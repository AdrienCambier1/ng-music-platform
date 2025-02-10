import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { DarkButtonComponent } from '../dark-button/dark-button.component';

@Component({
  selector: 'app-header',
  imports: [RouterModule, DarkButtonComponent],
  templateUrl: './header.component.html',
  styles: ``,
})
export class HeaderComponent {
  cartService = inject(CartService);

  cartItemCount: number = 0;

  ngOnInit(): void {
    this.cartService.cart$.subscribe(() => {
      this.cartItemCount = this.cartService.getCartItemCount();
    });
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
}
