const express = require('express');
const router = express.Router();
const prisma = require('../config/db');

// Получить все департаменты
router.get('/', async (req, res) => {
  try {
    const departments = await prisma.department.findMany();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения департаментов' });
    console.log(error);
  }
});

// Создать департамент
router.post('/', async (req, res) => {
  const { name } = req.body;

  try {
    const department = await prisma.department.create({
      data: { name },
    });
    res.json(department);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка создания департамента' });
    console.log(error);
  }
});

// Обновить департамент
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const updatedDepartment = await prisma.department.update({
      where: { id: parseInt(id) },
      data: { name },
    });
    res.json(updatedDepartment);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка обновления департамента' });
    console.log(error);
  }
});

// Удалить департамент
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedDepartment = await prisma.department.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'Департамент успешно удален', deletedDepartment });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка удаления департамента' });
    console.log(error);
  }
});

module.exports = router;