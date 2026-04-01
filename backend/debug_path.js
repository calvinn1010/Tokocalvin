const path = require('path');
const fs = require('fs');

const __dirname_mock = 'D:\\music-rental-system-modern2\\backend\\routes';
const image_from_db = '/uploads/1711894456789-guitar.jpg';

const filePath = path.join(__dirname_mock, '..', image_from_db);
console.log('Mocked dirname:', __dirname_mock);
console.log('Image from DB:', image_from_db);
console.log('Calculated filePath:', filePath);

// Check if backend folder exists
const backendDir = path.join(__dirname_mock, '..');
console.log('Backend directory:', backendDir);
if (fs.existsSync(backendDir)) {
  console.log('Backend directory exists');
  const uploadsDir = path.join(backendDir, 'uploads');
  if (fs.existsSync(uploadsDir)) {
    console.log('Uploads directory exists:', uploadsDir);
  } else {
    console.log('Uploads directory DOES NOT exist:', uploadsDir);
  }
}
