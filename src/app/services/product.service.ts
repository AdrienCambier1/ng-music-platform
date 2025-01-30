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
      this.products = JSON.parse(storedProducts);  // Chargement des produits stockés dans localStorage
    }
    this.cartSubject.next(this.loadCartFromLocalStorage());  // Chargement du panier
    this.favoritesSubject.next(this.loadFavoritesFromLocalStorage());  // Chargement des favoris
  }

  // Récupérer les produits depuis l'API
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.url).pipe(
      tap((products) => {
        this.products = products;
        localStorage.setItem('products', JSON.stringify(products)); // Sauvegarde des produits dans localStorage
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

  // Nombre d'articles uniques dans le panier
  getCartItemCount(): number {
    const uniqueItems = new Set(this.cartSubject.value.map((item) => item.id));
    return uniqueItems.size;
  }

  // Supprimer un produit du panier
  removeFromCart(productId: number): void {
    const product = this.getProduct(productId);
    if (product) {
      product.quantity = 0;
      this.updateCart();
      this.saveProductsToLocalStorage();
    }
  }

  // Récupérer les styles uniques
  getUniqueStyles(): string[] {
    const uniqueStyles = new Set(this.products.map((product) => product.style));
    return Array.from(uniqueStyles);
  }

  // Vider le panier
  clearCart(): void {
    this.products.forEach((product) => (product.quantity = 0));
    this.updateCart();
    this.saveProductsToLocalStorage();
  }

  // Vider les favoris
  clearFavorites(): void {
    this.products.forEach((product) => (product.isFavorite = false));
    this.updateFavorites();
    this.saveProductsToLocalStorage();
  }

  // Mise à jour du panier
  private updateCart(): void {
    const cartItems = this.getCart();
    this.cartSubject.next(cartItems);
    this.saveCartToLocalStorage(cartItems);
  }

  // Mise à jour des favoris
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

  // Récupérer les produits favoris
  getFavorites(): Product[] {
    return this.products.filter((product) => product.isFavorite);
  }

  // Ajouter/retirer un produit des favoris
  switchFavorite(product: Product): void {
    product.isFavorite = !product.isFavorite;
    this.updateFavorites();
    this.saveProductsToLocalStorage();
  }

  // Sauvegarder le panier dans localStorage
  private saveCartToLocalStorage(cartItems: Product[]): void {
    const cartIds = cartItems.map((item) => item.id);
    localStorage.setItem(this.storageCartKey, JSON.stringify(cartIds));
  }

  // Sauvegarder les favoris dans localStorage
  private saveFavoritesToLocalStorage(favoriteItems: Product[]): void {
    localStorage.setItem(this.storageFavoritesKey, JSON.stringify(favoriteItems));
  }

  // Sauvegarder tous les produits dans localStorage
  private saveProductsToLocalStorage(): void {
    localStorage.setItem('products', JSON.stringify(this.products));
  }

  // Charger les produits du panier depuis localStorage
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

  // Charger les produits favoris depuis localStorage
  private loadFavoritesFromLocalStorage(): Product[] {
    const storedFavorites = localStorage.getItem(this.storageFavoritesKey);
    if (storedFavorites) {
      return JSON.parse(storedFavorites);
    }
    return [];
  }
}
