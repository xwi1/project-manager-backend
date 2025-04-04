const express = require('express');
const router = express.Router();
const prisma = require('../config/db');

// Получить все проекты пользователя
router.get('/', async (req, res) => {
  const { userId } = req.query;
  try {
    const projects = await prisma.project.findMany({
      // where: { userId: parseInt(userId) },
      include: { tasks: true }
    });
    // const projects = await prisma.project.
    res.json(projects)
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения проектов' });
    console.log(error)
  }
});

// Создать проект
router.post('/', async (req, res) => {
  try {
    const project = await prisma.project.create({
      data: {
        name: req.body.name,
        userId: parseInt(req.body.userId),
        blocks: [], // Явно инициализируем пустые массивы
        workspaceOrder: []
      },
      include: { // Включаем связанные задачи
        tasks: true 
      }
    });

    res.json({
      ...project,
      tasks: project.tasks.map(task => ({
        ...task,
        cells: task.cells || {} // Гарантируем наличие поля cells
      }))
    });

  } catch (error) {
    console.error('Ошибка создания проекта:', error);
    res.status(500).json({ 
      error: 'Ошибка сервера',
      details: error.message 
    });
  }
});

// Получить проект по ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) },
      include: { tasks: true },
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения проекта' });
  }
});

// Обновить проект (блоки, порядок, задачи)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { blocks, workspaceOrder, tableRows } = req.body;
  try {
    const updatedProject = await prisma.project.update({
      where: { id: parseInt(id) },
      data: { blocks, workspaceOrder },
    });
    for (const row of tableRows) {
      console.log(row.id)
      await prisma.task.upsert({
        where: { id: row.id },
        create: {
          id: row.id,
          projectId: parseInt(id),
          cells: row.cells
        },
        update: {
          cells: row.cells
        }
      })
    }
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка обновления проекта' });
    console.log(error)
  }
});


module.exports = router;