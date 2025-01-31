import { Component, OnInit, inject } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { SearchInputComponent } from '../../components/search-input/search-input.component';
import { ProductFilterPipe } from '../../pipes/product-filter.pipe';
import { SearchFilterPipe } from '../../pipes/search-filter.pipe';
import { FormsModule } from '@angular/forms';
import { DropDownButtonComponent } from '../../components/drop-down-button/drop-down-button.component';
import { Product } from '../../interfaces/product';

@Component({
  selector: 'app-products-list',
  imports: [
    ProductCardComponent,
    SearchInputComponent,
    SearchFilterPipe,
    ProductFilterPipe,
    FormsModule,
    DropDownButtonComponent,
  ],
  templateUrl: './products-list.component.html',
  styles: ``,
})
export class ProductsListComponent implements OnInit {
  productService = inject(ProductService);
  products: Product[] = [];
  searchValue: string = '';
  sortOrder: any = 'asc';

  sortOptions = [
    { label: 'Croissant', action: () => this.changeSortOrder('asc') },
    { label: 'Décroissant', action: () => this.changeSortOrder('desc') },
  ];

  ngOnInit(): void {
    this.productService.products$.subscribe((products) => {
      this.products = products;
    });
  }

  changeSortOrder(order: string) {
    console.log('Tri changé en :', order);
    this.sortOrder = order;
  }
}
