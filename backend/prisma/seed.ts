import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начинаем заполнение базы данных...');

  // 1. Создаем суперадмина
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@digitalatlas.kz' },
    update: {},
    create: {
      email: 'admin@digitalatlas.kz',
      password: hashedPassword,
      name: 'Главный администратор',
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });
  
  console.log('✅ Создан суперадмин:', superAdmin.email);

  // 2. Создаем типы инфраструктуры
  const infrastructureTypesData = [
    {
      icon: 'business_center',
      color: '#1976D2',
      order: 1,
      nameRu: 'Специальная экономическая зона',
      nameKz: 'Арнайы экономикалық аймақ',
      nameEn: 'Special Economic Zone',
    },
    {
      icon: 'science',
      color: '#388E3C',
      order: 2,
      nameRu: 'Технопарк',
      nameKz: 'Технопарк',
      nameEn: 'Technopark',
    },
    {
      icon: 'lightbulb',
      color: '#7B1FA2',
      order: 3,
      nameRu: 'Бизнес-инкубатор',
      nameKz: 'Бизнес-инкубатор',
      nameEn: 'Business Incubator',
    },
    {
      icon: 'computer',
      color: '#F57C00',
      order: 4,
      nameRu: 'IT-хаб',
      nameKz: 'IT-хаб',
      nameEn: 'IT Hub',
    },
    {
      icon: 'account_balance',
      color: '#D32F2F',
      order: 5,
      nameRu: 'Венчурный фонд',
      nameKz: 'Венчурлық қор',
      nameEn: 'Venture Fund',
    },
    {
      icon: 'swap_horiz',
      color: '#0288D1',
      order: 6,
      nameRu: 'Центр трансфера технологий',
      nameKz: 'Технологияларды трансферттеу орталығы',
      nameEn: 'Technology Transfer Center',
    },
    {
      icon: 'engineering',
      color: '#455A64',
      order: 7,
      nameRu: 'Отраслевое КБ',
      nameKz: 'Салалық КБ',
      nameEn: 'Industry Design Bureau',
    },
  ];

  for (const typeData of infrastructureTypesData) {
    const { nameRu, nameKz, nameEn, ...typeInfo } = typeData;
    
    await prisma.infrastructureType.create({
      data: {
        ...typeInfo,
        isActive: true,
        translations: {
          create: [
            { languageCode: 'ru', name: nameRu },
            { languageCode: 'kz', name: nameKz },
            { languageCode: 'en', name: nameEn },
          ],
        },
      },
    });
  }
  
  console.log('✅ Созданы типы инфраструктуры:', infrastructureTypesData.length);

  // 3. Создаем регионы Казахстана
  const regionsData = [
    { code: '01', nameRu: 'г. Астана', nameKz: 'Астана қ.', nameEn: 'Astana' },
    { code: '02', nameRu: 'г. Алматы', nameKz: 'Алматы қ.', nameEn: 'Almaty' },
    { code: '03', nameRu: 'г. Шымкент', nameKz: 'Шымкент қ.', nameEn: 'Shymkent' },
    { code: '10', nameRu: 'Абайская область', nameKz: 'Абай облысы', nameEn: 'Abay Region' },
    { code: '11', nameRu: 'Акмолинская область', nameKz: 'Ақмола облысы', nameEn: 'Akmola Region' },
    { code: '12', nameRu: 'Актюбинская область', nameKz: 'Ақтөбе облысы', nameEn: 'Aktobe Region' },
    { code: '13', nameRu: 'Алматинская область', nameKz: 'Алматы облысы', nameEn: 'Almaty Region' },
    { code: '14', nameRu: 'Атырауская область', nameKz: 'Атырау облысы', nameEn: 'Atyrau Region' },
    { code: '15', nameRu: 'Восточно-Казахстанская область', nameKz: 'Шығыс Қазақстан облысы', nameEn: 'East Kazakhstan Region' },
    { code: '16', nameRu: 'Жамбылская область', nameKz: 'Жамбыл облысы', nameEn: 'Jambyl Region' },
    { code: '17', nameRu: 'Жетысуская область', nameKz: 'Жетісу облысы', nameEn: 'Jetisu Region' },
    { code: '18', nameRu: 'Западно-Казахстанская область', nameKz: 'Батыс Қазақстан облысы', nameEn: 'West Kazakhstan Region' },
    { code: '19', nameRu: 'Карагандинская область', nameKz: 'Қарағанды облысы', nameEn: 'Karaganda Region' },
    { code: '20', nameRu: 'Костанайская область', nameKz: 'Қостанай облысы', nameEn: 'Kostanay Region' },
    { code: '21', nameRu: 'Кызылординская область', nameKz: 'Қызылорда облысы', nameEn: 'Kyzylorda Region' },
    { code: '22', nameRu: 'Мангистауская область', nameKz: 'Маңғыстау облысы', nameEn: 'Mangystau Region' },
    { code: '23', nameRu: 'Павлодарская область', nameKz: 'Павлодар облысы', nameEn: 'Pavlodar Region' },
    { code: '24', nameRu: 'Северо-Казахстанская область', nameKz: 'Солтүстік Қазақстан облысы', nameEn: 'North Kazakhstan Region' },
    { code: '25', nameRu: 'Туркестанская область', nameKz: 'Түркістан облысы', nameEn: 'Turkestan Region' },
    { code: '26', nameRu: 'Улытауская область', nameKz: 'Ұлытау облысы', nameEn: 'Ulytau Region' },
  ];

  for (const regionData of regionsData) {
    const { nameRu, nameKz, nameEn, ...regionInfo } = regionData;
    
    await prisma.region.create({
      data: {
        ...regionInfo,
        translations: {
          create: [
            { languageCode: 'ru', name: nameRu },
            { languageCode: 'kz', name: nameKz },
            { languageCode: 'en', name: nameEn },
          ],
        },
      },
    });
  }
  
  console.log('✅ Созданы регионы:', regionsData.length);

  // 4. Создаем приоритетные направления
  const priorityDirections = [
    'Информационные технологии',
    'Технологии в сфере телекоммуникаций и связи',
    'Электроника и приборостроение',
    'Возобновляемые источники энергии, ресурсосбережение и эффективное природопользование',
    'Технологии в сфере создания и применения материалов различного назначения',
    'Технологии в сфере добычи, транспортировки и переработки нефти и газа',
    'Биотехнологии',
    'Нанотехнологии',
    'Космические технологии и исследования',
    'Агропромышленные технологии',
    'Медицинские технологии',
    'Экологические технологии',
  ];

  let orderIndex = 1;
  for (const name of priorityDirections) {
    await prisma.priorityDirection.create({
      data: { 
        name, 
        order: orderIndex++,
        isActive: true 
      },
    });
  }
  
  console.log('✅ Созданы приоритетные направления:', priorityDirections.length);

  // 5. Создаем тестовые объекты (опционально)
  const testObjectData = {
    infrastructureTypeId: 2, // Технопарк
    regionId: 2, // Алматы
    latitude: 43.238949,
    longitude: 76.889709,
    googleMapsUrl: 'https://maps.app.goo.gl/example',
    website: 'https://example.techpark.kz',
    geocodingStatus: 'SUCCESS',
    translations: {
      create: [
        {
          languageCode: 'ru',
          name: 'Парк инновационных технологий Alatau',
          address: 'г. Алматы, ул. Ибрагимова, 9',
          isPublished: true,
        },
        {
          languageCode: 'kz',
          name: 'Alatau инновациялық технологиялар паркі',
          address: 'Алматы қ., Ибрагимов көш., 9',
          isPublished: true,
        },
        {
          languageCode: 'en',
          name: 'Alatau Innovation Technology Park',
          address: '9 Ibragimov St., Almaty',
          isPublished: true,
        },
      ],
    },
    phones: {
      create: [
        { number: '+77273201821', type: 'MAIN', order: 1 },
        { number: '+77273201822', type: 'ADDITIONAL', order: 2 },
      ],
    },
  };

  const testObject = await prisma.object.create({
    data: testObjectData,
  });

  // Связываем с приоритетными направлениями
  await prisma.objectPriorityDirection.createMany({
    data: [
      { objectId: testObject.id, priorityDirectionId: 1 }, // IT
      { objectId: testObject.id, priorityDirectionId: 7 }, // Биотехнологии
    ],
  });

  console.log('✅ Создан тестовый объект:', testObject.id);

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
