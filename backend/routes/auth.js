const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/auth.controller');
const { auth } = require('../middleware/auth');
console.log('AuthController:', AuthController);

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.get('/me', auth, AuthController.getCurrentUser);

module.exports = router;
