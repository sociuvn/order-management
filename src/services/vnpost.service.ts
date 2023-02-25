import { info } from '../util/console';
import { Order } from '../dtos/order.dto';
import { OrderRequestDto, ListOrder as VNPostListOrder, Order as VNPostOrder, getOrdersOfCustomer, getOrder as getVNPostOrder, OrderDetail } from '../util/vnpost.util';

const showOrders = async (fromPurchaseDate: Date, toPurchaseDate: Date) => {
  try {
    const orders: Order[] = await getOrders(fromPurchaseDate.toISOString(), toPurchaseDate.toISOString());
    info(`🙌 Find ${orders?.length} VNPOST orders from ${fromPurchaseDate.toLocaleDateString()} to ${toPurchaseDate.toLocaleDateString()}!`);

    orders.forEach(async (order, index) => {
      info(`-------------------- 🔰 VNPost Order #${index + 1}: ${order.code} 🔰 --------------------`);
      showOrder(order);
    })

    info(`(Total: ${orders?.length} orders)`)
  } catch (error) {
    console.error(error.message);
  }
};

const showOrder = (order: Order) => {
  info('🠺 Order Id: ' + order.id);
  info('🠺 Order Code: ' + order.code);
  info('🠺 Order delivery status: ' + order.status);
  info('🠺 Order products: ' + order.products);
  info('🠺 Order delivery date: ' + order.doneAt);
}

const getOrder = async (condition: string): Promise<Order> => {
  const data: OrderRequestDto = {
    KeySearch: condition,
    ChildUserId: '',
    OrderByDescending: true,
    PageIndex: 0,
    PageSize: 5,
  };

  let result: Order;

  const orders: VNPostListOrder = await getOrdersOfCustomer(data);

  const item = orders?.Items[0];
  result = {
    id: item.Id,
    statusCode: item.OrderStatusId,
    status: item.OrderStatusName,
    fullName: item.ReceiverFullname,
    phone: item.ReceiverTel,
    codAmount: item.CodAmount,
    feeShip: Number(item.TotalFreightIncludeVat),
    products: item.PackageContent.substring(0, item.PackageContent.indexOf('TMĐT')),
    code: item.OrderCode,
    createdAt: new Date(item.CreateTime),
    doneAt: new Date(item.DeliveryTime),
    returnAt: undefined
  };

  return result;
};

const getOrderDetail = async (id: string): Promise<Order> => {
  let result: Order;
  const item: OrderDetail = await getVNPostOrder(id);

  result = {
    id: item.Id,
    statusCode: item.OrderStatusId,
    status: item.OrderStatusName,
    fullName: item.ReceiverFullname,
    phone: item.ReceiverTel,
    address: getAddress(item?.ReceiverAddress, item?.ReceiverFullAddress),
    codAmount: item.CodAmount,
    feeShip: Number(item.TotalFreightIncludeVat),
    products: item.PackageContent.substring(0, item.PackageContent.indexOf('TMĐT')),
    code: item.OrderCode,
    createdAt: new Date(item.CreateTime),
    doneAt: new Date(item.DeliveryTime),
    returnAt: item.OrderStatusName === 'Phát hoàn thành công' ? new Date(item.LastUpdateTime) : undefined
  };

  return result;
};

const getOrders = async (fromDate: string, toDate: string): Promise<Order[]> => {
  const data: OrderRequestDto = {
    ChildUserId: '',
    CreateTimeStart: fromDate,
    CreateTimeEnd: toDate,
    KeySearch: '',
    OrderByDescending: true,
    PageIndex: 0,
    PageSize: 1000,
  };

  const orders: VNPostListOrder = await getOrdersOfCustomer(data);

  return orders?.Items?.map((item: VNPostOrder) => {
    let order = {
      id: item.Id,
      statusCode: item.OrderStatusId,
      status: item.OrderStatusName,
      fullName: item.ReceiverFullname,
      phone: item.ReceiverTel,
      codAmount: item.CodAmount,
      feeShip: Number(item.TotalFreightIncludeVat),
      products: item.PackageContent.substring(0, item.PackageContent.indexOf('TMĐT')),
      code: item.OrderCode,
      createdAt: new Date(item.CreateTime),
      doneAt: new Date(item.DeliveryTime),
    };

    return order;
  });
};

const getAddress = (receiverAddress: string, receiverFullAddress: string) => {
  if (receiverAddress.split(',').length > 3) {
    return receiverAddress.replace('(KhongXacDinh)', '').trim();
  } else {
    const addrSplitted = receiverFullAddress?.split(',');
    return addrSplitted.length <= 4 ? receiverFullAddress : addrSplitted.slice(0, -3).join(',').replace('(KhongXacDinh)', '').trim();
  }
}

export { getOrder as getVNPostOrder, getOrders as getVNPostOrders, getOrderDetail as getVNPostOrderDetail, showOrders };
