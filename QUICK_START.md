# 🚀 QUICK START GUIDE

## Sistem Peminjaman Alat Musik - MySQL Version

### ⚡ Setup Super Cepat (5 Menit)

#### 1. Install MySQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server

# macOS  
brew install mysql

# Windows
# Download dari: https://dev.mysql.com/downloads/mysql/
```

#### 2. Setup Database
```bash
# Login MySQL
mysql -u root -p

# Buat database
CREATE DATABASE music_rental_db;
EXIT;
```

#### 3. Setup Backend
```bash
cd backend
npm install

# Edit .env - Sesuaikan password MySQL:
# DB_PASSWORD=your_mysql_password

# Run migration & seed
npm run db:migrate
npm run db:seed

# Start server
npm run dev
```

#### 4. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

#### 5. Login!
```
URL: http://localhost:3000
Username: admin
Password: admin123
```

### 📊 Data Yang Tersedia

**Users: 5 akun**
- admin / admin123
- petugas / petugas123  
- budi / user123
- siti / user123
- andi / user123

**Instruments: 22 alat musik**
- 8 Kategori lengkap
- Stock & harga real
- Detail brand & tahun

**Sample Rentals: 5 peminjaman**
- Status: pending, approved, returned

### 🔧 Troubleshooting

**MySQL Connection Failed?**
```bash
# Check service
sudo systemctl status mysql
sudo systemctl start mysql

# Test connection
mysql -u root -p -e "SELECT 1"
```

**Port Conflict?**
```bash
# Backend: Edit .env → PORT=5001
# Frontend: Edit vite.config.js → port: 3001
```

**Migration Error?**
```bash
# Reset database
mysql -u root -p -e "DROP DATABASE music_rental_db; CREATE DATABASE music_rental_db;"
npm run db:migrate
npm run db:seed
```

### 📁 File Structure
```
backend/
├── config/database.js     ← Sequelize config
├── models/                ← Database models
├── routes/                ← API endpoints  
├── scripts/               ← Setup scripts
└── server.js              ← Main server

frontend/
├── src/pages/             ← React pages
├── src/components/        ← React components
└── src/utils/api.js       ← API client
```

### 🎯 Features Checklist

- [x] MySQL Database dengan Sequelize ORM
- [x] 22 Alat Musik Real dengan Harga
- [x] 8 Kategori Musik Lengkap
- [x] Role-based Access Control
- [x] Modern UI dengan Animasi
- [x] Search & Filter
- [x] Responsive Design
- [x] JWT Authentication

### 💡 Tips

1. **Development**: Gunakan `npm run dev` untuk auto-reload
2. **Production**: Gunakan PM2 atau Docker
3. **Backup**: `mysqldump -u root -p music_rental_db > backup.sql`
4. **Reset**: Drop database, migrate, dan seed ulang

### 📚 Dokumentasi Lengkap

- README.md - Full documentation
- DATABASE_SCHEMA.sql - SQL reference
- SETUP_INSTRUCTIONS.md - Detailed setup

### 🆘 Need Help?

Common issues:
1. **Can't connect MySQL** → Check .env credentials
2. **Port in use** → Change port in .env/vite.config
3. **Seed error** → Drop & recreate database
4. **Frontend error** → Check backend is running

---

**Ready to start? Just run the commands above! 🎵**
