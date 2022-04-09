import fetch from 'cross-fetch';
import { kiotviet } from '../config/kiotviet';
import { log } from './console';

const getAccessToken = async (): Promise<any> => {
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
      throw new Error('Error when get Kiotviet Access token');
    }
  } catch (e) {
    throw e;
  }
};

const getOrder = async (code: string): Promise<any> => {
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
    if (response.status == 200) {
      return dataResponse;
    } else {
      log(dataResponse);
      throw new Error('Error when get Kiotviet Order');
    }
  } catch (e) {
    throw e;
  }
};

const getOrders = async (status: number, fromPurchaseDate: string, toPurchaseDate: string): Promise<any> => {
  const url = `${kiotviet.baseUrl}${kiotviet.getInvoices}`;

  const params = {
    // status: 3,
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
      return dataResponse;
    } else {
      log(dataResponse);
      throw new Error('Error when get Kiotviet List Order');
    }
  } catch (e) {
    throw e;
  }
};

const updateOrder = async (id: string, data: any): Promise<any> => {
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
      return dataResponse;
    } else {
      log(dataResponse);
      throw new Error('Error when update Kiotviet Order');
    }
  } catch (e) {
    throw e;
  }
};

const mapOrderStatus = (ghtkOrderStatus: string): number => {
  switch (ghtkOrderStatus) {
    case 'Đã giao hàng':
    case 'Đã giao hàng/Chưa đối soát':
    case 'Đã đối soát':
      return 3;
    default:
      return 1;
  }
};

export { getAccessToken, getOrder, getOrders, updateOrder, mapOrderStatus };
