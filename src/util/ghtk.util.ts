import fetch from 'cross-fetch';
import { ghtk } from '../config/ghtk';
import { generateQueryString } from './request';

export class Order {
  id: string;
  alias: string;
  statusCode: number;
  status: string;
  fullName: string;
  phone: string;
  firstAddress: string;
  lastAddress: string;
  pickMoney: number;
  feeShip: number;
  returnFee: number;
  totalFee: number;
  products: Product[];
  tags: string[];
  createdAt: number;
  doneAt: number;
  returnAt: number;
}

export class Product {
  productName: string;
  quantity: number;
}

const getOrder = async (id: string): Promise<Order> => {
  const url = `${ghtk.baseUrl}${ghtk.packageDetail}`;

  const params = {
    alias: id
  };
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${ghtk.token}`
    }
  };

  let result: Order;
  try {

    const response = await fetch(`${url}?${generateQueryString(params)}`, options);
    const dataResponse: any = await response.json();
    if (response.status == 200 && dataResponse.success === true) {
      const data = dataResponse?.data;
      const packageData = data?.Package;
      const tags = packageData?.draft_tags?.map((p: any) => p.name);
      const tracking: any = packageData?.tracking;
      const products: Product[] = tracking?.products?.map((p: any) => ({
        productName: p.product_name,
        quantity: p.quantity
      } as Product));
      result = {
        id: id,
        alias: packageData?.alias,
        statusCode: tracking?.status?.id,
        status: tracking?.status?.name,
        fullName: tracking?.customer_fullname,
        phone: tracking.customer_tel,
        firstAddress: tracking?.customer_first_address,
        lastAddress: tracking?.customer_last_address,
        pickMoney: packageData?.pick_money,
        feeShip: packageData?.final_ship_fee,
        returnFee: packageData?.return_fee,
        totalFee: tracking?.total_fee,
        products: products,
        tags: tags,
        createdAt: tracking?.created,
        doneAt: tracking?.done_at,
        returnAt: packageData?.returned_at
      };
    }
  } catch (e) {
    console.error(e);
  }

  return result;
};

export { getOrder };
