import { Component, inject, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Product } from '../../interfaces/product';
import { CartService } from '../../services/cart.service';
import { FavoritesService } from '../../services/favorites.service';
import { DarkButtonComponent } from '../dark-button/dark-button.component';
import { TextButtonComponent } from '../text-button/text-button.component';

@Component({
  selector: 'app-product-card',
  imports: [DatePipe, DarkButtonComponent, RouterModule, TextButtonComponent],
  templateUrl: './product-card.component.html',
  styles: ``,
})
export class ProductCardComponent {
  cartService = inject(CartService);
  favoritesService = inject(FavoritesService);

  @Input() product: Product = {
    id: '',
    title: '',
    price: 0,
    createdDate: '',
    style: '',
    quantity: 0,
    author: '',
    isFavorite: false,
    imageUrl: '',
    artists: [],
  };

  ngOnInit() {
    this.favoritesService.favorites$.subscribe((favorites) => {
      this.product.isFavorite = favorites.some((p) => p.id === this.product.id);
    });
  }

  addToCart() {
    this.cartService.addToCart(this.product.id);
  }

  switchFavorite() {
    this.favoritesService.switchFavorite(this.product.id);
  }
}
