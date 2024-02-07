import { info } from '../util/console';
import { Order } from '../dtos/order.dto';
import {
  OrderRequestDto,
  ListOrder,
  Order as ViettelPostOrder,
  getOrder as getViettelPostOrder,
  getListOrder
} from '../util/viettelpost.util';

const showOrders = async (fromPurchaseDate: Date, toPurchaseDate: Date) => {
  try {
    const orders: Order[] = await getOrders(
      fromPurchaseDate.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
      toPurchaseDate.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    );
    info(
      `🙌 Find ${
        orders?.length
      } ViettelPost orders from ${fromPurchaseDate.toLocaleDateString()} to ${toPurchaseDate.toLocaleDateString()}!`
    );

    orders.forEach(async (order, index) => {
      info(
        `-------------------- 🔰 ViettelPost Order #${index + 1}: ${
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

const getOrder = async (code: string): Promise<Order> => {
  const item: ViettelPostOrder = await getViettelPostOrder(code);

  return item
    ? ({
        id: String(item.orderId),
        statusCode: item.orderStatus,
        status: String(item.orderStatus),
        fullName: item.receiverFullname,
        address: item.receiverAddress,
        phone: item.receiverPhone,
        codAmount: item.moneyCollection,
        feeShip: Number(item.moneyTotal),
        products: item.productName,
        code: item.orderNumber,
        createdAt: item.orderSystemDate
          ? new Date(item.orderSystemDate)
          : undefined,
        doneAt: item.orderStatusDate
          ? new Date(item.orderStatusDate)
          : undefined,
        returnAt: undefined,
      } as Order)
    : undefined;
};

const getOrders = async (
  fromDate: string,
  toDate: string
): Promise<Order[]> => {
  const data: OrderRequestDto = {
    PAGE_INDEX: 1,
    PAGE_SIZE: 1000,
    INVENTORY: null,
    TYPE: 0,
    DATE_FROM: fromDate,
    DATE_TO: toDate,
    ORDER_PAYMENT: '',
    IS_FAST_DELIVERY: false,
    REASON_RETURN: null,
    ORDER_STATUS:
      '-100,-101,-102,-108,-109,-110,100,101,102,103,104,105,107,200,201,202,300,301,302,303,320,400,500,501,502,503,504,505,506,507,508,509,515,550,551,570',
  };

  const orders: ListOrder = await getListOrder(data);

  return orders?.orders?.map((item: ViettelPostOrder) => {
    const order = {
      id: String(item.orderId),
      statusCode: item.orderStatus,
      status: String(item.orderStatus),
      fullName: item.receiverFullname,
      phone: item.receiverPhone,
      codAmount: item.moneyCollection,
      feeShip: Number(item.moneyTotal),
      products: item.productName,
      code: item.orderNumber,
      createdAt: item.orderSystemDate
        ? new Date(item.orderSystemDate)
        : undefined,
      doneAt: item.orderStatusDate ? new Date(item.orderStatusDate) : undefined,
    };

    return order;
  });
};

export {
  getOrder as getViettelPostOrder,
  getOrders as getViettelPostOrders,
  showOrders,
};
