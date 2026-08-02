export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Critical';
export type AdjustmentType = 'Correction' | 'Audit' | 'Return' | 'Damage';

export interface UpdateStockRecord {
  id: string;
  product: string;
  sku: string;
  imei?: string;
  currentStock: number;
  adjustmentType: AdjustmentType;
  quantity: number;
  reason: string;
  updatedBy: string;
  updatedTime: string;
  status: 'Approved' | 'Pending';
}

export interface RestockRecord {
  id: string;
  product: string;
  supplier: string;
  currentQty: number;
  minQty: number;
  recommendedQty: number;
  orderQty: number;
  expectedArrival: string;
  status: 'Pending' | 'In Transit' | 'Received';
}

export interface LowStockRecord {
  id: string;
  product: string;
  currentQty: number;
  minQty: number;
  difference: number;
  dailySales: number;
  daysRemaining: number;
  supplier: string;
  priority: 'Critical' | 'Warning' | 'Healthy';
}

export interface DamagedStockRecord {
  id: string;
  product: string;
  quantity: number;
  damageType: string;
  reportedBy: string;
  reportedDate: string;
  repairCost: number;
  decision: 'Repair' | 'Discard' | 'Return' | 'Pending';
  status: 'Pending Review' | 'Approved' | 'Completed';
}

export interface ReplacementRecord {
  id: string;
  customer: string;
  product: string;
  imei: string;
  reason: string;
  supplier: string;
  requestDate: string;
  approval: 'Approved' | 'Pending' | 'Rejected';
  status: 'Open' | 'Closed';
}

export const dummyUpdateStock: UpdateStockRecord[] = [
  { id: 'US-1001', product: 'Samsung Galaxy A55', sku: 'SAM-A55-128', currentStock: 45, adjustmentType: 'Audit', quantity: -2, reason: 'Physical count mismatch', updatedBy: 'Admin User', updatedTime: '2026-08-01 10:30 AM', status: 'Approved' },
  { id: 'US-1002', product: 'iPhone 13 Display Assembly', sku: 'IP13-LCD-OEM', currentStock: 12, adjustmentType: 'Damage', quantity: -1, reason: 'Cracked during testing', updatedBy: 'Tech John', updatedTime: '2026-08-02 09:15 AM', status: 'Pending' },
  { id: 'US-1003', product: 'Vivo Y29 Back Glass', sku: 'VIV-Y29-BG', currentStock: 8, adjustmentType: 'Correction', quantity: 1, reason: 'Found in wrong bin', updatedBy: 'Admin User', updatedTime: '2026-08-02 11:00 AM', status: 'Approved' },
];

export const dummyRestock: RestockRecord[] = [
  { id: 'PO-2001', product: 'iPhone 13 Battery (Original)', supplier: 'MobileParts Inc.', currentQty: 5, minQty: 10, recommendedQty: 20, orderQty: 25, expectedArrival: '2026-08-05', status: 'In Transit' },
  { id: 'PO-2002', product: 'Samsung A55 Charging Flex', supplier: 'Shenzhen Tech Ltd.', currentQty: 2, minQty: 15, recommendedQty: 30, orderQty: 30, expectedArrival: '2026-08-10', status: 'Pending' },
  { id: 'PO-2003', product: 'Universal Screen Protector 6.5"', supplier: 'Local Distro', currentQty: 50, minQty: 100, recommendedQty: 200, orderQty: 150, expectedArrival: '2026-08-03', status: 'Received' },
];

export const dummyLowStock: LowStockRecord[] = [
  { id: 'LS-3001', product: 'iPhone 11 Pro Max Screen', currentQty: 1, minQty: 5, difference: -4, dailySales: 0.5, daysRemaining: 2, supplier: 'MobileParts Inc.', priority: 'Critical' },
  { id: 'LS-3002', product: 'Type-C Fast Charger 20W', currentQty: 8, minQty: 20, difference: -12, dailySales: 3, daysRemaining: 2, supplier: 'Local Distro', priority: 'Warning' },
  { id: 'LS-3003', product: 'Samsung S23 Ultra Camera Lens', currentQty: 0, minQty: 5, difference: -5, dailySales: 0.2, daysRemaining: 0, supplier: 'Shenzhen Tech Ltd.', priority: 'Critical' },
];

export const dummyDamagedStock: DamagedStockRecord[] = [
  { id: 'DS-4001', product: 'iPad Air 4 Digitizer', quantity: 1, damageType: 'Flex Cable Torn', reportedBy: 'Tech John', reportedDate: '2026-08-01', repairCost: 0, decision: 'Discard', status: 'Completed' },
  { id: 'DS-4002', product: 'Samsung A14 Display', quantity: 2, damageType: 'Dead Pixels on Arrival', reportedBy: 'Admin User', reportedDate: '2026-08-02', repairCost: 0, decision: 'Return', status: 'Pending Review' },
];

export const dummyReplacement: ReplacementRecord[] = [
  { id: 'REP-5001', customer: 'Ali Khan', product: 'iPhone 13 Battery (Original)', imei: 'N/A', reason: 'Swelling after 2 weeks', supplier: 'MobileParts Inc.', requestDate: '2026-08-01', approval: 'Approved', status: 'Open' },
  { id: 'REP-5002', customer: 'Sara Ahmed', product: 'Samsung Galaxy A55', imei: '354829104837192', reason: 'Microphone not working', supplier: 'Samsung Warranty Hub', requestDate: '2026-07-28', approval: 'Pending', status: 'Open' },
];
