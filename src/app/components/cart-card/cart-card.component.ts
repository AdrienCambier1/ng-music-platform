import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../interfaces/product';
import { CartService } from '../../services/cart.service';
import { FavoritesService } from '../../services/favorites.service';
import { DarkButtonComponent } from '../dark-button/dark-button.component';

@Component({
  selector: 'app-cart-card',
  imports: [DarkButtonComponent, CommonModule, FormsModule],
  templateUrl: './cart-card.component.html',
  styles: ``,
})
export class CartCardComponent {
  @Input() product: Product = {
    id: '',
    title: '',
    price: 0,
    createdDate: new Date().toISOString(),
    style: '',
    quantity: 0,
    author: '',
    isFavorite: false,
    imageUrl: '',
    artists: [],
  };

  cartService = inject(CartService);
  favoritesService = inject(FavoritesService);

  increaseQuantity() {
    this.cartService.incrementQuantity(this.product.id);
  }

  decreaseQuantity() {
    this.cartService.decrementQuantity(this.product.id);
  }

  removeFromCart() {
    this.cartService.removeFromCart(this.product.id);
  }
}
