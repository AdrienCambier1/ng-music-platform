export interface Product {
  id: string;
  title: string;
  author: string;
  createdDate: string;
  style?: string;
  price: number;
  quantity: number;
  isFavorite: boolean;
  imageUrl?: string;
}
