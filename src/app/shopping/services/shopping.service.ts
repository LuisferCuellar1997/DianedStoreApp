import { computed, effect, Injectable, signal } from '@angular/core';
import { Shop } from '../interfaces/shop.interface';
import { Jean } from '../../products/interfaces/product.interface';

@Injectable({providedIn: 'root'})
export class ShoppingService {
  constructor() {
    this.loadFromLocalStorage();
   }

  shopList=signal<Shop[]>([]);

  total=signal(()=>{
    let total=0;
    this.shopList().forEach(x=>{
      console.log(x.product.price)
      total+=x.product.price
    });
    console.log(total)
  });

  showShopList(){
    console.log(this.shopList());
  }

  addToCart(product:Jean, size:string){
    this.shopList().push({product:product,selectedSize:size});
    this.loadToLocalStorage()
  }

  //CARGAR LOCALSTORAGE
  loadToLocalStorage(){
    localStorage.setItem('shopList',JSON.stringify(this.shopList()))
  }

  loadFromLocalStorage(){
    const stored=localStorage.getItem('shopList');
    this.shopList.set(stored?JSON.parse(stored):[])
    console.log("ShopList-> \n",this.shopList())
  }
}
