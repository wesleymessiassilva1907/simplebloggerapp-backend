import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { PrismaService } from '@/common/prisma/prisma.service';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let prisma: any;

  const mockPrisma = {
    clinicAppointment: {
      findMany: jest.fn(), findFirst: jest.fn(), count: jest.fn(),
      create: jest.fn(), update: jest.fn(), delete: jest.fn(),
    },
    clinicPatient: { findFirst: jest.fn() },
    clinicDoctor: { findFirst: jest.fn() },
  };

  const tenantId = 'tenant-1';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      patientId: 'patient-1', doctorId: 'doctor-1',
      appointmentDate: '2025-06-15T10:00:00Z', status: 'scheduled',
    };

    it('should create appointment when patient and doctor are valid', async () => {
      mockPrisma.clinicPatient.findFirst.mockResolvedValue({ id: 'patient-1' });
      mockPrisma.clinicDoctor.findFirst.mockResolvedValue({ id: 'doctor-1' });
      mockPrisma.clinicAppointment.create.mockResolvedValue({ id: 'apt-1', ...createDto });

      const result = await service.create(tenantId, createDto as any);

      expect(result.id).toBe('apt-1');
    });

    it('should throw BadRequestException for invalid patient', async () => {
      mockPrisma.clinicPatient.findFirst.mockResolvedValue(null);

      await expect(service.create(tenantId, createDto as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid doctor', async () => {
      mockPrisma.clinicPatient.findFirst.mockResolvedValue({ id: 'patient-1' });
      mockPrisma.clinicDoctor.findFirst.mockResolvedValue(null);

      await expect(service.create(tenantId, createDto as any)).rejects.toThrow(BadRequestException);
    });
  });
});
