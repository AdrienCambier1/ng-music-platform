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

  // Clés pour le stockage local
  private storageCartKey = 'cart';
  private storageFavoritesKey = 'favorites';

  // Sujets pour les articles du panier et les favoris
  private cartSubject = new BehaviorSubject<Product[]>(this.loadCartFromLocalStorage());
  cart$ = this.cartSubject.asObservable();

  private favoritesSubject = new BehaviorSubject<Product[]>(this.loadFavoritesFromLocalStorage());
  favorites$ = this.favoritesSubject.asObservable();

  // Constructeur
  constructor() {
    this.loadInitialData();  // Chargement initial des données
  }

  // Chargement initial des données
  private loadInitialData(): void {
    // Récupérer les produits depuis le stockage local
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
      this.products = JSON.parse(storedProducts);
    }
    // Synchronisation du panier et des favoris
    this.cartSubject.next(this.loadCartFromLocalStorage());
    this.favoritesSubject.next(this.loadFavoritesFromLocalStorage());
  }

/// PRODUITS

  // Récupérer tous les produits
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.url).pipe(
      tap((products) => {
        this.products = [...products];
        localStorage.setItem('products', JSON.stringify(products));
        this.syncCartAndFavorites();
      })
    );
  }
  // Récupérer un produit spécifique par son ID
  getProduct(id: number): Product | undefined {
    return this.products.find((product) => product.id === id);
  }

  // Récupérer les produits favoris et les produits du panier
  private syncCartAndFavorites(): void {
    // Synchronisation du panier
    const cartItems = this.loadCartFromLocalStorage();
    this.cartSubject.next(cartItems);

    // Synchronisation des favoris
    const favoriteItems = this.loadFavoritesFromLocalStorage();
    this.favoritesSubject.next(favoriteItems);
  }
  // Enregistrer les produits dans le stockage local
  private saveProductsToLocalStorage(): void {
    localStorage.setItem('products', JSON.stringify(this.products));
  }

/// PANIER
  // Ajouter un produit au panier
  addToCart(productId: number, quantity: number = 1): void {
    const product = this.getProduct(productId);
    if (product) {
      product.quantity += quantity;
      this.updateCart();
      this.saveProductsToLocalStorage();
    }
  }

  // Récupérer le nombre d'articles
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
  // Vider le panier
  clearCart(): void {
    this.products.forEach((product) => (product.quantity = 0));
    this.updateCart();
    this.saveProductsToLocalStorage();
  }
  // Mettre à jour le panier
  private updateCart(): void {
    const cartItems = this.getCart();
    this.cartSubject.next(cartItems);
    this.saveCartToLocalStorage(cartItems);
  }
  // Récupérer les articles dans le panier
  getCart(): Product[] {
    return this.products.filter((product) => product.quantity > 0);
  }

  // Enregistrer les articles du panier dans le stockage local
  private saveCartToLocalStorage(cartItems: Product[]): void {
    const cartIds = cartItems.map((item) => item.id);
    localStorage.setItem(this.storageCartKey, JSON.stringify(cartIds));
  }

  // Charger les articles du panier depuis le stockage local
  private loadCartFromLocalStorage(): Product[] {
    const storedCart = localStorage.getItem(this.storageCartKey);
    if (storedCart) {
      const cartIds: number[] = JSON.parse(storedCart);
      // Mettre à jour les quantités des produits dans le panier
      cartIds.forEach(id => {
        const product = this.products.find(p => p.id === id);
        if (product) {
          product.quantity = product.quantity || 1;
        }
      });
      return this.products.filter(product => cartIds.includes(product.id));
    }
    return [];
  }

/// FAVORIS

  // Récupérer les favoris
  getFavorites(): Product[] {
    return this.products.filter((product) => product.isFavorite);
  }
    // Mettre à jour les favoris
  private updateFavorites(): void {
    const favoriteItems = this.getFavorites();
    this.favoritesSubject.next(favoriteItems);
    this.saveFavoritesToLocalStorage(favoriteItems);
  }
  // Vider les favoris
  clearFavorites(): void {
    this.products.forEach((product) => (product.isFavorite = false));
    this.updateFavorites();
    this.saveProductsToLocalStorage();
  }
  // Basculer un produit en favori ou non
  switchFavorite(product: Product): void {
    const updatedProduct = this.products.find(p => p.id === product.id);
    if (updatedProduct) {
      updatedProduct.isFavorite = !updatedProduct.isFavorite;
      this.updateFavorites();
      this.saveFavoritesToLocalStorage(this.getFavorites());
    }
  }
  // Enregistrer les favoris dans le stockage local
  private saveFavoritesToLocalStorage(favoriteItems: Product[]): void {
    const favoriteIds = favoriteItems.map((item) => item.id);
    localStorage.setItem(this.storageFavoritesKey, JSON.stringify(favoriteIds));
  }

  // Charger les favoris depuis le stockage local
  private loadFavoritesFromLocalStorage(): Product[] {
    const storedFavorites = localStorage.getItem(this.storageFavoritesKey);
    if (storedFavorites) {
      const favoriteIds: number[] = JSON.parse(storedFavorites);
      this.products.forEach((product) => {
        product.isFavorite = favoriteIds.includes(product.id);
      });
      return this.products.filter((product) => product.isFavorite);
    }
    return [];
  }

/// QUANTITÉ

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

/// PRIX

  // Calculer le prix total du panier
  calculateTotalPrice(): number {
    return this.getCart().reduce(
      (total, product) => total + product.price * product.quantity,
      0
    );
  }
}
