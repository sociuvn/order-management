import 'reflect-metadata';
import { Type } from 'class-transformer';
import fetch from 'cross-fetch';
import { vnpost } from '../config/vnpost';
import { transformObject } from './transform';

export class Order {
  Id: string;
  ItemCode: string;
  CodAmount: number;
  CodAmountEvaluation: number;
  CreateTime: string;
  DeliveryTime: string;
  LastUpdateTime: string;
  OrderCode: string;
  OrderStatusId: number;
  OrderStatusName: string;
  PackageContent: string;
  ReceiverFullname: string;
  ReceiverInBlacklist: string;
  ReceiverTel: string;
  TotalFreightIncludeVat: string;
  TotalFreightIncludeVatEvaluation: string;
}

export class OrderDetail extends Order {
  ReceiverAddress: string;
  ReceiverDistrictId: string;
  ReceiverProvinceId: string;
  ReceiverWardId: string;
  ReceiverFullAddress: string;
}

export class ListOrder {
  Count: number;

  @Type(() => Order)
  Items: Order[];
}

export class OrderRequestDto {
  ChildUserId: string;
  KeySearch?: string;
  CreateTimeEnd?: string;
  CreateTimeStart?: string;
  OrderByDescending: boolean;
  PageIndex: number;
  PageSize: number;
}

const getOrdersOfCustomer = async (data: OrderRequestDto): Promise<ListOrder> => {
  const url = `${vnpost.baseUrl}${vnpost.getListOrderOfCustomer}`;
  let options;
  let response;
  let dataResponse;
  let result;

  try {
    options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'h-token': vnpost.token
      },
      body: JSON.stringify(data)
    };
    response = await fetch(url, options);

    if (response.status == 200) {
      dataResponse = await response.json();
      result = transformObject(ListOrder, dataResponse);
    } else {
      throw Error(`[VNPost] ${await response.text()}`);
    }
  } catch (e) {
    throw e;
  }

  return result;
};

const getOrder = async (id: string): Promise<OrderDetail> => {
  const url = `${vnpost.baseUrl}${vnpost.getOrder}`;

  let options: any;
  let response: any;
  let dataResponse: any;
  let result: OrderDetail;

  try {
    options = {
      method: 'POST',
      headers: {
        'h-token': vnpost.token
      },
    };

    response = await fetch(`${url}/${id}`, options);

    if (response.status == 200) {
      dataResponse = await response.json();
      result = transformObject(OrderDetail, dataResponse);
    } else {
      throw Error(`[VNPost] ${await response.text()}`);
    }
  } catch (e) {
    throw e;
  }

  return result;
};

export { getOrdersOfCustomer, getOrder };
