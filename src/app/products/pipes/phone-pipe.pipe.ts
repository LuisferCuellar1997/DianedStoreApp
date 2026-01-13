import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phoneSpaces',
  standalone: true, // quítalo si no usas standalone
})
export class PhoneSpacesPipe implements PipeTransform {
  transform(value: string | number | null | undefined): string {
    if (value == null) return '';

    const digits = String(value).replace(/\D+/g, '');
    if (!digits) return '';

    const groups = digits.match(/\d{1,3}/g) ?? [];

    // Si la última fracción quedó de 1 dígito, únela a la anterior (3 + 1 = 4)
    if (groups.length >= 2 && groups[groups.length - 1].length === 1) {
      const last = groups.pop()!;         // "7"
      groups[groups.length - 1] += last;  // "244" + "7" => "2447"
    }

    return groups.join(' ');
  }
}
