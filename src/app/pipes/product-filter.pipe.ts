import { Pipe, PipeTransform } from '@angular/core';
import { Product } from '../interfaces/product';

@Pipe({
  name: 'productFilter',
})
export class ProductFilterPipe implements PipeTransform {
  transform(
    products: Product[],
    sortOrder:
      | 'title-asc'
      | 'title-desc'
      | 'date-newest'
      | 'date-oldest' = 'title-asc'
  ): Product[] {
    if (!products || products.length === 0) {
      return [];
    }

    let sortedProducts = [...products];

    sortedProducts.sort((a, b) => {
      switch (sortOrder) {
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'date-newest':
          return (
            new Date(b.createdDate).getTime() -
            new Date(a.createdDate).getTime()
          );
        case 'date-oldest':
          return (
            new Date(a.createdDate).getTime() -
            new Date(b.createdDate).getTime()
          );
        default:
          return 0;
      }
    });

    return sortedProducts;
  }
}
