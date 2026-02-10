# 🎵 Sistem Peminjaman Alat Musik (MySQL Version)

Aplikasi web fullstack untuk manajemen peminjaman alat musik dengan **MySQL Database** dan **Sequelize ORM**.

## 🌟 Upgrade dari Versi Sebelumnya

### ✅ Database Real (MySQL)
- ❌ Sebelumnya: Array in-memory (data hilang saat restart)
- ✅ Sekarang: MySQL Database dengan Sequelize ORM
- ✅ Data persisten dan scalable
- ✅ Relational database dengan foreign keys
- ✅ Transaction support

### 📊 Database Schema

```
users                  categories           instruments              rentals
├─ id (PK)            ├─ id (PK)          ├─ id (PK)              ├─ id (PK)
├─ username           ├─ name             ├─ name                 ├─ user_id (FK)
├─ email              ├─ icon             ├─ category_id (FK)     ├─ instrument_id (FK)
├─ password           ├─ color            ├─ condition            ├─ start_date
├─ full_name          └─ description      ├─ stock                ├─ end_date
├─ role                                   ├─ price_per_day        ├─ status
├─ phone                                  ├─ description          ├─ total_price
├─ address                                ├─ image                ├─ approved_by (FK)
└─ is_active                              ├─ brand                └─ approved_at
                                          ├─ year                  
                                          └─ is_available
```

## 🛠 Tech Stack

### Backend
- **Node.js + Express** - Server framework
- **MySQL** - Relational database
- **Sequelize** - ORM untuk MySQL
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload

### Frontend  
- **React 18 + Vite** - UI framework
- **Bootstrap 5 + Tailwind** - Styling
- **Axios** - HTTP client
- **React Router** - Navigation

## 📦 Installation

### Prerequisites
```bash
# Install MySQL
sudo apt install mysql-server  # Ubuntu/Debian
brew install mysql             # macOS
# Download from mysql.com       # Windows

# Install Node.js (v14+)
# Download dari nodejs.org
```

### 1. Setup MySQL Database

```bash
# Login ke MySQL
mysql -u root -p

# Buat database
CREATE DATABASE music_rental_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Buat user (opsional)
CREATE USER 'musicuser'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON music_rental_db.* TO 'musicuser'@'localhost';
FLUSH PRIVILEGES;

EXIT;
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Edit .env file
# Sesuaikan dengan konfigurasi MySQL Anda:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=music_rental_db

# Buat database (jika belum)
npm run db:create

# Run migrations (buat tables)
npm run db:migrate

# Seed data awal
npm run db:seed

# Start server
npm run dev
```

Server running di: `http://localhost:5000`
w
### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend running di: `http://localhost:3000`

## 🔑 Default Accounts

| Role | Username | Password | Email |
|------|----------|----------|-------|
| 👨‍💼 Admin | admin | admin123 | admin@musicrental.com |
| 👨‍🔧 Petugas | petugas | petugas123 | petugas@musicrental.com |
| 👤 User | budi | user123 | budi@email.com |
| 👤 User | siti | user123 | siti@email.com |
| 👤 User | andi | user123 | andi@email.com |

## 📊 Sample Data

### 8 Kategori Alat Musik
- 🎸 Gitar (3 alat)
- 🎹 Piano & Keyboard (3 alat)
- 🥁 Drum & Perkusi (3 alat)
- 🎺 Alat Musik Tiup (3 alat)
- 🎻 Biola & String (3 alat)
- 🎸 Bass (2 alat)
- 🎛️ Synthesizer (2 alat)
- 🪘 Alat Musik Tradisional (3 alat)

**Total: 22 alat musik dengan detail lengkap**

### Sample Instruments
- Gitar Akustik Yamaha F310 - Rp 50.000/hari
- Gitar Elektrik Fender Stratocaster - Rp 100.000/hari
- Keyboard Casio CTK-3500 - Rp 75.000/hari
- Piano Digital Yamaha P-45 - Rp 150.000/hari
- Drum Set Pearl Export - Rp 150.000/hari
- Saxophone Alto Yamaha YAS-280 - Rp 120.000/hari
- Bass Elektrik Ibanez SR300 - Rp 80.000/hari
- Dan 15 alat musik lainnya...

## 🎯 Features

### For All Users
- 🔐 Login & Registration
- 🎸 Browse catalog dengan kategori
- 🔍 Search & filter instruments
- 📱 Responsive design
- 🎨 Modern UI dengan animasi

### For Users
- ✅ Ajukan peminjaman
- 📊 Track status peminjaman
- 📋 Riwayat peminjaman

### For Petugas
- ✅ CRUD Alat Musik
- ✅ Approve/Reject peminjaman
- 📊 Dashboard statistics

### For Admin
- ✅ Full CRUD Users
- ✅ Full CRUD Instruments  
- ✅ Approve/Reject rentals
- 📊 Complete dashboard
- 👥 User management

## 🔄 API Endpoints

**Base URL:** `http://localhost:5000/api`

### Authentication
```
POST   /auth/register  - Register new user
POST   /auth/login     - Login
GET    /auth/me        - Get current user
```

### Users (Admin only)
```
GET    /users          - Get all users
GET    /users/:id      - Get user by ID
POST   /users          - Create user
PUT    /users/:id      - Update user  
DELETE /users/:id      - Delete user
```

### Categories
```
GET    /categories     - Get all categories
```

### Instruments
```
GET    /instruments         - Get all instruments
GET    /instruments/:id     - Get instrument by ID
POST   /instruments         - Create (Admin/Petugas)
PUT    /instruments/:id     - Update (Admin/Petugas)
DELETE /instruments/:id     - Delete (Admin/Petugas)
```

### Rentals
```
GET    /rentals             - Get rentals (filtered by role)
GET    /rentals/:id         - Get rental by ID
POST   /rentals             - Create rental
PUT    /rentals/:id/status  - Update status (Admin/Petugas)
DELETE /rentals/:id          - Delete rental
```

## 🗂 Project Structure

```
music-rental-system/
├── backend/
│   ├── config/
│   │   └── database.js          # Sequelize config
│   ├── models/
│   │   ├── User.js              # User model
│   │   ├── Category.js          # Category model
│   │   ├── Instrument.js        # Instrument model
│   │   ├── Rental.js            # Rental model
│   │   └── index.js             # Model associations
│   ├── routes/
│   │   ├── auth.js              # Auth routes
│   │   ├── users.js             # User CRUD
│   │   ├── categories.js        # Categories
│   │   ├── instruments.js       # Instruments CRUD
│   │   └── rentals.js           # Rentals CRUD
│   ├── middleware/
│   │   ├── auth.js              # JWT middleware
│   │   └── upload.js            # Multer config
│   ├── scripts/
│   │   ├── createDatabase.js    # Create DB script
│   │   ├── migrate.js           # Migration script
│   │   └── seed.js              # Seeding script
│   ├── uploads/                 # Uploaded images
│   ├── .env                     # Environment variables
│   ├── server.js                # Main server
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Instruments.jsx
    │   │   ├── Rentals.jsx
    │   │   └── Users.jsx
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

## 🐛 Troubleshooting

### MySQL Connection Error
```bash
# Check MySQL service
sudo systemctl status mysql
sudo systemctl start mysql

# Check credentials in .env file
DB_USER=root
DB_PASSWORD=your_password
```

### Port Already in Use
```bash
# Backend (Port 5000)
# Edit .env: PORT=5001

# Frontend (Port 3000)
# Edit vite.config.js: port: 3001
```

### Migration Error
```bash
# Reset database
mysql -u root -p -e "DROP DATABASE music_rental_db; CREATE DATABASE music_rental_db;"

# Re-run migration
npm run db:migrate
npm run db:seed
```

### Sequelize Connection Error
```bash
# Test connection
node -e "require('./config/database').testConnection()"

# Check MySQL is running
mysql -u root -p -e "SHOW DATABASES;"
```

## 🚀 Production Deployment

### Backend
1. Set production environment
```env
NODE_ENV=production
DB_HOST=your_production_host
DB_PASSWORD=strong_password
JWT_SECRET=random_secure_string
```

2. Use process manager
```bash
npm install -g pm2
pm2 start server.js --name music-rental-api
pm2 save
pm2 startup
```

### Frontend
```bash
npm run build
# Deploy dist/ folder to:
# - Vercel
# - Netlify
# - AWS S3 + CloudFront
# - Your hosting provider
```

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
DB_HOST=localhost
DB_PORT=3306
DB_NAME=music_rental_db
DB_USER=root
DB_PASSWORD=
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
```

## 🔒 Security

- ✅ Password hashing dengan bcryptjs
- ✅ JWT authentication
- ✅ Protected routes & endpoints
- ✅ Role-based access control
- ✅ Input validation
- ✅ File upload validation
- ✅ SQL injection protection (Sequelize)
- ✅ XSS protection

## 📚 Additional Resources

- [Sequelize Documentation](https://sequelize.org/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)

## 📄 License

MIT License - Free untuk pembelajaran

---

**Built with ❤️ for Music Lovers**
