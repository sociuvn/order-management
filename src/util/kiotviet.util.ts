import fetch from 'cross-fetch';
import { kiotviet } from '../config/kiotviet';
import { log } from './console';
import { transformObject, transformObjects } from './transform';

export class AddCustomerRequestDto {
  code?: string; // Mã khách hàng
  name: string; // Tên khách hàng
  gender?: boolean; // Giới tính (true: nam, false: nữ)
  birthDate?: Date; // Ngày sinh khách hàng
  contactNumber: string; // Số điện thoại khách hàng
  address?: string; // Địa chỉ khách hàng
  email?: string; // Email của khách hàng
  comments?: string; // Ghi chú
  groupIds?: number[]; // Danh sách Id nhóm khách hàng
  branchId: number; // ID chi nhánh tạo khách hàng
}

export class Customer {
  id: number;
  code: string;
  name: string;
  gender: boolean;
  contactNumber: string;
  address: string;
  retailerId: number;
  branchId: number;
  locationName: string;
  wardName: string;
  modifiedDate: Date;
  createdDate: Date;
  type: number;
  organization: string;
  comments: string;
  groups: string;
  debt: number;
  rewardPoint: number;
}

export class Invoice {
  id: number;
  uuid: string;
  code: string;
  purchaseDate: Date;
  branchId: number;
  branchName: string;
  soldById: number;
  saleChannelId: number;
  soldByName: string;
  customerId: number;
  customerCode: string;
  customerName: string;
  orderCode: string;
  total: number;
  totalPayment: number;
  status: number;
  statusValue: string;
  usingCod: boolean;
  modifiedDate: Date;
  createdDate: Date;
  invoiceDelivery: InvoiceDelivery;
  invoiceDetails: InvoiceDetail[];
  payments: Payment[];
  saleChannel: SaleChannel;
  invoiceOrderSurcharges: OrderSurcharge[];
}

export class InvoiceDelivery {
  invoiceId: number;
  deliveryBy: number;
  deliveryCode: string;
  serviceType: string;
  status: number;
  statusValue: string;
  price: number;
  receiver: string;
  contactNumber: string;
  address: string;
  locationId: number;
  locationName: string;
  wardId: number;
  wardName: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  usingPriceCod: boolean;
  partnerDelivery: PartnerDelivery;
  expectedDelivery: Date;
  latestStatus: number;
}

export class PartnerDelivery {
  code: string;
  name: string;
}

export class InvoiceDetail {
  productId: number;
  productCode: string;
  productName: string;
  quantity: number;
  price: number;
  discount: number;
  usePoint: boolean;
  subTotal: number;
  note: string;
  serialNumbers: string;
  productBatchExpire: ProductBatchExpire;
  returnQuantity: number;
}

export class ProductBatchExpire {
  id: number;
  productId: number;
  batchName: string;
  fullNameVirgule: string;
  createdDate: Date;
  expireDate: Date;
}

export class Payment { }

export class SaleChannel {
  img: string;
  retailerId: number;
  position: number;
  isActive: boolean;
  description: string;
  modifiedDate: Date;
  modifiedBy: number;
  createdBy: number;
  createdDate: Date;
  id: number;
  name: string;
}

export class OrderSurcharge { }

export class ListCustomerRequestDto {
  code?: string; // Nếu có mã code, cho phép tìm kiếm khách hàng theo mã khách hàng
  name?: string; // Tìm kiếm theo tên khách hàng
  contactNumber?: string; // Tìm kiếm theo số điện thoại khách hàng
  lastModifiedFrom?: Date; // thời gian cập nhật
  pageSize?: number; // Số items trong 1 trang, mặc định 20 items, tối đa 100 items
  currentItem?: number;
  orderBy?: string; // Sắp xếp dữ liệu theo trường orderBy (Ví dụ: orderBy=name)
  orderDirection?: string; // Sắp xếp kết quả trả về theo: Tăng dần Asc (Mặc định), giảm dần Desc
  includeRemoveIds?: boolean; //Có lấy thông tin danh sách Id bị xoá dựa trên lastModifiedFrom
  includeTotal?: boolean; //Có lấy thông tin TotalInvoice, TotalPoint, TotalRevenue
  includeCustomerGroup?: boolean; //Có lấy thông tin nhóm khách hàng hay không
  birthDate?: string; //filter khách hàng theo ngày sinh nhật
  groupId?: number; //filter theo nhóm khách hàng
  includeCustomerSocial?: boolean; // Có lấy thông tin Psid facebook fanpage của khách hàng hay không
}

export class Branch {
  id: number;
  branchName: string;
  address: string;
  locationName: string;
  wardName: string;
  contactNumber: string;
  retailerId: number;
  email: string;
  modifiedDate: Date;
  createdDate: Date;
}

const getAccessToken = async (): Promise<string> => {
  const data = {
    scopes: 'PublicApi.Access',
    grant_type: 'client_credentials',
    client_id: kiotviet.clientId,
    client_secret: kiotviet.clientSecret
  };
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams(data)
  };

  try {
    const response = await fetch(kiotviet.tokenConnectUrl, options);
    const dataResponse: any = await response.json();
    if (response.status == 200) {
      return dataResponse.access_token;
    } else {
      log(dataResponse);
      throw new Error('[Kiotviet] Error when get access token');
    }
  } catch (e) {
    throw e;
  }
};

const getInvoice = async (code: string): Promise<Invoice> => {
  const url = `${kiotviet.baseUrl}${kiotviet.getInvoiceByCode}/${code}`;

  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${kiotviet.token}`,
      Retailer: kiotviet.retailer
    }
  };

  try {
    const response = await fetch(url, options);
    const dataResponse: any = await response.json();
    if (response.status === 200) {
      return transformObject(Invoice, dataResponse);
    } else if (response.status === 420) {
      return undefined;
    } else {
      log(dataResponse);
      throw new Error('[Kiotviet] Error when get invoice');
    }
  } catch (e) {
    throw e;
  }
};

const getInvoices = async (status: number, fromPurchaseDate: string, toPurchaseDate: string): Promise<Invoice[]> => {
  const url = `${kiotviet.baseUrl}${kiotviet.getInvoices}`;

  const params = {
    status: status.toString(),
    pageSize: '100',
    includeInvoiceDelivery: 'true',
    fromPurchaseDate: fromPurchaseDate,
    toPurchaseDate: toPurchaseDate
  };

  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${kiotviet.token}`,
      Retailer: kiotviet.retailer
    }
  };

  try {

    const response = await fetch(`${url}?${new URLSearchParams(params).toString()}`, options);
    const dataResponse: any = await response.json();
    if (response.status == 200) {
      return transformObjects(Invoice, dataResponse?.data);
    } else {
      log(dataResponse);
      throw new Error('[Kiotviet] Error when get list invoices');
    }
  } catch (e) {
    throw e;
  }
};

const updateInvoice = async (id: string, data: any): Promise<Invoice> => {
  const url = `${kiotviet.baseUrl}${kiotviet.updateInvoiceById}/${id}`;

  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${kiotviet.token}`,
      Retailer: kiotviet.retailer
    },
    body: JSON.stringify(data)
  };

  try {
    const response = await fetch(url, options);
    const dataResponse: any = await response.json();
    if (response.status == 200) {
      return transformObject(Invoice, dataResponse);
    } else {
      log(dataResponse);
      throw new Error('[Kiotviet] Error when update Invoice');
    }
  } catch (e) {
    throw e;
  }
};

const getCustomers = async (requestData: ListCustomerRequestDto): Promise<Customer[]> => {
  const url = `${kiotviet.baseUrl}${kiotviet.customers}`;

  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${kiotviet.token}`,
      Retailer: kiotviet.retailer
    }
  };

  try {
    const response = await fetch(`${url}?${new URLSearchParams(requestData as any).toString()}`, options);
    const dataResponse: any = await response.json();
    if (response.status == 200) {
      return transformObjects(Customer, dataResponse?.data);
    } else {
      log(dataResponse);
      throw new Error('[Kiotviet] Error when get customers');
    }
  } catch (e) {
    throw e;
  }
};

const createCustomer = async (data: AddCustomerRequestDto): Promise<Customer> => {
  const url = `${kiotviet.baseUrl}${kiotviet.customers}`;
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${kiotviet.token}`,
      Retailer: kiotviet.retailer
    },
    body: JSON.stringify(data)
  };

  try {
    const response = await fetch(url, options);
    const dataResponse: any = await response.json();

    if (response.status == 200) {
      return transformObject(Customer, dataResponse?.data);
    } else {
      log(dataResponse);
      throw new Error('[Kiotviet] Error when create customer');
    }
  } catch (e) {
    throw e;
  }
};

const getBranches = async (): Promise<Branch[]> => {
  const url = `${kiotviet.baseUrl}${kiotviet.branches}`;

  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${kiotviet.token}`,
      Retailer: kiotviet.retailer
    }
  };

  try {
    const response = await fetch(`${url}`, options);
    const dataResponse: any = await response.json();
    if (response.status == 200 && dataResponse) {
      return transformObjects(Branch, dataResponse.data);
    } else {
      log(dataResponse);
      throw new Error('[Kiotviet] Error when get list branches');
    }
  } catch (e) {
    throw e;
  }
};

export { getAccessToken, getInvoice, getInvoices, updateInvoice, getCustomers, createCustomer, getBranches };
