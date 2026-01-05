import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'array'
})

export class ArrayPipe implements PipeTransform {
  transform(value: string[]): any {
    if(value.length>1){
      return 'Colores';
    }
    return 'Color';
  }
}
