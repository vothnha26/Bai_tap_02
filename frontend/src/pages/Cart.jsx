import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router';

const Cart = () => {
  const { cart, loading, updateQuantity, removeFromCart, clearCart, itemCount } = useCart();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (cart?.items?.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Giỏ hàng của bạn đang trống</h2>
        <p className="text-gray-600 mb-8">Hãy khám phá các sản phẩm tuyệt vời của chúng tôi!</p>
        <Link
          to="/"
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-white">Giỏ hàng ({itemCount})</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item.productId} className="bg-[#1A1A1A] p-4 rounded-xl flex items-center gap-4 border border-white/10">
              <img
                src={item.imageUrl || '/placeholder-product.png'}
                alt={item.name}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                <p className="text-blue-400 font-bold">{item.price.toLocaleString()}đ</p>
                
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center border border-white/20 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 text-white bg-transparent">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-red-400 hover:text-red-300 text-sm underline"
                  >
                    Xóa
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">{(item.price * item.quantity).toLocaleString()}đ</p>
              </div>
            </div>
          ))}
          
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={clearCart}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Làm trống giỏ hàng
            </button>
            <Link to="/" className="text-blue-400 hover:text-blue-300">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-[#1A1A1A] p-6 rounded-xl border border-white/10 sticky top-24">
            <h2 className="text-xl font-bold mb-6 text-white border-b border-white/10 pb-4">Tóm tắt đơn hàng</h2>
            
            <div className="space-y-4 mb-6 text-gray-400">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span className="text-white">{cart.totalAmount.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển</span>
                <span className="text-green-400">Miễn phí</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-4 border-t border-white/10 text-white">
                <span>Tổng cộng</span>
                <span className="text-blue-400">{cart.totalAmount.toLocaleString()}đ</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 block text-center"
            >
              Thanh toán ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
