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
// router.put('/:id', async (req, res) => {
//   const { id } = req.params;
//   const { cells } = req.body;
//   try {
//     const updatedTask = await prisma.task.update({
//       where: { id: parseInt(id) },
//       data: { cells },
//     });
//     res.json(updatedTask);
//   } catch (error) {
//     res.status(500).json({ error: 'Ошибка обновления задачи' });
//   }
// });

// Изменить статус задачи
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { newStatus } = req.body;
  console.log(id)
  console.log(newStatus)
  try {
    const updatedTask = await prisma.task.update({
      where: { id: id },
      data: {
        status: newStatus,
        submittedAt: newStatus === 'на рассмотрении' ? new Date() : null,
      },
    });
    res.json(updatedTask);
    console.log(updatedTask)
  } catch (error) {
    res.status(500).json({ error: 'Ошибка обновления статуса' });
    console.log(error)
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

router.delete('/', async (req, res) => {
  const { taskId } = req.body

  try {
    const response = await prisma.task.delete({
      where: { id: taskId }
    })
    res.json({ response })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Ошибка удаления задачи' })
  }
})

module.exports = router;