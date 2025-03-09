import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { FavoritesService } from '../../services/favorites.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../interfaces/product';
import { DarkButtonComponent } from '../../components/dark-button/dark-button.component';
import { LightButtonComponent } from '../../components/light-button/light-button.component';
import { NotFoundComponent } from '../not-found/not-found.component';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    DarkButtonComponent,
    LightButtonComponent,
    NotFoundComponent,
    ProductCardComponent,
  ],
  templateUrl: './product-details.component.html',
  styles: [],
  providers: [DatePipe],
})
export class ProductDetailsComponent {
  productService = inject(ProductService);
  favoritesService = inject(FavoritesService);
  cartService = inject(CartService);
  route = inject(ActivatedRoute);
  datePipe = inject(DatePipe);

  product: Product | null = null;

  randomProducts: Product[] = [];
  quantity: number = 1;
  isLoaded: boolean = false;
  productDetails: { label: string; value: any }[] = [];
  productTracks: { label: string; value: any }[] = [];

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = String(params['id']);
      this.isLoaded = false;
      this.loadProductDetails(id);
    });
  }

  private loadProductDetails(id: string): void {
    this.productService
      .getProductDetailsById(id)
      .pipe(finalize(() => (this.isLoaded = true)))
      .subscribe((product) => {
        if (!product) return;

        this.product = product;
        this.setProductDetails();
        this.setProductTracks();
        this.loadRandomProducts();
        this.loadFavoriteState();
      });
  }

  private setProductDetails(): void {
    if (!this.product) return;

    this.productDetails = [
      { label: 'Artiste', value: this.product.author },
      { label: 'Style', value: this.product.style || 'Non défini' },
      {
        label: 'Date de création',
        value: this.datePipe.transform(this.product.createdDate, 'dd/MM/yyyy'),
      },
    ];
  }

  private setProductTracks(): void {
    if (!this.product?.tracks) return;

    let totalDurationInSeconds = 0;

    this.productTracks = this.product.tracks.map((track) => {
      const durationInSeconds = Math.floor(track.trackDuration / 1000);
      totalDurationInSeconds += durationInSeconds;

      return {
        label: track.trackName,
        value: this.formatDuration(durationInSeconds),
      };
    });

    this.productDetails.push({
      label: "Durée totale de l'album",
      value: this.formatDuration(totalDurationInSeconds),
    });
  }

  private loadRandomProducts(): void {
    this.productService.getRandomProducts().subscribe((products) => {
      if (products && products.length > 0) {
        this.randomProducts = products;
      }
    });
  }

  private loadFavoriteState(): void {
    this.favoritesService.favorites$.subscribe((favorites) => {
      if (!this.product) return;

      this.product.isFavorite = favorites.some(
        (p) => p.id === this.product!.id
      );
    });
  }

  private formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} min ${remainingSeconds} sec`;
  }

  addToCart(): void {
    if (!this.product) return;

    this.cartService.addToCart(this.product.id, this.quantity);
    this.quantity = 1;
  }

  switchFavorite(): void {
    if (!this.product) return;

    this.favoritesService.switchFavorite(this.product.id);
  }

  incrementQuantity(): void {
    this.quantity++;
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }
}
