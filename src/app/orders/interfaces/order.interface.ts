import { DocumentType } from '../../delivery/pages/delivery-page/personal-info-form/personal-info-form';
import { Shop } from '../../shopping/interfaces/shop.interface';

export interface Order {
  customer: Customer,
  address:Address,
  items:
    {
      productId?: string;
      size?: string;
      quantity?: number;
      price?: number;
    }[];
  total: number;
}

export interface Customer {
  email?: string;
  firstName?: string;
  lastName?: string;
  tipDoc?: DocumentType|null;
  numDoc?: string;
  phoneNumber?: string;
}

export interface Address{
  departamento?:string,
  municipio?:string,
  barrio?:string,
  calle?:string,
  complemento?:string
}
