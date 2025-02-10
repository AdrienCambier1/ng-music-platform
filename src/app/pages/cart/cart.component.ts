import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Product } from '../../interfaces/product';
import { CartService } from '../../services/cart.service';
import { CartCardComponent } from '../../components/cart-card/cart-card.component';
import { DarkButtonComponent } from '../../components/dark-button/dark-button.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CartCardComponent,
    DarkButtonComponent,
  ],
  templateUrl: './cart.component.html',
  styles: ``,
})
export class CartComponent {
  cartService = inject(CartService);
  router = inject(Router);

  cart: Product[] = [];
  totalPrice: string = '';
  showForm = false;

  OrderForm = new FormGroup({
    name: new FormControl('', Validators.required),
    adress: new FormControl('', Validators.required),
  });

  ngOnInit(): void {
    this.cartService.cart$.subscribe((cart) => {
      this.cart = cart;
      this.totalPrice = this.cartService.calculateTotalPrice().toFixed(2);
    });
  }

  showPaymentForm(): void {
    this.showForm = true;
  }

  hidePaymentForm(): void {
    this.OrderForm.reset();
    this.showForm = false;
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  handleSubmit(): void {
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
