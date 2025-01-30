import { Pipe, PipeTransform } from '@angular/core';
import { Product } from '../interfaces/product';

@Pipe({
  name: 'productFilter',
})
export class ProductFilterPipe implements PipeTransform {
  transform(products: Product[], sortOrder: 'asc' | 'desc' = 'asc'): Product[] {
    if (!products || products.length === 0) {
      return [];
    }
    let sortedProducts = [...products];

    sortedProducts.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.title.localeCompare(b.title);
      } else {
        return b.title.localeCompare(a.title);
      }
    });

    return sortedProducts;
  }
}
