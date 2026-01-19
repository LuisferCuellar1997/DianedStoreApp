import { Address } from '../../orders/interfaces/order.interface';
import { Product } from '../../products/interfaces/product.interface';

export interface MyShop {
  address: Address;
  items: {
    product: Product; // 👈 NO nullable
    size?: string;
    quantity?: number;
    price?: number;
  }[];
  total: number;
  createdAt?: Date;
  status?:string;
}

export interface MyShopItem {
  product: Product; // 👈 NO nullable
  size?: string;
  quantity?: number;
  price?: number;
}

export interface MyShopByDate {
  date: Date;
  items: MyShopItem[];
  total: number;
}
