import Joi from 'joi';

export const validateUser = (user: any) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('admin', 'technician', 'manager').required(),
    plant_id: Joi.number().allow(null)
  });

  return schema.validate(user);
};
