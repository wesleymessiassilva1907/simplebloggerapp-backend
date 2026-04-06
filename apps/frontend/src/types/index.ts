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

// Real Estate
export interface RealEstateProperty {
  id: string; tenantId: string; title: string; description?: string;
  type: string; status: string; price: number; area?: number;
  bedrooms?: number; bathrooms?: number; parkingSpots?: number;
  address?: string; neighborhood?: string; city?: string; state?: string;
  condominium?: number; iptu?: number;
  visits?: RealEstateVisit[]; deals?: RealEstateDeal[];
  createdAt: string; updatedAt: string;
}

export interface RealEstateClient {
  id: string; tenantId: string; name: string; email?: string; phone?: string;
  cpf?: string; type: string; budget?: number; source?: string; status: string;
  notes?: string; createdAt: string; updatedAt: string;
}

export interface RealEstateVisit {
  id: string; tenantId: string; propertyId: string; clientId: string;
  visitDate: string; status: string; feedback?: string; rating?: number; notes?: string;
  property?: { title: string }; client?: { name: string };
  createdAt: string; updatedAt: string;
}

export interface RealEstateDeal {
  id: string; tenantId: string; propertyId: string; clientId: string;
  type: string; value: number; commission?: number; commissionPercent?: number;
  status: string; contractDate?: string; closingDate?: string; notes?: string;
  property?: { title: string }; client?: { name: string };
  createdAt: string; updatedAt: string;
}

// Nutrition
export interface NutritionPatient {
  id: string; tenantId: string; name: string; email?: string; phone?: string;
  cpf?: string; birthDate?: string; gender?: string; height?: number;
  currentWeight?: number; targetWeight?: number; objective?: string; notes?: string;
  createdAt: string; updatedAt: string;
}

export interface NutritionPlan {
  id: string; tenantId: string; patientId: string; name: string;
  objective?: string; dailyCalories?: number; dailyProtein?: number;
  dailyCarbs?: number; dailyFat?: number; startDate?: string; endDate?: string;
  status: string; notes?: string; patient?: { name: string };
  createdAt: string; updatedAt: string;
}

export interface NutritionMeal {
  id: string; tenantId: string; planId: string; name: string;
  time?: string; foods?: any; notes?: string; sortOrder: number;
  plan?: { name: string }; createdAt: string; updatedAt: string;
}

export interface NutritionAppointment {
  id: string; tenantId: string; patientId: string; appointmentDate: string;
  type: string; status: string; weight?: number; notes?: string;
  recommendations?: string; patient?: { name: string };
  createdAt: string; updatedAt: string;
}

export interface NutritionMeasurement {
  id: string; tenantId: string; patientId: string; date: string;
  weight: number; bodyFat?: number; muscleMass?: number; bmi?: number;
  waist?: number; hip?: number; arm?: number; chest?: number; thigh?: number;
  notes?: string; patient?: { name: string };
  createdAt: string; updatedAt: string;
}

// Legal
export interface LegalClient {
  id: string; tenantId: string; name: string; email?: string; phone?: string;
  cpfCnpj?: string; type: string; address?: string; notes?: string; status: string;
  createdAt: string; updatedAt: string;
}

export interface LegalCase {
  id: string; tenantId: string; clientId: string; caseNumber?: string;
  title: string; description?: string; type?: string; court?: string;
  judge?: string; status: string; priority: string; value?: number;
  filingDate?: string; nextHearingDate?: string; notes?: string; aiSummary?: string;
  client?: { name: string }; createdAt: string; updatedAt: string;
}

export interface LegalDocument {
  id: string; tenantId: string; caseId: string; title: string;
  type?: string; content?: string; filePath?: string; version: number;
  status: string; aiAnalysis?: string; case?: { title: string };
  createdAt: string; updatedAt: string;
}

export interface LegalTask {
  id: string; tenantId: string; caseId: string; title: string;
  description?: string; type?: string; dueDate?: string; status: string;
  priority: string; assignedTo?: string; case?: { title: string };
  createdAt: string; updatedAt: string;
}

export interface LegalBilling {
  id: string; tenantId: string; clientId: string; caseId?: string;
  description: string; type: string; amount: number; hoursWorked?: number;
  hourlyRate?: number; status: string; dueDate?: string; paidAt?: string;
  client?: { name: string }; case?: { title: string };
  createdAt: string; updatedAt: string;
}

// Restaurant
export interface RestaurantCategory {
  id: string; tenantId: string; name: string; description?: string;
  sortOrder: number; isActive: boolean; createdAt: string; updatedAt: string;
}

export interface RestaurantMenuItem {
  id: string; tenantId: string; categoryId?: string; name: string;
  description?: string; price: number; prepTime?: number;
  isAvailable: boolean; isPromotion: boolean; promotionPrice?: number;
  calories?: number; category?: { name: string };
  createdAt: string; updatedAt: string;
}

export interface RestaurantOrder {
  id: string; tenantId: string; orderNumber: string; customerName: string;
  customerPhone?: string; customerAddress?: string; channel: string;
  status: string; subtotal: number; deliveryFee?: number; discount?: number;
  total: number; paymentMethod?: string; paymentStatus: string;
  notes?: string; estimatedTime?: number;
  createdAt: string; updatedAt: string;
}

export interface RestaurantDriver {
  id: string; tenantId: string; name: string; phone?: string;
  vehicle?: string; licensePlate?: string; isAvailable: boolean; status: string;
  createdAt: string; updatedAt: string;
}

// Aesthetic
export interface AestheticClient {
  id: string; tenantId: string; name: string; email?: string; phone?: string;
  cpf?: string; birthDate?: string; gender?: string; skinType?: string;
  photoConsent: boolean; source?: string; notes?: string;
  createdAt: string; updatedAt: string;
}

export interface AestheticProcedure {
  id: string; tenantId: string; name: string; description?: string;
  category?: string; duration?: number; price: number;
  costPerSession?: number; sessionsNeeded?: number; interval?: number;
  aftercare?: string; isActive: boolean;
  createdAt: string; updatedAt: string;
}

export interface AestheticAppointment {
  id: string; tenantId: string; clientId: string; procedureId: string;
  packageId?: string; appointmentDate: string; sessionNumber?: number;
  status: string; professional?: string; notes?: string;
  client?: { name: string }; procedure?: { name: string };
  createdAt: string; updatedAt: string;
}

export interface AestheticPackage {
  id: string; tenantId: string; name: string; description?: string;
  totalPrice: number; totalSessions: number; validityDays?: number;
  discount?: number; isActive: boolean;
  createdAt: string; updatedAt: string;
}

export interface AestheticBilling {
  id: string; tenantId: string; clientId: string; description: string;
  amount: number; status: string; paymentMethod?: string;
  installments?: number; dueDate?: string; paidAt?: string;
  client?: { name: string }; createdAt: string; updatedAt: string;
}

// Dental
export interface DentalPatient {
  id: string; tenantId: string; name: string; email?: string; phone?: string;
  cpf?: string; birthDate?: string; gender?: string; address?: string;
  emergencyContact?: string; lastVisit?: string; notes?: string;
  createdAt: string; updatedAt: string;
}

export interface DentalDentist {
  id: string; tenantId: string; name: string; email?: string; phone?: string;
  cro?: string; specialty?: string; isActive: boolean;
  createdAt: string; updatedAt: string;
}

export interface DentalTreatment {
  id: string; tenantId: string; name: string; description?: string;
  category?: string; duration?: number; price: number;
  toothRelated: boolean; isActive: boolean;
  createdAt: string; updatedAt: string;
}

export interface DentalAppointment {
  id: string; tenantId: string; patientId: string; dentistId: string;
  appointmentDate: string; duration?: number; type: string; status: string;
  toothNumber?: string; notes?: string; clinicalNotes?: string;
  patient?: { name: string }; dentist?: { name: string };
  createdAt: string; updatedAt: string;
}

export interface DentalTreatmentPlan {
  id: string; tenantId: string; patientId: string; dentistId: string;
  name: string; description?: string; status: string; totalCost?: number;
  discount?: number; startDate?: string; endDate?: string; notes?: string;
  patient?: { name: string }; dentist?: { name: string };
  createdAt: string; updatedAt: string;
}

export interface DentalBilling {
  id: string; tenantId: string; patientId: string; description: string;
  amount: number; status: string; paymentMethod?: string;
  installments?: number; dueDate?: string; paidAt?: string;
  patient?: { name: string }; createdAt: string; updatedAt: string;
}
