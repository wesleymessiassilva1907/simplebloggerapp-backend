export interface User {
  id: string;
  name: string;
  email: string;
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  roles: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; pages: number; };
}

export interface Patient {
  id: string; tenantId: string; name: string; cpf?: string; birthDate?: string;
  phone?: string; email?: string; address?: string; emergencyContact?: string;
  createdAt: string; updatedAt: string;
}

export interface Doctor {
  id: string; tenantId: string; name: string; email?: string; specialty?: string;
  crm?: string; phone?: string; createdAt: string; updatedAt: string;
}

export interface Appointment {
  id: string; tenantId: string; patientId: string; doctorId: string;
  appointmentDate: string; status: string; notes?: string;
  patient?: { name: string }; doctor?: { name: string; specialty?: string };
  createdAt: string; updatedAt: string;
}

export interface MedicalRecord {
  id: string; tenantId: string; patientId: string; doctorId: string;
  appointmentId?: string; description: string; diagnosis?: string;
  prescription?: string; attachmentId?: string;
  patient?: { name: string }; doctor?: { name: string };
  createdAt: string; updatedAt: string;
}

export interface ClinicBilling {
  id: string; tenantId: string; patientId: string; appointmentId?: string;
  amount: number; status: string; paymentMethod?: string;
  dueDate?: string; paidAt?: string;
  patient?: { name: string }; appointment?: { appointmentDate: string };
  createdAt: string; updatedAt: string;
}

export interface Project {
  id: string; tenantId: string; name: string; description?: string;
  startDate?: string; endDate?: string; budget?: number; status: string;
  location?: string; tasks?: Task[]; expenses?: Expense[];
  createdAt: string; updatedAt: string;
}

export interface Task {
  id: string; tenantId: string; projectId: string; name: string;
  description?: string; assignedTo?: string; startDate?: string;
  endDate?: string; status: string; progressPercent: number;
  project?: { name: string }; createdAt: string; updatedAt: string;
}

export interface Expense {
  id: string; tenantId: string; projectId: string; description: string;
  category?: string; amount: number; expenseDate: string; supplier?: string;
  project?: { name: string }; createdAt: string; updatedAt: string;
}

export interface Worker {
  id: string; tenantId: string; name: string; email?: string;
  phone?: string; role?: string; dailyCost?: number;
  createdAt: string; updatedAt: string;
}
