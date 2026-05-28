import Joi from 'joi';

const RESOURCE_CATEGORIES = [
    'INTERVIEW_PREP',
    'SYSTEM_DESIGN',
    'DSA',
    'BEHAVIORAL',
    'CAREER_GROWTH',
    'COMPANY_RESEARCH',
    'RESUME',
    'NEGOTIATION',
    'TECH_BLOGS',
    'PODCASTS_VIDEOS',
];

const RESOURCE_TYPES = [
    'ARTICLE',
    'VIDEO',
    'BOOK',
    'COURSE',
    'TOOL',
    'PODCAST',
    'REPO',
    'NEWSLETTER',
    'CHEATSHEET',
];

export const listResources = {
    query: Joi.object().keys({
        category: Joi.string().valid(...RESOURCE_CATEGORIES).allow(''),
        type: Joi.string().valid(...RESOURCE_TYPES).allow(''),
        difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced').allow(''),
        search: Joi.string().allow('').max(200),
        bookmarkedOnly: Joi.boolean().truthy('true').falsy('false').default(false),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(20),
    }),
};

export const resourceIdParam = {
    params: Joi.object().keys({
        id: Joi.string().uuid().required(),
    }),
};

export const bulkCreateResources = {
    body: Joi.array()
        .items(
            Joi.object().keys({
                title: Joi.string().required(),
                description: Joi.string().required(),
                url: Joi.string().uri().required(),
                category: Joi.string().valid(...RESOURCE_CATEGORIES).required(),
                type: Joi.string().valid(...RESOURCE_TYPES).required(),
                author: Joi.string().allow(null, ''),
                source: Joi.string().allow(null, ''),
                thumbnail: Joi.string().uri().allow(null, ''),
                tags: Joi.array().items(Joi.string()).default([]),
                is_free: Joi.boolean().default(true),
                is_curated: Joi.boolean().default(true),
                language: Joi.string().default('en'),
                difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced').allow(null, ''),
                estimated_min: Joi.number().integer().min(1).allow(null),
            })
        )
        .min(1)
        .required(),
};
