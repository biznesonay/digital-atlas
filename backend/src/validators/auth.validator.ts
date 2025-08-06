import Joi from 'joi';

export const authValidators = {
  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Некорректный формат email',
        'any.required': 'Email обязателен',
      }),
    password: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.min': 'Пароль должен содержать минимум 6 символов',
        'any.required': 'Пароль обязателен',
      }),
  }),

  register: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Некорректный формат email',
        'any.required': 'Email обязателен',
      }),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required()
      .messages({
        'string.min': 'Пароль должен содержать минимум 8 символов',
        'string.pattern.base': 'Пароль должен содержать заглавные и строчные буквы, цифры и специальные символы',
        'any.required': 'Пароль обязателен',
      }),
    name: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Имя должно содержать минимум 2 символа',
        'string.max': 'Имя не должно превышать 100 символов',
        'any.required': 'Имя обязательно',
      }),
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string()
      .required()
      .messages({
        'any.required': 'Refresh token обязателен',
      }),
  }),

  resetPasswordRequest: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Некорректный формат email',
        'any.required': 'Email обязателен',
      }),
  }),

  resetPassword: Joi.object({
    token: Joi.string()
      .required()
      .messages({
        'any.required': 'Токен сброса пароля обязателен',
      }),
    newPassword: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required()
      .messages({
        'string.min': 'Пароль должен содержать минимум 8 символов',
        'string.pattern.base': 'Пароль должен содержать заглавные и строчные буквы, цифры и специальные символы',
        'any.required': 'Новый пароль обязателен',
      }),
  }),
};
