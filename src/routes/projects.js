const express = require('express');
const router = express.Router();
const prisma = require('../config/db');

// Получить все проекты
router.get('/', async (req, res) => {
  const { userId } = req.query;

  try {
    const projects = await prisma.project.findMany({
      where: { userId: userId ? parseInt(userId) : null },
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

  console.log(tasks[0].cells)

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
          value: cellData.value, // Значение ячейки
          type: cellData.type || 'text', // Тип ячейки
          taskId: createdTask.id,
        }));

        // Создаем ячейки для задачи
        await prisma.cell.createMany({
          data: cellsArray,
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

module.exports = router;