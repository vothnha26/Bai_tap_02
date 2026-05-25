# Cart Module Design

## Overview
Xây dựng chức năng Giỏ hàng sử dụng Redis để lưu trữ tạm thời, đảm bảo tốc độ truy xuất cao và tuân thủ nguyên tắc SOLID.

## Sequence Diagram: Add to Cart

```puml
@startuml
actor User
participant "CartUI" as UI
participant "CartController" as Controller
participant "CartService" as Service
participant "ProductRepository" as ProductRepo
database "Redis" as Redis

User -> UI: Click "Add to Cart"
UI -> Controller: POST /api/cart {productId, quantity}
activate Controller

Controller -> Service: addToCart(userId, productId, quantity)
activate Service

Service -> ProductRepo: findById(productId)
activate ProductRepo
ProductRepo --> Service: productInfo
deactivate ProductRepo

Service -> Redis: get("cart:" + userId)
activate Redis
Redis --> Service: existingCart
deactivate Redis

Service -> Service: Update cart logic (merge items)

Service -> Redis: set("cart:" + userId, updatedCart)
activate Redis
Redis --> Service: OK
deactivate Redis

Service --> Controller: updatedCart
deactivate Service

Controller --> UI: 200 OK {cart}
deactivate Controller

UI --> User: Show success notification
@enduml
```

## API Specification

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/cart | Lấy toàn bộ sản phẩm trong giỏ hàng |
| POST | /api/cart | Thêm sản phẩm vào giỏ hàng |
| PUT | /api/cart/:productId | Cập nhật số lượng của một sản phẩm |
| DELETE | /api/cart/:productId | Xóa một sản phẩm khỏi giỏ hàng |
| DELETE | /api/cart | Làm trống giỏ hàng |

## Data Structure in Redis
Key: `cart:{userId}`
Value: JSON String
```json
{
  "items": [
    {
      "productId": "...",
      "name": "...",
      "price": 1000,
      "quantity": 2,
      "imageUrl": "..."
    }
  ],
  "totalAmount": 2000
}
```
