const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzc0OTY3ODI3LCJleHAiOjE3NzUwNTQyMjd9.RbOJszaDnTt8n-45P4ElJ8ly9lNIDELJudnwcH7Jg7w'; // Using the admin token from the logs

async function testDeleteImage() {
  try {
    console.log('Fetching first instrument with image...');
    const listRes = await axios.get(`${API_URL}/instruments`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const instrument = listRes.data.find(i => i.image);
    if (!instrument) {
      console.log('No instrument with image found to test.');
      return;
    }
    
    console.log(`Testing image deletion for ID: ${instrument.id} (${instrument.name})`);
    const deleteRes = await axios.delete(`${API_URL}/instruments/${instrument.id}/image`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Response:', deleteRes.data);
  } catch (err) {
    if (err.response) {
      console.error('FAIL - Error response:', err.response.status, err.response.data);
    } else {
      console.error('FAIL - Error:', err.message);
    }
  }
}

testDeleteImage();
