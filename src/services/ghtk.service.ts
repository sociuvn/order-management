import { Order } from '../dtos/order.dto';
import { getOrder as getGHTKOrder, Order as GHTKOrder } from '../util/ghtk.util';

const getOrder = async (id: string): Promise<Order> => {
  const order: GHTKOrder = await getGHTKOrder(id);

  return {
    id: order.id,
    statusCode: order.statusCode,
    status: order.status,
    fullName: order.fullName,
    phone: order.phone,
    address: order.lastAddress,
    codAmount: order.pickMoney,
    feeShip: order.feeShip,
    products: order.products.map(p => p.productName).join(','),
    code: order.id,
    createdAt: new Date(order.createdAt * 1000),
    doneAt: new Date(order.doneAt * 1000),
    returnAt: order.returnAt ? new Date(order.returnAt * 1000) : undefined
  };
};

export { getOrder as getGHTKOrder };
