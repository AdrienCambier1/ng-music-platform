import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { CartCardComponent } from '../../components/cart-card/cart-card.component';
import { DarkButtonComponent } from '../../components/dark-button/dark-button.component';
import {
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { Product } from '../../interfaces/product';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CartCardComponent,
    CommonModule,
    DarkButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './cart.component.html',
  styles: ``,
})
export class CartComponent {
  productService = inject(ProductService);
  cart: Product[] = [];
  totalPrice: string = '';
  showForm = false;
  router = inject(Router);

  OrderForm = new FormGroup({
    name: new FormControl('', Validators.required),
    adress: new FormControl('', Validators.required),
  });

  ngOnInit(): void {
    this.productService.cart$.subscribe((cart) => {
      this.cart = cart;
      this.totalPrice = this.productService.calculateTotalPrice().toFixed(2);
    });
  }

  showPaymentForm() {
    this.showForm = true;
  }

  hidePaymentForm() {
    this.OrderForm.reset();
    this.showForm = false;
  }

  clearCart() {
    this.productService.clearCart();
  }

  handleSubmit() {
    if (this.OrderForm.valid) {
      const { name, adress } = this.OrderForm.value;
      alert(
        `${name}, votre commande d'un montant de ${this.totalPrice}€ a bien été enregistrée !`
      );
      this.OrderForm.reset();
      this.showForm = false;
      this.clearCart();
      this.router.navigate(['/']);
    }
  }
}
