import { Product } from "../../products/interfaces/product.interface";

export interface Shop{
  product:Product,
  selectedSize:string,
  quantity?:number,
  subtotal:number
}
