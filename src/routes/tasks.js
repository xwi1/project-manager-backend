const express = require('express');
const router = express.Router();
const prisma = require('../config/db');

// Создать задачу
router.post('/', async (req, res) => {
  const { projectId, cells } = req.body;
  try {
    const newTask = await prisma.task.create({
      data: {
        projectId: parseInt(projectId),
        cells: cells || {},
        status: 'не сдано',
      },
    });
    res.json(newTask);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка создания задачи' });
  }
});

// Обновить задачу
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { cells } = req.body;
  try {
    const updatedTask = await prisma.task.update({
      where: { id: parseInt(id) },
      data: { cells },
    });
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка обновления задачи' });
  }
});

// Изменить статус задачи
router.put('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const updatedTask = await prisma.task.update({
      where: { id: parseInt(id) },
      data: {
        status,
        submittedAt: status === 'на рассмотрении' ? new Date() : null,
      },
    });
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка обновления статуса' });
  }
});

// Задачи проекта
router.get('/project/:projectId', async (req, res) => {
  const { projectId } = req.params;
  try {
    const tasks = await prisma.task.findMany({
      where: { projectId: parseInt(projectId) },
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения задач' });
  }
});

// Задачи на рассмотрении
router.get('/pending', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { status: 'на рассмотрении' },
      include: { project: true },
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения задач' });
  }
});

module.exports = router;