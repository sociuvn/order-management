import { info } from '../util/console';
import { Order } from '../dtos/order.dto';
import { Order as GHNOrder, getOrder as getGHNOrder, getTrackingLogs, searchOrder } from '../util/ghn.util';

const showOrders = async (fromPurchaseDate: Date, toPurchaseDate: Date) => {
  try {
    const orders: Order[] = await getOrders(
      fromPurchaseDate.toISOString(),
      toPurchaseDate.toISOString()
    );
    info(
      `🙌 Find ${
        orders?.length
      } GHN orders from ${fromPurchaseDate.toLocaleDateString()} to ${toPurchaseDate.toLocaleDateString()}!`
    );

    orders.forEach(async (order, index) => {
      info(
        `-------------------- 🔰 GHN Order #${index + 1}: ${
          order.code
        } 🔰 --------------------`
      );
      showOrder(order);
    });

    info(`(Total: ${orders?.length} orders)`);
  } catch (error) {
    console.error(error.message);
  }
};

const showOrder = (order: Order) => {
  info('• Order Id: ' + order.id);
  info('• Order Code: ' + order.code);
  info('• Order delivery status: ' + order.status);
  info('• Order products: ' + order.products);
  info('• Order delivery date: ' + order.doneAt);
};

const getOrders = async (
  fromDate: string,
  toDate: string
): Promise<Order[]> => {
  return [];
  // const data: OrderRequestDto = {
  //   ChildUserId: '',
  //   CreateTimeStart: fromDate,
  //   CreateTimeEnd: toDate,
  //   KeySearch: '',
  //   OrderByDescending: true,
  //   PageIndex: 0,
  //   PageSize: 1000,
  // };

  // const orders: VNPostListOrder = await searchOrder(data);

  // return orders?.Items?.map((item: VNPostOrder) => {
  //   const order = {
  //     id: item.Id,
  //     statusCode: item.OrderStatusId,
  //     status: item.OrderStatusName,
  //     fullName: item.ReceiverFullname,
  //     phone: item.ReceiverTel,
  //     codAmount: item.CodAmount,
  //     feeShip: Number(item.TotalFreightIncludeVat),
  //     products: item.PackageContent.substring(
  //       0,
  //       item.PackageContent.indexOf('TMĐT')
  //     ),
  //     code: item.OrderCode,
  //     createdAt: new Date(item.CreateTime),
  //     doneAt: new Date(item.DeliveryTime),
  //   };

  //   return order;
  // });
};

const getOrder = async (orderCode: string): Promise<Order> => {
  const order: GHNOrder = await getGHNOrder(orderCode);
  if (order && !order.returnFee) {
    const orderFromTrackingLogs = await getTrackingLogs(orderCode);

    order.statusName =  orderFromTrackingLogs?.statusName;
    order.returnFee = orderFromTrackingLogs?.returnFee;
    order.mainServiceFee = orderFromTrackingLogs?.mainServiceFee;
    order.totalFee = orderFromTrackingLogs?.totalFee;
  }

  return {
    id: order.id,
    statusCode: undefined,
    status: order.status,
    fullName: order.toName,
    phone: order.toPhone,
    address: order.toAddress,
    codAmount: order.codAmount,
    feeShip: order.totalFee,
    products: order.items.map((p) => p.name).join(','),
    code: order.orderCode,
    createdAt: order.orderDate,
    doneAt: order.finishDate,
    returnAt: order.returnTime,
  } as Order;
};

export { getOrder as getGHNOrder, showOrders };
