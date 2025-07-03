// test-auth.js
const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function testAuth() {
  try {
    console.log('1. Тестируем вход в систему...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'Admin123!'
    });
    
    console.log('✅ Вход успешен!');
    console.log('Пользователь:', loginResponse.data.data.user);
    
    const accessToken = loginResponse.data.data.accessToken;
    
    console.log('\n2. Тестируем получение данных пользователя...');
    const meResponse = await axios.get(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('✅ Данные получены!');
    console.log('Текущий пользователь:', meResponse.data.data);
    
  } catch (error) {
    console.error('❌ Ошибка:', error.response?.data || error.message);
  }
}

testAuth();