const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const app = express();
const PORT = 3001;
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-min-32-chars';

app.use(cors());
app.use(express.json());

// Middleware для проверки JWT токена
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Токен не предоставлен' });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Недействительный токен' });
  }
};

// API endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AUTH endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user || !user.password) {
      return res.status(401).json({ success: false, error: 'Неверный email или пароль' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Неверный email или пароль' });
    }
    
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.json({
      success: true,
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

// OBJECTS endpoints
app.get('/api/objects', async (req, res) => {
  try {
    const lang = req.query.lang || 'ru';
    const objects = await prisma.object.findMany({
      where: {
        translations: {
          some: {
            languageCode: lang,
            isPublished: true
          }
        }
      },
      include: {
        infrastructureType: {
          include: {
            translations: {
              where: { languageCode: lang }
            }
          }
        },
        region: {
          include: {
            translations: {
              where: { languageCode: lang }
            }
          }
        },
        translations: {
          where: { languageCode: lang }
        },
        phones: true,
        priorityDirections: true,
        organizations: true
      }
    });
    
    const formattedObjects = objects.map(obj => ({
      id: obj.id,
      infrastructureType: {
        id: obj.infrastructureType.id,
        name: obj.infrastructureType.translations[0]?.name || '',
        icon: obj.infrastructureType.icon,
        color: obj.infrastructureType.color
      },
      region: {
        id: obj.region.id,
        name: obj.region.translations[0]?.name || ''
      },
      name: obj.translations[0]?.name || '',
      address: obj.translations[0]?.address || '',
      latitude: obj.latitude,
      longitude: obj.longitude,
      website: obj.website,
      phones: obj.phones,
      priorityDirections: obj.priorityDirections,
      organizations: obj.organizations
    }));
    
    res.json({ 
      success: true, 
      data: formattedObjects,
      count: formattedObjects.length
    });
  } catch (error) {
    console.error('Error fetching objects:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// CREATE object
app.post('/api/objects', authMiddleware, async (req, res) => {
  try {
    const object = await prisma.object.create({
      data: {
        infrastructureTypeId: req.body.infrastructureTypeId,
        regionId: req.body.regionId,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        googleMapsUrl: req.body.googleMapsUrl,
        website: req.body.website,
        geocodingStatus: 'MANUAL',
        translations: {
          create: req.body.translations
        },
        phones: req.body.phones ? {
          create: req.body.phones.map((phone, index) => ({
            number: phone.number,
            type: phone.type || 'MAIN',
            order: index
          }))
        } : undefined
      }
    });
    
    res.status(201).json({ success: true, data: object });
  } catch (error) {
    console.error('Create error:', error);
    res.status(500).json({ success: false, error: 'Ошибка создания объекта' });
  }
});

// UPDATE object
app.put('/api/objects/:id', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Удаляем старые переводы и телефоны
    await prisma.objectTranslation.deleteMany({ where: { objectId: id } });
    await prisma.phone.deleteMany({ where: { objectId: id } });
    
    const object = await prisma.object.update({
      where: { id },
      data: {
        infrastructureTypeId: req.body.infrastructureTypeId,
        regionId: req.body.regionId,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        website: req.body.website,
        translations: {
          create: req.body.translations
        },
        phones: req.body.phones ? {
          create: req.body.phones.map((phone, index) => ({
            number: phone.number,
            type: phone.type || 'MAIN',
            order: index
          }))
        } : undefined
      }
    });
    
    res.json({ success: true, data: object });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ success: false, error: 'Ошибка обновления объекта' });
  }
});

// DELETE object
app.delete('/api/objects/:id', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.object.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, error: 'Ошибка удаления объекта' });
  }
});

// DICTIONARIES endpoints
app.get('/api/dictionaries/infrastructure-types', async (req, res) => {
  try {
    const lang = req.query.lang || 'ru';
    const types = await prisma.infrastructureType.findMany({
      where: { isActive: true },
      include: {
        translations: {
          where: { languageCode: lang }
        }
      }
    });
    
    const formatted = types.map(type => ({
      id: type.id,
      name: type.translations[0]?.name || '',
      icon: type.icon,
      color: type.color
    }));
    
    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

app.get('/api/dictionaries/regions', async (req, res) => {
  try {
    const lang = req.query.lang || 'ru';
    const regions = await prisma.region.findMany({
      include: {
        translations: {
          where: { languageCode: lang }
        }
      }
    });
    
    const formatted = regions.map(region => ({
      id: region.id,
      name: region.translations[0]?.name || ''
    }));
    
    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

app.get('/api/dictionaries/priority-directions', async (req, res) => {
  try {
    const directions = await prisma.priorityDirection.findMany({
      where: { isActive: true }
    });
    res.json({ success: true, data: directions });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// Start server
async function start() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
    
    app.listen(PORT, () => {
      console.log('✅ Server running on port ' + PORT);
      console.log('📍 API: http://localhost:' + PORT + '/api');
      console.log('\nAuth endpoints:');
      console.log('  POST /api/auth/login');
      console.log('\nObject endpoints:');
      console.log('  GET    /api/objects');
      console.log('  POST   /api/objects (auth required)');
      console.log('  PUT    /api/objects/:id (auth required)');
      console.log('  DELETE /api/objects/:id (auth required)');
    });
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

start();
