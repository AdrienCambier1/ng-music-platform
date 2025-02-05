import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Product } from '../interfaces/product';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private readonly url = 'http://localhost:4000/products';

  private storageCartKey = 'cart';
  private storageFavoritesKey = 'favorites';

  private productsSubject = new BehaviorSubject<Product[]>([]);
  products$ = this.productsSubject.asObservable();

  private cartSubject = new BehaviorSubject<Product[]>(
    this.loadCartFromLocalStorage()
  );
  cart$ = this.cartSubject.asObservable();

  private favoritesSubject = new BehaviorSubject<Product[]>(
    this.loadFavoritesFromLocalStorage()
  );
  favorites$ = this.favoritesSubject.asObservable();

  constructor() {
    this.loadInitialData();
  }
  
  private loadInitialData(): void {
    this.http
    .get<Product[]>(this.url)
    .pipe(
      tap((products) => {
        this.productsSubject.next(products);
        this.syncCartAndFavorites();
      })
    )
    .subscribe();
  }
  
  getProductById(id: string): Product | undefined {
    return this.productsSubject.value.find((product) => product.id === id);
  }

  getProductDetailsById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.url}/${id}`).pipe(
      tap((product) => {
        if (!product.tracks) {
          this.http.get<any>(`http://localhost:4000/products/${id}/tracks`).subscribe((tracks) => {
            product.tracks = tracks;
            this.productsSubject.next([product]);
          });
        }
      })
    );
  }

  addToCart(productId: string, quantity: number = 1): void {
    let cart = this.cartSubject.value;
    const product = this.getProductById(productId);

    if (product) {
      const existingProduct = cart.find((p) => p.id === productId);
      if (existingProduct) {
        existingProduct.quantity += quantity;
      } else {
        cart = [...cart, { ...product, quantity }];
      }
      this.updateCart(cart);
    }
  }

  removeFromCart(productId: string): void {
    let cart = this.cartSubject.value.filter((p) => p.id !== productId);
    this.updateCart(cart);
  }

  clearCart(): void {
    this.updateCart([]);
  }

  incrementQuantity(productId: string): void {
    this.updateProductQuantity(productId, 1);
  }

  decrementQuantity(productId: string): void {
    this.updateProductQuantity(productId, -1);
  }

  private updateProductQuantity(productId: string, change: number): void {
    const cart = this.cartSubject.value.map((product) =>
      product.id === productId
        ? { ...product, quantity: Math.max(1, product.quantity + change) }
        : product
    );
    this.updateCart(cart);
  }
  
  private updateCart(cart: Product[]): void {
    this.cartSubject.next(cart);
    localStorage.setItem(this.storageCartKey, JSON.stringify(cart));
  }

  private loadCartFromLocalStorage(): Product[] {
    return JSON.parse(localStorage.getItem(this.storageCartKey) || '[]');
  }

  switchFavorite(productId: string): void {
    const favorites = this.favoritesSubject.value;
    const productIndex = favorites.findIndex((p) => p.id === productId);

    if (productIndex !== -1) {
      this.updateFavorites(favorites.filter((p) => p.id !== productId));
    } else {
      const product = this.getProductById(productId);
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


  calculateTotalPrice(): number {
    return this.cartSubject.value.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    );
  }

  private syncCartAndFavorites(): void {
    this.cartSubject.next(this.loadCartFromLocalStorage());
    this.favoritesSubject.next(this.loadFavoritesFromLocalStorage());
  }

  getCartItemCount(): number {
    return this.cartSubject.value.reduce(
      (total, product) => total + product.quantity,
      0
    );
  }
}
