import { AddCustomerRequestDto, Branch, Customer, getBranches, getCustomers as getKVCustomers, getInvoice as getKVInvoice, getInvoices as getKVInvoices, Invoice, ListCustomerRequestDto, updateInvoice as updateKVInvoice, createCustomer as createKVCustomer } from '../util/kiotviet.util';
import { getGHTKOrder } from './ghtk.service';
import { info, log } from '../util/console';
import { kiotviet } from '../config/kiotviet';
import { KIOTVIET_DELIVERY_STATUS, KIOTVIET_INVOICE_STATUS } from '../config/constant';
import { getVNPostOrder, getVNPostOrderDetail, getVNPostOrders } from './vnpost.service';
import { Order } from '../dtos/order.dto';
import { getGHNOrder, getGHNOrders } from './ghn.service';
import { getViettelPostOrder, getViettelPostOrders } from './viettelpost.service';

const printInvoiceByCode = async (code: string) => {
  try {
    log('➥ Start to get kiotviet invoice data: ' + code);
    const invoice = await getKVInvoice(code);
    info(invoice ? invoice : '❌ Can not find this invoice!');
  } catch (error) {
    console.error(error.message);
  }
};

const syncInvoiceByCode = async (code: string) => {
  try {
    log('➥ Start to get kiotviet invoice data: ' + code);
    const invoice = await getKVInvoice(code);
    if (invoice) {
      await syncInvoice(invoice);
    } else {
      info(`❌ Can not find invoice with code: ${code}`);
    }
  } catch (error) {
    console.error(error.message);
  }
};

const syncInvoice = async (invoice: any, index = 0) => {
  try {
    const partnerDelivery = invoice.invoiceDelivery?.partnerDelivery;

    if (
      partnerDelivery?.code !== kiotviet.partnerDelivery.GHTK &&
      partnerDelivery?.code !== kiotviet.partnerDelivery.GHN &&
      partnerDelivery?.code !== kiotviet.partnerDelivery.VNPOST &&
      partnerDelivery?.code !== kiotviet.partnerDelivery.VIETTELPOST
    ) {
      info(
        `🙃 Skip data sync for invoice ${invoice.code} because delivery partner is not be GHTK, GHN, VNPOST, VIETTELPOST!`
      );
      return;
    }

    let data = {};
    if (partnerDelivery?.code === kiotviet.partnerDelivery.GHTK) {
      data = await syncInvoiceByDelivery(
        index,
        invoice,
        getGHTKOrder,
        toGHTKDeliveryStatus
      );
    }

    if (partnerDelivery?.code === kiotviet.partnerDelivery.GHN) {
      data = await syncInvoiceByDelivery(
        index,
        invoice,
        getGHNOrder,
        toGHNDeliveryStatus
      );
    }

    if (partnerDelivery?.code === kiotviet.partnerDelivery.VNPOST) {
      data = await syncInvoiceByDelivery(
        index,
        invoice,
        getVNPostOrder,
        toVNPostDeliveryStatus
      );
    }

    if (partnerDelivery?.code === kiotviet.partnerDelivery.VIETTELPOST) {
      data = await syncInvoiceByDelivery(
        index,
        invoice,
        getViettelPostOrder,
        toViettelPostDeliveryStatus
      );
    }

    if (invoice.status === KIOTVIET_INVOICE_STATUS.PROCESSING || invoice.status === KIOTVIET_INVOICE_STATUS.COMPLETE) {
      await updateKVInvoice(invoice.id, data);
      info('✔️  Sync invoice data done: ' + invoice.code);
    } else {
      info('❌ Can not update data for this invoice');
    }
  } catch (error) {
    console.error(error.message);
  }
};

const syncInvoiceByDelivery = async (
  index: number,
  invoice: any,
  getOrder: (id: string) => Promise<Order>,
  toDeliveryStatus: (status: any) => number,
) => {
  const deliveryCode = invoice.invoiceDelivery?.deliveryCode;

  log(
    `-------------------- [Order #${
      index + 1
    }: ${deliveryCode}] --------------------`
  );
  const order: Order = await getOrder(deliveryCode);

  if (!order) {
    return;
  }

  const deliveryDate = order.doneAt ?? undefined;
  log('• Invoice status: ' + getInvoiceStatusText(invoice.status));
  log('• Order delivery status: ' + order.status);
  log('• Order delivery date: ' + (deliveryDate || 'Time is not recorded'));
  log('--');

  const deliveryStatus = toDeliveryStatus(order.status);
  return {
    deliveryDetail: {
      status: deliveryStatus,
      price: order?.feeShip,
      usingPriceCod: invoice.invoiceDelivery.usingPriceCod,
      expectedDelivery: deliveryDate,
      partnerDelivery: invoice.invoiceDelivery?.partnerDelivery,
    },
  };
};

const syncInvoices = async (status: number, fromPurchaseDate: Date, toPurchaseDate: Date) => {
  try {
    const invoices: Invoice[] = await getKVInvoices(status, fromPurchaseDate.toUTCString(), toPurchaseDate.toUTCString());
    info(`🙌 Find ${invoices.length} invoices from ${fromPurchaseDate.toLocaleDateString()} to ${toPurchaseDate.toLocaleDateString()}!`);

    for (let i = 0; i < invoices.length; i++) {
      await syncInvoice(invoices[i], i);
    }
    info(`(Total: ${invoices?.length} invoices)`);
  } catch (error) {
    console.error(error.message);
  }
};

const listBranches = async () => {
  try {
    const branches: Branch[] = await getBranches();
    branches.forEach((branch, index) => {
      info(`#${index + 1} Id: ${branch.id} - name: ${branch.branchName} - address: ${branch.address} - contact: ${branch.contactNumber}`);
      log(branch);
    });
  } catch (error) {
    console.error(error.message);
  }
};

const createCustomers = async (fromPurchaseDate: Date, toPurchaseDate: Date) => {
  try {
    await createVNPostCustomers(fromPurchaseDate, toPurchaseDate);
    await createGHNCustomers(fromPurchaseDate, toPurchaseDate);
    await createViettelPostCustomers(fromPurchaseDate, toPurchaseDate);
    // TODO createGHTKCustomers(fromPurchaseDate, toPurchaseDate);
  } catch (error) {
    console.error(error.message);
  }
};

const createVNPostCustomers = async (fromPurchaseDate: Date, toPurchaseDate: Date) => {
  try {
    const orders: Order[] = await getVNPostOrders(fromPurchaseDate.toISOString(), toPurchaseDate.toISOString());
    info(`🙌 Find ${orders?.length} VNPOST orders from ${fromPurchaseDate.toLocaleDateString()} to ${toPurchaseDate.toLocaleDateString()}!`);

    for (let i = orders.length - 1; i >= 0; i--) {
      info(`-------------------- [VNPost Order: ${orders[i].code} (${orders[i].createdAt?.toLocaleDateString()})] --------------------`);
      await findAndCreateCustomer('VNPOST', orders[i]);
    }
  } catch (error) {
    console.error(error.message);
  }
};

const createViettelPostCustomers = async (
  fromPurchaseDate: Date,
  toPurchaseDate: Date
) => {
  try {
    const orders: Order[] = await getViettelPostOrders(
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

    for (let i = orders.length - 1; i >= 0; i--) {
      info(
        `-------------------- [ViettelPost Order: ${orders[i].code} (${orders[
          i
        ].createdAt?.toLocaleDateString()})] --------------------`
      );
      await findAndCreateCustomer('VIETTELPOST', orders[i]);
    }
  } catch (error) {
    console.error(error.message);
  }
};

const createGHTKCustomers = async (fromPurchaseDate: Date, toPurchaseDate: Date) => {
  try {
    // TODO
  } catch (error) {
    console.error(error.message);
  }
};

const createGHNCustomers = async (fromPurchaseDate: Date, toPurchaseDate: Date) => {
  try {
    toPurchaseDate.setDate(toPurchaseDate.getDate() + 1);

    const orders: Order[] = await getGHNOrders(
      fromPurchaseDate,
      toPurchaseDate
    );
    info(
      `🙌 Find ${
        orders?.length
      } GHN orders from ${fromPurchaseDate.toLocaleDateString()} to ${toPurchaseDate.toLocaleDateString()}!`
    );

    for (let i = orders.length - 1; i >= 0; i--) {
      info(
        `-------------------- [GHN Order: ${orders[i].code} (${orders[i].createdAt?.toLocaleDateString()})] --------------------`
      );
      await findAndCreateCustomer('GHN', orders[i]);
    }
  } catch (error) {
    console.error(error.message);
  }
};

const findCustomerByPhone = async (phone: string): Promise<Customer> => {
  let customer: Customer;
  try {
    const findDto: ListCustomerRequestDto = {
      contactNumber: phone
    };
    const customers: Customer[] = await getKVCustomers(findDto);
    if (customers?.length > 0) {
      customer = customers[0];
    }
  } catch (error) {
    console.error(error.message);
  }

  return customer;
};

const createCustomer = async (customer: AddCustomerRequestDto): Promise<Customer> => {
  try {
    return await createKVCustomer(customer);
  } catch (error) {
    console.error(error.message);
  }
};

const findAndCreateCustomer = async (from: 'VNPOST' | 'GHN' | 'GHTK' | 'VIETTELPOST', order: Order) => {
  try {
    let customer = await findCustomerByPhone(order.phone);
    let orderDetail: Order;
    // Call API order detail to get customer address
    if (from === 'VNPOST') {
      orderDetail = await getVNPostOrderDetail(order.id);
    } else if (from === 'GHN') {
      orderDetail = await getGHNOrder(order.code);
    } else if (from === 'GHTK') {
      // TODO: Add logic for GHTK
    } else if (from === 'VIETTELPOST') {
      orderDetail = await getViettelPostOrder(order.code);
    }
    if (customer) {
      info(`🔎 [${from}] Phone: ${orderDetail.phone} - Name: ${orderDetail.fullName} - Address: ${orderDetail.address} => [KiotViet] Phone: ${customer.contactNumber} - Name: ${customer.name} - Address: ${customer.address} - Ward: ${customer.wardName || 'None'} - Location: ${customer.locationName || 'None'}`);
    } else {
      // Create customer
      const customerRequest: AddCustomerRequestDto = {
        name: orderDetail.fullName,
        contactNumber: orderDetail.phone,
        address: orderDetail.address,
        branchId: Number(kiotviet.branch1)
      };
      customer = await createCustomer(customerRequest);

      customer ? info(`✔️  [${from}] Phone: ${orderDetail.phone} - Name: ${orderDetail.fullName} - Address: ${orderDetail.address} => [KiotViet] Phone: ${customer.contactNumber} - Name: ${customer.name} - Address: ${customer.address} - Ward: ${customer.wardName || 'None'} - Location: ${customer.locationName || 'None'}`)
        : info('❌ Have the error when creating customer for this order!');
    }
  } catch (error) {
    console.error(error.message);
  }
};

const toGHTKDeliveryStatus = (ghtkOrderStatus: string): number => {
  switch (ghtkOrderStatus) {
    case 'Đã giao hàng':
    case 'Đã giao hàng/Chưa đối soát':
    case 'Đã đối soát':
      return KIOTVIET_DELIVERY_STATUS.COMPLETE;
    default:
      return KIOTVIET_DELIVERY_STATUS.PROCESSING;
  }
};

const toGHNDeliveryStatus = (ghnOrderStatus: string): number => {
  switch (ghnOrderStatus) {
    case 'delivered':
      return KIOTVIET_DELIVERY_STATUS.COMPLETE;
    case 'return':
    case 'returned':
      return KIOTVIET_DELIVERY_STATUS.RETURNNING;
    default:
      return KIOTVIET_DELIVERY_STATUS.PROCESSING;
  }
};

const toVNPostDeliveryStatus = (vnpostOrderStatus: number): number => {
  switch (vnpostOrderStatus) {
    case 70: // Thu gom thành công
      return KIOTVIET_DELIVERY_STATUS.TAKEN;
    case 100: // Phát thành công
    case 110: // Chờ trả tiền
    case 120: // Đã trả tiền
      return KIOTVIET_DELIVERY_STATUS.COMPLETE;
    case 170: // Phát hoàn thành công
      return KIOTVIET_DELIVERY_STATUS.RETURNNING;
    default:
      return KIOTVIET_DELIVERY_STATUS.PROCESSING;
  }
};

const toViettelPostDeliveryStatus = (viettelpostOrderStatus: string): number => {
  switch (Number(viettelpostOrderStatus)) {
    case -100: // Tạo mới
    case 100: // Đã tiếp nhận
    case 103: // Đã tiếp nhận
    case -108: // Đã tiếp nhận
      return KIOTVIET_DELIVERY_STATUS.PROCESSING;
    case 104: // Đang lấy hàng
      return KIOTVIET_DELIVERY_STATUS.TAKING;
    case 105: // Đã lấy hàng
    case 200: // Đã lấy hàng
    case 202: // Đang vận chuyển
    case 300: // Đang vận chuyển
    case 310: // Đang vận chuyển
    case 320: // Đang vận chuyển
    case 400: // Đang vận chuyển
      return KIOTVIET_DELIVERY_STATUS.TAKEN;
    case 500: // Đang giao hàng
      return KIOTVIET_DELIVERY_STATUS.DELIVERING;
    case 501: // Giao hàng thành công
      return KIOTVIET_DELIVERY_STATUS.COMPLETE;
    case 551: // Đang chuyển hoàn
    case 504: // Đã trả
      return KIOTVIET_DELIVERY_STATUS.RETURNNING;
    default:
      return KIOTVIET_DELIVERY_STATUS.PROCESSING;
  }
};

const getInvoiceStatusText = (status: KIOTVIET_INVOICE_STATUS) => {
  switch (status) {
    case KIOTVIET_INVOICE_STATUS.COMPLETE:
      return 'Đã hoàn thành';
    case KIOTVIET_INVOICE_STATUS.CANCEL:
      return 'Đã hủy';
    case KIOTVIET_INVOICE_STATUS.PROCESSING:
      return 'Đang xử lý';
    case KIOTVIET_INVOICE_STATUS.UNCOMPLETE:
      return 'Chưa hoàn thành';
    default:
      return '';
  }
};

export { printInvoiceByCode, syncInvoiceByCode, syncInvoice, syncInvoices, getInvoiceStatusText, createCustomers, listBranches };
