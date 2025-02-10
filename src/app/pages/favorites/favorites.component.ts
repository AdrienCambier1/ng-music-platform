import { Component, inject } from '@angular/core';
import { Product } from '../../interfaces/product';
import { FavoritesService } from '../../services/favorites.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { DarkButtonComponent } from '../../components/dark-button/dark-button.component';

@Component({
  selector: 'app-favorites',
  imports: [ProductCardComponent, DarkButtonComponent],
  templateUrl: './favorites.component.html',
  styles: ``,
})
export class FavoritesComponent {
  favoritesService = inject(FavoritesService);
  favorites: Product[] = [];

  ngOnInit(): void {
    this.favoritesService.favorites$.subscribe((favorites) => {
      this.favorites = favorites;
    });
  }

  clearFavorites(): void {
    this.favoritesService.clearFavorites();
  }
}
