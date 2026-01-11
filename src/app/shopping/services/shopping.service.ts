import { computed, effect, Injectable, signal } from '@angular/core';
import { Shop } from '../interfaces/shop.interface';
import { Jean, Product } from '../../products/interfaces/product.interface';

@Injectable({providedIn: 'root'})
export class ShoppingService {
  constructor() {
    this.loadFromLocalStorage();
   }

  shopList=signal<Shop[]>([]);

  addToCart(product:Jean, size:string){
    if(this.shopList().find(x=>x.product.id===product.id && x.selectedSize===size)){
      console.log("Found");
      this.shopList.update(prod=>prod.map(x=>x.product.id===product.id&&x.selectedSize===size?{...x,quantity:x.quantity!+1}:x))
      console.log({shopList:this.shopList()})
    }else{
      const newProduct=this.mapToShop(product,size);
      this.shopList.update(prod=>[...prod,newProduct]);
    }
    this.loadToLocalStorage()
  }

  //CARGAR LOCALSTORAGE
  loadToLocalStorage(){
    localStorage.setItem('shopList',JSON.stringify(this.shopList()))
  }

  loadFromLocalStorage(){
    const stored=localStorage.getItem('shopList');
    this.shopList.set(stored?JSON.parse(stored):[])
  }

  mapToShop(product:Jean, size:string):Shop{
    return {
      product,
      selectedSize:size,
      quantity:1,
      subtotal:product.price
    };
  }

  changeQuantity(id:string,selectedSize:string,operation:number){
      this.shopList.update(list=>
        list.map(item=>{
          console.log("Desde el servicio->",item.quantity)
          if(item.quantity && item.product.id===id && item.selectedSize===selectedSize){
            return {...item,quantity:item.quantity+operation}
          }
          return item;
        })
      );
      this.loadToLocalStorage()
  }

  deleteProduct(id:string,selectedSize:string){
    this.shopList.update(list=>list.filter(prod=>!(prod.product.id===id && prod.selectedSize===selectedSize)))
    this.loadToLocalStorage()
  }

}
