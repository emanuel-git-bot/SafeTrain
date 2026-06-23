import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const area1 = await prisma.area.upsert({
    where: { name: 'Construção Civil' },
    update: {},
    create: { name: 'Construção Civil', description: 'Trabalhos em obras, altura, e maquinário pesado' }
  });

  const area2 = await prisma.area.upsert({
    where: { name: 'Saúde' },
    update: {},
    create: { name: 'Saúde', description: 'Hospitais, clínicas e ambientes com risco biológico' }
  });

  const adminPass = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@safetrain.com' },
    update: {},
    create: {
      name: 'SafeTrain Admin',
      email: 'admin@safetrain.com',
      password: adminPass,
      role: 'admin',
      permissions: JSON.stringify(["view_clients", "edit_courses", "view_areas"])
    }
  });

  // Create a B2B Company
  const company = await prisma.company.upsert({
    where: { cnpj: '12.345.678/0001-99' },
    update: { areaId: area1.id },
    create: {
      name: 'Votorantim',
      cnpj: '12.345.678/0001-99',
      areaId: area1.id
    }
  });

  await prisma.voucher.upsert({
    where: { code: 'VTC-2024-TESTE' },
    update: {},
    create: {
      code: 'VTC-2024-TESTE',
      companyId: company.id
    }
  });

  const courseTitle = 'NR-35: Trabalho em Altura';
  const c1 = await prisma.course.findFirst({ where: { title: courseTitle } }) || await prisma.course.create({
    data: {
      title: courseTitle,
      description: 'Norma regulamentadora para atividades realizadas em alturas superiores a 2 metros.',
      areaId: area1.id,
      level: 'Obrigatório',
      duration: '8h',
      price: 89,
      published: true,
      image: 'photo-1504307651254-35680f356dfd'
    }
  });

  // Create Modules if they don't exist
  const existingModules = await prisma.module.findMany({ where: { courseId: c1.id } });
  if (existingModules.length === 0) {
    await prisma.module.create({
      data: {
        courseId: c1.id,
        title: 'Introdução à NR-35',
        type: 'video',
        duration: '12min',
        minScreenTime: 720,
        order: 1
      }
    });
  
    await prisma.module.create({
      data: {
        courseId: c1.id,
        title: 'Avaliação Final',
        type: 'quiz',
        passingScore: 70,
        order: 2,
        questions: JSON.stringify([
          { q: "Qual é a altura mínima para trabalho em altura?", opts: ["1m", "1.5m", "2m", "3m"], correct: 2 }
        ])
      }
    });
  }

  console.log('Seed completo!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
