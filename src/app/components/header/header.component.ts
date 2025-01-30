import { Component, inject } from '@angular/core';
import { DarkButtonComponent } from '../dark-button/dark-button.component';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-header',
  imports: [DarkButtonComponent, RouterModule],
  templateUrl: './header.component.html',
  styles: ``,
})
export class HeaderComponent {
  ProductService = inject(ProductService);
  cartItemCount = 0;
  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  ngOnInit() {
    this.ProductService.cart$.subscribe(() => {
      this.cartItemCount = this.ProductService.getCartItemCount();
    });
  }
}
