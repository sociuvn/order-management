import 'reflect-metadata';
import { Expose, Type } from 'class-transformer';
import fetch from 'cross-fetch';
import { transformObject } from './transform';
import { viettelpost } from '../config/viettelpost';

export class Order {
  @Expose({ name: 'ORDER_ID' })
  orderId: number;

  @Expose({ name: 'ORDER_NUMBER' })
  orderNumber: string;

  @Expose({ name: 'ORDER_STATUS' })
  orderStatus: number;

  @Expose({ name: 'RECEIVER_FULLNAME' })
  receiverFullname: string;

  @Expose({ name: 'RECEIVER_ADDRESS' })
  receiverAddress: string;

  @Expose({ name: 'RECEIVER_PHONE' })
  receiverPhone: string;

  @Expose({ name: 'PRODUCT_NAME' })
  productName: string;

  @Expose({ name: 'MONEY_COLLECTION' })
  moneyCollection: number;

  @Expose({ name: 'MONEY_TOTAL' })
  moneyTotal: string;

  @Expose({ name: 'ORDER_SYSTEMDATE' })
  orderSystemDate: string;

  @Expose({ name: 'ORDER_STATUSDATE' })
  orderStatusDate: string;
}

export class ListOrder {
  @Expose({ name: 'TOTAL' })
  total: number;

  @Expose({ name: 'TOTAL_MONEY' })
  totalMoney: number;

  @Expose({ name: 'LIST_ORDER' })
  @Type(() => Order)
  orders: Order[];
}

export class OrderRequestDto {
  PAGE_INDEX: number;
  PAGE_SIZE: number;
  INVENTORY?: string;
  TYPE: number;
  DATE_FROM: string;
  DATE_TO: string;
  ORDER_PAYMENT: string;
  IS_FAST_DELIVERY: boolean;
  REASON_RETURN?: string;
  ORDER_STATUS: string;
}

const getListOrder = async (data: OrderRequestDto): Promise<ListOrder> => {
  const url = `${viettelpost.baseUrl}${viettelpost.getListOrder}`;
  let options;
  let response;
  let dataResponse;
  let result;

  try {
    options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': viettelpost.token,
      },
      body: JSON.stringify(data),
    };
    response = await fetch(url, options);

    if (response.status == 200) {
      dataResponse = await response.json();
      const orders = dataResponse?.data?.data;
      result = transformObject(ListOrder, orders);
    } else {
      throw Error(`[ViettelPost] ${await response.text()}`);
    }
  } catch (e) {
    throw e;
  }

  return result;
};

const getOrder = async (orderNumber: string): Promise<Order> => {
  const url = `${viettelpost.baseUrl}${viettelpost.getOrder}`;

  let options: any;
  let response: any;
  let dataResponse: any;
  let result: Order;

  try {
    options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'token': viettelpost.token,
      },
    };

    response = await fetch(`${url}?OrderNumber=${orderNumber}`, options);

    if (response.status == 200) {
      dataResponse = await response.json();
      if (dataResponse[0]){
        result = transformObject(Order, dataResponse[0]);
      } else {
        throw Error(`[ViettelPost] Can not find order with id: ${orderNumber}`);
      }
    } else {
      throw Error(`[ViettelPost] ${await response.text()}`);
    }
  } catch (e) {
    throw e;
  }

  return result;
};

export { getListOrder, getOrder };
