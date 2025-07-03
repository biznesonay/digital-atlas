const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Добавление тестовых объектов...');

  // Тестовые объекты
  const testObjects = [
    {
      name: 'Парк инновационных технологий Алматы',
      address: 'г. Алматы, ул. Богенбай батыра, 104',
      lat: 43.238949,
      lng: 76.889709,
      infrastructureTypeId: 2, // Технопарк
      regionId: 2, // Алматы
      website: 'https://techpark.kz',
      phones: ['+77273201821']
    },
    {
      name: 'Astana Hub',
      address: 'г. Астана, пр. Мәңгілік Ел, 55/11',
      lat: 51.088797,
      lng: 71.392974,
      infrastructureTypeId: 4, // IT-хаб
      regionId: 1, // Астана
      website: 'https://astanahub.com',
      phones: ['+77172695777']
    },
    {
      name: 'NURIS Технопарк',
      address: 'г. Астана, Кабанбай батыра, 53',
      lat: 51.090556,
      lng: 71.418333,
      infrastructureTypeId: 2, // Технопарк
      regionId: 1, // Астана
      website: 'https://nuris.nu.edu.kz',
      phones: ['+77172706688']
    },
    {
      name: 'Бизнес-инкубатор MOST',
      address: 'г. Алматы, ул. Тимирязева, 28В',
      lat: 43.235684,
      lng: 76.909563,
      infrastructureTypeId: 3, // Бизнес-инкубатор
      regionId: 2, // Алматы
      website: 'https://most.com.kz',
      phones: ['+77273132151']
    }
  ];

  // Добавляем объекты
  for (const obj of testObjects) {
    try {
      const created = await prisma.object.create({
        data: {
          infrastructureTypeId: obj.infrastructureTypeId,
          regionId: obj.regionId,
          latitude: obj.lat,
          longitude: obj.lng,
          googleMapsUrl: `https://maps.google.com/?q=${obj.lat},${obj.lng}`,
          website: obj.website,
          geocodingStatus: 'SUCCESS',
          translations: {
            create: [
              {
                languageCode: 'ru',
                name: obj.name,
                address: obj.address,
                isPublished: true
              }
            ]
          },
          phones: {
            create: obj.phones.map((phone, index) => ({
              number: phone,
              type: index === 0 ? 'MAIN' : 'ADDITIONAL',
              order: index
            }))
          },
          priorityDirections: {
            connect: [
              { id: 1 }, // Информационные технологии
              { id: 2 }  // Возобновляемые источники энергии
            ]
          }
        }
      });
      console.log(`✅ Добавлен: ${obj.name}`);
    } catch (error) {
      console.error(`❌ Ошибка при добавлении ${obj.name}:`, error.message);
    }
  }

  console.log('✅ Готово!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
