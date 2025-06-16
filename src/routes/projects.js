const express = require('express');
const router = express.Router();
const prisma = require('../config/db');

// Получить все проекты
router.get('/', async (req, res) => {
  const { userId } = req.query;

  try {
    // Проверяем, передан ли userId
    if (!userId) {
      return res.status(400).json({ error: 'Необходимо указать ID пользователя' });
    }

    // Находим пользователя по userId
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: { roles: { include: { role: true } }, department: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Определяем роли пользователя
    const userRoles = user.roles.map((userRole) => userRole.role.name);

    // Формируем условия для фильтрации проектов
    let projectFilter = {};
    if (userRoles.includes('admin')) {
      // Администратор может видеть все проекты
      projectFilter = {};
    } else if (userRoles.includes('manager') || userRoles.includes('employee')) {
      // Менеджеры и сотрудники могут видеть только проекты своего отдела
      projectFilter = {
        departmentId: user.department?.id || null,
      };
    } else {
      // Если роль пользователя не определена, возвращаем пустой список
      return res.json([]);
    }

    // Получаем проекты с учетом фильтра
    const projects = await prisma.project.findMany({
      where: projectFilter,
      include: {
        blocks: true,
        tasks: {
          include: {
            cells: true, // Включаем ячейки для каждой задачи
          },
        },
      },
    });

    // Преобразуем данные для отправки на фронтенд
    const formattedProjects = projects.map((project) => ({
      ...project,
      tasks: project.tasks.map((task) => ({
        ...task,
        cells: task.cells.reduce((acc, cell) => {
          acc[cell.blockId] = {
            value: cell.value,
            type: cell.type,
            assignedUser: cell.userId,
          };
          return acc;
        }, {}),
      })),
    }));

    res.json(formattedProjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка получения проектов' });
  }
});

// Создать проект
router.post('/', async (req, res) => {
  const { name, userId, departmentId } = req.body;

  try {
    const project = await prisma.project.create({
      data: {
        name: name,
        userId: userId ? parseInt(userId) : null, // Проверяем, передан ли userId
        departmentId: departmentId ? parseInt(departmentId) : null, // Проверяем, передан ли departmentId
      },
      include: {
        tasks: true,
        blocks: true,
      },
    });

    res.json(project);

  } catch (error) {
    res.status(500).json({ error: 'Ошибка создания проекта' });
    console.log(error);
  }
});

// Получить проект по ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) },
      include: {
        tasks: {
          orderBy: { order: 'asc' },
          include: {
            children: true,
            cells: true,
          },
        },
        blocks: { orderBy: { order: 'asc' } },
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Проект не найден' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения проекта' });
    console.log(error);
  }
});

// Сохраняем изменения в проекте
router.put('/:id/save', async (req, res) => {
  const { id } = req.params;
  const { blocks, tasks } = req.body;

  console.log(blocks)

  try {
    // Обновляем блоки
    await prisma.block.deleteMany({ where: { projectId: parseInt(id) } });
    const updatedBlocks = await prisma.block.createMany({
      data: blocks.map((block) => ({
        ...block,
        id: block.id,
        projectId: parseInt(id),
      })),
    });

    // Обновляем задачи
    await prisma.task.deleteMany({ where: { projectId: parseInt(id) } });
    const updatedTasks = await Promise.all(
      tasks.map(async (task) => {
        const createdTask = await prisma.task.create({
          data: {
            id: task.id,
            parentId: task.parentId || null,
            order: task.order || 0,
            status: task.status || 'not submitted',
            projectId: parseInt(id),
          },
        });

        // Преобразуем cells из объекта в массив
        const cellsArray = Object.entries(task.cells).map(([blockId, cellData]) => ({
          blockId,
          value: cellData.value.toString(), // Значение ячейки
          type: cellData.type || 'text', // Тип ячейки
          taskId: createdTask.id,
          userId: cellData.assignedUser
        }));

        // Создаем ячейки для задачи
        await prisma.cell.createMany({
          data: cellsArray.map((cell) => ({
            blockId: cell.blockId,
            value: cell.value,
            type: cell.type,
            taskId: createdTask.id,
            userId: cell.userId || null, // Добавляем userId из данных ячейки
          })),
        });

        return createdTask;
      })
    );

    res.json({ message: 'Проект успешно сохранен', updatedBlocks, updatedTasks });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сохранения проекта', details: error.message });
    console.log(error);
  }
});

// Обновление проекта
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, departmentId } = req.body;

  try {
    // Находим проект
    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) },
    });

    if (!project) {
      return res.status(404).json({ error: 'Проект не найден' });
    }

    // Обновляем проект
    const updatedProject = await prisma.project.update({
      where: { id: parseInt(id) },
      data: {
        name,
        departmentId: departmentId === null ? null : parseInt(departmentId), // Учитываем null
      },
    });

    res.json(updatedProject);
  } catch (error) {
    console.error('Ошибка обновления проекта:', error);
    res.status(500).json({ error: 'Ошибка обновления проекта' });
  }
});

// Удаление проекта
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedProject = await prisma.project.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Проект успешно удален', deletedProject });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка удаления проекта', details: error.message });
    console.log(error);
  }
});

module.exports = router;