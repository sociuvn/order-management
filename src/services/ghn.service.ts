import { info } from '../util/console';
import { Order } from '../dtos/order.dto';
import { Order as GHNOrder, ListOrder, getOrder as getGHNOrder, getTrackingLogs, searchOrder } from '../util/ghn.util';

const showOrders = async (fromPurchaseDate: Date, toPurchaseDate: Date) => {
  try {

    const orders: Order[] = await getOrders(fromPurchaseDate, toPurchaseDate);
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
  fromPurchaseDate: Date,
  toPurchaseDate: Date
): Promise<Order[]> => {
  const fromTime = Math.floor(fromPurchaseDate.getTime() / 1000);
  const toTime = Math.floor(toPurchaseDate.getTime() / 1000);
  const data = {
    status: [
      'ready_to_pick',
      'picking',
      'money_collect_picking',
      'picked',
      'sorting',
      'storing',
      'transporting',
      'delivering',
      'delivery_fail',
      'money_collect_delivering',
      'return',
      'returning',
      'return_fail',
      'return_transporting',
      'return_sorting',
      'waiting_to_return',
      'returned',
      'delivered',
      'cancel',
      'lost',
      'damage',
    ],
    payment_type_id: [1, 2, 4, 5],
    from_time: fromTime,
    to_time: toTime,
    offset: 0,
    limit: 1000000,
    from_cod_amount: 0,
    to_cod_amount: 0,
    ignore_shop_id: false,
    is_search_exactly: false,
    source: '5sao',
  };

  const orders: ListOrder = await searchOrder(data);

  return orders?.data.map((order: GHNOrder) => {
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
    };
  });
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

export { getOrder as getGHNOrder, showOrders, getOrders as getGHNOrders };
