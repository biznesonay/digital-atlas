const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/objects', (req, res) => {
  res.json({ 
    success: true, 
    data: [],
    count: 0
  });
});

app.get('/api/dictionaries/infrastructure-types', (req, res) => {
  res.json({ 
    success: true, 
    data: [
      { id: 1, name: 'Технопарк', icon: 'science', color: '#388E3C' },
      { id: 2, name: 'IT-хаб', icon: 'computer', color: '#F57C00' },
      { id: 3, name: 'Бизнес-инкубатор', icon: 'lightbulb', color: '#7B1FA2' },
      { id: 4, name: 'СЭЗ', icon: 'business_center', color: '#1976D2' }
    ]
  });
});

app.get('/api/dictionaries/regions', (req, res) => {
  res.json({ 
    success: true, 
    data: [
      { id: 1, name: 'г. Астана' },
      { id: 2, name: 'г. Алматы' },
      { id: 3, name: 'Акмолинская область' }
    ]
  });
});

app.get('/api/dictionaries/priority-directions', (req, res) => {
  res.json({ 
    success: true, 
    data: [
      { id: 1, name: 'Информационные технологии' },
      { id: 2, name: 'Возобновляемые источники энергии' },
      { id: 3, name: 'Биотехнологии' }
    ]
  });
});

app.listen(PORT, () => {
  console.log('✅ Server running on port ' + PORT);
  console.log('📍 API: http://localhost:' + PORT + '/api');
  console.log('\nAvailable endpoints:');
  console.log('  GET /api/health');
  console.log('  GET /api/objects');
  console.log('  GET /api/dictionaries/infrastructure-types');
  console.log('  GET /api/dictionaries/regions');
  console.log('  GET /api/dictionaries/priority-directions');
});
