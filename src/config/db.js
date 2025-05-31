const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Создание базовых ролей в системе
async function seedRoles() {
  try {
    const roles = [
      { name: "admin", description: "Администратор" },
      { name: "manager", description: "Менеджер" },
      { name: "employee", description: "Сотрудник" },
      { name: "observer", description: "Наблюдатель" },
    ];

    for (const role of roles) {
      await prisma.role.upsert({
        where: { name: role.name },
        update: {},
        create: role,
      });
    }

    console.log("Роли успешно добавлены.");
  } catch (error) {
    console.error("Ошибка при добавлении ролей:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedRoles();

module.exports = prisma;