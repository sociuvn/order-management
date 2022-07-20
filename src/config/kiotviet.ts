export const kiotviet = {
  tokenConnectUrl: 'https://id.kiotviet.vn/connect/token',
  baseUrl: 'https://public.kiotapi.com',
  getInvoices: '/invoices',
  getInvoiceByCode: '/invoices/code',
  updateInvoiceById: '/invoices',
  clientId: process.env.KIOTVIET_CLIENT_ID,
  clientSecret: process.env.KIOTVIET_SECRET,
  retailer: process.env.KIOTVIET_RETAILER,
  token: process.env.KIOTVIET_TOKEN,
  partnerDelivery: {
    GHTK: process.env.KIOTVIET_PARTNER_DELIVERY_CODE_GHTK,
    GHN: process.env.KIOTVIET_PARTNER_DELIVERY_CODE_GHN,
    VNPOST: process.env.KIOTVIET_PARTNER_DELIVERY_CODE_VNPOST,
  }
};
