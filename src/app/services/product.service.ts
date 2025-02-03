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

  // Clé de l'URL des produits et pour le stockage local
  readonly url = 'http://localhost:4000/products';
  private storageCartKey = 'cart';
  private storageFavoritesKey = 'favorites';

  // Sujets pour les produits, le panier et les favoris
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

  // Constructeur
  constructor() {
    this.loadInitialData(); // Chargement initial des données
  }

  // Chargement initial des données
  private loadInitialData(): void {
    const storedProducts = localStorage.getItem('products');
    
    if (storedProducts) {
      try {
        this.products = JSON.parse(storedProducts);
        if (Array.isArray(this.products) && this.products.length > 0) {
          this.productsSubject.next(this.products);
          this.syncCartAndFavorites();
        } else {
          console.warn('Aucun produit valide trouvé dans localStorage, chargement depuis l\'API');
          this.getProducts().subscribe();
        }
      } catch (error) {
        console.error('Erreur lors de la lecture des produits depuis localStorage', error);
        this.getProducts().subscribe();
      }
    } else {
      console.log('Aucun produit trouvé dans localStorage, chargement depuis l\'API');
      this.getProducts().subscribe();
    }
  }
  
  /// PRODUITS

  // Récupérer tous les produits depuis l'API et mettre à jour les données
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.url).pipe(
      tap((products) => {
        this.products = [...products];
        localStorage.setItem('products', JSON.stringify(products)); // Sauvegarder les produits dans le stockage local
        this.productsSubject.next(this.products); // Mettre à jour les abonnés avec les nouveaux produits
        this.syncCartAndFavorites(); // Synchroniser le panier et les favoris
      })
    );
  }

  // Récupérer un produit spécifique par son ID
  getProduct(id: string): Product | undefined {
    return this.products.find((product) => product.id === id);
  }

  // Synchronisation des produits dans le panier et les favoris
  private syncCartAndFavorites(): void {
    // Synchronisation du panier
    const cartItems = this.loadCartFromLocalStorage();
    this.cartSubject.next(cartItems);

    // Synchronisation des favoris
    const favoriteItems = this.loadFavoritesFromLocalStorage();
    this.favoritesSubject.next(favoriteItems);
  }

  /// PANIER

  // Ajouter un produit au panier
  addToCart(productId: string, quantity: number = 1): void {
    const product = this.getProduct(productId);
    if (product) {
      product.quantity += quantity;
      this.updateCart();
      this.saveProductsToLocalStorage();
    }
  }
  

  // Récupérer le nombre d'articles dans le panier
  getCartItemCount(): number {
    const uniqueItems = new Set(this.cartSubject.value.map((item) => item.id));
    return uniqueItems.size;
  }

  // Supprimer un produit du panier
  removeFromCart(productId: string): void {
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

  // Récupérer les produits du panier
  getCart(): Product[] {
    return this.products.filter((product) => product.quantity > 0);
  }

  // Sauvegarder les produits du panier dans le stockage local
  private saveCartToLocalStorage(cartItems: Product[]): void {
    const cartIds = cartItems.map((item) => item.id);
    localStorage.setItem(this.storageCartKey, JSON.stringify(cartIds));
  }
  // Charger les produits du panier depuis le stockage local
  private loadCartFromLocalStorage(): Product[] {
    const storedCart = localStorage.getItem(this.storageCartKey);
    if (storedCart) {
      const cartIds: string[] = JSON.parse(storedCart);
      cartIds.forEach((id) => {
        const product = this.products.find((p) => p.id === id);
        if (product) {
          product.quantity = product.quantity || 1;
        }
      });
      return this.products.filter((product) => cartIds.includes(product.id));
    }
    return [];
  }
  

  /// FAVORIS

  // Récupérer les produits favoris
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
    const updatedProduct = this.products.find((p) => p.id === product.id);
    if (updatedProduct) {
      updatedProduct.isFavorite = !updatedProduct.isFavorite;
      this.updateFavorites();
      this.saveFavoritesToLocalStorage(this.getFavorites());
    }
  }

  // Sauvegarder les favoris dans le stockage local
  private saveFavoritesToLocalStorage(favoriteItems: Product[]): void {
    const favoriteIds = favoriteItems.map((item) => item.id);
    localStorage.setItem(this.storageFavoritesKey, JSON.stringify(favoriteIds));
  }

  // Charger les favoris depuis le stockage local
  private loadFavoritesFromLocalStorage(): Product[] {
    const storedFavorites = localStorage.getItem(this.storageFavoritesKey);
    if (storedFavorites) {
      const favoriteIds: string[] = JSON.parse(storedFavorites);
      this.products.forEach((product) => {
        product.isFavorite = favoriteIds.includes(product.id);
      });
      return this.products.filter((product) => product.isFavorite);
    }
    return [];
  }
  
  /// QUANTITÉ

  // Incrémenter la quantité d'un produit dans le panier
  incrementQuantity(productId: string): void {
    const product = this.getProduct(productId);
    if (product) {
      product.quantity += 1;
      this.updateCart();
      this.saveProductsToLocalStorage();
    }
  }
  // Décrémenter la quantité d'un produit dans le panier
  decrementQuantity(productId: string): void {
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

  // Sauvegarder les produits dans le stockage local
  private saveProductsToLocalStorage(): void {
    localStorage.setItem('products', JSON.stringify(this.products)); // Sauvegarde de l'état des produits dans le localStorage
  }
}
