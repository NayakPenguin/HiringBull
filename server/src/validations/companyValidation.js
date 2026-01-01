import Joi from 'joi';

const categoryValues = ['tech-giant', 'fintech-giant', 'indian-startup', 'global-startup', 'ycombinator', 'mass-hiring', 'hft'];

const companySchema = Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().allow(null, ''),
    logo: Joi.string().uri().allow(null, ''),
    category: Joi.string().valid(...categoryValues).allow(null, ''),
});

export const getCompanies = {
    query: Joi.object().keys({
        category: Joi.string().valid(...categoryValues).allow(''),
    }),
};

export const createCompany = {
    body: companySchema,
};

export const bulkCreateCompanies = {
    body: Joi.array().items(companySchema).min(1),
};

export const updateCompany = {
    params: Joi.object().keys({
        id: Joi.string().required(),
    }),
    body: Joi.object().keys({
        name: Joi.string(),
        description: Joi.string().allow(null, ''),
        logo: Joi.string().uri().allow(null, ''),
        category: Joi.string().valid(...categoryValues).allow(null, ''),
    }).min(1),
};

export const bulkUpdateCompanies = {
    body: Joi.array().items(
        Joi.object().keys({
            id: Joi.string().required(),
            name: Joi.string(),
            description: Joi.string().allow(null, ''),
            logo: Joi.string().uri().allow(null, ''),
            category: Joi.string().valid(...categoryValues).allow(null, ''),
        }).min(2)
    ).min(1),
};
