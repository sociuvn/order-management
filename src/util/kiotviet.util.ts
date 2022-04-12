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

const getInvoice = async (code: string): Promise<any> => {
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
      return dataResponse;
    } else if (response.status === 420) {
      return undefined;
    } else {
      log(dataResponse);
      throw new Error('Error when get Kiotviet Invoice');
    }
  } catch (e) {
    throw e;
  }
};

const getInvoices = async (status: number, fromPurchaseDate: string, toPurchaseDate: string): Promise<any> => {
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
      return dataResponse?.data;
    } else {
      log(dataResponse);
      throw new Error('Error when get Kiotviet List Invoice');
    }
  } catch (e) {
    throw e;
  }
};

const updateInvoice = async (id: string, data: any): Promise<any> => {
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
      throw new Error('Error when update Kiotviet Invoice');
    }
  } catch (e) {
    throw e;
  }
};

export { getAccessToken, getInvoice, getInvoices, updateInvoice };
