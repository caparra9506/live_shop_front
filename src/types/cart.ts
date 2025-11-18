export enum CartStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface CartItem {
  id: number;
  quantity: number;
  price: string;
  subtotal: string;
  addedAt: string;
  product: {
    id: number;
    name: string;
    imageUrl: string;
    stock: number;
  };
  productVariant?: {
    id: number;
    color?: { name: string };
    size?: { name: string };
  };
}

export interface Cart {
  id: number;
  status: CartStatus;
  totalAmount: string;
  shippingCost: string;
  discountAmount: string;
  expiresAt: string;
  timeoutDays: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  cartItems: CartItem[];
  tiktokUser: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  store: {
    id: number;
    name: string;
  };
}

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

export interface CreateCartDto {
  userTikTokId: number;
  storeName: string;
  timeoutDays?: number;
  notes?: string;
}

export interface AddItemToCartDto {
  cartId: number;
  productId: number;
  quantity: number;
  productVariantId?: number;
}

export interface UpdateCartItemDto {
  cartItemId: number;
  quantity: number;
}