import fetch from 'cross-fetch';
import { ghtk } from '../config/ghtk';
import { generateQueryString } from './request';

const getOrder = async (id: string): Promise<any> => {
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

  let result: any = {
    order: id
  };
  try {

    const response = await fetch(`${url}?${generateQueryString(params)}`, options);
    const dataResponse: any = await response.json();
    if (response.status == 200 && dataResponse.success === true) {
      const data = dataResponse?.data;
      const packageData = data?.Package;
      const tags = packageData?.draft_tags?.map((p: any) => p.name);
      const tracking: any = packageData?.tracking;
      const products = tracking?.products?.map((p: any) => ({
        product_name: p.product_name,
        quantity: p.quantity
      }));
      result = {
        ...result,
        status: tracking?.status?.name,
        full_name: tracking?.customer_fullname,
        phone: tracking.customer_tel,
        first_address: tracking?.customer_first_address,
        last_address: tracking?.customer_last_address,
        pick_money: tracking?.pick_money,
        fee_ship: packageData?.final_ship_fee,
        return_fee: packageData?.return_fee,
        total_fee: tracking?.total_fee,
        products: products,
        tags: tags,
        created_at: tracking?.created,
        done_at: tracking?.done_at,
        return_at: packageData?.returned_at
      };
    }
  } catch (e) {
    console.error(e);
  }

  return result;
};

export { getOrder };
