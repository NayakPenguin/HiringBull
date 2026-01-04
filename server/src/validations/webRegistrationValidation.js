import Joi from 'joi';

export const createWebRegistration = {
    body: Joi.object().keys({
        email: Joi.string().email().required().messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
        currentPlan: Joi.string().valid('ONE_MONTH', 'THREE_MONTH', 'SIX_MONTH').required().messages({
            'any.only': 'Plan must be ONE_MONTH, THREE_MONTH, or SIX_MONTH',
            'any.required': 'Plan is required'
        }),
        planStart: Joi.date().iso().required().messages({
            'date.base': 'Plan start must be a valid date',
            'any.required': 'Plan start is required'
        }),
        planEnd: Joi.date().iso().greater(Joi.ref('planStart')).required().messages({
            'date.base': 'Plan end must be a valid date',
            'date.greater': 'Plan end must be after plan start',
            'any.required': 'Plan end is required'
        }),
        paidAmount: Joi.number().positive().required().messages({
            'number.base': 'Paid amount must be a number',
            'number.positive': 'Paid amount must be greater than 0',
            'any.required': 'Paid amount is required'
        }),
        referralCode: Joi.string().allow(null, '').optional()
    })
};

export const checkWebRegistration = {
    query: Joi.object().keys({
        email: Joi.string().email().required().messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        })
    })
};

export const updateWebRegistration = {
    params: Joi.object().keys({
        email: Joi.string().email().required().messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        })
    }),
    body: Joi.object().keys({
        currentPlan: Joi.string().valid('ONE_MONTH', 'THREE_MONTH', 'SIX_MONTH').optional(),
        planStart: Joi.date().iso().optional(),
        planEnd: Joi.date().iso().when('planStart', {
            is: Joi.exist(),
            then: Joi.date().iso().greater(Joi.ref('planStart')),
            otherwise: Joi.date().iso()
        }).optional(),
        paidAmount: Joi.number().positive().optional(),
        referralCode: Joi.string().allow(null, '').optional()
    }).min(1)
};

export const deleteWebRegistration = {
    params: Joi.object().keys({
        email: Joi.string().email().required().messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        })
    })
};