import Joi from 'joi';

export const getSocialPosts = {
    query: Joi.object().keys({
        source: Joi.string().allow(''),
        company: Joi.string().allow(''),
        segment: Joi.string().allow(''),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(20),
    }),
};

export const getSocialPost = {
    params: Joi.object().keys({
        id: Joi.string().uuid().required(),
    }),
};

export const bulkCreateSocialPosts = {
    body: Joi.array().items(
        Joi.object().keys({
            name: Joi.string().required(),
            description: Joi.string().required(),
            segment: Joi.string().allow(null, ''),
            company: Joi.string().allow(null, ''),
            source: Joi.string().allow(null, ''),
            source_link: Joi.string().uri().allow(null, ''),
            image_link: Joi.string().uri().allow(null, ''),
            created_by: Joi.string().allow(null, ''),
        })
    ).min(1).required(),
};

export const getAllSocialPosts = {
    query: Joi.object().keys({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(20),
    }),
};
