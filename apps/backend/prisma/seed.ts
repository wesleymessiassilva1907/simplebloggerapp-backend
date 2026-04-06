import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create roles
  const roles = await Promise.all([
    prisma.role.upsert({ where: { name: 'super_admin' }, update: {}, create: { name: 'super_admin', description: 'Super Administrator - full platform access' } }),
    prisma.role.upsert({ where: { name: 'tenant_admin' }, update: {}, create: { name: 'tenant_admin', description: 'Tenant Administrator - full tenant access' } }),
    prisma.role.upsert({ where: { name: 'clinic_doctor' }, update: {}, create: { name: 'clinic_doctor', description: 'Doctor - clinic module access' } }),
    prisma.role.upsert({ where: { name: 'clinic_receptionist' }, update: {}, create: { name: 'clinic_receptionist', description: 'Receptionist - patient and appointment management' } }),
    prisma.role.upsert({ where: { name: 'construction_manager' }, update: {}, create: { name: 'construction_manager', description: 'Manager - construction module access' } }),
    prisma.role.upsert({ where: { name: 'construction_worker' }, update: {}, create: { name: 'construction_worker', description: 'Worker - limited construction access' } }),
    prisma.role.upsert({ where: { name: 'barbershop_barber' }, update: {}, create: { name: 'barbershop_barber', description: 'Barber - barbershop module access' } }),
    prisma.role.upsert({ where: { name: 'barbershop_receptionist' }, update: {}, create: { name: 'barbershop_receptionist', description: 'Receptionist - barbershop client and booking management' } }),
  ]);

  const [superAdminRole, tenantAdminRole, doctorRole, receptionistRole, managerRole, workerRole, barberRole, barbershopReceptionistRole] = roles;
  console.log('✅ Roles created');

  // Create tenants
  const clinicTenant = await prisma.tenant.upsert({
    where: { slug: 'clinica-sao-paulo' },
    update: {},
    create: { name: 'Clínica São Paulo', slug: 'clinica-sao-paulo', status: 'active', plan: 'professional' },
  });

  const constructionTenant = await prisma.tenant.upsert({
    where: { slug: 'construtora-aurora' },
    update: {},
    create: { name: 'Construtora Aurora', slug: 'construtora-aurora', status: 'active', plan: 'starter' },
  });
  console.log('✅ Tenants created');

  const passwordHash = await bcrypt.hash('Admin@123', 10);

  // Create super admin (belongs to clinic tenant for demo)
  const superAdmin = await prisma.user.upsert({
    where: { email_tenantId: { email: 'admin@nexushub.com', tenantId: clinicTenant.id } },
    update: {},
    create: { tenantId: clinicTenant.id, name: 'Super Admin', email: 'admin@nexushub.com', passwordHash, status: 'active' },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: superAdmin.id, roleId: superAdminRole.id } },
    update: {},
    create: { userId: superAdmin.id, roleId: superAdminRole.id },
  });

  // Clinic tenant admin
  const clinicAdmin = await prisma.user.upsert({
    where: { email_tenantId: { email: 'admin@clinica.com', tenantId: clinicTenant.id } },
    update: {},
    create: { tenantId: clinicTenant.id, name: 'Dr. Ricardo Oliveira', email: 'admin@clinica.com', passwordHash, status: 'active' },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: clinicAdmin.id, roleId: tenantAdminRole.id } },
    update: {},
    create: { userId: clinicAdmin.id, roleId: tenantAdminRole.id },
  });

  // Doctor user
  const doctorUser = await prisma.user.upsert({
    where: { email_tenantId: { email: 'ana@clinica.com', tenantId: clinicTenant.id } },
    update: {},
    create: { tenantId: clinicTenant.id, name: 'Dra. Ana Santos', email: 'ana@clinica.com', passwordHash, status: 'active' },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: doctorUser.id, roleId: doctorRole.id } },
    update: {},
    create: { userId: doctorUser.id, roleId: doctorRole.id },
  });

  // Receptionist user
  const receptionistUser = await prisma.user.upsert({
    where: { email_tenantId: { email: 'maria@clinica.com', tenantId: clinicTenant.id } },
    update: {},
    create: { tenantId: clinicTenant.id, name: 'Maria Fernanda', email: 'maria@clinica.com', passwordHash, status: 'active' },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: receptionistUser.id, roleId: receptionistRole.id } },
    update: {},
    create: { userId: receptionistUser.id, roleId: receptionistRole.id },
  });
  console.log('✅ Clinic users created');

  // Construction tenant admin
  const constructionAdmin = await prisma.user.upsert({
    where: { email_tenantId: { email: 'admin@construtora.com', tenantId: constructionTenant.id } },
    update: {},
    create: { tenantId: constructionTenant.id, name: 'Eng. Paulo Mendes', email: 'admin@construtora.com', passwordHash, status: 'active' },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: constructionAdmin.id, roleId: tenantAdminRole.id } },
    update: {},
    create: { userId: constructionAdmin.id, roleId: tenantAdminRole.id },
  });

  // Construction manager
  const managerUser = await prisma.user.upsert({
    where: { email_tenantId: { email: 'carlos@construtora.com', tenantId: constructionTenant.id } },
    update: {},
    create: { tenantId: constructionTenant.id, name: 'Carlos Ferreira', email: 'carlos@construtora.com', passwordHash, status: 'active' },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: managerUser.id, roleId: managerRole.id } },
    update: {},
    create: { userId: managerUser.id, roleId: managerRole.id },
  });

  // Construction worker
  const workerUser = await prisma.user.upsert({
    where: { email_tenantId: { email: 'jose@construtora.com', tenantId: constructionTenant.id } },
    update: {},
    create: { tenantId: constructionTenant.id, name: 'José da Silva', email: 'jose@construtora.com', passwordHash, status: 'active' },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: workerUser.id, roleId: workerRole.id } },
    update: {},
    create: { userId: workerUser.id, roleId: workerRole.id },
  });
  console.log('✅ Construction users created');

  // Create clinic doctors
  const doctor1 = await prisma.clinicDoctor.create({
    data: { tenantId: clinicTenant.id, name: 'Dra. Ana Santos', email: 'ana@clinica.com', specialty: 'Clínica Geral', crm: 'CRM/SP 123456', phone: '(11) 99999-1111' },
  });
  const doctor2 = await prisma.clinicDoctor.create({
    data: { tenantId: clinicTenant.id, name: 'Dr. Ricardo Oliveira', email: 'ricardo@clinica.com', specialty: 'Cardiologia', crm: 'CRM/SP 654321', phone: '(11) 99999-2222' },
  });
  console.log('✅ Doctors created');

  // Create clinic patients
  const patients = await Promise.all([
    prisma.clinicPatient.create({
      data: { tenantId: clinicTenant.id, name: 'João da Silva', cpf: '123.456.789-00', birthDate: new Date('1985-03-15'), phone: '(11) 98888-1111', email: 'joao@email.com', address: 'Rua das Flores, 123 - São Paulo', emergencyContact: 'Maria - (11) 98888-2222' },
    }),
    prisma.clinicPatient.create({
      data: { tenantId: clinicTenant.id, name: 'Ana Beatriz Souza', cpf: '987.654.321-00', birthDate: new Date('1990-07-22'), phone: '(11) 97777-3333', email: 'ana.b@email.com', address: 'Av. Paulista, 456 - São Paulo' },
    }),
    prisma.clinicPatient.create({
      data: { tenantId: clinicTenant.id, name: 'Carlos Eduardo Lima', cpf: '456.789.123-00', birthDate: new Date('1978-11-05'), phone: '(11) 96666-4444', email: 'carlos.e@email.com', address: 'Rua Augusta, 789 - São Paulo' },
    }),
    prisma.clinicPatient.create({
      data: { tenantId: clinicTenant.id, name: 'Fernanda Costa', cpf: '321.654.987-00', birthDate: new Date('1995-01-30'), phone: '(11) 95555-5555', email: 'fernanda@email.com' },
    }),
    prisma.clinicPatient.create({
      data: { tenantId: clinicTenant.id, name: 'Roberto Almeida', cpf: '654.321.987-00', birthDate: new Date('1960-09-12'), phone: '(11) 94444-6666', email: 'roberto@email.com' },
    }),
  ]);
  console.log('✅ Patients created');

  // Create appointments
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  await Promise.all([
    prisma.clinicAppointment.create({
      data: { tenantId: clinicTenant.id, patientId: patients[0].id, doctorId: doctor1.id, appointmentDate: new Date(today.setHours(9, 0, 0, 0)), status: 'scheduled', notes: 'Consulta de rotina' },
    }),
    prisma.clinicAppointment.create({
      data: { tenantId: clinicTenant.id, patientId: patients[1].id, doctorId: doctor1.id, appointmentDate: new Date(today.setHours(10, 0, 0, 0)), status: 'confirmed', notes: 'Retorno' },
    }),
    prisma.clinicAppointment.create({
      data: { tenantId: clinicTenant.id, patientId: patients[2].id, doctorId: doctor2.id, appointmentDate: new Date(today.setHours(14, 0, 0, 0)), status: 'scheduled', notes: 'Avaliação cardiológica' },
    }),
    prisma.clinicAppointment.create({
      data: { tenantId: clinicTenant.id, patientId: patients[3].id, doctorId: doctor1.id, appointmentDate: new Date(tomorrow.setHours(9, 0, 0, 0)), status: 'scheduled' },
    }),
  ]);
  console.log('✅ Appointments created');

  // Create clinic billings
  await Promise.all([
    prisma.clinicBilling.create({
      data: { tenantId: clinicTenant.id, patientId: patients[0].id, amount: 250, status: 'paid', paymentMethod: 'credit_card', paidAt: new Date() },
    }),
    prisma.clinicBilling.create({
      data: { tenantId: clinicTenant.id, patientId: patients[1].id, amount: 180, status: 'pending', dueDate: tomorrow },
    }),
    prisma.clinicBilling.create({
      data: { tenantId: clinicTenant.id, patientId: patients[2].id, amount: 350, status: 'paid', paymentMethod: 'pix', paidAt: new Date() },
    }),
  ]);
  console.log('✅ Clinic billings created');

  // Construction data
  const project1 = await prisma.constructionProject.create({
    data: { tenantId: constructionTenant.id, name: 'Edifício Residencial Aurora', description: 'Construção de edifício residencial de 12 andares com 48 unidades', startDate: new Date('2025-01-15'), endDate: new Date('2026-06-30'), budget: 5000000, status: 'in_progress', location: 'Av. Brasil, 1500 - São Paulo, SP' },
  });
  const project2 = await prisma.constructionProject.create({
    data: { tenantId: constructionTenant.id, name: 'Condomínio Jardins do Sol', description: 'Condomínio horizontal com 20 casas', startDate: new Date('2025-03-01'), endDate: new Date('2026-03-01'), budget: 8000000, status: 'planning', location: 'Rod. Raposo Tavares, km 25 - SP' },
  });
  const project3 = await prisma.constructionProject.create({
    data: { tenantId: constructionTenant.id, name: 'Reforma Comercial Centro', description: 'Reforma de prédio comercial de 3 andares', startDate: new Date('2025-02-01'), endDate: new Date('2025-08-30'), budget: 1200000, status: 'in_progress', location: 'Rua XV de Novembro, 300 - SP' },
  });
  console.log('✅ Projects created');

  // Construction tasks
  await Promise.all([
    prisma.constructionTask.create({ data: { tenantId: constructionTenant.id, projectId: project1.id, name: 'Terraplanagem', description: 'Nivelamento do terreno', status: 'completed', progressPercent: 100, startDate: new Date('2025-01-15'), endDate: new Date('2025-02-15') } }),
    prisma.constructionTask.create({ data: { tenantId: constructionTenant.id, projectId: project1.id, name: 'Fundação', description: 'Escavação e concretagem da fundação', status: 'completed', progressPercent: 100, startDate: new Date('2025-02-16'), endDate: new Date('2025-04-15') } }),
    prisma.constructionTask.create({ data: { tenantId: constructionTenant.id, projectId: project1.id, name: 'Estrutura - Blocos 1-6', description: 'Estrutura de concreto dos andares 1 ao 6', status: 'in_progress', progressPercent: 60, startDate: new Date('2025-04-16') } }),
    prisma.constructionTask.create({ data: { tenantId: constructionTenant.id, projectId: project1.id, name: 'Estrutura - Blocos 7-12', description: 'Estrutura de concreto dos andares 7 ao 12', status: 'pending', progressPercent: 0 } }),
    prisma.constructionTask.create({ data: { tenantId: constructionTenant.id, projectId: project1.id, name: 'Instalações elétricas', status: 'pending', progressPercent: 0 } }),
    prisma.constructionTask.create({ data: { tenantId: constructionTenant.id, projectId: project1.id, name: 'Instalações hidráulicas', status: 'pending', progressPercent: 0 } }),
    prisma.constructionTask.create({ data: { tenantId: constructionTenant.id, projectId: project3.id, name: 'Demolição interna', status: 'completed', progressPercent: 100 } }),
    prisma.constructionTask.create({ data: { tenantId: constructionTenant.id, projectId: project3.id, name: 'Alvenaria', status: 'in_progress', progressPercent: 45 } }),
    prisma.constructionTask.create({ data: { tenantId: constructionTenant.id, projectId: project3.id, name: 'Acabamento', status: 'pending', progressPercent: 0 } }),
  ]);
  console.log('✅ Tasks created');

  // Construction expenses
  await Promise.all([
    prisma.constructionExpense.create({ data: { tenantId: constructionTenant.id, projectId: project1.id, description: 'Serviço de terraplanagem', category: 'servico', amount: 120000, expenseDate: new Date('2025-01-20'), supplier: 'Terra Ltda' } }),
    prisma.constructionExpense.create({ data: { tenantId: constructionTenant.id, projectId: project1.id, description: 'Concreto para fundação', category: 'material', amount: 350000, expenseDate: new Date('2025-02-20'), supplier: 'Concreteira SP' } }),
    prisma.constructionExpense.create({ data: { tenantId: constructionTenant.id, projectId: project1.id, description: 'Aço para estrutura', category: 'material', amount: 480000, expenseDate: new Date('2025-03-10'), supplier: 'Aço Brasil SA' } }),
    prisma.constructionExpense.create({ data: { tenantId: constructionTenant.id, projectId: project1.id, description: 'Mão de obra - Março', category: 'mao_de_obra', amount: 180000, expenseDate: new Date('2025-03-31'), supplier: 'Equipe própria' } }),
    prisma.constructionExpense.create({ data: { tenantId: constructionTenant.id, projectId: project3.id, description: 'Demolição e remoção de entulho', category: 'servico', amount: 45000, expenseDate: new Date('2025-02-10'), supplier: 'Demolidora Centro' } }),
    prisma.constructionExpense.create({ data: { tenantId: constructionTenant.id, projectId: project3.id, description: 'Tijolos e argamassa', category: 'material', amount: 28000, expenseDate: new Date('2025-03-05'), supplier: 'Material SP' } }),
  ]);
  console.log('✅ Expenses created');

  // Construction workers
  const workers = await Promise.all([
    prisma.constructionWorker.create({ data: { tenantId: constructionTenant.id, name: 'José da Silva', email: 'jose@construtora.com', phone: '(11) 93333-1111', role: 'Pedreiro', dailyCost: 250 } }),
    prisma.constructionWorker.create({ data: { tenantId: constructionTenant.id, name: 'Antônio Ferreira', phone: '(11) 93333-2222', role: 'Eletricista', dailyCost: 300 } }),
    prisma.constructionWorker.create({ data: { tenantId: constructionTenant.id, name: 'Pedro Santos', phone: '(11) 93333-3333', role: 'Encanador', dailyCost: 280 } }),
    prisma.constructionWorker.create({ data: { tenantId: constructionTenant.id, name: 'Lucas Oliveira', phone: '(11) 93333-4444', role: 'Servente', dailyCost: 150 } }),
    prisma.constructionWorker.create({ data: { tenantId: constructionTenant.id, name: 'Marcos Souza', phone: '(11) 93333-5555', role: 'Mestre de Obras', dailyCost: 400 } }),
  ]);
  console.log('✅ Workers created');

  // Allocate workers to projects
  await Promise.all([
    prisma.constructionProjectWorker.create({ data: { tenantId: constructionTenant.id, projectId: project1.id, workerId: workers[0].id, allocatedFrom: new Date('2025-01-15') } }),
    prisma.constructionProjectWorker.create({ data: { tenantId: constructionTenant.id, projectId: project1.id, workerId: workers[1].id, allocatedFrom: new Date('2025-04-01') } }),
    prisma.constructionProjectWorker.create({ data: { tenantId: constructionTenant.id, projectId: project1.id, workerId: workers[3].id, allocatedFrom: new Date('2025-01-15') } }),
    prisma.constructionProjectWorker.create({ data: { tenantId: constructionTenant.id, projectId: project1.id, workerId: workers[4].id, allocatedFrom: new Date('2025-01-15') } }),
    prisma.constructionProjectWorker.create({ data: { tenantId: constructionTenant.id, projectId: project3.id, workerId: workers[2].id, allocatedFrom: new Date('2025-02-01') } }),
  ]);
  console.log('✅ Workers allocated to projects');

  // ==================== BARBERSHOP ====================

  const barbershopTenant = await prisma.tenant.upsert({
    where: { slug: 'barbearia-style' },
    update: {},
    create: { name: 'Barbearia Style', slug: 'barbearia-style', status: 'active', plan: 'professional' },
  });
  console.log('✅ Barbershop tenant created');

  // Barbershop admin user
  const barbershopAdmin = await prisma.user.upsert({
    where: { email_tenantId: { email: 'admin@barbearia.com', tenantId: barbershopTenant.id } },
    update: {},
    create: { tenantId: barbershopTenant.id, name: 'João Barbeiro', email: 'admin@barbearia.com', passwordHash, status: 'active' },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: barbershopAdmin.id, roleId: tenantAdminRole.id } },
    update: {},
    create: { userId: barbershopAdmin.id, roleId: tenantAdminRole.id },
  });

  // Barbershop barber user
  const barberUser = await prisma.user.upsert({
    where: { email_tenantId: { email: 'pedro@barbearia.com', tenantId: barbershopTenant.id } },
    update: {},
    create: { tenantId: barbershopTenant.id, name: 'Pedro Cortes', email: 'pedro@barbearia.com', passwordHash, status: 'active' },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: barberUser.id, roleId: barberRole.id } },
    update: {},
    create: { userId: barberUser.id, roleId: barberRole.id },
  });
  console.log('✅ Barbershop users created');

  // Create barbers
  const barbers = await Promise.all([
    prisma.barbershopBarber.create({ data: { tenantId: barbershopTenant.id, name: 'Pedro Cortes', email: 'pedro@barbearia.com', phone: '(11) 91111-1111', specialty: 'corte', commission: 50 } }),
    prisma.barbershopBarber.create({ data: { tenantId: barbershopTenant.id, name: 'Rafael Estilo', email: 'rafael@barbearia.com', phone: '(11) 91111-2222', specialty: 'barba', commission: 45 } }),
    prisma.barbershopBarber.create({ data: { tenantId: barbershopTenant.id, name: 'Diego Navalha', email: 'diego@barbearia.com', phone: '(11) 91111-3333', specialty: 'coloração', commission: 55 } }),
  ]);
  console.log('✅ Barbers created');

  // Create barbershop services
  const barbershopServices = await Promise.all([
    prisma.barbershopService.create({ data: { tenantId: barbershopTenant.id, name: 'Corte Masculino', description: 'Corte tradicional com máquina e tesoura', price: 45, duration: 30, category: 'corte' } }),
    prisma.barbershopService.create({ data: { tenantId: barbershopTenant.id, name: 'Barba', description: 'Barba com navalha e toalha quente', price: 30, duration: 20, category: 'barba' } }),
    prisma.barbershopService.create({ data: { tenantId: barbershopTenant.id, name: 'Combo Corte+Barba', description: 'Corte masculino + barba completa', price: 65, duration: 50, category: 'combo' } }),
    prisma.barbershopService.create({ data: { tenantId: barbershopTenant.id, name: 'Pigmentação', description: 'Pigmentação capilar completa', price: 80, duration: 60, category: 'tratamento' } }),
    prisma.barbershopService.create({ data: { tenantId: barbershopTenant.id, name: 'Corte Infantil', description: 'Corte para crianças até 12 anos', price: 35, duration: 25, category: 'corte' } }),
  ]);
  console.log('✅ Barbershop services created');

  // Create barbershop clients
  const barbershopClients = await Promise.all([
    prisma.barbershopClient.create({ data: { tenantId: barbershopTenant.id, name: 'Lucas Mendes', phone: '(11) 98888-1111', email: 'lucas@email.com', birthDate: new Date('1992-04-10'), notes: 'Prefere corte degradê' } }),
    prisma.barbershopClient.create({ data: { tenantId: barbershopTenant.id, name: 'Bruno Tavares', phone: '(11) 98888-2222', email: 'bruno@email.com', birthDate: new Date('1988-08-25') } }),
    prisma.barbershopClient.create({ data: { tenantId: barbershopTenant.id, name: 'Thiago Rocha', phone: '(11) 98888-3333', email: 'thiago@email.com', birthDate: new Date('1995-01-15') } }),
    prisma.barbershopClient.create({ data: { tenantId: barbershopTenant.id, name: 'Matheus Lima', phone: '(11) 98888-4444', birthDate: new Date('1990-11-30'), notes: 'Alérgico a amônia' } }),
    prisma.barbershopClient.create({ data: { tenantId: barbershopTenant.id, name: 'Gabriel Santos', phone: '(11) 98888-5555', email: 'gabriel@email.com', birthDate: new Date('1985-06-20') } }),
  ]);
  console.log('✅ Barbershop clients created');

  // Create barbershop bookings
  const bookingToday = new Date();
  const bookingTomorrow = new Date();
  bookingTomorrow.setDate(bookingTomorrow.getDate() + 1);

  await Promise.all([
    prisma.barbershopBooking.create({
      data: {
        tenantId: barbershopTenant.id, clientId: barbershopClients[0].id, barberId: barbers[0].id,
        bookingDate: new Date(bookingToday.getFullYear(), bookingToday.getMonth(), bookingToday.getDate(), 9, 0, 0),
        status: 'scheduled', totalPrice: 45, notes: 'Corte degradê',
        services: { create: [{ serviceId: barbershopServices[0].id, price: 45 }] },
      },
    }),
    prisma.barbershopBooking.create({
      data: {
        tenantId: barbershopTenant.id, clientId: barbershopClients[1].id, barberId: barbers[1].id,
        bookingDate: new Date(bookingToday.getFullYear(), bookingToday.getMonth(), bookingToday.getDate(), 10, 0, 0),
        status: 'confirmed', totalPrice: 65,
        services: { create: [{ serviceId: barbershopServices[2].id, price: 65 }] },
      },
    }),
    prisma.barbershopBooking.create({
      data: {
        tenantId: barbershopTenant.id, clientId: barbershopClients[2].id, barberId: barbers[2].id,
        bookingDate: new Date(bookingTomorrow.getFullYear(), bookingTomorrow.getMonth(), bookingTomorrow.getDate(), 14, 0, 0),
        status: 'scheduled', totalPrice: 80,
        services: { create: [{ serviceId: barbershopServices[3].id, price: 80 }] },
      },
    }),
  ]);
  console.log('✅ Barbershop bookings created');

  // Create barbershop products
  await Promise.all([
    prisma.barbershopProduct.create({ data: { tenantId: barbershopTenant.id, name: 'Pomada Modeladora', description: 'Pomada efeito matte 150g', price: 45, stock: 30, category: 'pomada' } }),
    prisma.barbershopProduct.create({ data: { tenantId: barbershopTenant.id, name: 'Óleo para Barba', description: 'Óleo hidratante para barba 60ml', price: 35, stock: 25, category: 'óleo' } }),
    prisma.barbershopProduct.create({ data: { tenantId: barbershopTenant.id, name: 'Shampoo Anticaspa', description: 'Shampoo anticaspa 300ml', price: 28, stock: 40, category: 'shampoo' } }),
    prisma.barbershopProduct.create({ data: { tenantId: barbershopTenant.id, name: 'Pente de Madeira', description: 'Pente artesanal de madeira', price: 25, stock: 15, category: 'acessório' } }),
  ]);
  console.log('✅ Barbershop products created');

  // ==================== NEW VERTICALS ====================

  // New roles
  const newRoles = await Promise.all([
    prisma.role.upsert({ where: { name: 'realestate_broker' }, update: {}, create: { name: 'realestate_broker', description: 'Real estate broker' } }),
    prisma.role.upsert({ where: { name: 'realestate_agent' }, update: {}, create: { name: 'realestate_agent', description: 'Real estate agent' } }),
    prisma.role.upsert({ where: { name: 'nutritionist' }, update: {}, create: { name: 'nutritionist', description: 'Nutritionist professional' } }),
    prisma.role.upsert({ where: { name: 'legal_lawyer' }, update: {}, create: { name: 'legal_lawyer', description: 'Lawyer' } }),
    prisma.role.upsert({ where: { name: 'legal_paralegal' }, update: {}, create: { name: 'legal_paralegal', description: 'Paralegal assistant' } }),
    prisma.role.upsert({ where: { name: 'restaurant_manager' }, update: {}, create: { name: 'restaurant_manager', description: 'Restaurant manager' } }),
    prisma.role.upsert({ where: { name: 'restaurant_kitchen' }, update: {}, create: { name: 'restaurant_kitchen', description: 'Kitchen staff' } }),
    prisma.role.upsert({ where: { name: 'restaurant_delivery' }, update: {}, create: { name: 'restaurant_delivery', description: 'Delivery driver' } }),
    prisma.role.upsert({ where: { name: 'aesthetic_professional' }, update: {}, create: { name: 'aesthetic_professional', description: 'Aesthetic professional' } }),
    prisma.role.upsert({ where: { name: 'aesthetic_receptionist' }, update: {}, create: { name: 'aesthetic_receptionist', description: 'Aesthetic clinic receptionist' } }),
    prisma.role.upsert({ where: { name: 'dental_dentist' }, update: {}, create: { name: 'dental_dentist', description: 'Dentist professional' } }),
    prisma.role.upsert({ where: { name: 'dental_receptionist' }, update: {}, create: { name: 'dental_receptionist', description: 'Dental clinic receptionist' } }),
  ]);
  console.log('✅ New vertical roles created');

  // --- Real Estate Tenant ---
  const realestateTenant = await prisma.tenant.upsert({
    where: { slug: 'imobiliaria-luxo' },
    update: {},
    create: { name: 'Imobiliária Luxo Premium', slug: 'imobiliaria-luxo', status: 'active', plan: 'professional' },
  });
  const realestateAdmin = await prisma.user.upsert({
    where: { email_tenantId: { email: 'admin@imobiliaria.com', tenantId: realestateTenant.id } },
    update: {},
    create: { tenantId: realestateTenant.id, name: 'Roberto Campos', email: 'admin@imobiliaria.com', passwordHash, status: 'active' },
  });
  await prisma.userRole.upsert({ where: { userId_roleId: { userId: realestateAdmin.id, roleId: tenantAdminRole.id } }, update: {}, create: { userId: realestateAdmin.id, roleId: tenantAdminRole.id } });

  await prisma.realEstateProperty.createMany({ data: [
    { tenantId: realestateTenant.id, title: 'Penthouse Jardins', type: 'penthouse', status: 'available', price: 8500000, area: 450, bedrooms: 4, bathrooms: 6, parkingSpots: 4, neighborhood: 'Jardins', city: 'São Paulo', state: 'SP', condominium: 5500 },
    { tenantId: realestateTenant.id, title: 'Mansão Alphaville', type: 'mansion', status: 'available', price: 12000000, area: 800, bedrooms: 6, bathrooms: 8, parkingSpots: 6, neighborhood: 'Alphaville', city: 'Barueri', state: 'SP' },
    { tenantId: realestateTenant.id, title: 'Apartamento Vila Nova', type: 'apartment', status: 'reserved', price: 3200000, area: 180, bedrooms: 3, bathrooms: 4, parkingSpots: 3, neighborhood: 'Vila Nova Conceição', city: 'São Paulo', state: 'SP', condominium: 2800 },
  ]});
  await prisma.realEstateClient.createMany({ data: [
    { tenantId: realestateTenant.id, name: 'Eduardo Monteiro', email: 'eduardo@invest.com', phone: '(11) 99999-0001', type: 'investor', budget: 15000000, source: 'referral' },
    { tenantId: realestateTenant.id, name: 'Patricia Lemos', email: 'patricia@email.com', phone: '(11) 99999-0002', type: 'buyer', budget: 5000000, source: 'instagram' },
  ]});
  console.log('✅ Real Estate data created');

  // --- Nutrition Tenant ---
  const nutritionTenant = await prisma.tenant.upsert({
    where: { slug: 'nutri-vida' },
    update: {},
    create: { name: 'Nutri Vida Consultório', slug: 'nutri-vida', status: 'active', plan: 'starter' },
  });
  const nutritionAdmin = await prisma.user.upsert({
    where: { email_tenantId: { email: 'admin@nutrivida.com', tenantId: nutritionTenant.id } },
    update: {},
    create: { tenantId: nutritionTenant.id, name: 'Dra. Camila Nutrição', email: 'admin@nutrivida.com', passwordHash, status: 'active' },
  });
  await prisma.userRole.upsert({ where: { userId_roleId: { userId: nutritionAdmin.id, roleId: tenantAdminRole.id } }, update: {}, create: { userId: nutritionAdmin.id, roleId: tenantAdminRole.id } });

  const nutPatients = await Promise.all([
    prisma.nutritionPatient.create({ data: { tenantId: nutritionTenant.id, name: 'Ana Carolina', email: 'ana@email.com', phone: '(11) 97777-1111', gender: 'female', height: 165, currentWeight: 72, targetWeight: 62, objective: 'weight_loss' } }),
    prisma.nutritionPatient.create({ data: { tenantId: nutritionTenant.id, name: 'Marcos Vieira', email: 'marcos@email.com', phone: '(11) 97777-2222', gender: 'male', height: 178, currentWeight: 85, targetWeight: 80, objective: 'muscle_gain' } }),
  ]);
  console.log('✅ Nutrition data created');

  // --- Legal Tenant ---
  const legalTenant = await prisma.tenant.upsert({
    where: { slug: 'advocacia-silva' },
    update: {},
    create: { name: 'Silva & Associados Advocacia', slug: 'advocacia-silva', status: 'active', plan: 'professional' },
  });
  const legalAdmin = await prisma.user.upsert({
    where: { email_tenantId: { email: 'admin@silvaadv.com', tenantId: legalTenant.id } },
    update: {},
    create: { tenantId: legalTenant.id, name: 'Dr. Ricardo Silva', email: 'admin@silvaadv.com', passwordHash, status: 'active' },
  });
  await prisma.userRole.upsert({ where: { userId_roleId: { userId: legalAdmin.id, roleId: tenantAdminRole.id } }, update: {}, create: { userId: legalAdmin.id, roleId: tenantAdminRole.id } });

  const legalClients = await Promise.all([
    prisma.legalClient.create({ data: { tenantId: legalTenant.id, name: 'Empresa ABC Ltda', email: 'juridico@abc.com', phone: '(11) 3333-1111', cpfCnpj: '12.345.678/0001-00', type: 'company' } }),
    prisma.legalClient.create({ data: { tenantId: legalTenant.id, name: 'Maria Oliveira', email: 'maria.o@email.com', phone: '(11) 95555-1111', cpfCnpj: '123.456.789-00', type: 'individual' } }),
  ]);
  await prisma.legalCase.createMany({ data: [
    { tenantId: legalTenant.id, clientId: legalClients[0].id, caseNumber: '0001234-56.2025.8.26.0100', title: 'Ação Trabalhista - Funcionário X', type: 'labor', court: '1ª Vara do Trabalho', status: 'active', priority: 'high', value: 150000 },
    { tenantId: legalTenant.id, clientId: legalClients[1].id, caseNumber: '0005678-90.2025.8.26.0100', title: 'Divórcio Consensual', type: 'family', court: '2ª Vara de Família', status: 'active', priority: 'medium', value: 50000 },
  ]});
  console.log('✅ Legal data created');

  // --- Restaurant Tenant ---
  const restaurantTenant = await prisma.tenant.upsert({
    where: { slug: 'dark-kitchen-sabor' },
    update: {},
    create: { name: 'Dark Kitchen Sabor', slug: 'dark-kitchen-sabor', status: 'active', plan: 'professional' },
  });
  const restaurantAdmin = await prisma.user.upsert({
    where: { email_tenantId: { email: 'admin@sabor.com', tenantId: restaurantTenant.id } },
    update: {},
    create: { tenantId: restaurantTenant.id, name: 'Chef André Lima', email: 'admin@sabor.com', passwordHash, status: 'active' },
  });
  await prisma.userRole.upsert({ where: { userId_roleId: { userId: restaurantAdmin.id, roleId: tenantAdminRole.id } }, update: {}, create: { userId: restaurantAdmin.id, roleId: tenantAdminRole.id } });

  const categories = await Promise.all([
    prisma.restaurantCategory.create({ data: { tenantId: restaurantTenant.id, name: 'Hambúrgueres', sortOrder: 1 } }),
    prisma.restaurantCategory.create({ data: { tenantId: restaurantTenant.id, name: 'Pizzas', sortOrder: 2 } }),
    prisma.restaurantCategory.create({ data: { tenantId: restaurantTenant.id, name: 'Bebidas', sortOrder: 3 } }),
  ]);
  await prisma.restaurantMenuItem.createMany({ data: [
    { tenantId: restaurantTenant.id, categoryId: categories[0].id, name: 'Smash Burger Clássico', price: 32, prepTime: 15, calories: 650 },
    { tenantId: restaurantTenant.id, categoryId: categories[0].id, name: 'Smash Burger Bacon', price: 38, prepTime: 18, calories: 800, isPromotion: true, promotionPrice: 32 },
    { tenantId: restaurantTenant.id, categoryId: categories[1].id, name: 'Pizza Margherita', price: 45, prepTime: 25, calories: 900 },
    { tenantId: restaurantTenant.id, categoryId: categories[2].id, name: 'Refrigerante Lata', price: 8, prepTime: 1 },
  ]});
  await prisma.restaurantDriver.createMany({ data: [
    { tenantId: restaurantTenant.id, name: 'Diego Motoboy', phone: '(11) 92222-1111', vehicle: 'moto', licensePlate: 'ABC-1234', isAvailable: true, status: 'online' },
    { tenantId: restaurantTenant.id, name: 'Felipe Bike', phone: '(11) 92222-2222', vehicle: 'bicycle', isAvailable: true, status: 'online' },
  ]});
  console.log('✅ Restaurant data created');

  // --- Aesthetic Clinic Tenant ---
  const aestheticTenant = await prisma.tenant.upsert({
    where: { slug: 'estetica-belle' },
    update: {},
    create: { name: 'Belle Estética Avançada', slug: 'estetica-belle', status: 'active', plan: 'professional' },
  });
  const aestheticAdmin = await prisma.user.upsert({
    where: { email_tenantId: { email: 'admin@belle.com', tenantId: aestheticTenant.id } },
    update: {},
    create: { tenantId: aestheticTenant.id, name: 'Dra. Juliana Estética', email: 'admin@belle.com', passwordHash, status: 'active' },
  });
  await prisma.userRole.upsert({ where: { userId_roleId: { userId: aestheticAdmin.id, roleId: tenantAdminRole.id } }, update: {}, create: { userId: aestheticAdmin.id, roleId: tenantAdminRole.id } });

  await prisma.aestheticProcedure.createMany({ data: [
    { tenantId: aestheticTenant.id, name: 'Botox', category: 'injectable', duration: 30, price: 1200, sessionsNeeded: 1, aftercare: 'Evitar exercício por 24h' },
    { tenantId: aestheticTenant.id, name: 'Peeling Químico', category: 'peeling', duration: 45, price: 350, sessionsNeeded: 4, interval: 15 },
    { tenantId: aestheticTenant.id, name: 'Depilação a Laser', category: 'depilation', duration: 60, price: 280, sessionsNeeded: 8, interval: 30 },
    { tenantId: aestheticTenant.id, name: 'Limpeza de Pele', category: 'facial', duration: 60, price: 180, sessionsNeeded: 1 },
    { tenantId: aestheticTenant.id, name: 'Preenchimento Labial', category: 'injectable', duration: 40, price: 2500, sessionsNeeded: 1 },
  ]});
  await prisma.aestheticClient.createMany({ data: [
    { tenantId: aestheticTenant.id, name: 'Carolina Mendes', email: 'carolina@email.com', phone: '(11) 96666-1111', skinType: 'combination', source: 'instagram', photoConsent: true },
    { tenantId: aestheticTenant.id, name: 'Fernanda Lopes', email: 'fernanda@email.com', phone: '(11) 96666-2222', skinType: 'oily', source: 'referral', photoConsent: true },
    { tenantId: aestheticTenant.id, name: 'Isabela Costa', email: 'isabela@email.com', phone: '(11) 96666-3333', skinType: 'sensitive', source: 'google' },
  ]});
  console.log('✅ Aesthetic Clinic data created');

  // --- Dental Tenant ---
  const dentalTenant = await prisma.tenant.upsert({
    where: { slug: 'odonto-sorriso' },
    update: {},
    create: { name: 'Odonto Sorriso', slug: 'odonto-sorriso', status: 'active', plan: 'professional' },
  });
  const dentalAdmin = await prisma.user.upsert({
    where: { email_tenantId: { email: 'admin@odonto.com', tenantId: dentalTenant.id } },
    update: {},
    create: { tenantId: dentalTenant.id, name: 'Dr. Felipe Dentista', email: 'admin@odonto.com', passwordHash, status: 'active' },
  });
  await prisma.userRole.upsert({ where: { userId_roleId: { userId: dentalAdmin.id, roleId: tenantAdminRole.id } }, update: {}, create: { userId: dentalAdmin.id, roleId: tenantAdminRole.id } });

  await prisma.dentalDentist.createMany({ data: [
    { tenantId: dentalTenant.id, name: 'Dr. Felipe Souza', email: 'felipe@odonto.com', phone: '(11) 94444-1111', cro: 'CRO/SP 12345', specialty: 'general' },
    { tenantId: dentalTenant.id, name: 'Dra. Beatriz Lima', email: 'beatriz@odonto.com', phone: '(11) 94444-2222', cro: 'CRO/SP 67890', specialty: 'orthodontics' },
  ]});
  await prisma.dentalTreatment.createMany({ data: [
    { tenantId: dentalTenant.id, name: 'Limpeza Dental', category: 'preventive', duration: 45, price: 180 },
    { tenantId: dentalTenant.id, name: 'Restauração Resina', category: 'restorative', duration: 60, price: 250 },
    { tenantId: dentalTenant.id, name: 'Canal', category: 'endodontic', duration: 90, price: 800 },
    { tenantId: dentalTenant.id, name: 'Clareamento', category: 'cosmetic', duration: 60, price: 1200, toothRelated: false },
    { tenantId: dentalTenant.id, name: 'Extração', category: 'surgical', duration: 45, price: 350 },
    { tenantId: dentalTenant.id, name: 'Aparelho Ortodôntico', category: 'orthodontic', duration: 30, price: 3500, toothRelated: false },
  ]});
  await prisma.dentalPatient.createMany({ data: [
    { tenantId: dentalTenant.id, name: 'Ricardo Almeida', email: 'ricardo@email.com', phone: '(11) 95555-1111', cpf: '111.222.333-44', birthDate: new Date('1988-05-20') },
    { tenantId: dentalTenant.id, name: 'Juliana Ferreira', email: 'juliana@email.com', phone: '(11) 95555-2222', cpf: '555.666.777-88', birthDate: new Date('1995-10-15') },
    { tenantId: dentalTenant.id, name: 'Pedro Henrique', email: 'pedro.h@email.com', phone: '(11) 95555-3333', birthDate: new Date('2010-03-08') },
  ]});
  console.log('✅ Dental data created');

  // Subscription plans
  await Promise.all([
    prisma.subscriptionPlan.create({ data: { tenantId: clinicTenant.id, planName: 'professional', price: 799, status: 'active' } }),
    prisma.subscriptionPlan.create({ data: { tenantId: constructionTenant.id, planName: 'starter', price: 500, status: 'active' } }),
    prisma.subscriptionPlan.create({ data: { tenantId: barbershopTenant.id, planName: 'professional', price: 799, status: 'active' } }),
    prisma.subscriptionPlan.create({ data: { tenantId: realestateTenant.id, planName: 'professional', price: 1499, status: 'active' } }),
    prisma.subscriptionPlan.create({ data: { tenantId: nutritionTenant.id, planName: 'starter', price: 299, status: 'active' } }),
    prisma.subscriptionPlan.create({ data: { tenantId: legalTenant.id, planName: 'professional', price: 799, status: 'active' } }),
    prisma.subscriptionPlan.create({ data: { tenantId: restaurantTenant.id, planName: 'professional', price: 599, status: 'active' } }),
    prisma.subscriptionPlan.create({ data: { tenantId: aestheticTenant.id, planName: 'professional', price: 799, status: 'active' } }),
    prisma.subscriptionPlan.create({ data: { tenantId: dentalTenant.id, planName: 'professional', price: 799, status: 'active' } }),
  ]);
  console.log('✅ Subscription plans created');

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📧 Login credentials (password: Admin@123):');
  console.log('   Super Admin:         admin@nexushub.com');
  console.log('   Clinic Admin:        admin@clinica.com');
  console.log('   Doctor:              ana@clinica.com');
  console.log('   Receptionist:        maria@clinica.com');
  console.log('   Construction Admin:  admin@construtora.com');
  console.log('   Manager:             carlos@construtora.com');
  console.log('   Worker:              jose@construtora.com');
  console.log('   Barbershop Admin:    admin@barbearia.com');
  console.log('   Barber:              pedro@barbearia.com');
  console.log('   Real Estate Admin:   admin@imobiliaria.com');
  console.log('   Nutrition Admin:     admin@nutrivida.com');
  console.log('   Legal Admin:         admin@silvaadv.com');
  console.log('   Restaurant Admin:    admin@sabor.com');
  console.log('   Aesthetic Admin:     admin@belle.com');
  console.log('   Dental Admin:        admin@odonto.com');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
