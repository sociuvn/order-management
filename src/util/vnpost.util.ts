import fetch from 'cross-fetch';
import { vnpost } from '../config/vnpost';

const getOrder = async (id: string): Promise<any> => {
  const url = `${vnpost.baseUrl}${vnpost.getListOrderOfCustomer}`;

  const data = {
    KeySearch: id,
    ChildUserId: '',
    OrderByDescending: true,
    PageIndex: 0,
    PageSize: 5,
  };

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'h-token': vnpost.token
    },
    body: JSON.stringify(data)
  };

  let result: any = {
    order: id
  };

  try {

    const response = await fetch(url, options);
    if (response.status == 401) {
      console.log(await response.text());
    }

    if (response.status == 200) {
      const dataResponse: any = await response.json();
      const data = dataResponse?.Items[0];
      result = {
        ...result,
        id: data.Id,
        status_code: data.OrderStatusId,
        status: data.OrderStatusName,
        full_name: data.ReceiverFullname,
        phone: data.ReceiverTel,
        cod_amount: data.CodAmount,
        fee_ship: data.TotalFreightIncludeVat,
        products: data.PackageContent,
        code: data.OrderCode,
        created_at: data.CreateTime,
        done_at: data.DeliveryTime,
        return_at: data.DeliveryTime
      };
    }
  } catch (e) {
    console.error(e);
  }

  return result;
};

export { getOrder };
