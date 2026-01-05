import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'gender'
})

export class ShowGenderPIpe implements PipeTransform {
  transform(value: string): any {
    if(value==='female'){
      return 'Dama';
    }else if(value==='male'){
      return 'Caballero';
    }
  }
}
