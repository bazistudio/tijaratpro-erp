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
