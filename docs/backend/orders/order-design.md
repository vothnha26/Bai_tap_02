# Order & Checkout Module Design

## Overview
Xây dựng chức năng Thanh toán và Đơn hàng. Phương thức mặc định là COD (Cash on Delivery). Kiến trúc được thiết kế theo Strategy Pattern để dễ dàng tích hợp các ví điện tử (MoMo, ZaloPay, VNPay) trong tương lai.

## Sequence Diagram: Checkout (COD)

```puml
@startuml
actor User
participant "CheckoutUI" as UI
participant "OrderController" as Controller
participant "OrderService" as Service
participant "CartService" as CartService
participant "OrderRepository" as OrderRepo
participant "ProductRepository" as ProductRepo
database "MongoDB" as DB
database "Redis" as Redis

User -> UI: Click "Place Order" (COD)
UI -> Controller: POST /api/orders {shippingAddress, phone, note}
activate Controller

Controller -> Service: createOrder(userId, orderData)
activate Service

Service -> CartService: getCart(userId)
activate CartService
CartService -> Redis: get("cart:" + userId)
Redis --> CartService: cartItems
CartService --> Service: cartData
deactivate CartService

Service -> Service: Validate stock & Calculate totals

Service -> OrderRepo: create(orderData)
activate OrderRepo
OrderRepo -> DB: Save Order (Status: PENDING)
DB --> OrderRepo: orderObject
OrderRepo --> Service: orderObject
deactivate OrderRepo

Service -> ProductRepo: updateStock(items)
Service -> CartService: clearCart(userId)

Service --> Controller: orderObject
deactivate Service

Controller --> UI: 201 Created {order}
deactivate Controller

UI --> User: Show Order Success Page
@enduml
```

## Data Models

### Order Schema
- `userId`: ObjectId (Ref: User)
- `items`: Array
    - `productId`, `name`, `price`, `quantity`, `imageUrl`
- `totalAmount`: Number
- `shippingAddress`: String
- `phone`: String
- `status`: Enum ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED']
- `paymentMethod`: Enum ['COD', 'MOMO', 'VNPAY']
- `paymentStatus`: Enum ['PENDING', 'PAID', 'FAILED']
- `note`: String

## Strategy Pattern for Payment (Future-proof)
```javascript
interface PaymentStrategy {
  processPayment(amount, orderId): Promise<Result>;
}

class CODPayment implements PaymentStrategy { ... }
class MoMoPayment implements PaymentStrategy { ... }
```
