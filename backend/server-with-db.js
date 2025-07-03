const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const PORT = 3001;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// API endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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
    });
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

start();
