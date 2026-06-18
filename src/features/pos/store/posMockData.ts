export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  costPrice: number;
  price: number;
  stock: number;
  reservedStock: number;
}

export const mockProducts: Product[] = [
  { id: '1', sku: 'A123', barcode: '100123456789', name: 'LCD iPhone 12 Original', costPrice: 5000, price: 6800, stock: 24, reservedStock: 0 },
  { id: '2', sku: 'BAT-A12', barcode: '100987654321', name: 'Samsung A12 Battery', costPrice: 1000, price: 1500, stock: 2, reservedStock: 0 },
  { id: '3', sku: 'CHG-20W', barcode: '200111222333', name: 'Apple 20W Fast Charger', costPrice: 2200, price: 3500, stock: 50, reservedStock: 0 },
  { id: '4', sku: 'CBL-TC', barcode: '200444555666', name: 'Type-C to Type-C Cable Baseus', costPrice: 400, price: 800, stock: 15, reservedStock: 0 },
  { id: '5', sku: 'SCR-S23', barcode: '300777888999', name: 'Screen Protector S23 Ultra UV', costPrice: 600, price: 1200, stock: 0, reservedStock: 0 },
  { id: '6', sku: 'EAR-AP2', barcode: '400123123123', name: 'AirPods Pro 2nd Gen (Master Copy)', costPrice: 2800, price: 4500, stock: 8, reservedStock: 0 },
  { id: '7', sku: 'COV-I14P', barcode: '500456456456', name: 'iPhone 14 Pro Silicone Case', costPrice: 400, price: 900, stock: 30, reservedStock: 0 },
  { id: '8', sku: 'PWB-10K', barcode: '600789789789', name: 'Mi Powerbank 10000mAh', costPrice: 3200, price: 4200, stock: 12, reservedStock: 0 },
  { id: '9', sku: 'REP-GLS', barcode: '700321321321', name: 'Back Glass iPhone 13 Pro Max', costPrice: 1200, price: 2500, stock: 5, reservedStock: 0 },
  { id: '10', sku: 'CAM-S21', barcode: '800654654654', name: 'S21 Ultra Camera Module Replacement', costPrice: 9000, price: 12500, stock: 1, reservedStock: 0 },
];

export interface CreditCustomer {
  id: string;
  accountCode: string;
  name: string;
  mobile: string;
  currentBalance: number;
  creditLimit: number;
}

export const mockCustomers: CreditCustomer[] = [
  { id: 'c1', accountCode: 'ACC-001', name: 'Ahmed Mobile Center', mobile: '03001234567', currentBalance: 45000, creditLimit: 100000 },
  { id: 'c2', accountCode: 'ACC-002', name: 'Al Rehman Traders', mobile: '03211234567', currentBalance: 120000, creditLimit: 200000 },
  { id: 'c3', accountCode: 'ACC-003', name: 'Usman Electronics', mobile: '03331234567', currentBalance: 18500, creditLimit: 50000 },
  { id: 'c4', accountCode: 'ACC-004', name: 'Galaxy Mobile House', mobile: '03451234567', currentBalance: 72000, creditLimit: 150000 },
  { id: 'c5', accountCode: 'ACC-005', name: 'Hamza Communication', mobile: '03111234567', currentBalance: 9800, creditLimit: 30000 },
];

export interface ShopProfile {
  name: string;
  address: string;
  phone1: string;
  phone2?: string;
  ntn?: string;
  invoiceNote?: string;
  logo?: string;
}

export const mockShopProfile: ShopProfile = {
  name: 'NEW AI AUTO TRADERS',
  address: 'Shop #67, Imperial Market, Liaquat Bagh, Rawalpindi',
  phone1: '0303-5231061',
  phone2: '0333-5205621',
  invoiceNote: 'THANK YOU FOR SHOPPING'
};
