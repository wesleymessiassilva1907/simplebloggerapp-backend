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

  // Subscription plans
  await Promise.all([
    prisma.subscriptionPlan.create({ data: { tenantId: clinicTenant.id, planName: 'professional', price: 799, status: 'active' } }),
    prisma.subscriptionPlan.create({ data: { tenantId: constructionTenant.id, planName: 'starter', price: 500, status: 'active' } }),
    prisma.subscriptionPlan.create({ data: { tenantId: barbershopTenant.id, planName: 'professional', price: 799, status: 'active' } }),
  ]);
  console.log('✅ Subscription plans created');

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📧 Login credentials (password: Admin@123):');
  console.log('   Super Admin:        admin@nexushub.com');
  console.log('   Clinic Admin:       admin@clinica.com');
  console.log('   Doctor:             ana@clinica.com');
  console.log('   Receptionist:       maria@clinica.com');
  console.log('   Construction Admin: admin@construtora.com');
  console.log('   Manager:            carlos@construtora.com');
  console.log('   Worker:             jose@construtora.com');
  console.log('   Barbershop Admin:   admin@barbearia.com');
  console.log('   Barber:             pedro@barbearia.com');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
