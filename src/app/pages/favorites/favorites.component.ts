import { Component, inject } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { Product } from '../../interfaces/product';
import { DarkButtonComponent } from '../../components/dark-button/dark-button.component';

@Component({
  selector: 'app-favorites',
  imports: [ProductCardComponent, DarkButtonComponent],
  templateUrl: './favorites.component.html',
  styles: ``,
})
export class FavoritesComponent {
  productService = inject(ProductService);
  favorites: Product[] = [];

  ngOnInit(): void {
    this.productService.favorites$.subscribe((favorites) => {
      this.favorites = favorites;
    });
  }

  clearFavorites(): void {
    this.productService.clearFavorites();
  }
}
