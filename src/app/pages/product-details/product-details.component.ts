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
  standalone: true,
  imports: [DarkButtonComponent, LightButtonComponent, NotFoundComponent],
  templateUrl: './product-details.component.html',
  styles: [],
  providers: [DatePipe],
})
export class ProductDetailsComponent implements OnInit {
  productService = inject(ProductService);
  route = inject(ActivatedRoute);
  datePipe = inject(DatePipe);

  quantity: number = 1;
  product: Product | undefined;
  productDetails: { label: string; value: any }[] = [];
  productTracks: { label: string; value: any }[] = [];

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = String(params['id']);
      this.loadProductDetails(id);
    });
  }

  // Renvoi les détails du produit en fonction de l'ID passé en paramètre de l'URL
  private loadProductDetails(id: string): void {
    this.productService.getProductDetailsById(id).subscribe(
      (product) => {
        this.product = product;
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
          let totalDurationInSeconds = 0;
          this.productTracks = this.product.tracks?.map((track) => {
            const durationInSeconds = Math.floor(track.trackDuration / 1000);
            totalDurationInSeconds += durationInSeconds;
  
            const minutes = Math.floor(durationInSeconds / 60);
            const seconds = durationInSeconds % 60;
  
            return {
              label: track.trackName,
              value: `${minutes} min ${seconds} sec`,
            };
          }) || [];
          const totalMinutes = Math.floor(totalDurationInSeconds / 60); 
          const totalSeconds = totalDurationInSeconds % 60;
  
          // Ajouter le total à l'affichage
          this.productDetails.push({
            label: 'Durée totale de l\'album',
            value: `${totalMinutes} min ${totalSeconds} sec`,
          });
        }
      },
      (error) => {
        console.error('Erreur lors du chargement des détails du produit', error);
      }
    );
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
