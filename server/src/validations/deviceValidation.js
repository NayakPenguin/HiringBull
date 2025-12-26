import Joi from 'joi';

export const addDevice = {
    body: Joi.object().keys({
        token: Joi.string().required(),
        type: Joi.string().valid('ios', 'android', 'web').optional(),
    }),
};

export const addDevicePublic = {
    body: Joi.object().keys({
        token: Joi.string().required(),
        type: Joi.string().valid('ios', 'android', 'web').optional(),
        clerkId: Joi.string().optional(),
    }),
};

export const removeDevice = {
    params: Joi.object().keys({
        token: Joi.string().required(),
    }),
};

export const getDevices = {
    params: Joi.object().keys({
        userId: Joi.string().uuid().optional(),
    }),
};
