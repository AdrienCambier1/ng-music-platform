import { Component, inject } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { ProductService } from '../../services/product.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { SearchInputComponent } from '../../components/search-input/search-input.component';
import { ProductFilterPipe } from '../../pipes/product-filter.pipe';
import { SearchFilterPipe } from '../../pipes/search-filter.pipe';
import { FormsModule } from '@angular/forms';
import { DropDownButtonComponent } from '../../components/drop-down-button/drop-down-button.component';
import { Product } from '../../interfaces/product';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-products-list',
  imports: [
    ProductCardComponent,
    SearchInputComponent,
    SearchFilterPipe,
    ProductFilterPipe,
    FormsModule,
    DropDownButtonComponent,
    NgxPaginationModule,
    CommonModule,
    PaginationComponent,
  ],
  templateUrl: './products-list.component.html',
  styles: ``,
})
export class ProductsListComponent {
  currentPage: number = 1;
  itemsPerPage: number = 20;
  productService = inject(ProductService);
  products: Product[] = [];
  searchValue: string = '';
  sortOrder: any = 'asc';
  isLoaded: boolean = false;
  sortOptions = [
    { label: 'Croissant', action: () => this.changeSortOrder('asc') },
    { label: 'Décroissant', action: () => this.changeSortOrder('desc') },
  ];

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.productService.loadInitialData().subscribe((products) => {
      if (!products) return;

      this.products = products;
      this.isLoaded = true;
    });
  }

  changeSortOrder(order: string) {
    console.log('Tri changé en :', order);
    this.sortOrder = order;
  }

  onPageChange(newPage: number): void {
    this.currentPage = newPage;
  }
}
