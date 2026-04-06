import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { PrismaService } from '@/common/prisma/prisma.service';

describe('PatientsService', () => {
  let service: PatientsService;
  let prisma: any;

  const mockPrisma = {
    clinicPatient: {
      findMany: jest.fn(), findFirst: jest.fn(), count: jest.fn(),
      create: jest.fn(), update: jest.fn(), delete: jest.fn(),
    },
  };

  const tenantId = 'tenant-1';
  const mockPatient = {
    id: 'patient-1', tenantId, name: 'Joao Silva', cpf: '123.456.789-00',
    phone: '(11) 99999-0000', email: 'joao@email.com',
    createdAt: new Date(), updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated patients', async () => {
      mockPrisma.clinicPatient.findMany.mockResolvedValue([mockPatient]);
      mockPrisma.clinicPatient.count.mockResolvedValue(1);

      const result = await service.findAll(tenantId, 1, 10);

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(mockPrisma.clinicPatient.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId }, skip: 0, take: 10 })
      );
    });

    it('should filter by search term', async () => {
      mockPrisma.clinicPatient.findMany.mockResolvedValue([]);
      mockPrisma.clinicPatient.count.mockResolvedValue(0);

      await service.findAll(tenantId, 1, 10, 'joao');

      expect(mockPrisma.clinicPatient.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ OR: expect.any(Array) }) })
      );
    });
  });

  describe('findOne', () => {
    it('should return a patient', async () => {
      mockPrisma.clinicPatient.findFirst.mockResolvedValue(mockPatient);

      const result = await service.findOne('patient-1', tenantId);

      expect(result.id).toBe('patient-1');
    });

    it('should throw NotFoundException if patient not found', async () => {
      mockPrisma.clinicPatient.findFirst.mockResolvedValue(null);

      await expect(service.findOne('invalid', tenantId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a patient', async () => {
      const createDto = { name: 'Maria', cpf: '987.654.321-00' };
      mockPrisma.clinicPatient.create.mockResolvedValue({ id: 'new-id', tenantId, ...createDto });

      const result = await service.create(tenantId, createDto as any);

      expect(result.name).toBe('Maria');
      expect(mockPrisma.clinicPatient.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: { tenantId, ...createDto } })
      );
    });
  });

  describe('remove', () => {
    it('should delete a patient', async () => {
      mockPrisma.clinicPatient.findFirst.mockResolvedValue(mockPatient);
      mockPrisma.clinicPatient.delete.mockResolvedValue(mockPatient);

      await service.remove('patient-1', tenantId);

      expect(mockPrisma.clinicPatient.delete).toHaveBeenCalledWith({ where: { id: 'patient-1' } });
    });

    it('should throw NotFoundException if patient not found for delete', async () => {
      mockPrisma.clinicPatient.findFirst.mockResolvedValue(null);

      await expect(service.remove('invalid', tenantId)).rejects.toThrow(NotFoundException);
    });
  });
});
