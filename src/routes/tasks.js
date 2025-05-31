const express = require('express');
const router = express.Router();
const prisma = require('../config/db');

// Изменить статус задачи
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { newStatus } = req.body;

  try {
    const updatedTask = await prisma.task.update({
      where: { id: id },
      data: {
        status: newStatus,
        submittedAt: newStatus === 'на рассмотрении' ? new Date() : null,
      },
    });
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка обновления статуса' });
    console.log(error);
  }
});

// Задачи проекта
router.get('/project/:projectId', async (req, res) => {
  const { projectId } = req.params;

  try {
    const tasks = await prisma.task.findMany({
      where: { projectId: parseInt(projectId), parentId: null },
      orderBy: { order: 'asc' },
      include: {
        children: {
          orderBy: { order: 'asc' },
        },
      },
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения задач' });
    console.log(error);
  }
});

// Удалить задачу
router.delete('/', async (req, res) => {
  const { taskId } = req.body;

  try {
    // Удаляем задачу
    const response = await prisma.task.delete({
      where: { id: taskId },
    });

    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка удаления задачи' });
    console.log(error);
  }
});

module.exports = router;