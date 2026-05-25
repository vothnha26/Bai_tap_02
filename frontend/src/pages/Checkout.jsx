import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router';
import orderService from '../services/order.service';

const Checkout = () => {
  const { cart, loading: cartLoading, clearCart, itemCount } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    shippingAddress: '',
    phone: '',
    note: '',
    paymentMethod: 'COD'
  });

  useEffect(() => {
    if (!cartLoading && (!cart || !cart.items || cart.items.length === 0)) {
      navigate('/cart');
    }
  }, [cart, cartLoading, navigate]);

  if (cartLoading || !cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const order = await orderService.createOrder(formData);
      await clearCart(); // Clear cart after success
      navigate(`/order-success/${order.id}`);
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-white">Thanh toán</h1>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1A1A1A] p-6 rounded-xl border border-white/10">
            <h2 className="text-xl font-bold mb-6 text-white">Thông tin giao hàng</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2">Số điện thoại</label>
                <input
                  type="text"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  placeholder="Nhập số điện thoại của bạn"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-2">Địa chỉ nhận hàng</label>
                <textarea
                  name="shippingAddress"
                  required
                  rows="3"
                  value={formData.shippingAddress}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  placeholder="Nhập địa chỉ giao hàng chi tiết"
                ></textarea>
              </div>
              <div>
                <label className="block text-gray-400 mb-2">Ghi chú (tùy chọn)</label>
                <input
                  type="text"
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  placeholder="Ghi chú cho shipper..."
                />
              </div>
            </div>
          </div>

          <div className="bg-[#1A1A1A] p-6 rounded-xl border border-white/10">
            <h2 className="text-xl font-bold mb-6 text-white">Phương thức thanh toán</h2>
            <div className="space-y-4">
              <label className="flex items-center p-4 border border-blue-500 bg-blue-500/10 rounded-lg cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={formData.paymentMethod === 'COD'}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600"
                />
                <div className="ml-4">
                  <p className="text-white font-bold">Thanh toán khi nhận hàng (COD)</p>
                  <p className="text-gray-400 text-sm">Bạn sẽ thanh toán tiền mặt cho shipper khi nhận được hàng.</p>
                </div>
              </label>
              
              <div className="flex items-center p-4 border border-white/10 rounded-lg opacity-50 cursor-not-allowed">
                <input type="radio" disabled className="w-5 h-5" />
                <div className="ml-4">
                  <p className="text-white font-bold">Ví điện tử (MoMo/ZaloPay)</p>
                  <p className="text-gray-400 text-sm">Sắp ra mắt</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-[#1A1A1A] p-6 rounded-xl border border-white/10 sticky top-24">
            <h2 className="text-xl font-bold mb-6 text-white border-b border-white/10 pb-4">Đơn hàng của bạn ({itemCount})</h2>
            
            <div className="max-h-60 overflow-y-auto mb-6 space-y-4 pr-2">
              {cart.items.map((item) => (
                <div key={item.productId} className="flex gap-3">
                  <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{item.name}</p>
                    <p className="text-gray-400 text-xs">x{item.quantity}</p>
                  </div>
                  <p className="text-white text-sm font-bold">{(item.price * item.quantity).toLocaleString()}đ</p>
                </div>
              ))}
            </div>

            <div className="space-y-4 mb-6 pt-4 border-t border-white/10">
              <div className="flex justify-between text-gray-400">
                <span>Tạm tính</span>
                <span className="text-white">{cart.totalAmount.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Phí vận chuyển</span>
                <span className="text-green-400">Miễn phí</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-4 border-t border-white/10 text-white">
                <span>Tổng cộng</span>
                <span className="text-blue-400">{cart.totalAmount.toLocaleString()}đ</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex justify-center items-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white"></div>
              ) : (
                'Xác nhận đặt hàng'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
