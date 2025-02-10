import { Injectable, inject, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Product } from '../interfaces/product';
import { tap, map } from 'rxjs/operators';
import { CartService } from './cart.service';
import { FavoritesService } from './favorites.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  injector = inject(Injector);
  _cartService?: CartService;
  _favoritesService?: FavoritesService;
  private http = inject(HttpClient);
  private readonly url = 'http://localhost:4000/products';

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

  loadInitialData(): Observable<Product[]> {
    return this.http.get<Product[]>(this.url).pipe(
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
    return this.http.get<Product>(`${this.url}/${id}`).pipe(
      tap((product) => {
        if (!product.tracks) {
          this.http
            .get<any>(`http://localhost:4000/products/${id}/tracks`)
            .subscribe((tracks) => {
              product.tracks = tracks;
              this.productsSubject.next([product]);
            });
        }
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
