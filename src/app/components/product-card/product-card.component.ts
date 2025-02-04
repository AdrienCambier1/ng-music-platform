import { Component, inject, Input } from '@angular/core';
import { Product } from '../../interfaces/product';
import { ProductService } from '../../services/product.service';
import { DarkButtonComponent } from '../dark-button/dark-button.component';
import { RouterModule } from '@angular/router';
import { TextButtonComponent } from '../text-button/text-button.component';

@Component({
  selector: 'app-product-card',
  imports: [DarkButtonComponent, RouterModule, TextButtonComponent],
  templateUrl: './product-card.component.html',
  styles: ``,
})
export class ProductCardComponent {
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

  ngOnInit() {
    this.productService.favorites$.subscribe((favorites) => {
      this.product.isFavorite = favorites.some((p) => p.id === this.product.id);
    });
  }

  addToCart() {
    this.productService.addToCart(this.product.id);
  }

  switchFavorite() {
    this.productService.switchFavorite(this.product.id);
  }
}
