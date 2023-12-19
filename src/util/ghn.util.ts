import { Expose, Type } from 'class-transformer';
import { ghn } from '../config/ghn';
import { transformObject } from './transform';

export class Order {
  @Expose({ name: '_id' })
  id: string;

  @Expose({ name: 'shop_id' })
  shopId: number;

  @Expose({ name: 'client_id' })
  clientId: number;

  @Expose({ name: 'to_name' })
  toName: string;

  @Expose({ name: 'to_phone' })
  toPhone: string;

  @Expose({ name: 'to_address' })
  toAddress: string;

  @Expose({ name: 'to_ward_code' })
  toWardCode: string;

  @Type(() => Item)
  items: Item[];

  @Expose({ name: 'cod_amount' })
  codAmount: number;

  @Expose({ name: 'order_code' })
  orderCode: string;

  @Expose({ name: 'status' })
  status: string;

  @Expose({ name: 'status_name' })
  statusName: string;

  @Expose({ name: 'order_date' })
  orderDate: Date;

  @Expose({ name: 'finish_date' })
  finishDate?: Date;

  @Expose({ name: 'return_time' })
  returnTime?: Date;

  @Expose({ name: 'main_service_fee' })
  mainServiceFee: number;

  @Expose({ name: 'return_fee' })
  returnFee: number;

  @Expose({ name: 'total_fee' })
  totalFee: number;
}

class Item {
  name: string;
  quantity: number;
}

export const searchOrder = async (id: string): Promise<Order[]> => {
  const url = `${ghn.baseShipUrl}${ghn.searchOrder}`;
  return [];
};

export const getOrder = async (orderCode: string): Promise<Order> => {
  const url = `${ghn.baseShipUrl}${ghn.getOrder}`;
  let options;
  let response;
  let dataResponse;
  let result;

  try {
    options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': ghn.token,
      },
      body: JSON.stringify({
        order_code: orderCode
      }),
    };
    response = await fetch(url, options);

    if (response.status == 200) {
      dataResponse = await response.json();
      result = transformObject(Order, dataResponse.data);
    } else {
      throw Error(`[GHN] ${await response.text()}`);
    }
  } catch (e) {
    throw e;
  }

  return result;
};

export const getTrackingLogs = async (orderCode: string): Promise<Order> => {
  const url = `${ghn.baseOrderTrackingUrl}${ghn.trackingLogs}`;
  let options;
  let response;
  let dataResponse;
  let result;

  try {
    options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_code: orderCode,
      }),
    };
    response = await fetch(url, options);

    if (response.status == 200) {
      dataResponse = await response.json();
      result = transformObject(Order, dataResponse?.data?.order_info);
    } else {
      throw Error(`[GHN] ${await response.text()}`);
    }
  } catch (e) {
    throw e;
  }

  return result;
};
