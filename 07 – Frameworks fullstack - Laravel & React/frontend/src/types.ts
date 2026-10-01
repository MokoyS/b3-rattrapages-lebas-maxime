export interface Product {
  id: number
  name: string
  description: string
  category: string
  priceCents: number
  stock: number
  imageUrl: string
}

export interface UserProfile {
  id: number
  email: string
  firstName: string
  lastName: string
  loyaltyCardNumber: string
  loyaltyPoints: number
  memberSince: string
}

export interface LoyaltyAccount {
  loyaltyCardNumber: string
  loyaltyPoints: number
  memberSince: string
  ordersCount: number
}

export interface OrderItem {
  productName: string
  unitPriceCents: number
  quantity: number
}

export interface Order {
  id: number
  createdAt: string
  totalCents: number
  status: string
  cardLast4: string
  pointsEarned: number
  items: OrderItem[]
}

export interface CartLine {
  product: Product
  quantity: number
}
