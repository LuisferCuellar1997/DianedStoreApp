import { Shop } from "../../shopping/interfaces/shop.interface";

export interface Order{
  customer:{
    email:string,
    firstName:string,
    lastName:string,
    tipDoc:string,
    numDoc:string,
    phoneNumber:string,
  },
  items:[{
    productId:string,
    size:string,
    quantity:number,
    price:number,
  }],
  total:number
}
