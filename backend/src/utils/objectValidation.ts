// backend/src/utils/objectValidation.ts

import Joi from 'joi';

// Схема для перевода
const translationSchema = Joi.object({
  languageCode: Joi.string().valid('ru', 'kz', 'en').required(),
  name: Joi.string().max(1000).required(),
  address: Joi.string().max(1000).required(),
  isPublished: Joi.boolean().required()
});

// Схема для телефона
const phoneSchema = Joi.object({
  number: Joi.string()
    .pattern(/^\+?[0-9\s\-\(\)]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Неверный формат телефона'
    }),
  type: Joi.string().valid('MAIN', 'ADDITIONAL', 'FAX', 'MOBILE').default('MAIN')
});

// Схема для организации
const organizationSchema = Joi.object({
  name: Joi.string().required(),
  website: Joi.string().uri().allow('', null).optional()
});

// Схема для создания объекта
export const createObjectSchema = Joi.object({
  infrastructureTypeId: Joi.number().integer().positive().required(),
  regionId: Joi.number().integer().positive().required(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  googleMapsUrl: Joi.string().uri().allow('', null).optional(),
  website: Joi.string().uri().allow('', null).optional(),
  geocodingStatus: Joi.string()
    .valid('PENDING', 'SUCCESS', 'FAILED', 'MANUAL')
    .optional(),
  translations: Joi.array()
    .items(translationSchema)
    .min(1)
    .required()
    .messages({
      'array.min': 'Необходимо указать хотя бы один перевод'
    }),
  phones: Joi.array()
    .items(phoneSchema)
    .max(5)
    .optional()
    .messages({
      'array.max': 'Максимально допустимо 5 телефонов'
    }),
  priorityDirections: Joi.array()
    .items(Joi.number().integer().positive())
    .optional(),
  organizations: Joi.array()
    .items(organizationSchema)
    .optional()
}).custom((value, helpers) => {
  // Проверка: хотя бы один язык должен быть опубликован
  const hasPublished = value.translations.some((t: any) => t.isPublished);
  if (!hasPublished) {
    return helpers.error('any.custom', {
      message: 'Хотя бы один язык должен быть опубликован'
    });
  }
  return value;
});

// Схема для обновления объекта
export const updateObjectSchema = Joi.object({
  infrastructureTypeId: Joi.number().integer().positive().optional(),
  regionId: Joi.number().integer().positive().optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  googleMapsUrl: Joi.string().uri().allow('', null).optional(),
  website: Joi.string().uri().allow('', null).optional(),
  geocodingStatus: Joi.string()
    .valid('PENDING', 'SUCCESS', 'FAILED', 'MANUAL')
    .optional(),
  translations: Joi.array()
    .items(translationSchema)
    .min(1)
    .optional(),
  phones: Joi.array()
    .items(phoneSchema)
    .max(5)
    .optional(),
  priorityDirections: Joi.array()
    .items(Joi.number().integer().positive())
    .optional(),
  organizations: Joi.array()
    .items(organizationSchema)
    .optional()
});

// Схема для фильтрации объектов
export const objectFilterSchema = Joi.object({
  search: Joi.string().optional(),
  infrastructureTypeId: Joi.number().integer().positive().optional(),
  regionId: Joi.number().integer().positive().optional(),
  priorityDirections: Joi.array()
    .items(Joi.number().integer().positive())
    .optional(),
  isPublished: Joi.boolean().optional(),
  geocodingStatus: Joi.string()
    .valid('PENDING', 'SUCCESS', 'FAILED', 'MANUAL')
    .optional(),
  lang: Joi.string().valid('ru', 'kz', 'en').default('ru')
});

// Схема для массовых операций
export const bulkOperationSchema = Joi.object({
  ids: Joi.array()
    .items(Joi.number().integer().positive())
    .min(1)
    .required()
    .messages({
      'array.min': 'Необходимо выбрать хотя бы один объект'
    }),
  action: Joi.string()
    .valid('activate', 'deactivate', 'delete')
    .required(),
  lang: Joi.string().valid('ru', 'kz', 'en').default('ru')
});