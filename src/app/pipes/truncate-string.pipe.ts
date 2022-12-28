import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'TruncateString',
  standalone: true,
})
export class TruncateStringPipe implements PipeTransform {
  transform(value: string, length: number = 0): string {
    return value.length > length ? value.slice(0, length) + '...' : value;
  }
}
