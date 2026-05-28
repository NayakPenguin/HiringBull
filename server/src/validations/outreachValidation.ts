import Joi from 'joi';

export const createOutreach = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    companyName: Joi.string().required(),
    reason: Joi.string().required(),
    jobId: Joi.string().optional(),
    resumeLink: Joi.string().uri().optional(),
    message: Joi.string().optional(),
  }),
};

export const getOutreachById = {
  params: Joi.object().keys({
    id: Joi.string().uuid().required(),
  }),
};

export const updateOutreachStatus = {
  params: Joi.object().keys({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid('APPROVED', 'REJECTED', 'SENT').required(),
  }),
};
