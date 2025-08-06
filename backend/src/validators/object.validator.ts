import Joi from 'joi';

const translationSchema = Joi.object({
  name: Joi.string().max(1000).required().messages({
    'string.max': 'Название не должно превышать 1000 символов',
    'any.required': 'Название обязательно',
  }),
  address: Joi.string().max(1000).required().messages({
    'string.max': 'Адрес не должен превышать 1000 символов',
    'any.required': 'Адрес обязателен',
  }),
  isPublished: Joi.boolean().default(false),
});

const phoneSchema = Joi.object({
  number: Joi.string()
    .pattern(/^\+?[0-9\s\-()]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Некорректный формат телефона',
      'any.required': 'Номер телефона обязателен',
    }),
  type: Joi.string()
    .valid('MAIN', 'ADDITIONAL', 'FAX', 'MOBILE')
    .default('MAIN'),
});

const organizationSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Название организации обязательно',
  }),
  website: Joi.string().uri().allow('', null).messages({
    'string.uri': 'Некорректный формат URL',
  }),
});

export const objectValidators = {
  create: Joi.object({
    infrastructureTypeId: Joi.number().integer().positive().required().messages({
      'number.base': 'ID типа инфраструктуры должен быть числом',
      'number.positive': 'ID типа инфраструктуры должен быть положительным',
      'any.required': 'Тип инфраструктуры обязателен',
    }),
    regionId: Joi.number().integer().positive().required().messages({
      'number.base': 'ID региона должен быть числом',
      'number.positive': 'ID региона должен быть положительным',
      'any.required': 'Регион обязателен',
    }),
    latitude: Joi.number().min(-90).max(90).allow(null).messages({
      'number.min': 'Широта должна быть между -90 и 90',
      'number.max': 'Широта должна быть между -90 и 90',
    }),
    longitude: Joi.number().min(-180).max(180).allow(null).messages({
      'number.min': 'Долгота должна быть между -180 и 180',
      'number.max': 'Долгота должна быть между -180 и 180',
    }),
    googleMapsUrl: Joi.string().uri().allow('', null).messages({
      'string.uri': 'Некорректный формат URL Google Maps',
    }),
    website: Joi.string().uri().allow('', null).messages({
      'string.uri': 'Некорректный формат URL веб-сайта',
    }),
    translations: Joi.object({
      ru: translationSchema.optional(),
      kz: translationSchema.optional(),
      en: translationSchema.optional(),
    })
      .min(1)
      .required()
      .messages({
        'object.min': 'Необходимо заполнить данные хотя бы для одного языка',
        'any.required': 'Переводы обязательны',
      }),
    phones: Joi.array()
      .items(phoneSchema)
      .max(5)
      .optional()
      .messages({
        'array.max': 'Максимальное количество телефонов - 5',
      }),
    priorityDirectionIds: Joi.array()
      .items(Joi.number().integer().positive())
      .optional()
      .messages({
        'array.base': 'Приоритетные направления должны быть массивом ID',
      }),
    organizations: Joi.array()
      .items(organizationSchema)
      .optional(),
  }),

  update: Joi.object({
    infrastructureTypeId: Joi.number().integer().positive().optional(),
    regionId: Joi.number().integer().positive().optional(),
    latitude: Joi.number().min(-90).max(90).allow(null).optional(),
    longitude: Joi.number().min(-180).max(180).allow(null).optional(),
    googleMapsUrl: Joi.string().uri().allow('', null).optional(),
    website: Joi.string().uri().allow('', null).optional(),
    translations: Joi.object({
      ru: translationSchema.optional(),
      kz: translationSchema.optional(),
      en: translationSchema.optional(),
    }).optional(),
    phones: Joi.array().items(phoneSchema).max(5).optional(),
    priorityDirectionIds: Joi.array()
      .items(Joi.number().integer().positive())
      .optional(),
    organizations: Joi.array().items(organizationSchema).optional(),
  }),

  filters: Joi.object({
    search: Joi.string().allow('').optional(),
    infrastructureTypeIds: Joi.alternatives()
      .try(
        Joi.array().items(Joi.number().integer().positive()),
        Joi.string() // для query params
      )
      .optional(),
    priorityDirectionIds: Joi.alternatives()
      .try(
        Joi.array().items(Joi.number().integer().positive()),
        Joi.string()
      )
      .optional(),
    regionId: Joi.number().integer().positive().optional(),
    isPublished: Joi.boolean().optional(),
    geocodingStatus: Joi.string()
      .valid('SUCCESS', 'FAILED', 'MANUAL', 'PENDING')
      .optional(),
    hasCoordinates: Joi.boolean().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    lang: Joi.string().valid('ru', 'kz', 'en').default('ru'),
  }),
};
