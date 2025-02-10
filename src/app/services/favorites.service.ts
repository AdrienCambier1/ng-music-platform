import { inject, Injectable, Injector } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../interfaces/product';
import { ProductService } from './product.service';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  injector = inject(Injector);
  _productService?: ProductService;
  private storageFavoritesKey = 'favorites';

  private favoritesSubject = new BehaviorSubject<Product[]>(
    this.loadFavoritesFromLocalStorage()
  );
  favorites$ = this.favoritesSubject.asObservable();

  get projectService(): ProductService {
    if (!this._productService) {
      this._productService = this.injector.get(ProductService);
    }
    return this._productService;
  }

  switchFavorite(productId: string): void {
    const favorites = this.favoritesSubject.value;
    const productIndex = favorites.findIndex((p) => p.id === productId);

    if (productIndex !== -1) {
      this.updateFavorites(favorites.filter((p) => p.id !== productId));
    } else {
      const product = this.projectService.getProductById(productId);
      if (product) {
        this.updateFavorites([...favorites, product]);
      }
    }
  }

  clearFavorites(): void {
    this.updateFavorites([]);
  }

  private updateFavorites(favorites: Product[]): void {
    this.favoritesSubject.next(favorites);
    localStorage.setItem(this.storageFavoritesKey, JSON.stringify(favorites));
  }

  private loadFavoritesFromLocalStorage(): Product[] {
    return JSON.parse(localStorage.getItem(this.storageFavoritesKey) || '[]');
  }

  getFavorites(): Product[] {
    return this.favoritesSubject.value;
  }

  syncFavorites(favorites: Product[]): void {
    this.favoritesSubject.next(favorites);
  }
}
