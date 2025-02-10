import { Injectable, inject, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Product } from '../interfaces/product';
import { tap, map } from 'rxjs/operators';
import { CartService } from './cart.service';
import { FavoritesService } from './favorites.service';
import { SpotifyService } from './spotify.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  injector = inject(Injector);
  _cartService?: CartService;
  _favoritesService?: FavoritesService;
  private spotifyService = inject(SpotifyService);

  private productsSubject = new BehaviorSubject<Product[]>([]);
  products$ = this.productsSubject.asObservable();

  get cartService(): CartService {
    if (!this._cartService) {
      this._cartService = this.injector.get(CartService);
    }
    return this._cartService;
  }

  get favoritesService(): FavoritesService {
    if (!this._favoritesService) {
      this._favoritesService = this.injector.get(FavoritesService);
    }
    return this._favoritesService;
  }

  constructor() {
    this.loadInitialData().subscribe();
  }

  loadInitialData(): Observable<Product[]> {
    return this.spotifyService.fetchAlbums().pipe(
      tap((products) => {
        this.productsSubject.next(products);
        this.syncCartAndFavorites();
      })
    );
  }

  getProductById(id: string): Product | undefined {
    return this.productsSubject.value.find((product) => product.id === id);
  }

  getProductDetailsById(id: string): Observable<Product> {
    return this.spotifyService.fetchAlbumDetails(id).pipe(
      tap((product) => {
        this.productsSubject.next([...this.productsSubject.value, product]);
      })
    );
  }

  getAllProducts(): Product[] {
    return this.productsSubject.value;
  }

  getRandomProducts(): Observable<Product[]> {
    return this.products$.pipe(
      map((products) => {
        const shuffled = products.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 4);
      })
    );
  }

  private syncCartAndFavorites(): void {
    const cart = this.cartService.getCartItems();
    const favorites = this.favoritesService.getFavorites();

    this.cartService.syncCart(cart);
    this.favoritesService.syncFavorites(favorites);
  }
}
