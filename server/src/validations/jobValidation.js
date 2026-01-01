import Joi from 'joi';

export const getJobs = {
    query: Joi.object().keys({
        segment: Joi.string().allow(''),
        companyId: Joi.string().uuid().allow(''),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(20),
    }),
};

export const getJob = {
    params: Joi.object().keys({
        id: Joi.string().uuid().required(),
    }),
};

export const bulkCreateJobs = {
    body: Joi.array().items(
        Joi.object().keys({
            title: Joi.string().required(),
            company: Joi.string().required(),
            companyId: Joi.string().uuid().allow(null, ''),
            segment: Joi.string().allow(null, ''),
            careerpage_link: Joi.string().uri().allow(null, ''),
            company_id: Joi.string().allow(null, ''),
            created_by: Joi.string().allow(null, ''),
        })
    ).min(1).required(),
};

export const getJobsFollowed = {
    query: Joi.object().keys({
        segment: Joi.string().allow(''),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(20),
    }),
};
