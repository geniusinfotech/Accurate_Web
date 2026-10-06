// Base API response wrapper
export interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  message?: string;
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Auth
export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  roles: string[];
  permissions?: string[];
  isActive?: boolean;
  firstname?: string;
  lastname?: string;
  username?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

/** POST /auth/login — flat payload, no `user` wrapper. */
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  userId: string;
  email: string;
  roles: string[];
  username?: string;
  firstname?: string;
  lastname?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  /** @deprecated Send firstname/lastname instead; kept for backwards compat. */
  name?: string;
}

/** POST /auth/register — returns the user record directly. */
export type RegisterResponse = User;

export interface RefreshRequest {
  refresh_token?: string;
}

export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
}

/** GET /auth/me — the JWT claims object returned by the strategy. */
export interface MeResponse {
  userId: string;
  _id: string;
  sub: string;
  username?: string;
  email: string;
  roles: string[];
}

// Category
export interface Category {
  _id: string;
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  parentId?: string;
  children?: Category[];
  showOnHomepage?: boolean;
  homepageCoverImage?: string;
  createdAt: string;
  updatedAt: string;
}

// Brand
export interface Brand {
  _id: string;
  id: string;
  name: string;
  code: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  _id?: string;
  variantId?: string;
  sku: string;
  // New backend shape uses a free-form weight label e.g. "1 kg", "500 ml".
  weight?: string;
  packSize?: number;
  packUnit?: 'ml' | 'L' | 'gm' | 'kg' | string;
  fragrance?: string;
  color?: string;
  price: number;
  mrp?: number;
  stock: number;
  images?: string[];
  isActive?: boolean;
}

export interface PackagingInfo {
  type?: string;
  material?: string;
  closureType?: string;
}

export interface UsageInfo {
  usageInstructions?: string;
  dilutionInstructions?: string;
  recommendedDosage?: string;
  suitableFor?: string[];
  notSuitableFor?: string[];
}

export interface SafetyInfo {
  safetyInstructions?: string;
  firstAidInstructions?: string;
  keepAwayFromChildren?: boolean;
  avoidEyeContact?: boolean;
  doNotIngest?: boolean;
  doNotMixWithOtherCleaners?: boolean;
}

// Product
export interface Product {
  _id: string;
  id: string;
  name: string;
  sku: string;
  slug?: string;
  categoryId: string;
  category?: Category;
  brandId?: string;
  brand?: Brand;
  shortDescription?: string;
  description?: string;
  productType: string;
  productForm?: string;
  isConcentrated?: boolean;
  concentration?: string;
  phValue?: number;
  fragrance?: string;
  color?: string;
  availableFragrances?: string[];
  ingredients?: string[];
  ingredientDescription?: string;
  benefits?: string[];
  features?: string[];
  usage?: UsageInfo;
  safety?: SafetyInfo;
  packaging?: PackagingInfo;
  price: number;
  mrp?: number;
  discountPercent?: number;
  discount?: number;
  stock: number;
  reservedStock?: number;
  variants?: ProductVariant[];
  images: string[];
  image?: string;
  videoUrl?: string;
  tags?: string[];
  keywords?: string[];
  metaTitle?: string;
  metaDescription?: string;
  warranty?: string;
  shelfLife?: string;
  storageInstructions?: string;
  certifications?: string[];
  hsnCode?: string;
  gstRate?: string;
  batchNumber?: string;
  manufacturingDate?: string;
  expiryDate?: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestseller?: boolean;
  isPremium?: boolean;
  isActive?: boolean;
  status?: 'draft' | 'pending' | 'published' | 'archived';
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock';
  dimensions?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  brandId?: string;
  categoryId?: string;
  isActive?: boolean;
  status?: string;
  includeUnpublished?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price_asc' | 'price_desc' | 'newest';
}

export interface CreateProductDto {
  name: string;
  sku: string;
  categoryId: string;
  brandId?: string;
  productType: string;
  productForm?: string;
  isConcentrated?: boolean;
  concentration?: string;
  phValue?: number;
  fragrance?: string;
  color?: string;
  availableFragrances?: string[];
  ingredients?: string[];
  ingredientDescription?: string;
  benefits?: string[];
  features?: string[];
  usage?: UsageInfo;
  safety?: SafetyInfo;
  packaging?: PackagingInfo;
  price: number;
  mrp?: number;
  discountPercent?: number;
  discount?: number;
  stock: number;
  reservedStock?: number;
  variants?: ProductVariant[];
  description?: string;
  shortDescription?: string;
  images?: string[];
  videoUrl?: string;
  tags?: string[];
  keywords?: string[];
  metaTitle?: string;
  metaDescription?: string;
  warranty?: string;
  shelfLife?: string;
  storageInstructions?: string;
  certifications?: string[];
  hsnCode?: string;
  gstRate?: string;
  batchNumber?: string;
  manufacturingDate?: string;
  expiryDate?: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestseller?: boolean;
  isPremium?: boolean;
  isActive?: boolean;
  status?: 'draft' | 'pending' | 'published' | 'archived';
  slug?: string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

// Banner
export interface Banner {
  _id: string;
  id: string;
  title: string;
  description?: string;
  ctaText?: string;
  link?: string;
  displayOrder: number;
  isActive: boolean;
  desktopMediaType?: 'image' | 'video';
  desktopMedia?: string;
  mobileMediaType?: 'image' | 'video';
  mobileMedia?: string;
  createdAt: string;
  updatedAt: string;
}

// Deal/Offer
export interface DealOffer {
  _id: string;
  id: string;
  title: string;
  description?: string;
  discountPercentage?: number;
  couponCode?: string;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

// Coupon
export interface Coupon {
  _id: string;
  id: string;
  code: string;
  discountValue: number;
  discountType: 'percent' | 'fixed';
  minSpendGoal?: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  isAutoApplied?: boolean;
  usageLimit?: number;
  usedCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Coupon form type (for create/edit forms - optional fields)
export interface CouponFormData {
  code: string;
  discountValue: number;
  discountType: 'percent' | 'fixed';
  minSpendGoal?: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  isAutoApplied?: boolean;
}

// Testimonial
export interface Testimonial {
  _id: string;
  id: string;
  text: string;
  customerName: string;
  customerPost?: string;
  rating?: number;
  isActive: boolean;
  sortOrder?: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

// Order
export interface OrderItem {
  productId: string | Product;
  product?: Product;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  discount?: number;
  total: number;
  image?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Order {
  _id: string;
  id: string;
  orderNumber: string;
  customerId: string | User;
  customerName?: string;
  phone?: string;
  email?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  paymentId?: string;
  shippingAddress: Address;
  billingAddress?: Address;
  notes?: string;
  courierName?: string;
  trackingId?: string;
  createdAt: string;
  updatedAt: string;
}

// Customer
export interface Customer {
  _id: string;
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  gstin?: string;
  notes?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Dealer
export interface Dealer {
  _id: string;
  id: string;
  name: string;
  phone: string;
  address?: string;
  notes?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Manager (API response structure)
export interface Manager {
  _id: string;
  id: string;
  user: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    phone?: string;
  };
  permissions: string[];
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// Manager form type (for create/edit forms)
export interface ManagerFormData {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  password: string;
  permissions: Record<string, boolean>;
}

// Activity Log — backend shape (activity-log.schema) plus legacy aliases.
export interface ActivityLog {
  _id: string;
  id: string;
  actorId?: string;
  actorName?: string;
  actorRole?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  before?: Record<string, any>;
  after?: Record<string, any>;
  changes?: Array<{ field: string; from: any; to: any }>;
  summary?: string;
  timestamp?: string;
  // Legacy aliases from older payloads
  userId?: string;
  userName?: string;
  userRole?: string;
  resource?: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// Settings
export interface Settings {
  _id: string;
  key: string;
  value: any;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Shipping Settings
export interface ShippingSettings {
  freeShippingAbove: number;
  flatRate: number;
  codCharge: number;
  estimatedDays: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  recentOrders: Order[];
  topProducts: Product[];
  lowStockProducts: Product[];
  // Web stats from API
  pendingShipmentCount?: number;
  todayWebOrdersCount?: number;
  todayWebRevenue?: number;
  webPlacedCount?: number;
  webProcessingCount?: number;
  totalWebRevenue?: number;
  totalWebOrdersCount?: number;
}

// Reports
export interface SalesReport {
  period: string;
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: { product: Product; quantity: number; revenue: number }[];
  topCategories: { category: Category; quantity: number; revenue: number }[];
}

export interface InventoryReport {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalStockValue: number;
  products: Product[];
}

// Customer Ledger
export interface LedgerEntry {
  _id: string;
  id: string;
  customerId: string;
  customerName: string;
  type: 'sale' | 'payment' | 'credit' | 'debit';
  amount: number;
  balance: number;
  mode?: 'cash' | 'upi' | 'card' | 'bank' | 'credit';
  reference?: string;
  notes?: string;
  date: string;
  createdAt: string;
}

// Cash Bank
export interface CashBankAccount {
  _id: string;
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'upi';
  balance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CashBankEntry {
  _id: string;
  id: string;
  accountId: string;
  account?: CashBankAccount;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  category?: string;
  description?: string;
  reference?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

// Manufacturing
export interface RawMaterial {
  _id: string;
  id: string;
  materialName: string;
  quantity: number;
  pricePerKg: number;
  totalAmount: number;
  lotId: string;
  reference?: string;
  purchaseDate: string;
  dealerId?: string;
  dealerName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Worker {
  _id: string;
  id: string;
  name: string;
  phone: string;
  type: 'chain' | 'polish' | 'packing' | 'refine';
  rateConfig: { perKg?: number; perPcs?: number };
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface WorkBatch {
  _id: string;
  id: string;
  stage: string;
  workerId: string;
  worker?: Worker;
  kgGivenOut: number;
  kgReturned?: number;
  pcsGivenOut?: number;
  pcsReturned?: number;
  defectCount?: number;
  makingChargePerPcs?: number;
  totalMakingCharge?: number;
  dateOut: string;
  dateCompleted?: string;
  assignNotes?: string;
  completionNotes?: string;
  status: 'pending' | 'completed' | 'cancelled';
  rawMaterialId?: string;
  lotId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SemiFinishedStock {
  _id: string;
  id: string;
  stage: string;
  quantity: number;
  lotId: string;
  status: 'ready' | 'completed' | 'published';
  rawMaterialId?: string;
  batchId?: string;
  createdAt: string;
  updatedAt: string;
}

// Wishlist
export interface WishlistItem {
  _id: string;
  id: string;
  productId: string | Product;
  product?: Product;
  createdAt: string;
}

// Payment
export interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: 'created' | 'attempted' | 'paid' | 'failed';
}

// Error
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  details?: Record<string, any>;
}