const express = require('express');
const router = express.Router();
const prisma = require('../config/db');


// Логин
router.post('/login', async (req, res) => {
  const { email, password } = req.body; // Получаем email и пароль
  
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    // Проверка пароля (без хеширования)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Неверный пароль' });
    }
    
    res.json({
      id: user.id,
      email: user.email,
      role: user.role
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Регистрация
router.post('/register', async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Email уже занят' });
    }
    
    const newUser = await prisma.user.create({
      data: {
        email,
        password: password, // Пароль хранится открыто
        role: role || 'employee'
      }
    });
    
    res.json({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Ошибка создания пользователя' });
  }
});

module.exports = router;