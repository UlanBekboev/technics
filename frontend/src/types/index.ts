export interface Product {
  id: number;
  slug: string;
  name: string;
  sku?: string;
  shortDescription?: string;
  description?: string;
  price: number;
  oldPrice?: number;
  stock: number;
  isActive: boolean;
  isNew: boolean;
  isHit: boolean;
  stockStatus: string;
  rating: number;
  reviewCount: number;
  soldCount: number;
  categoryId: number;
  brandId?: number;
  brand?: Brand;
  category?: Category;
  images: ProductImage[];
  specs: ProductSpec[];
  createdAt: string;
  updatedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

export interface ProductImage {
  id: number;
  url: string;
  isMain: boolean;
}

export interface ProductSpec {
  id: number;
  key: string;
  value: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string;
  icon?: string;
  parentId?: number;
  featured: boolean;
  showInCatalog: boolean;
  position: number;
  productCount?: number;
  subcategories?: Category[];
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logoUrl?: string;
}

export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonUrl?: string;
  image: string;
  overlayStyle: string;
  isActive: boolean;
  position: number;
}

export interface Order {
  id: number;
  status: string;
  total: number;
  address?: string;
  comment?: string;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: Product;
}

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: string;
}
