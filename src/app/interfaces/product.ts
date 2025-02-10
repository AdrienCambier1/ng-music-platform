import { Track } from './track';

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
  artists: { name: string; profileUrl: string }[];
  tracks?: Track[];
}
