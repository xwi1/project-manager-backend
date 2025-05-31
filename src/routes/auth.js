const express = require('express');
const router = express.Router();
const prisma = require('../config/db');

// Логин
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } }, department: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Проверка пароля (без хеширования)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Неверный пароль' });
    }

    // Возвращаем роли пользователя
    res.json({
      id: user.id,
      email: user.email,
      roles: user.roles.map((userRole) => userRole.role.name),
      department: user.department?.name || null,
    });

  } catch (error) {
    res.status(500).json({ error: 'Ошибка авторизации' });
    console.log(error);
  }
});

// Регистрация
router.post('/register', async (req, res) => {
  const { email, password, roleNames, departmentId } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ error: 'Email уже занят' });
    }

    // Находим роли по их названиям
    const roles = await prisma.role.findMany({
      where: { name: { in: roleNames } },
    });

    const newUser = await prisma.user.create({
      data: {
        email,
        password,
        departmentId: departmentId || null,
        roles: {
          create: roles.map((role) => ({ roleId: role.id })),
        },
      },
    });

    res.json({
      id: newUser.id,
      email: newUser.email,
      roles: roleNames,
      department: departmentId ? { id: departmentId } : null,
    });

  } catch (error) {
    res.status(500).json({ error: 'Ошибка создания пользователя' });
    console.log(error);
  }
});

module.exports = router;