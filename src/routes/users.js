// routes/users.js
const express = require('express');
const router = express.Router();
const prisma = require('../config/db');

// Получение всех пользователей
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        departmentId: true,
        roles: {
          select: {
            role: {
              select: {
                name: true, // Выбираем только имя роли
              },
            },
          },
        },
      },
    });

    // Преобразуем роли в массив имен
    const formattedUsers = users.map((user) => ({
      ...user,
      roles: user.roles.map((role) => role.role.name), // Извлекаем имена ролей
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error('Ошибка при получении пользователей:', error);
    res.status(500).json({ error: 'Ошибка при получении пользователей' });
  }
});

// Обновление данных пользователя
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { email, password, departmentId, roles } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        email,
        password: password ? await bcrypt.hash(password, 10) : undefined, // Хэшируем пароль, если он передан
        departmentId: departmentId === null ? null : parseInt(departmentId),
        roles: {
          deleteMany: {}, // Удаляем старые роли
          create: roles.map((roleName) => ({
            role: {
              connect: { name: roleName }, // Подключаем новые роли
            },
          })),
        },
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Ошибка при обновлении пользователя:', error);
    res.status(500).json({ error: 'Ошибка при обновлении пользователя' });
  }
});

// Удаление пользователя
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.user.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'Пользователь успешно удален' });
  } catch (error) {
    console.error('Ошибка при удалении пользователя:', error);
    res.status(500).json({ error: 'Ошибка при удалении пользователя' });
  }
});

module.exports = router;