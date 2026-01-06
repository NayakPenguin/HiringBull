import Joi from 'joi';

export const createUser = {
    body: Joi.object().keys({
        name: Joi.string().allow(null, ''),
        email: Joi.string().email().allow(null, ''),
        img_url: Joi.string().uri().allow(null, ''),
        active: Joi.boolean(),
        is_experienced: Joi.boolean(),
        college_name: Joi.string().allow(null, ''),
        cgpa: Joi.string().allow(null, ''),
        company_name: Joi.string().allow(null, ''),
        years_of_experience: Joi.number().integer().allow(null),
        resume_link: Joi.string().uri().allow(null, ''),
        segment: Joi.string().allow(null, ''),
        experience_level: Joi.string().valid(
            'INTERNSHIP',
            'FRESHER_OR_LESS_THAN_1_YEAR',
            'ONE_TO_THREE_YEARS'
        ).required(),
        companies: Joi.array().items(Joi.string()),
        clerkId: Joi.string().allow(null, ''),
        promo_code: Joi.string().allow(null, ''),
    }).min(0),
};

export const getUser = {
    params: Joi.object().keys({
        id: Joi.string().uuid().required(),
    }),
};

export const updateUser = {
    params: Joi.object().keys({
        id: Joi.string().uuid().required(),
    }),
    body: Joi.object().keys({
        name: Joi.string(),
        email: Joi.string().email(),
        img_url: Joi.string().uri().allow(null, ''),
        active: Joi.boolean(),
        is_experienced: Joi.boolean(),
        college_name: Joi.string().allow(null, ''),
        cgpa: Joi.string().allow(null, ''),
        company_name: Joi.string().allow(null, ''),
        years_of_experience: Joi.number().allow(null),
        experience_level: Joi.string().valid(
            'INTERNSHIP',
            'FRESHER_OR_LESS_THAN_1_YEAR',
            'ONE_TO_THREE_YEARS'
        ),
        resume_link: Joi.string().uri().allow(null, ''),
        segment: Joi.string().allow(null, ''),
        companies: Joi.array().items(Joi.string().uuid()),
        promo_code: Joi.string().allow(null, ''),
    })
};

export const updateProfile = {
    body: Joi.object().keys({
        name: Joi.string().optional(),
        is_experienced: Joi.boolean().optional(),
        college_name: Joi.string().allow(null, '').optional(),
        cgpa: Joi.string().allow(null, '').optional(),
        company_name: Joi.string().allow(null, '').optional(),
        years_of_experience: Joi.number().allow(null).optional(),
        experience_level: Joi.string().valid(
            'INTERNSHIP',
            'FRESHER_OR_LESS_THAN_1_YEAR',
            'ONE_TO_THREE_YEARS'
        ).optional(),
        resume_link: Joi.string().uri().allow(null, '').optional(),
        followedCompanies: Joi.array().items(Joi.string().uuid()).optional()
    })
};

export const deleteUser = {
    params: Joi.object().keys({
        id: Joi.string().uuid().required(),
    }),
};
