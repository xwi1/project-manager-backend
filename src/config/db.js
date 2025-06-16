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

async function seedAdmin() {
  try {

    const adminRole = await prisma.role.findUnique({ where:{ name: 'admin' } })    
    
    const user = await prisma.user.upsert({
      where: {
        email: 'admin@mail.ru'
      },
      update: {},
      create: {
        name: 'Администратор сайта',
        email: 'admin@mail.ru',
        password: 'admin',
        departmentId: null,
        roles: { 
          create: {
            role: {
              connect: { id: adminRole.id }
            }
          }
        }
      }
    })
    



    console.log("Администратор успешно добавлен.")
  } catch (error) {
    console.error("Ошибка при добавлении админа")
    // console.log(error)
  } finally {
    await prisma.$disconnect();
  }
}

seedRoles();
seedAdmin()

module.exports = prisma;