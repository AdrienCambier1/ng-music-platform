import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../interfaces/product';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private products: Product[] = [];
  readonly url = 'http://localhost:3000/products';

  private storageCartKey = 'cart';
  private storageFavoritesKey = 'favorites';

  private cartSubject = new BehaviorSubject<Product[]>(this.loadCartFromLocalStorage());
  cart$ = this.cartSubject.asObservable();

  private favoritesSubject = new BehaviorSubject<Product[]>(this.loadFavoritesFromLocalStorage());
  favorites$ = this.favoritesSubject.asObservable();

  constructor() {
    this.loadInitialData();  // Chargement initial des données
  }

  private loadInitialData(): void {
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
      this.products = JSON.parse(storedProducts);
    }
    this.cartSubject.next(this.loadCartFromLocalStorage());
    this.favoritesSubject.next(this.loadFavoritesFromLocalStorage());
  }

  // Récupérer les produits depuis l'API
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.url).pipe(
      tap((products) => {
        localStorage.setItem('products', JSON.stringify(products));
      })
    );
  }

  // Récupérer un produit spécifique par son ID
  getProduct(id: number): Product | undefined {
    return this.products.find((product) => product.id === id);
  }

  // Ajouter un produit au panier
  addToCart(productId: number, quantity: number = 1): void {
    const product = this.getProduct(productId);
    if (product) {
      product.quantity += quantity;
      this.updateCart();
      this.saveProductsToLocalStorage();
    }
  }

  getCartItemCount(): number {
    const uniqueItems = new Set(this.cartSubject.value.map((item) => item.id));
    return uniqueItems.size;
  }
  removeFromCart(productId: number): void {
    const product = this.getProduct(productId);
    if (product) {
      product.quantity = 0;
      this.updateCart();
      this.saveProductsToLocalStorage();
    }
  }

  clearCart(): void {
    this.products.forEach((product) => (product.quantity = 0));
    this.updateCart();
    this.saveProductsToLocalStorage();
  }

  clearFavorites(): void {
    this.products.forEach((product) => (product.isFavorite = false));
    this.updateFavorites();
    this.saveProductsToLocalStorage();
  }

  private updateCart(): void {
    const cartItems = this.getCart();
    this.cartSubject.next(cartItems);
    this.saveCartToLocalStorage(cartItems);
  }

  private updateFavorites(): void {
    const favoriteItems = this.getFavorites();
    this.favoritesSubject.next(favoriteItems);
    this.saveFavoritesToLocalStorage(favoriteItems);
  }


  // Incrémenter la quantité d'un produit
  incrementQuantity(productId: number): void {
    const product = this.getProduct(productId);
    if (product) {
      product.quantity += 1;
      this.updateCart();
      this.saveProductsToLocalStorage();
    }
  }

  // Décrémenter la quantité d'un produit
  decrementQuantity(productId: number): void {
    const product = this.getProduct(productId);
    if (product && product.quantity > 1) {
      product.quantity -= 1;
      this.updateCart();
      this.saveProductsToLocalStorage();
    }
  }

  // Calculer le prix total du panier
  calculateTotalPrice(): number {
    return this.getCart().reduce(
      (total, product) => total + product.price * product.quantity,
      0
    );
  }

  // Récupérer les articles dans le panier
  getCart(): Product[] {
    return this.products.filter((product) => product.quantity > 0);
  }

  getFavorites(): Product[] {
    return this.products.filter((product) => product.isFavorite);
  }

  switchFavorite(product: Product): void {
    this.favorites$.subscribe((favorites) => {
      if (favorites.includes(product)) {
        favorites = favorites.filter((fav) => fav.id !== product.id);
      } else {
        favorites.push(product);
      }
      this.favoritesSubject.next(favorites);
    }
    );
  }

  private saveCartToLocalStorage(cartItems: Product[]): void {
    const cartIds = cartItems.map((item) => item.id);
    localStorage.setItem(this.storageCartKey, JSON.stringify(cartIds));
  }

  private saveFavoritesToLocalStorage(favoriteItems: Product[]): void {
    localStorage.setItem(
      this.storageFavoritesKey,
      JSON.stringify(favoriteItems)
    );
  }

  private saveProductsToLocalStorage(): void {
    localStorage.setItem('products', JSON.stringify(this.products));
  }

  private loadCartFromLocalStorage(): Product[] {
    const storedCart = localStorage.getItem(this.storageCartKey);
    if (storedCart) {
      const cartIds: number[] = JSON.parse(storedCart);
      return cartIds
        .map((id) => this.products.find((product) => product.id === id))
        .filter(Boolean) as Product[];
    }
    return [];
  }

  private loadFavoritesFromLocalStorage(): Product[] {
    const storedFavorites = localStorage.getItem(this.storageFavoritesKey);
    if (storedFavorites) {
      return JSON.parse(storedFavorites);
    }
    return [];
  }
}
