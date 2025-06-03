const express = require('express');
const router = express.Router();
const prisma = require('../config/db');

// Получить все отделы
router.get('/', async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      include: { users: true },
    });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения отделов' });
  }
});

// Получить всех пользователей
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения пользователей' });
  }
});

// Создать отдел
router.post('/', async (req, res) => {
  const { name } = req.body;

  try {
    const department = await prisma.department.create({
      data: { name },
    });
    res.json(department);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка создания отдела' });
  }
});

const roleMap = {
  admin: 1,
  manager: 2,
  employee: 3,
};

function getRoleIdByName(roleName) {
  return roleMap[roleName] || null;
}

// Обновить отдел
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, users } = req.body; // users — массив объектов { userId, role }

  try {
    // Обновляем название отдела и список пользователей
    const updatedDepartment = await prisma.department.update({
      where: { id: parseInt(id) },
      data: {
        name,
        users: {
          set: users.map((user) => ({ id: user.userId })), // Обновляем список пользователей
        },
      },
    });

    // Удаляем старые роли пользователей для этого отдела
    await prisma.userRole.deleteMany({
      where: {
        user: {
          departmentId: parseInt(id), // Удаляем роли только для пользователей этого отдела
        },
      },
    });

    // Создаем новые роли для пользователей
    await prisma.userRole.createMany({
      data: users.map((user) => ({
        userId: user.userId,
        roleId: getRoleIdByName(user.role), // Преобразуем название роли в ID
      })),
    });

    res.json(updatedDepartment);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка обновления отдела' });
    console.log(error);
  }
});


// Удалить отдел
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.department.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'Отдел успешно удален' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка удаления отдела' });
  }
});

// Получить всех пользователей без отдела
router.get('/users/unassigned', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { departmentId: null },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения пользователей без отдела' });
    console.log(error)
  }
});

// Получить пользователей отдела с их ролями
router.get('/:id/users-with-roles', async (req, res) => {
  const { id } = req.params;

  try {
    const department = await prisma.department.findUnique({
      where: { id: parseInt(id) },
      include: {
        users: {
          include: {
            roles: {
              include: {
                role: true, // Включаем информацию о роли
              },
            },
          },
        },
      },
    });

    if (!department) {
      return res.status(404).json({ error: 'Отдел не найден' });
    }

    // Преобразуем данные для отправки на фронтенд
    const usersWithRoles = department.users.map((user) => ({
      ...user,
      role: user.roles.length > 0 ? user.roles[0].role.name : 'employee', // Берём первую роль
    }));

    res.json(usersWithRoles);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения пользователей с ролями' });
    console.log(error);
  }
});

module.exports = router;