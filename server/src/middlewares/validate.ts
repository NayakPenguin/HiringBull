import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { pick } from "../utils/pick.js";

type ValidationSchema = {
  params?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  body?: Joi.ObjectSchema | Joi.ArraySchema;
};

const validate =
  (schema: ValidationSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const validSchema = pick(schema, ["params", "query", "body"]);
    const object = pick(
      req as unknown as Record<string, unknown>,
      Object.keys(validSchema) as (keyof typeof validSchema)[],
    );

    const { value, error } = Joi.compile(validSchema)
      .prefs({ errors: { label: "key" }, abortEarly: false })
      .validate(object);

    if (error) {
      const errorMessage = error.details
        .map((details) => details.message)
        .join(", ");
      res.status(httpStatus.BAD_REQUEST).json({ error: errorMessage });
      return;
    }

    Object.assign(req, value);
    next();
  };

export default validate;
