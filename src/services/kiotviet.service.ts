import { AddCustomerRequestDto, Branch, Customer, getBranches, getCustomers as getKVCustomers, getInvoice as getKVInvoice, getInvoices as getKVInvoices, Invoice, ListCustomerRequestDto, updateInvoice as updateKVInvoice, createCustomer as createKVCustomer } from '../util/kiotviet.util';
import { getGHTKOrder } from './ghtk.service';
import { info, log } from '../util/console';
import { kiotviet } from '../config/kiotviet';
import { KIOTVIET_DELIVERY_STATUS, KIOTVIET_INVOICE_STATUS } from '../config/constant';
import { getVNPostOrder, getVNPostOrderDetail, getVNPostOrders } from './vnpost.service';
import { Order } from '../dtos/order.dto';

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
    const deliveryCode = invoice.invoiceDelivery?.deliveryCode;

    if (partnerDelivery?.code !== kiotviet.partnerDelivery.GHTK && partnerDelivery?.code !== kiotviet.partnerDelivery.VNPOST) {
      info(`🙃 Skip data sync for invoice ${invoice.code} because delivery partner is not be GHTK, VNPOST!`);
      return;
    }

    let data = {};
    if (partnerDelivery?.code === kiotviet.partnerDelivery.GHTK) {
      log(`-------------------- [GHTK Order #${index + 1}: ${deliveryCode}] --------------------`);
      const ghtkOrder: Order = await getGHTKOrder(deliveryCode);

      if (!ghtkOrder) {
        return;
      }

      const deliveryDate = ghtkOrder.doneAt ?? undefined;
      log('• Invoice status: ' + getInvoiceStatusText(invoice.status));
      log('• Order delivery status: ' + ghtkOrder.status);
      log('• Order delivery date: ' + (deliveryDate || 'Time is not recorded'));
      log('--');

      const deliveryStatus = toGHTKDeliveryStatus(ghtkOrder.status);
      data = {
        ...data,
        deliveryDetail: {
          status: deliveryStatus,
          price: ghtkOrder?.feeShip,
          usingPriceCod: invoice.invoiceDelivery.usingPriceCod,
          expectedDelivery: deliveryDate,
          partnerDelivery: partnerDelivery
        }
      };
    }

    if (partnerDelivery?.code === kiotviet.partnerDelivery.VNPOST) {
      log(`-------------------- [VNPost Order #${index + 1}: ${deliveryCode}] --------------------`);
      const vnpostOrder: Order = await getVNPostOrder(deliveryCode);

      if (!vnpostOrder) {
        return;
      }

      const deliveryDate = vnpostOrder.doneAt ?? undefined;
      log('• Invoice status: ' + getInvoiceStatusText(invoice.status));
      log('• Order delivery status: ' + vnpostOrder.status);
      log('• Order delivery date: ' + (deliveryDate || 'Time is not recorded'));
      log('--');

      const deliveryStatus = toVNPOSTDeliveryStatus(vnpostOrder.statusCode);
      data = {
        ...data,
        deliveryDetail: {
          status: deliveryStatus,
          price: vnpostOrder?.feeShip,
          usingPriceCod: invoice.invoiceDelivery.usingPriceCod,
          expectedDelivery: deliveryDate,
          partnerDelivery: partnerDelivery
        }
      };
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
    createVNPostCustomers(fromPurchaseDate, toPurchaseDate);
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
      await findAndCreateCustomer(orders[i]);
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

const findAndCreateCustomer = async (order: Order) => {
  try {
    let customer = await findCustomerByPhone(order.phone);
    // Call API order detail to get customer address
    const orderDetail: Order = await getVNPostOrderDetail(order.id);

    if (customer) {
      info(`🔎 [VNPOST] Phone: ${orderDetail.phone} - Name: ${orderDetail.fullName} - Address: ${orderDetail.address} => [KiotViet] Phone: ${customer.contactNumber} - Name: ${customer.name} - Address: ${customer.address} - Ward: ${customer.wardName || 'None'} - Location: ${customer.locationName || 'None'}`);
    } else {
      // Create customer
      const customerRequest: AddCustomerRequestDto = {
        name: orderDetail.fullName,
        contactNumber: orderDetail.phone,
        address: orderDetail.address,
        branchId: Number(kiotviet.branch1)
      };
      customer = await createCustomer(customerRequest);

      customer ? info(`✔️  [VNPOST] Phone: ${orderDetail.phone} - Name: ${orderDetail.fullName} - Address: ${orderDetail.address} => [KiotViet] Phone: ${customer.contactNumber} - Name: ${customer.name} - Address: ${customer.address} - Ward: ${customer.wardName || 'None'} - Location: ${customer.locationName || 'None'}`)
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

const toVNPOSTDeliveryStatus = (vnpostOrderStatus: number): number => {
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
