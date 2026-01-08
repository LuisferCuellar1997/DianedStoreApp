import { Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  imports: [],
  templateUrl: './skeleton.html',
})
export class Skeleton {
  //3 posibles valores: product-list, product-detail, product-similar
  template=input.required<string>()
}
