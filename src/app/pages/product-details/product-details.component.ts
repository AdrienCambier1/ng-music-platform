import { Component, inject } from '@angular/core';
import { DarkButtonComponent } from '../../components/dark-button/dark-button.component';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../interfaces/product';
import { LightButtonComponent } from '../../components/light-button/light-button.component';
import { DatePipe } from '@angular/common';
import { NotFoundComponent } from '../not-found/not-found.component';

@Component({
  selector: 'app-product-details',
  imports: [DarkButtonComponent, LightButtonComponent, NotFoundComponent],
  templateUrl: './product-details.component.html',
  styles: [],
  providers: [DatePipe],
})
export class ProductDetailsComponent {
  quantity: number = 1;
  product: Product | any;
  productService = inject(ProductService);
  productDetails: { label: string; value: string | Date | undefined }[] = [];

  constructor(private route: ActivatedRoute, private datePipe: DatePipe) {
    this.route.params.subscribe((params) => {
      const id = Number(params['id']);
      this.product = this.productService.getProduct(id);
      if (this.product) {
        this.productDetails = [
          { label: 'Auteur', value: this.product.author },
          { label: 'Style', value: this.product.style },
          {
            label: 'Date de création',
            value: this.datePipe.transform(
              this.product.createdDate,
              'dd/MM/yyyy'
            ),
          },
        ];
      }
    });
  }

  addTocart(productId: number, quantity: number) {
    this.productService.addToCart(productId, quantity);
    this.quantity = 1;
  }

  switchFavorite(product: Product) {
    this.productService.switchFavorite(product);
  }

  incrementQuantity() {
    this.quantity++;
  }

  decrementQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }
}
