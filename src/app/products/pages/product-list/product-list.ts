import { Component, computed, inject, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductService } from '../../services/products.service';
import { Jean, ProductFilters } from '../../interfaces/product.interface';
import { Card } from '../../components/card/card';
import { Skeleton } from "../../../share/components/skeleton/skeleton";

@Component({
  selector: 'app-product-list',
  imports: [Card, Skeleton],
  templateUrl: './product-list.html',
})
export class ProductList {


  prod=input.required<Jean[]>();
  loading=input<boolean>(false);
  hasInterected=input<boolean>(true)
  pageSize=input<number>();
  totalPages = input<number>(1);
  pageChange=output<number>()
  filters=input.required<ProductFilters>()
  skeletonCount = computed(() =>
    Array.from({ length: this.prod().length })
  );

}
