import { Component, inject, OnInit } from '@angular/core';
import { DarkButtonComponent } from '../../components/dark-button/dark-button.component';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../interfaces/product';
import { LightButtonComponent } from '../../components/light-button/light-button.component';
import { DatePipe } from '@angular/common';
import { NotFoundComponent } from '../not-found/not-found.component';

@Component({
  selector: 'app-product-details',
  standalone: true, // Permet une meilleure modularité
  imports: [DarkButtonComponent, LightButtonComponent, NotFoundComponent],
  templateUrl: './product-details.component.html',
  styles: [],
  providers: [DatePipe],
})
export class ProductDetailsComponent {
  productService = inject(ProductService);
  route = inject(ActivatedRoute);
  datePipe = inject(DatePipe);

  quantity: number = 1;
  product: Product | undefined;
  productDetails: { label: string; value: any }[] = [];

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = String(params['id']);
      this.loadProductDetails(id);
    });
  }

  private loadProductDetails(id: string): void {
    this.product = this.productService.getProductById(id);

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
  }

  addToCart() {
    if (this.product) {
      this.productService.addToCart(this.product.id, this.quantity);
      this.quantity = 1;
    }
  }

  switchFavorite() {
    if (this.product) {
      this.productService.switchFavorite(this.product.id);
    }
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
