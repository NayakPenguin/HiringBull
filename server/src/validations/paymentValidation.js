import Joi from 'joi';

export const createOrder = {
  body: Joi.object({
    email: Joi.string().email().required(),
    planType: Joi.string().valid('STARTER', 'GROWTH', 'PRO').required(),
    referralCode: Joi.string().optional().allow(null, ""),
  }),
};

export const verifyPayment = {
  body: Joi.object({
    razorpay_order_id: Joi.string().required(),
    razorpay_payment_id: Joi.string().required(),
    razorpay_signature: Joi.string().required(),
  }),
};

export const verifyGooglePlayPurchase = {
  body: Joi.object({
    purchaseToken: Joi.string().required(),
    productId: Joi.string().required(),
    packageName: Joi.string().required(),
  }),
};