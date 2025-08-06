import ExcelJS from 'exceljs';
import { prisma } from '../config/database';
import { AppError } from '../middleware/error-handler';
import { importLogger } from '../config/logger';
import fs from 'fs/promises';
import path from 'path';

interface ImportRow {
  name_ru?: string;
  name_kz?: string;
  name_en?: string;
  address_ru?: string;
  address_kz?: string;
  address_en?: string;
  infrastructure_type?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  google_maps_url?: string;
  website?: string;
  phones?: string;
  priority_directions?: string;
  organizations?: string;
}

interface ImportResult {
  totalRows: number;
  successRows: number;
  errorRows: number;
  errors: Array<{
    row: number;
    error: string;
    data?: any;
  }>;
}

export class ImportService {
  static async importFromExcel(
    filePath: string,
    userId: number
  ): Promise<ImportResult> {
    const workbook = new ExcelJS.Workbook();
    const result: ImportResult = {
      totalRows: 0,
      successRows: 0,
      errorRows: 0,
      errors: [],
    };

    // Логируем начало импорта
    importLogger.info('Начало импорта файла', {
      userId,
      filename: path.basename(filePath),
      timestamp: new Date().toISOString(),
    });

    try {
      // Читаем файл
      await workbook.xlsx.readFile(filePath);
      importLogger.debug('Файл Excel успешно прочитан');
      
      // Берем первый лист
      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) {
        const error = 'Файл не содержит листов';
        importLogger.error('Ошибка чтения файла', { error, userId });
        throw new AppError(error, 400, 'NO_WORKSHEETS');
      }

      // Получаем заголовки из первой строки
      const headers: string[] = [];
      worksheet.getRow(1).eachCell((cell, colNumber) => {
        headers[colNumber - 1] = cell.value?.toString().toLowerCase().trim() || '';
      });
      
      importLogger.debug('Заголовки файла', { headers });

      // Проверяем обязательные колонки
      const requiredColumns = ['name_ru', 'address_ru', 'infrastructure_type', 'region'];
      const missingColumns = requiredColumns.filter(col => !headers.includes(col));
      
      if (missingColumns.length > 0) {
        const error = `Отсутствуют обязательные колонки: ${missingColumns.join(', ')}`;
        importLogger.error('Ошибка валидации заголовков', {
          error,
          missingColumns,
          foundHeaders: headers,
          userId,
        });
        throw new AppError(error, 400, 'MISSING_COLUMNS');
      }

      // Загружаем справочники для сопоставления
      const infrastructureTypes = await prisma.infrastructureType.findMany({
        include: { translations: true },
      });
      
      const regions = await prisma.region.findMany({
        include: { translations: true },
      });
      
      const priorityDirections = await prisma.priorityDirection.findMany();

      importLogger.debug('Справочники загружены', {
        infrastructureTypes: infrastructureTypes.length,
        regions: regions.length,
        priorityDirections: priorityDirections.length,
      });

      // Создаем запись истории импорта
      const importHistory = await prisma.importHistory.create({
        data: {
          userId,
          filename: path.basename(filePath),
          status: 'PROCESSING',
          totalRows: 0,
          successRows: 0,
          errorRows: 0,
        },
      });

      importLogger.info('Создана запись истории импорта', {
        importHistoryId: importHistory.id,
        userId,
      });

      // Обрабатываем строки начиная со второй
      const rows: ImportRow[] = [];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Пропускаем заголовки
        
        const rowData: ImportRow = {};
        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber - 1];
          if (header && cell.value !== null && cell.value !== undefined) {
            rowData[header as keyof ImportRow] = cell.value as any;
          }
        });
        
        // Проверяем, что строка не пустая
        if (Object.keys(rowData).length > 0) {
          rows.push(rowData);
        }
      });

      result.totalRows = rows.length;
      importLogger.info('Начало обработки строк', {
        totalRows: result.totalRows,
        importHistoryId: importHistory.id,
      });

      // Обрабатываем каждую строку
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2; // +2 потому что начинаем со второй строки Excel

        try {
          // Валидация обязательных полей
          if (!row.name_ru || !row.address_ru) {
            throw new Error('Отсутствует обязательное поле: название или адрес на русском');
          }

          // Находим тип инфраструктуры
          const infrastructureType = infrastructureTypes.find(type => {
            return type.translations.some(trans => 
              trans.name.toLowerCase() === row.infrastructure_type?.toLowerCase()
            );
          });

          if (!infrastructureType) {
            throw new Error(`Неизвестный тип инфраструктуры: ${row.infrastructure_type}`);
          }

          // Находим регион
          const region = regions.find(r => {
            return r.translations.some(trans => 
              trans.name.toLowerCase() === row.region?.toLowerCase()
            );
          });

          if (!region) {
            throw new Error(`Неизвестный регион: ${row.region}`);
          }

          // Парсим приоритетные направления
          const priorityDirectionIds: number[] = [];
          if (row.priority_directions) {
            const directionNames = row.priority_directions.split(/[,;]/).map(d => d.trim());
            for (const dirName of directionNames) {
              const direction = priorityDirections.find(pd => 
                pd.name.toLowerCase() === dirName.toLowerCase()
              );
              if (direction) {
                priorityDirectionIds.push(direction.id);
              } else {
                importLogger.warn('Неизвестное приоритетное направление', {
                  rowNumber,
                  directionName: dirName,
                });
              }
            }
          }

          // Парсим телефоны
          const phones = row.phones ? row.phones.split(/[,;]/).map(phone => ({
            number: phone.trim(),
            type: 'MAIN' as const,
          })) : [];

          // Парсим организации
          const organizations = row.organizations ? row.organizations.split(/[,;]/).map(org => ({
            name: org.trim(),
          })) : [];

          // Создаем объект
          const createdObject = await prisma.object.create({
            data: {
              infrastructureTypeId: infrastructureType.id,
              regionId: region.id,
              latitude: row.latitude ? Number(row.latitude) : null,
              longitude: row.longitude ? Number(row.longitude) : null,
              googleMapsUrl: row.google_maps_url || null,
              website: row.website || null,
              geocodingStatus: row.latitude && row.longitude ? 'SUCCESS' : 'PENDING',
              translations: {
                create: [
                  {
                    languageCode: 'ru',
                    name: row.name_ru,
                    address: row.address_ru,
                    isPublished: true,
                  },
                  ...(row.name_kz && row.address_kz ? [{
                    languageCode: 'kz',
                    name: row.name_kz,
                    address: row.address_kz,
                    isPublished: true,
                  }] : []),
                  ...(row.name_en && row.address_en ? [{
                    languageCode: 'en',
                    name: row.name_en,
                    address: row.address_en,
                    isPublished: true,
                  }] : []),
                ],
              },
              phones: phones.length > 0 ? {
                create: phones.map((phone, index) => ({
                  ...phone,
                  order: index,
                })),
              } : undefined,
              priorityDirections: priorityDirectionIds.length > 0 ? {
                create: priorityDirectionIds.map(dirId => ({
                  priorityDirectionId: dirId,
                })),
              } : undefined,
              organizations: organizations.length > 0 ? {
                create: organizations,
              } : undefined,
            },
          });

          result.successRows++;
          
          importLogger.debug('Объект успешно создан', {
            rowNumber,
            objectId: createdObject.id,
            name: row.name_ru,
          });
          
        } catch (error: any) {
          result.errorRows++;
          const errorDetails = {
            row: rowNumber,
            error: error.message,
            data: row,
          };
          
          result.errors.push(errorDetails);
          
          // Логируем каждую ошибку импорта
          importLogger.error('Ошибка импорта строки', {
            ...errorDetails,
            importHistoryId: importHistory.id,
            stack: error.stack,
          });
        }
      }

      // Обновляем историю импорта
      await prisma.importHistory.update({
        where: { id: importHistory.id },
        data: {
          status: result.errorRows === 0 ? 'SUCCESS' : 'PARTIAL',
          totalRows: result.totalRows,
          successRows: result.successRows,
          errorRows: result.errorRows,
          errors: result.errors.length > 0 ? result.errors : undefined,
          completedAt: new Date(),
        },
      });

      // Логируем результат импорта
      importLogger.info('Импорт завершен', {
        importHistoryId: importHistory.id,
        userId,
        totalRows: result.totalRows,
        successRows: result.successRows,
        errorRows: result.errorRows,
        status: result.errorRows === 0 ? 'SUCCESS' : 'PARTIAL',
      });

    } catch (error: any) {
      importLogger.error('Критическая ошибка импорта', {
        error: error.message,
        stack: error.stack,
        userId,
        filename: path.basename(filePath),
      });
      throw error;
    } finally {
      // Удаляем временный файл
      try {
        await fs.unlink(filePath);
        importLogger.debug('Временный файл удален', { filePath });
      } catch (error) {
        importLogger.error('Ошибка удаления временного файла', {
          error,
          filePath,
        });
      }
    }

    return result;
  }

  // Генерация шаблона для импорта
  static async generateTemplate(): Promise<string> {
    try {
      importLogger.info('Генерация шаблона для импорта');
      
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Объекты');

      // Заголовки
      const headers = [
        'name_ru',
        'name_kz',
        'name_en',
        'address_ru',
        'address_kz',
        'address_en',
        'infrastructure_type',
        'region',
        'latitude',
        'longitude',
        'google_maps_url',
        'website',
        'phones',
        'priority_directions',
        'organizations',
      ];

      // Добавляем заголовки
      worksheet.addRow(headers);

      // Стилизация заголовков
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };

      // Примеры данных
      const examples = [
        {
          name_ru: 'Технопарк Алатау',
          name_kz: 'Алатау технопаркі',
          name_en: 'Alatau Technopark',
          address_ru: 'г. Алматы, ул. Ибрагимова, 9',
          address_kz: 'Алматы қ., Ибрагимов көш., 9',
          address_en: '9 Ibragimov St., Almaty',
          infrastructure_type: 'Технопарк',
          region: 'г. Алматы',
          latitude: 43.238949,
          longitude: 76.889709,
          google_maps_url: 'https://maps.app.goo.gl/example',
          website: 'https://example.kz',
          phones: '+77273201821;+77273201822',
          priority_directions: 'Информационные технологии;Биотехнологии',
          organizations: 'ТОО Компания 1;ТОО Компания 2',
        },
      ];

      examples.forEach(example => {
        worksheet.addRow(Object.values(example));
      });

      // Автоматическая ширина колонок
      worksheet.columns.forEach(column => {
        if (column.values) {
          const lengths = column.values.map(v => v?.toString().length || 0);
          const maxLength = Math.max(...lengths);
          column.width = Math.min(maxLength + 2, 50);
        }
      });

      // Добавляем второй лист с инструкциями
      const instructionSheet = workbook.addWorksheet('Инструкция');
      instructionSheet.addRow(['Инструкция по заполнению']);
      instructionSheet.addRow([]);
      instructionSheet.addRow(['Обязательные поля:']);
      instructionSheet.addRow(['- name_ru: Название на русском языке']);
      instructionSheet.addRow(['- address_ru: Адрес на русском языке']);
      instructionSheet.addRow(['- infrastructure_type: Тип инфраструктуры (точное название из справочника)']);
      instructionSheet.addRow(['- region: Регион (точное название из справочника)']);
      instructionSheet.addRow([]);
      instructionSheet.addRow(['Необязательные поля:']);
      instructionSheet.addRow(['- name_kz, name_en: Названия на других языках']);
      instructionSheet.addRow(['- address_kz, address_en: Адреса на других языках']);
      instructionSheet.addRow(['- latitude, longitude: Координаты (числа)']);
      instructionSheet.addRow(['- google_maps_url: Ссылка на Google Maps']);
      instructionSheet.addRow(['- website: Веб-сайт организации']);
      instructionSheet.addRow(['- phones: Телефоны через точку с запятой']);
      instructionSheet.addRow(['- priority_directions: Приоритетные направления через точку с запятой']);
      instructionSheet.addRow(['- organizations: Организации через точку с запятой']);

      // Сохраняем файл
      const templatePath = path.join('uploads', `template-${Date.now()}.xlsx`);
      await workbook.xlsx.writeFile(templatePath);
      
      importLogger.info('Шаблон успешно создан', { templatePath });
      
      return templatePath;
    } catch (error: any) {
      importLogger.error('Ошибка генерации шаблона', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}
