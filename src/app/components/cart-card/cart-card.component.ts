import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Product } from '../../interfaces/product';
import { ProductService } from '../../services/product.service';
import { DarkButtonComponent } from '../dark-button/dark-button.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  };
  
  

  productService = inject(ProductService);
  cartProducts = this.productService.getProducts();

  increaseQuantity() {
    this.productService.incrementQuantity(this.product.id);
  }

  decreaseQuantity() {
    this.productService.decrementQuantity(this.product.id);
  }

  removeFromCart(productId: string) {
    this.productService.removeFromCart(productId);
  }
}
