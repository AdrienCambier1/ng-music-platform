export interface Product {
  id: number;
  title: string;
  price: number;
  createdDate: Date;
  style: string;
  quantity: number;
  author: string;
  isFavorite: boolean;
  imageUrl?: string;
}
