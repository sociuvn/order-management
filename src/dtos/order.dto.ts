export class Order {
  id: string;
  statusCode: number;
  status: string;
  fullName: string;
  phone: string;
  address?: string;
  codAmount: number;
  feeShip: number;
  products?: string;
  code: string;
  createdAt: Date;
  doneAt: Date;
  returnAt?: Date;
};

export class OrderDetail {

}
