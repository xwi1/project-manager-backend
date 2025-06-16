const express = require('express');
const router = express.Router();
const prisma = require('../config/db');

// Изменить статус задачи
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { newStatus } = req.body;

  try {
    // Обновляем статус задачи
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status: newStatus,
        submittedAt: newStatus === 'under_review' ? new Date() : null,
      },
    });

    // Если задача стала не назначенной, то очищаем ячейки
    if (newStatus === "not_assigned") {
      // Находим ячейку по taskId и type
      const cell = await prisma.cell.findFirst({
        where: {
          taskId: id,
          type: 'control',
        },
      });

      if (cell) {
        // Обновляем ячейку по уникальному идентификатору
        await prisma.cell.update({
          where: {
            id: cell.id,
          },
          data: {
            value: '',
            userId: null,
          },
        });
      }
    }

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка обновления статуса' });
    console.error(error);
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