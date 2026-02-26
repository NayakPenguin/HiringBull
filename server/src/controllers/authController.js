import { OAuth2Client } from "google-auth-library";
import { Resend } from "resend";
import httpStatus from "http-status";
import prisma from "../prismaClient.js";
import { signToken } from "../middlewares/auth.js";

const resend = new Resend(process.env.RESEND_API_KEY);

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

// ─── Helpers ────────────────────────────────────────────────

/**
 * Find or create a user by email + provider, then return a JWT.
 */
const findOrCreateUser = async ({ email, name, provider, providerId, imgUrl }) => {
  // 1) Try by email first (handles existing Clerk-era users)
  let user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    // Backfill provider fields if missing (migration from Clerk)
    const updates = {};
    if (!user.provider) updates.provider = provider;
    if (!user.providerId) updates.providerId = providerId;
    if (!user.img_url && imgUrl) updates.img_url = imgUrl;
    if (!user.name && name) updates.name = name;

    if (Object.keys(updates).length > 0) {
      user = await prisma.user.update({ where: { id: user.id }, data: updates });
    }
  } else {
    // 2) Create new user
    user = await prisma.user.create({
      data: {
        email,
        name: name || "User",
        provider,
        providerId,
        img_url: imgUrl || null,
        active: true,
      },
    });
  }

  if (!user.active) {
    const error = new Error("Account disabled");
    error.statusCode = httpStatus.FORBIDDEN;
    throw error;
  }

  const token = signToken(user.id);
  return { token, user };
};

/**
 * Generate a 6-digit OTP and store it in the database (5 min expiry).
 */
const generateOtp = async (email) => {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Delete any existing OTPs for this email
  await prisma.otp.deleteMany({ where: { email } });

  await prisma.otp.create({
    data: { email, code, expiresAt },
  });

  return code;
};

// ─── Google OAuth ───────────────────────────────────────────

/**
 * POST /api/auth/google
 * Body: { idToken: string }
 *
 * Verifies a Google ID token (from the mobile app's Google Sign-In)
 * and returns a JWT + user record.
 */
export const googleLogin = catchAsync(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: "idToken is required" });
  }

  // Verify the Google ID token
  const googleClient = new OAuth2Client();
  const ticket = await googleClient.verifyIdToken({
    idToken,
    // Accept tokens from any of our client IDs (Android, iOS, Web)
    audience: [
      process.env.GOOGLE_CLIENT_ID_ANDROID,
      process.env.GOOGLE_CLIENT_ID_IOS,
      process.env.GOOGLE_CLIENT_ID_WEB,
    ].filter(Boolean),
  });

  const payload = ticket.getPayload();
  if (!payload?.email) {
    return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid Google token" });
  }

  const { token, user } = await findOrCreateUser({
    email: payload.email,
    name: payload.name,
    provider: "google",
    providerId: payload.sub,
    imgUrl: payload.picture,
  });

  res.status(httpStatus.OK).json({ token, user });
});

// ─── LinkedIn OpenID Connect ────────────────────────────────

/**
 * POST /api/auth/linkedin
 * Body: { code: string, redirectUri: string }
 *
 * Exchanges a LinkedIn authorization code for user info via OpenID Connect,
 * then returns a JWT + user record.
 */
export const linkedinLogin = catchAsync(async (req, res) => {
  const { code, redirectUri } = req.body;
  if (!code || !redirectUri) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: "code and redirectUri are required",
    });
  }

  // 1) Exchange authorization code for access token
  const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: process.env.LINKEDIN_CLIENT_ID,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET,
    }),
  });

  if (!tokenResponse.ok) {
    return res.status(httpStatus.UNAUTHORIZED).json({ message: "LinkedIn token exchange failed" });
  }

  const tokenData = await tokenResponse.json();

  // 2) Fetch user info from LinkedIn's OpenID Connect userinfo endpoint
  const userInfoResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!userInfoResponse.ok) {
    return res.status(httpStatus.UNAUTHORIZED).json({ message: "Failed to fetch LinkedIn profile" });
  }

  const profile = await userInfoResponse.json();

  if (!profile.email) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      message: "LinkedIn account does not have an email address",
    });
  }

  const { token, user } = await findOrCreateUser({
    email: profile.email,
    name: profile.name,
    provider: "linkedin",
    providerId: profile.sub,
    imgUrl: profile.picture || null,
  });

  res.status(httpStatus.OK).json({ token, user });
});

// ─── Email OTP ──────────────────────────────────────────────

/**
 * POST /api/auth/email/send-otp
 * Body: { email: string }
 *
 * Sends a 6-digit OTP to the given email address via Resend.
 */
export const sendOtp = catchAsync(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: "email is required" });
  }

  const code = await generateOtp(email);

  await resend.emails.send({
    // TODO: Change to "HiringBull <noreply@hiringbull.org>" before production push
    from: process.env.RESEND_FROM_EMAIL || "HiringBull <noreply@punjabtech.online>",
    to: email,
    subject: "Your HiringBull verification code",
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
        <h2>Verification Code</h2>
        <p>Your code is:</p>
        <h1 style="letter-spacing: 8px; font-size: 36px; text-align: center; background: #f5f5f5; padding: 16px; border-radius: 8px;">${code}</h1>
        <p style="color: #666;">This code expires in 5 minutes.</p>
      </div>
    `,
  });

  res.status(httpStatus.OK).json({ message: "OTP sent" });
});

/**
 * POST /api/auth/email/verify-otp
 * Body: { email: string, code: string }
 *
 * Verifies the OTP and returns a JWT + user record.
 */
export const verifyOtp = catchAsync(async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: "email and code are required" });
  }

  const otp = await prisma.otp.findFirst({
    where: { email, code, verified: false },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid OTP" });
  }

  if (new Date() > otp.expiresAt) {
    await prisma.otp.delete({ where: { id: otp.id } });
    return res.status(httpStatus.UNAUTHORIZED).json({ message: "OTP expired" });
  }

  // Mark as verified and clean up
  await prisma.otp.delete({ where: { id: otp.id } });

  const { token, user } = await findOrCreateUser({
    email,
    name: null,
    provider: "email",
    providerId: email,
    imgUrl: null,
  });

  res.status(httpStatus.OK).json({ token, user });
});

// ─── Token Refresh ──────────────────────────────────────────

/**
 * POST /api/auth/refresh
 * Requires: Valid JWT in Authorization header (via requireAuth)
 *
 * Issues a fresh JWT for the authenticated user.
 */
export const refreshToken = catchAsync(async (req, res) => {
  const token = signToken(req.user.id);
  res.status(httpStatus.OK).json({ token });
});
