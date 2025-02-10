import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { finalize } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { Product } from '../../interfaces/product';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { SearchInputComponent } from '../../components/search-input/search-input.component';
import { DropDownButtonComponent } from '../../components/drop-down-button/drop-down-button.component';
import { DarkButtonComponent } from '../../components/dark-button/dark-button.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { ProductFilterPipe } from '../../pipes/product-filter.pipe';
import { SearchFilterPipe } from '../../pipes/search-filter.pipe';

@Component({
  selector: 'app-products-list',
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    ProductCardComponent,
    SearchInputComponent,
    DropDownButtonComponent,
    DarkButtonComponent,
    PaginationComponent,
    SearchFilterPipe,
    ProductFilterPipe,
  ],
  templateUrl: './products-list.component.html',
  styles: ``,
})
export class ProductsListComponent {
  @ViewChild(SearchInputComponent) searchInputComponent!: SearchInputComponent;

  productService = inject(ProductService);

  products: Product[] = [];
  searchValue: string = '';
  sortOrder: string | any = 'title-asc';
  isLoaded: boolean = false;
  currentPage: number = 1;
  itemsPerPage: number = 20;

  sortOptions = [
    { label: 'Titre A-Z', action: () => this.changeSortOrder('title-asc') },
    { label: 'Titre Z-A', action: () => this.changeSortOrder('title-desc') },
    {
      label: 'Plus récents',
      action: () => this.changeSortOrder('date-newest'),
    },
    {
      label: 'Plus anciens',
      action: () => this.changeSortOrder('date-oldest'),
    },
  ];

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.productService
      .loadInitialData()
      .pipe(finalize(() => (this.isLoaded = true)))
      .subscribe((products) => {
        if (!products) return;
        this.products = products;
      });
  }

  changeSortOrder(order: string): void {
    console.log('Tri changé en :', order);
    this.sortOrder = order;
  }

  onPageChange(newPage: number): void {
    this.currentPage = newPage;
  }

  clearSearch(): void {
    this.searchInputComponent.clearSearch();
  }
}
