
export enum OrderStatus {
  PENDING = 'Pending',
  PREPARING = 'Preparing',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled'
}

export enum OrderSource {
  KOOKXTRA = 'Kookxtra',
  UBEREATS = 'Uber Eats',
  WHATSAPP = 'WhatsApp',
  CALL = 'Call',
  WEBSITE = 'Website',
  OTHER = 'Other'
}

export enum ExpenseCategory {
  INGREDIENTS = 'Ingredients',
  PACKAGING = 'Packaging',
  MARKETING = 'Marketing',
  UTILITIES = 'Utilities',
  SALARY = 'Salary',
  OTHER = 'Other'
}

export enum VatRate {
  ZERO = 0,
  LOW = 9,
  HIGH = 21
}

export interface OrderItem {
  name: string;
  quantity: number;
  type: 'Home Cooked' | 'Restaurant' | 'Drink' | 'Other';
}

export interface Order {
  id: string;
  customerName: string;
  items: OrderItem[]; // Structured items
  totalAmount: number; // in Euros
  status: OrderStatus;
  source: OrderSource;
  platformFee?: number; // For 'Other' or specific platforms
  isBulk: boolean;
  vatRate?: number;
  date: string;
  isSubscription: boolean;
  attachmentUrl?: string; // For scanned tickets
}

export interface Expense {
  id: string;
  description: string; // Supplier or Item name
  amount: number;
  category: ExpenseCategory;
  date: string;
  vatRate: number; // 0, 9, or 21
  taxAmount: number; // Calculated tax
  invoiceImageUrl?: string;
}

export interface InvoiceItem {
  description: string;
  amount: number;
}

export interface Invoice {
  id: string;
  clientName: string;
  items: InvoiceItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  date: string;
  dueDate: string;
  status: 'Draft' | 'Sent' | 'Paid';
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Starter' | 'Main' | 'Dessert' | 'Beverage' | 'Tiffin' | 'Side';
  isVegetarian: boolean;
  imageUrl?: string;
  isCombo?: boolean; // For Tiffins
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  attachmentUrl?: string;
}

export interface BusinessDetails {
  kvkNumber: string;
  tradeName: string;
  legalForm: 'Eenmanszaak' | 'VOF' | 'BV' | 'Stichting' | 'Other'; // Crucial for Tax
  address: string;
  sector: 'Cloud Kitchen' | 'Restaurant' | 'Catering' | 'Retail'; // Crucial for Hygiene
  hasStaff: boolean; // Crucial for Payroll Tax / Arbo
  servesAlcohol: boolean; // Crucial for Licensing
  isKorEligible: boolean; // Revenue < 20k/yr
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  biometricsEnabled: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  kitchenName: string;
  logoUrl?: string;
  themeColor?: 'teal' | 'orange' | 'blue';
  role?: 'admin' | 'user';
  businessDetails?: BusinessDetails;
  securitySettings?: SecuritySettings;
}

export interface ComplianceItem {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Compliant';
  category: 'Hygiene' | 'Tax' | 'Legal' | 'Admin';
  dueDate?: string;
}