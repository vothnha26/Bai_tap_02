import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router';
import { Truck, Phone, MapPin, CreditCard, ChevronRight, Package, ShieldCheck, AlertCircle, ShoppingBag, Tag, Gift, Trash } from 'lucide-react';
import orderService from '../services/order.service';
import { promotionApi } from '../services/promotion.service';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';

const Checkout = () => {
  const { cart, loading: cartLoading, clearCart, itemCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    shippingAddress: '',
    phone: '',
    note: '',
    paymentMethod: 'COD',
    promotionCode: ''
  });

  // Promotion states
  const [promotionCode, setPromotionCode] = useState('');
  const [appliedPromotion, setAppliedPromotion] = useState(null);
  const [applicablePromotions, setApplicablePromotions] = useState([]);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        phone: user.phone || '',
        shippingAddress: user.address || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!cartLoading && (!cart || !cart.items || cart.items.length === 0)) {
      navigate('/cart');
    }
  }, [cart, cartLoading, navigate]);

  useEffect(() => {
    if (cart && cart.items && cart.items.length > 0) {
      fetchApplicablePromotions();
    }
  }, [cart]);

  const fetchApplicablePromotions = async () => {
    try {
      const res = await promotionApi.getApplicable(cart.items, 0);
      setApplicablePromotions(res.data);
    } catch (err) {
      console.error('Error fetching applicable promotions:', err);
    }
  };

  const handleApplyPromotion = async (codeToApply) => {
    const code = codeToApply || promotionCode;
    if (!code) return;

    setPromoLoading(true);
    setPromoError('');
    try {
      const res = await promotionApi.apply(code, cart.items, 0);
      setAppliedPromotion(res.data);
      setFormData(prev => ({ ...prev, promotionCode: res.data.code }));
    } catch (err) {
      setPromoError(err.response?.data?.message || 'Không thể áp dụng mã khuyến mãi này');
      setAppliedPromotion(null);
      setFormData(prev => ({ ...prev, promotionCode: '' }));
    } finally {
      setPromoLoading(false);
    }
  };

  const handleCancelPromotion = () => {
    setAppliedPromotion(null);
    setPromotionCode('');
    setPromoError('');
    setFormData(prev => ({ ...prev, promotionCode: '' }));
  };

  if (cartLoading || !cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
      await clearCart(); 
      navigate(`/order-success/${order.id}`);
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng');
    } finally {
      setLoading(false);
    }
  };

  const discountAmount = appliedPromotion ? appliedPromotion.discountAmount : 0;
  const finalAmount = Math.max(0, cart.totalAmount - discountAmount);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link to="/cart" className="hover:text-primary transition-colors">Giỏ hàng</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-bold">Thanh toán</span>
      </div>

      <h1 className="text-4xl font-black mb-10 text-foreground flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
          <ShoppingBag className="w-8 h-8" />
        </div>
        Thanh toán đơn hàng
      </h1>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* Thông tin giao hàng */}
          <div className="bg-white dark:bg-card p-8 rounded-3xl border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                <Truck className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Thông tin giao hàng</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  Số điện thoại nhận hàng
                </label>
                <input
                  type="text"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="Nhập số điện thoại của bạn"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  Địa chỉ nhận hàng chi tiết
                </label>
                <textarea
                  name="shippingAddress"
                  required
                  rows="3"
                  value={formData.shippingAddress}
                  onChange={handleChange}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                ></textarea>
                <p className="text-xs text-muted-foreground italic flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Mẹo: Kiểm tra kỹ địa chỉ để shipper giao hàng nhanh nhất
                </p>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-foreground">Ghi chú (tùy chọn)</label>
                <input
                  type="text"
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="Lời nhắn cho shipper (ví dụ: Giao giờ hành chính)"
                />
              </div>
            </div>
          </div>

          {/* Phương thức thanh toán */}
          <div className="bg-white dark:bg-card p-8 rounded-3xl border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                <CreditCard className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Phương thức thanh toán</h2>
            </div>

            <div className="space-y-4">
              <label className={`flex items-center p-6 border-2 rounded-2xl cursor-pointer transition-all ${
                formData.paymentMethod === 'COD' 
                  ? 'border-primary bg-primary/5 shadow-md' 
                  : 'border-border hover:border-primary/50'
              }`}>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  formData.paymentMethod === 'COD' ? 'border-primary bg-primary' : 'border-muted-foreground'
                }`}>
                  {formData.paymentMethod === 'COD' && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={formData.paymentMethod === 'COD'}
                  onChange={handleChange}
                  className="hidden"
                />
                <div className="ml-4">
                  <p className="text-foreground font-black uppercase text-sm tracking-wide">Thanh toán khi nhận hàng (COD)</p>
                  <p className="text-muted-foreground text-xs mt-1">Phí thu hộ 0đ • Kiểm tra hàng trước khi trả tiền</p>
                </div>
              </label>
              
              <div className="flex items-center p-6 border-2 border-dashed border-border rounded-2xl opacity-40 grayscale cursor-not-allowed">
                <div className="w-6 h-6 rounded-full border-2 border-muted-foreground" />
                <div className="ml-4">
                  <p className="text-foreground font-black uppercase text-sm tracking-wide">Ví điện tử / Ngân hàng (MoMo, VNPAY)</p>
                  <p className="text-muted-foreground text-xs mt-1">Sắp ra mắt trong phiên bản tới</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-600">
            <ShieldCheck className="w-6 h-6 shrink-0" />
            <p className="text-sm font-medium">Mọi giao dịch trên PubliCast đều được bảo mật tuyệt đối 100%.</p>
          </div>
        </div>

        {/* Tóm tắt đơn hàng */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-card p-8 rounded-3xl border border-border shadow-xl sticky top-24">
            <h2 className="text-xl font-black mb-8 text-foreground border-b border-border pb-4 uppercase tracking-tighter">Đơn hàng của bạn ({itemCount})</h2>
            
            <div className="max-h-80 overflow-y-auto mb-8 space-y-5 pr-2 custom-scrollbar">
              {cart.items.map((item) => (
                <div key={item.productId} className="flex gap-4 items-center group">
                  <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden border border-border shadow-sm">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black w-5 h-5 rounded-bl-lg flex items-center justify-center shadow-lg">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-sm font-bold truncate">{item.name}</p>
                    <p className="text-muted-foreground text-xs font-medium">Đơn giá: {item.price.toLocaleString()}đ</p>
                  </div>
                  <p className="text-foreground text-sm font-black">{(item.price * item.quantity).toLocaleString()}đ</p>
                </div>
              ))}
            </div>

            {/* Khung áp dụng khuyến mãi */}
            <div className="border-t border-border pt-6 mb-6">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest block mb-2 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-primary" /> Mã giảm giá / Quà tặng
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  disabled={appliedPromotion}
                  value={promotionCode}
                  onChange={(e) => setPromotionCode(e.target.value)}
                  className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-foreground font-mono font-bold focus:ring-2 focus:ring-primary/20 outline-none uppercase text-sm"
                  placeholder="NHẬP VOUCHER"
                />
                {appliedPromotion ? (
                  <Button type="button" variant="destructive" onClick={handleCancelPromotion} className="rounded-xl px-4 font-bold h-10">Hủy</Button>
                ) : (
                  <Button type="button" onClick={() => handleApplyPromotion()} disabled={promoLoading || !promotionCode} className="rounded-xl px-4 font-bold h-10">Áp dụng</Button>
                )}
              </div>
              {promoError && <p className="text-xs text-red-500 font-semibold mt-1">{promoError}</p>}
              {appliedPromotion && <p className="text-xs text-emerald-600 font-bold mt-1.5">Đã áp dụng: {appliedPromotion.name}</p>}

              {/* Quà tặng đính kèm */}
              {appliedPromotion && appliedPromotion.giftItems && appliedPromotion.giftItems.length > 0 && (
                <div className="mt-4 bg-blue-50 dark:bg-blue-950/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30 space-y-2">
                  <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1"><Gift className="w-3 h-3" /> Quà tặng đi kèm:</p>
                  {appliedPromotion.giftItems.map((gift, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <img src={gift.imageUrl} alt={gift.name} className="w-8 h-8 object-cover rounded-lg border shadow-sm" />
                      <div className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 truncate flex-1">{gift.name}</div>
                      <div className="text-[11px] font-bold text-gray-900 dark:text-white">x{gift.quantity}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Danh sách Voucher khả dụng */}
              {applicablePromotions.length > 0 && !appliedPromotion && (
                <div className="mt-4">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase mb-2">Voucher khả dụng:</p>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {applicablePromotions.map((promo) => (
                      <div 
                        key={promo._id} 
                        onClick={() => { setPromotionCode(promo.code); handleApplyPromotion(promo.code); }}
                        className="p-2 border border-dashed border-border rounded-xl flex items-center justify-between cursor-pointer hover:bg-primary/5 hover:border-primary transition group"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-[10px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase">{promo.code}</span>
                          <p className="text-[10px] text-gray-500 font-semibold mt-1 truncate">{promo.name}</p>
                        </div>
                        <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition whitespace-nowrap ml-2">Áp dụng</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4 mb-8 pt-6 border-t border-border">
              <div className="flex justify-between text-muted-foreground text-sm font-medium">
                <span>Tạm tính</span>
                <span className="text-foreground">{cart.totalAmount.toLocaleString()}đ</span>
              </div>
              
              {appliedPromotion && (
                <div className="flex justify-between text-emerald-600 text-sm font-bold">
                  <span>Giảm giá</span>
                  <span>-{discountAmount.toLocaleString()}đ</span>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground text-sm font-medium">
                <span>Phí vận chuyển</span>
                <span className="text-green-600 font-black italic">Miễn phí</span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between items-end">
                <span className="text-muted-foreground text-xs font-black uppercase tracking-widest">Tổng cộng</span>
                <span className="text-3xl font-black text-primary leading-none tracking-tighter">{finalAmount.toLocaleString()}đ</span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/30 border-t-white"></div>
              ) : (
                'Hoàn tất đặt hàng'
              )}
            </Button>

            <p className="text-center text-[10px] text-muted-foreground mt-6 uppercase font-bold tracking-widest">
              Nhấn "Hoàn tất" đồng nghĩa bạn đồng ý với điều khoản của chúng tôi
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
