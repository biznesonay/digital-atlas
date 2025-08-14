import { PrismaClient } from '@prisma/client';
// @ts-ignore
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Создание суперадмина
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  });

  // Создание типов инфраструктуры
  const infrastructureTypes = [
    { icon: '🏭', color: '#1976D2', names: { ru: 'СЭЗ', kz: 'АЭА', en: 'SEZ' } },
    { icon: '🏢', color: '#388E3C', names: { ru: 'Технопарк', kz: 'Технопарк', en: 'Technopark' } },
    { icon: '💡', color: '#7B1FA2', names: { ru: 'Бизнес-инкубатор', kz: 'Бизнес-инкубатор', en: 'Business Incubator' } },
    { icon: '💻', color: '#F57C00', names: { ru: 'IT-хаб', kz: 'IT-хаб', en: 'IT Hub' } },
    { icon: '💰', color: '#D32F2F', names: { ru: 'Венчурный фонд', kz: 'Венчурлық қор', en: 'Venture Fund' } },
  ];

  for (const type of infrastructureTypes) {
    const created = await prisma.infrastructureType.create({
      data: {
        icon: type.icon,
        color: type.color,
        translations: {
          create: [
            { languageCode: 'ru', name: type.names.ru },
            { languageCode: 'kz', name: type.names.kz },
            { languageCode: 'en', name: type.names.en },
          ],
        },
      },
    });
    console.log(`Created infrastructure type: ${type.names.ru}`);
  }

  // Создание регионов
  const regions = [
    { names: { ru: 'г. Астана', kz: 'Астана қ.', en: 'Astana' } },
    { names: { ru: 'г. Алматы', kz: 'Алматы қ.', en: 'Almaty' } },
    { names: { ru: 'г. Шымкент', kz: 'Шымкент қ.', en: 'Shymkent' } },
    { names: { ru: 'Акмолинская область', kz: 'Ақмола облысы', en: 'Akmola Region' } },
    { names: { ru: 'Актюбинская область', kz: 'Ақтөбе облысы', en: 'Aktobe Region' } },
    { names: { ru: 'Алматинская область', kz: 'Алматы облысы', en: 'Almaty Region' } },
    { names: { ru: 'Атырауская область', kz: 'Атырау облысы', en: 'Atyrau Region' } },
    { names: { ru: 'Восточно-Казахстанская область', kz: 'Шығыс Қазақстан облысы', en: 'East Kazakhstan Region' } },
    { names: { ru: 'Жамбылская область', kz: 'Жамбыл облысы', en: 'Zhambyl Region' } },
    { names: { ru: 'Западно-Казахстанская область', kz: 'Батыс Қазақстан облысы', en: 'West Kazakhstan Region' } },
    { names: { ru: 'Карагандинская область', kz: 'Қарағанды облысы', en: 'Karaganda Region' } },
    { names: { ru: 'Костанайская область', kz: 'Қостанай облысы', en: 'Kostanay Region' } },
    { names: { ru: 'Кызылординская область', kz: 'Қызылорда облысы', en: 'Kyzylorda Region' } },
    { names: { ru: 'Мангистауская область', kz: 'Маңғыстау облысы', en: 'Mangystau Region' } },
    { names: { ru: 'Павлодарская область', kz: 'Павлодар облысы', en: 'Pavlodar Region' } },
    { names: { ru: 'Северо-Казахстанская область', kz: 'Солтүстік Қазақстан облысы', en: 'North Kazakhstan Region' } },
    { names: { ru: 'Туркестанская область', kz: 'Түркістан облысы', en: 'Turkestan Region' } },
  ];

  for (const region of regions) {
    await prisma.region.create({
      data: {
        translations: {
          create: [
            { languageCode: 'ru', name: region.names.ru },
            { languageCode: 'kz', name: region.names.kz },
            { languageCode: 'en', name: region.names.en },
          ],
        },
      },
    });
    console.log(`Created region: ${region.names.ru}`);
  }

  // Создание приоритетных направлений
  const priorityDirections = [
    'Информационные технологии',
    'Возобновляемые источники энергии',
    'Биотехнологии',
    'Робототехника и автоматизация',
    'Новые материалы',
    'Искусственный интеллект',
    'Нанотехнологии',
    'Космические технологии',
  ];

  for (const direction of priorityDirections) {
    await prisma.priorityDirection.create({
      data: { name: direction },
    });
    console.log(`Created priority direction: ${direction}`);
  }

  // Создание тестовых объектов
  const testObjects = [
    {
      name: { ru: 'Технопарк Астана', kz: 'Астана технопаркі', en: 'Astana Technopark' },
      address: { ru: 'ул. Мангилик Ел, 55', kz: 'Мәңгілік Ел к., 55', en: 'Mangilik El Ave, 55' },
      latitude: 51.088605,
      longitude: 71.403877,
      infrastructureTypeId: 2,
      regionId: 1,
      website: 'https://techpark.kz',
      contactPhones: '+7 (7172) 123-456',
      priorityDirections: [1, 3, 6],
    },
    {
      name: { ru: 'IT-хаб Алматы', kz: 'Алматы IT-хабы', en: 'Almaty IT Hub' },
      address: { ru: 'ул. Тимирязева, 42', kz: 'Тимирязев к., 42', en: 'Timiryazev St, 42' },
      latitude: 43.238949,
      longitude: 76.889709,
      infrastructureTypeId: 4,
      regionId: 2,
      website: 'https://ithub.kz',
      contactPhones: '+7 (727) 987-654',
      priorityDirections: [1, 6, 7],
    },
  ];

  for (const obj of testObjects) {
    const created = await prisma.object.create({
      data: {
        infrastructureTypeId: obj.infrastructureTypeId,
        regionId: obj.regionId,
        latitude: obj.latitude,
        longitude: obj.longitude,
        website: obj.website,
        contactPhones: obj.contactPhones,
        translations: {
          create: [
            { languageCode: 'ru', name: obj.name.ru, address: obj.address.ru, isPublished: true },
            { languageCode: 'kz', name: obj.name.kz, address: obj.address.kz, isPublished: true },
            { languageCode: 'en', name: obj.name.en, address: obj.address.en, isPublished: true },
          ],
        },
        priorityDirections: {
          create: obj.priorityDirections.map(id => ({
            priorityDirection: { connect: { id } },
          })),
        },
      },
    });
    console.log(`Created test object: ${obj.name.ru}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });