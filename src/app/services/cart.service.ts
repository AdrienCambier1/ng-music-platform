import { inject, Injectable, Injector } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../interfaces/product';
import { ProductService } from './product.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  injector = inject(Injector);
  _productService?: ProductService;
  private storageCartKey = 'cart';

  private cartSubject = new BehaviorSubject<Product[]>(
    this.loadCartFromLocalStorage()
  );
  cart$ = this.cartSubject.asObservable();

  get projectService(): ProductService {
    if (!this._productService) {
      this._productService = this.injector.get(ProductService);
    }
    return this._productService;
  }

  addToCart(productId: string, quantity: number = 1): void {
    let cart = this.cartSubject.value;
    const product = this.projectService.getProductById(productId);

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

  getCartItemCount(): number {
    return this.cartSubject.value.reduce(
      (total, product) => total + product.quantity,
      0
    );
  }

  calculateTotalPrice(): number {
    return this.cartSubject.value.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    );
  }

  getCartItems(): Product[] {
    return this.cartSubject.value;
  }

  syncCart(cart: Product[]): void {
    this.cartSubject.next(cart);
  }
}
