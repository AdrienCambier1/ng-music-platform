import { Component, OnInit, inject } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { SearchInputComponent } from '../../components/search-input/search-input.component';
import { ProductFilterPipe } from '../../pipes/product-filter.pipe';
import { SearchFilterPipe } from '../../pipes/search-filter.pipe';
import { FormsModule } from '@angular/forms';
import { DropDownButtonComponent } from '../../components/drop-down-button/drop-down-button.component';
import { Product } from '../../interfaces/product'; 
import { Subscription } from 'rxjs';

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
  sortOrder: 'asc' | 'desc' | undefined = 'asc'; // Valeur par défaut

  private productsSubscription: Subscription | undefined; // Souscription à l'Observable

  sortOptions = [
    { label: 'Croissant', action: () => this.changeSortOrder('asc') },
    { label: 'Décroissant', action: () => this.changeSortOrder('desc') },
  ];

  ngOnInit(): void {
    // On souscrit à l'Observable retourné par le service
    this.productsSubscription = this.productService.getProducts().subscribe({
      next: (products: Product[]) => {
        this.products = products; // On affecte les produits reçus
      },
      error: (error) => {
        console.error('Erreur lors du chargement des produits:', error);
      }
    });
  }
  ngOnDestroy(): void {
    // Si le composant est détruit, on se désabonne de l'Observable pour éviter les fuites de mémoire
    if (this.productsSubscription) {
      this.productsSubscription.unsubscribe();
    }
  }

  changeSortOrder(order: 'asc' | 'desc'): void {
    console.log('Tri changé en :', order);
    this.sortOrder = order;
  }
  
}
