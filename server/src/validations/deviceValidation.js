import Joi from 'joi';

export const addDevice = {
  body: Joi.object({
    deviceId: Joi.string().required(),
    token: Joi.string().optional().allow(null, ''),
    type: Joi.string().valid('ios', 'android', 'web').optional()
  })
};

export const updateDevice = {
  body: Joi.object({
    deviceId: Joi.string().required(),
    token: Joi.string().optional().allow(null, ''),
    type: Joi.string().valid('ios', 'android', 'web').optional()
  })
};

export const addDevicePublic = {
    body: Joi.object().keys({
        token: Joi.string().required(),
        type: Joi.string().valid('ios', 'android', 'web').optional(),
        clerkId: Joi.string().optional(),
    }),
};

export const removeDevice = {
  params: Joi.object({
    userId: Joi.string().uuid().required()
  })
};

export const getDevices = {
    params: Joi.object().keys({
        userId: Joi.string().uuid().optional(),
    }),
};
