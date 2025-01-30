import { Pipe, PipeTransform } from '@angular/core';
import { Product } from '../interfaces/product';

@Pipe({
  name: 'searchFilter',
})
export class SearchFilterPipe implements PipeTransform {
  transform(value: Product[], searchTerm: string): Product[] {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    return value.filter(
      (product) =>
        product.title.toLowerCase().includes(lowerCaseSearchTerm) ||
        product.author.toLowerCase().includes(lowerCaseSearchTerm) ||
        product.style.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }
}
