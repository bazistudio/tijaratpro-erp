export type PackageDurationType = 'DAYS' | 'MONTHS' | 'YEARS';
export type PackageStatus = 'ACTIVE' | 'INACTIVE';
export type SubscriptionStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'EXPIRED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type OwnerType = 'ORGANIZATION' | 'SHOP';

export interface Package {
  _id: string;
  name: string;
  code: string;
  description?: string;
  durationType: PackageDurationType;
  durationValue: number;
  trialDays?: number;
  price?: number; // Might be useful if there is a base price, though TijaratPro packages don't have fixed prices according to backend
  enabledModules: string[];
  maxUsers?: number;
  maxBranches?: number;
  maxProducts?: number;
  status: PackageStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  _id: string;
  ownerType: OwnerType;
  ownerId: string | any; // Any allows for populated objects
  packageId: string | Package;
  status: SubscriptionStatus;
  startDate: string;
  expiryDate: string;
  remainingDays: number;
  autoRenew: boolean;
  subscriptionPrice: number;
  isSuspended: boolean;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRequest {
  _id: string;
  ownerType: OwnerType;
  ownerId: string | any;
  subscriptionId: string | Subscription;
  packageId: string | Package;
  amount: number;
  paymentMethod: string;
  transactionReference: string;
  screenshotUrl: string;
  status: PaymentStatus;
  notes?: string;
  adminNotes?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string | any;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionHistory {
  _id: string;
  subscriptionId: string | Subscription;
  ownerType: OwnerType;
  ownerId: string | any;
  action: 'CREATED' | 'APPROVED' | 'RENEWED' | 'SUSPENDED' | 'EXPIRED' | 'RESUMED' | 'CANCELLED';
  oldExpiry?: string;
  newExpiry?: string;
  previousPrice?: number;
  newPrice?: number;
  previousPackage?: string | Package;
  newPackage?: string | Package;
  performedBy?: string | any;
  paymentReference?: string | PaymentRequest;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
