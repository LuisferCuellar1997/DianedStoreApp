import { Component, computed, inject } from '@angular/core';
import { Navbar } from '../../../share/components/navbar/navbar';
import { ProductService } from '../../services/products.service';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-product-detail',
  imports: [Navbar],
  templateUrl: './product-detail.html',
})
export class ProductDetail {

  private route=inject(ActivatedRoute)
  private prodService = inject(ProductService);
  productId=toSignal(
    this.route.paramMap,{initialValue:null}
  )
  prodSelected=computed(()=>{
    const id=this.productId()?.get('id');
    if(!id)return null
    const prodFound=this.prodService.getProductById(id);
    console.log(prodFound)
    return this.prodService.getProductById(id).subscribe(p=>p?.id);
  });
}
