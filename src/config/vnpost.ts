export const vnpost = {
  baseUrl: 'https://donhang.vnpost.vn/api',
  getListOrderOfCustomer: '/api/CustomerOrder/GetListOderOfCustomer',
  getOrder: '/api/Order/GetOrder',
  token: process.env.VNPOST_TOKEN
};
