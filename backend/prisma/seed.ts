// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начинаем заполнение базы данных...');

  // 1. Создаем типы инфраструктуры
  const infrastructureTypes = [
    {
      icon: 'business_center',
      color: '#1976D2',
      order: 1,
      translations: {
        create: [
          { languageCode: 'ru', name: 'Специальная экономическая зона' },
          { languageCode: 'kz', name: 'Арнайы экономикалық аймақ' },
          { languageCode: 'en', name: 'Special Economic Zone' }
        ]
      }
    },
    {
      icon: 'science',
      color: '#388E3C',
      order: 2,
      translations: {
        create: [
          { languageCode: 'ru', name: 'Технопарк' },
          { languageCode: 'kz', name: 'Технопарк' },
          { languageCode: 'en', name: 'Technopark' }
        ]
      }
    },
    {
      icon: 'lightbulb',
      color: '#7B1FA2',
      order: 3,
      translations: {
        create: [
          { languageCode: 'ru', name: 'Бизнес-инкубатор' },
          { languageCode: 'kz', name: 'Бизнес-инкубатор' },
          { languageCode: 'en', name: 'Business Incubator' }
        ]
      }
    },
    {
      icon: 'computer',
      color: '#F57C00',
      order: 4,
      translations: {
        create: [
          { languageCode: 'ru', name: 'IT-хаб' },
          { languageCode: 'kz', name: 'IT-хаб' },
          { languageCode: 'en', name: 'IT Hub' }
        ]
      }
    }
  ];

  for (const type of infrastructureTypes) {
    await prisma.infrastructureType.create({ data: type });
  }

  console.log('✅ Типы инфраструктуры созданы');

  // 2. Создаем регионы
  const regions = [
    {
      code: 'AST',
      translations: {
        create: [
          { languageCode: 'ru', name: 'г. Астана' },
          { languageCode: 'kz', name: 'Астана қ.' },
          { languageCode: 'en', name: 'Astana' }
        ]
      }
    },
    {
      code: 'ALA',
      translations: {
        create: [
          { languageCode: 'ru', name: 'г. Алматы' },
          { languageCode: 'kz', name: 'Алматы қ.' },
          { languageCode: 'en', name: 'Almaty' }
        ]
      }
    },
    {
      code: 'AKM',
      translations: {
        create: [
          { languageCode: 'ru', name: 'Акмолинская область' },
          { languageCode: 'kz', name: 'Ақмола облысы' },
          { languageCode: 'en', name: 'Akmola Region' }
        ]
      }
    }
  ];

  for (const region of regions) {
    await prisma.region.create({ data: region });
  }

  console.log('✅ Регионы созданы');

  // 3. Создаем приоритетные направления
  const priorityDirections = [
    'Информационные технологии',
    'Возобновляемые источники энергии',
    'Биотехнологии',
    'Новые материалы',
    'Космические технологии'
  ];

  for (let i = 0; i < priorityDirections.length; i++) {
    await prisma.priorityDirection.create({
      data: {
        name: priorityDirections[i],
        order: i + 1
      }
    });
  }

  console.log('✅ Приоритетные направления созданы');

  // 4. Создаем администратора
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  
  await prisma.user.create({
    data: {
      email: process.env.SUPER_ADMIN_EMAIL || 'admin@example.com',
      password: hashedPassword,
      name: process.env.SUPER_ADMIN_NAME || 'Администратор',
      role: 'SUPER_ADMIN',
      isActive: true
    }
  });

  console.log('✅ Администратор создан');
  console.log('📧 Email: admin@example.com');
  console.log('🔑 Пароль: Admin123!');

  console.log('🎉 База данных успешно заполнена начальными данными!');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при заполнении базы данных:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });