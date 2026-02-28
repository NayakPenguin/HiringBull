import { OAuth2Client } from "google-auth-library";
import { Resend } from "resend";
import httpStatus from "http-status";
import prisma from "../prismaClient.js";
import { signToken } from "../middlewares/auth.js";
import { log } from "../utils/logger.js";

const resend = new Resend(process.env.RESEND_API_KEY);

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

// ─── Helpers ────────────────────────────────────────────────

/**
 * Find or create a user by email + provider, then return a JWT.
 */
const findOrCreateUser = async ({ email, name, provider, providerId, imgUrl }) => {
  log(`[Auth] findOrCreateUser: email=${email}, provider=${provider}`);
  // 1) Try by email first (handles existing Clerk-era users)
  let user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    log(`[Auth] Existing user found: id=${user.id}, email=${email}`);
    // Backfill provider fields if missing (migration from Clerk)
    const updates = {};
    if (!user.provider) updates.provider = provider;
    if (!user.providerId) updates.providerId = providerId;
    if (!user.img_url && imgUrl) updates.img_url = imgUrl;
    if (!user.name && name) updates.name = name;

    if (Object.keys(updates).length > 0) {
      log(`[Auth] Backfilling fields for user ${user.id}:`, Object.keys(updates));
      user = await prisma.user.update({ where: { id: user.id }, data: updates });
    }
  } else {
    // 2) Create new user
    log(`[Auth] Creating new user: email=${email}, provider=${provider}`);
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
    log(`[Auth] New user created: id=${user.id}`);
  }

  if (!user.active) {
    log(`[Auth] Account disabled: id=${user.id}`);
    const error = new Error("Account disabled");
    error.statusCode = httpStatus.FORBIDDEN;
    throw error;
  }

  const token = signToken(user.id, user.email);
  log(`[Auth] JWT issued for user ${user.id} (email=${user.email})`);
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
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Google Sign-In
 *     description: Verifies a Google ID token and returns a JWT + user record.
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idToken]
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: Google ID token from mobile Google Sign-In
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token (365-day expiry)
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Missing idToken
 *       401:
 *         description: Invalid Google token
 */
export const googleLogin = catchAsync(async (req, res) => {
  const { idToken } = req.body;
  log(`[Auth:Google] Login attempt`);
  if (!idToken) {
    log(`[Auth:Google] Missing idToken`);
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
    log(`[Auth:Google] Token verified but no email in payload`);
    return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid Google token" });
  }

  log(`[Auth:Google] Token verified for ${payload.email}`);
  const { token, user } = await findOrCreateUser({
    email: payload.email,
    name: payload.name,
    provider: "google",
    providerId: payload.sub,
    imgUrl: payload.picture,
  });

  log(`[Auth:Google] Login success: userId=${user.id}`);
  res.status(httpStatus.OK).json({ token, user });
});

// ─── LinkedIn OpenID Connect ────────────────────────────────

/**
 * @swagger
 * /api/auth/linkedin:
 *   post:
 *     summary: LinkedIn Sign-In
 *     description: Exchanges a LinkedIn authorization code for user info, returns JWT + user.
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, redirectUri]
 *             properties:
 *               code:
 *                 type: string
 *                 description: LinkedIn authorization code
 *               redirectUri:
 *                 type: string
 *                 description: Redirect URI used in the auth request
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Missing code or redirectUri
 *       401:
 *         description: LinkedIn auth failed
 */
export const linkedinLogin = catchAsync(async (req, res) => {
  const { code, redirectUri } = req.body;
  log(`[Auth:LinkedIn] Login attempt, redirectUri=${redirectUri}`);
  if (!code || !redirectUri) {
    log(`[Auth:LinkedIn] Missing code or redirectUri`);
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
    log(`[Auth:LinkedIn] Token exchange failed: status=${tokenResponse.status}`);
    return res.status(httpStatus.UNAUTHORIZED).json({ message: "LinkedIn token exchange failed" });
  }

  const tokenData = await tokenResponse.json();
  log(`[Auth:LinkedIn] Token exchange successful`);

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

  log(`[Auth:LinkedIn] Profile fetched: email=${profile.email}`);
  const { token, user } = await findOrCreateUser({
    email: profile.email,
    name: profile.name,
    provider: "linkedin",
    providerId: profile.sub,
    imgUrl: profile.picture || null,
  });

  log(`[Auth:LinkedIn] Login success: userId=${user.id}`);
  res.status(httpStatus.OK).json({ token, user });
});

// ─── LinkedIn Mobile OAuth (Server-side callback) ───────────
//
// LinkedIn only accepts HTTPS redirect URIs, so mobile apps can't
// use custom schemes (exp+hiringbull-nayak://).
//
// Flow:
//  1. App opens browser → GET /api/auth/linkedin/start
//  2. Server redirects → LinkedIn OAuth consent
//  3. LinkedIn redirects → GET /api/auth/linkedin/callback?code=...
//  4. Server exchanges code → JWT, then redirects to app deep link
//     exp+hiringbull-nayak://login?token=JWT&userId=...
//

const LINKEDIN_SCOPES = "openid profile email";
const APP_DEEP_LINK = "exp+hiringbull-nayak://login";

/**
 * @swagger
 * /api/auth/linkedin/start:
 *   get:
 *     summary: Start LinkedIn OAuth (mobile)
 *     description: Redirects the browser to LinkedIn consent screen. The callback will redirect back to the app with a JWT.
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       302:
 *         description: Redirect to LinkedIn
 */
export const linkedinStartOAuth = (req, res) => {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const serverUrl = process.env.SERVER_URL || `http://${req.headers.host}`;
  const callbackUrl = `${serverUrl}/api/auth/linkedin/callback`;

  // Generate a random state param to prevent CSRF
  const state = Math.random().toString(36).substring(2, 15);

  const linkedinAuthUrl = new URL("https://www.linkedin.com/oauth/v2/authorization");
  linkedinAuthUrl.searchParams.set("response_type", "code");
  linkedinAuthUrl.searchParams.set("client_id", clientId);
  linkedinAuthUrl.searchParams.set("redirect_uri", callbackUrl);
  linkedinAuthUrl.searchParams.set("scope", LINKEDIN_SCOPES);
  linkedinAuthUrl.searchParams.set("state", state);

  log(`[Auth:LinkedIn:Mobile] Starting OAuth, callback=${callbackUrl}`);
  res.redirect(linkedinAuthUrl.toString());
};

/**
 * @swagger
 * /api/auth/linkedin/callback:
 *   get:
 *     summary: LinkedIn OAuth callback (mobile)
 *     description: >
 *       LinkedIn redirects here with an authorization code.
 *       Server exchanges code for token, creates/finds user,
 *       then redirects to the app's deep link with JWT.
 *     tags: [Auth]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirect to app deep link with token
 *       400:
 *         description: Missing code or LinkedIn error
 */
export const linkedinCallbackOAuth = catchAsync(async (req, res) => {
  const { code, error: linkedinError, error_description } = req.query;

  if (linkedinError) {
    log(`[Auth:LinkedIn:Mobile] LinkedIn error: ${linkedinError} - ${error_description}`);
    const errorRedirect = `${APP_DEEP_LINK}?error=${encodeURIComponent(error_description || linkedinError)}`;
    return res.redirect(errorRedirect);
  }

  if (!code) {
    log(`[Auth:LinkedIn:Mobile] Missing authorization code`);
    return res.status(400).send("Missing authorization code");
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const serverUrl = process.env.SERVER_URL || `http://${req.headers.host}`;
  const callbackUrl = `${serverUrl}/api/auth/linkedin/callback`;

  log(`[Auth:LinkedIn:Mobile] Exchanging code, callbackUrl=${callbackUrl}`);

  // 1) Exchange code for access token
  const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: callbackUrl,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!tokenResponse.ok) {
    const errBody = await tokenResponse.text();
    log(`[Auth:LinkedIn:Mobile] Token exchange failed: ${tokenResponse.status} ${errBody}`);
    const errorRedirect = `${APP_DEEP_LINK}?error=${encodeURIComponent("LinkedIn authentication failed")}`;
    return res.redirect(errorRedirect);
  }

  const tokenData = await tokenResponse.json();
  log(`[Auth:LinkedIn:Mobile] Token exchange successful`);

  // 2) Fetch user profile
  const userInfoResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!userInfoResponse.ok) {
    const errorRedirect = `${APP_DEEP_LINK}?error=${encodeURIComponent("Failed to fetch LinkedIn profile")}`;
    return res.redirect(errorRedirect);
  }

  const profile = await userInfoResponse.json();

  if (!profile.email) {
    const errorRedirect = `${APP_DEEP_LINK}?error=${encodeURIComponent("LinkedIn account has no email")}`;
    return res.redirect(errorRedirect);
  }

  log(`[Auth:LinkedIn:Mobile] Profile: email=${profile.email}, name=${profile.name}`);

  // 3) Find or create user + JWT
  const { token, user } = await findOrCreateUser({
    email: profile.email,
    name: profile.name,
    provider: "linkedin",
    providerId: profile.sub,
    imgUrl: profile.picture || null,
  });

  // 4) Redirect to app deep link with the JWT
  const successRedirect = `${APP_DEEP_LINK}?token=${encodeURIComponent(token)}&userId=${encodeURIComponent(user.id)}`;
  log(`[Auth:LinkedIn:Mobile] Success, redirecting to app deep link`);
  res.redirect(successRedirect);
});

// ─── Email OTP ──────────────────────────────────────────────

/**
 * @swagger
 * /api/auth/email/send-otp:
 *   post:
 *     summary: Send Email OTP
 *     description: Sends a 6-digit OTP to the given email address.
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP sent
 *       400:
 *         description: Missing email
 */
export const sendOtp = catchAsync(async (req, res) => {
  const { email } = req.body;
  log(`[Auth:OTP] Send OTP request for: ${email}`);
  if (!email) {
    log(`[Auth:OTP] Missing email`);
    return res.status(httpStatus.BAD_REQUEST).json({ message: "email is required" });
  }

  const code = await generateOtp(email);
  log(`[Auth:OTP] OTP generated for ${email}`);

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

  log(`[Auth:OTP] Email sent to ${email}`);
  res.status(httpStatus.OK).json({ message: "OTP sent" });
});

/**
 * @swagger
 * /api/auth/email/verify-otp:
 *   post:
 *     summary: Verify Email OTP
 *     description: Verifies the OTP and returns a JWT + user record.
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               code:
 *                 type: string
 *                 description: 6-digit OTP code
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified, login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Missing email or code
 *       401:
 *         description: Invalid or expired OTP
 */
export const verifyOtp = catchAsync(async (req, res) => {
  const { email, code } = req.body;
  log(`[Auth:OTP] Verify attempt: email=${email}`);
  if (!email || !code) {
    log(`[Auth:OTP] Missing email or code`);
    return res.status(httpStatus.BAD_REQUEST).json({ message: "email and code are required" });
  }

  const otp = await prisma.otp.findFirst({
    where: { email, code, verified: false },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    log(`[Auth:OTP] Invalid OTP for ${email}`);
    return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid OTP" });
  }

  if (new Date() > otp.expiresAt) {
    log(`[Auth:OTP] OTP expired for ${email}`);
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

  log(`[Auth:OTP] Verify success: email=${email}, userId=${user.id}`);
  res.status(httpStatus.OK).json({ token, user });
});

// ─── Token Refresh ──────────────────────────────────────────

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh JWT
 *     description: Issues a fresh JWT for the authenticated user. Requires valid existing JWT.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: New JWT issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: New JWT token (365-day expiry)
 *       401:
 *         description: Authentication required or invalid token
 */
export const refreshToken = catchAsync(async (req, res) => {
  log(`[Auth:Refresh] Token refresh for userId=${req.user.id}`);
  const token = signToken(req.user.id, req.user.email);
  res.status(httpStatus.OK).json({ token });
});
