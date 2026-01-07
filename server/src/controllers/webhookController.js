import { Webhook } from 'svix';
import httpStatus from 'http-status';
import prisma from '../prismaClient.js';

const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

/**
 * @swagger
 * /api/webhooks/clerk:
 *   post:
 *     summary: Handle Clerk webhooks
 *     description: Process webhook events from Clerk for user synchronization
 *     tags: [Webhooks]
 *     parameters:
 *       - in: header
 *         name: svix-id
 *         required: true
 *         schema:
 *           type: string
 *         description: Svix webhook ID
 *       - in: header
 *         name: svix-timestamp
 *         required: true
 *         schema:
 *           type: string
 *         description: Svix webhook timestamp
 *       - in: header
 *         name: svix-signature
 *         required: true
 *         schema:
 *           type: string
 *         description: Svix webhook signature
 *     requestBody:
 *       required: true
 *       description: Clerk webhook payload
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: object
 *               type:
 *                 type: string
 *                 enum: ['user.created', 'user.updated', 'user.deleted']
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Bad request - Invalid webhook signature
 *       500:
 *         description: Internal server error - Missing webhook secret
 */
export const handleClerkWebhook = catchAsync(async (req, res) => {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        console.error('CLERK_WEBHOOK_SECRET is not set');
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).send('Server configuration error');
    }

    // Get the headers
    const svix_id = req.headers['svix-id'];
    const svix_timestamp = req.headers['svix-timestamp'];
    const svix_signature = req.headers['svix-signature'];

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return res.status(httpStatus.BAD_REQUEST).send('Error occured -- no svix headers');
    }

    // Get the body
    const payload = req.body;
    const body = req.rawBody ? req.rawBody.toString() : JSON.stringify(payload);

    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt;

    // Verify the payload with the headers
    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        });
    } catch (err) {
        console.error('Error verifying webhook:', err.message);
        return res.status(httpStatus.BAD_REQUEST).json({ Error: err.message });
    }

    const { id: clerkId } = evt.data;
    const eventType = evt.type;

    console.log(`Webhook received: ${eventType} for user ${clerkId}`);

    if (eventType === 'user.created' || eventType === 'user.updated') {
        const { email_addresses, first_name, last_name, image_url, phone_numbers } = evt.data;

        const email = email_addresses[0]?.email_address;
        const name = [first_name, last_name].filter(Boolean).join(' ') || 'User';

        // Upsert user into database
        await prisma.user.upsert({
            where: { clerkId },
            update: {
                name,
                email,
                avatar: image_url,
                // Add more fields as needed
            },
            create: {
                clerkId,
                name,
                email,
                avatar: image_url,
            },
        });

        console.log(`User ${clerkId} ${eventType === 'user.created' ? 'created' : 'updated'} in database`);
    }

    if (eventType === 'user.deleted') {
        try {
            await prisma.user.delete({
                where: { clerkId },
            });
            console.log(`User ${clerkId} deleted from database`);
        } catch (err) {
            console.error(`Error deleting user ${clerkId}:`, err.message);
            // Ignore if user already deleted
        }
    }

    res.status(httpStatus.OK).json({ success: true });
});
