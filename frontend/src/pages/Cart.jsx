import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router';
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft, ChevronRight, Package, CreditCard, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/button';

const Cart = () => {
  const { cart, loading, updateQuantity, removeFromCart, clearCart, itemCount } = useCart();

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-muted border-t-primary"></div>
        <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.2em] animate-pulse">Đang cập nhật giỏ hàng...</p>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="w-28 h-28 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-10 border border-primary/10 shadow-inner">
          <ShoppingCart className="w-12 h-12 text-primary/40" />
        </div>
        <h2 className="text-4xl font-black text-foreground mb-4 tracking-tighter uppercase">Giỏ hàng trống</h2>
        <p className="text-muted-foreground mb-12 max-w-sm mx-auto font-medium leading-relaxed">Bạn chưa thêm sản phẩm nào vào giỏ hàng. Hãy lấp đầy nó bằng những món đồ yêu thích nhé!</p>
        <Link to="/">
          <Button size="lg" className="rounded-2xl px-12 h-16 font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/20 hover:scale-105 transition-transform">
            Tiếp tục mua sắm
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center gap-2 text-sm text-muted-foreground font-bold uppercase tracking-widest mb-10">
        <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground">Giỏ hàng của bạn</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-foreground tracking-tighter flex items-center gap-5">
            <div className="p-4 bg-primary/10 rounded-[2rem] text-primary">
              <ShoppingCart className="w-10 h-10" />
            </div>
            Giỏ hàng
          </h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2 pl-2">
            <Package className="w-4 h-4 text-primary" />
            Bạn đang có <span className="text-foreground font-black underline decoration-primary decoration-4 underline-offset-4">{itemCount}</span> sản phẩm trong túi
          </p>
        </div>
        <Button 
          variant="ghost" 
          onClick={clearCart}
          className="text-muted-foreground hover:text-destructive font-black uppercase text-[10px] tracking-widest hover:bg-destructive/5 rounded-xl h-10"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Làm trống giỏ hàng
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {cart.items.map((item, index) => (
            <div 
              key={item.productId} 
              className="bg-white dark:bg-card p-6 md:p-8 rounded-[2.5rem] flex flex-col sm:flex-row items-center gap-8 border border-border shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500 group animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative w-32 h-32 md:w-40 md:h-40 shrink-0 rounded-3xl overflow-hidden border border-border bg-slate-50 shadow-inner group-hover:scale-105 transition-transform duration-500">
                <img
                  src={item.imageUrl || '/placeholder-product.png'}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0 w-full text-center sm:text-left space-y-4">
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-foreground tracking-tight line-clamp-1 group-hover:text-primary transition-colors cursor-pointer">{item.name}</h3>
                  <p className="text-primary font-black text-lg mt-1 tracking-tight">{item.price.toLocaleString()}đ</p>
                </div>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6">
                  <div className="flex items-center bg-accent/50 p-1.5 rounded-2xl border border-border shadow-inner">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-background text-foreground shadow-sm hover:bg-primary hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-black text-foreground text-lg">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-background text-foreground shadow-sm hover:bg-primary hover:text-white transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="flex items-center gap-2 text-muted-foreground hover:text-destructive font-black uppercase text-[10px] tracking-widest transition-colors py-2 px-4 rounded-xl hover:bg-destructive/5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Xóa khỏi giỏ
                  </button>
                </div>
              </div>

              <div className="text-right shrink-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-border w-full sm:w-auto">
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Thành tiền</p>
                <p className="text-3xl font-black text-foreground tracking-tighter">{(item.price * item.quantity).toLocaleString()}đ</p>
              </div>
            </div>
          ))}
          
          <Link to="/" className="inline-flex items-center gap-3 text-slate-400 hover:text-primary transition-all font-black uppercase text-[10px] tracking-[0.2em] group mt-8">
            <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-all">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
            Tiếp tục mua hàng
          </Link>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-card p-10 rounded-[3rem] border border-border shadow-2xl sticky top-24 overflow-hidden">
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
            
            <h2 className="text-2xl font-black mb-10 text-foreground uppercase tracking-tight border-b border-border pb-6 relative z-10">Tóm tắt đơn hàng</h2>
            
            <div className="space-y-6 mb-10 relative z-10">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-bold text-sm uppercase tracking-widest">Tạm tính</span>
                <span className="text-foreground font-black text-lg">{cart.totalAmount.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-bold text-sm uppercase tracking-widest">Vận chuyển</span>
                <span className="text-green-600 font-black text-sm uppercase tracking-widest bg-green-500/10 px-3 py-1 rounded-lg italic">Miễn phí</span>
              </div>
              
              <div className="pt-6 border-t border-border flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <span className="text-muted-foreground font-black text-xs uppercase tracking-[0.2em]">Tổng cộng</span>
                  <span className="text-4xl font-black text-primary leading-none tracking-tighter">{cart.totalAmount.toLocaleString()}đ</span>
                </div>
                <p className="text-[10px] text-muted-foreground italic text-right mt-2">(Đã bao gồm thuế VAT nếu có)</p>
              </div>
            </div>

            <Link
              to="/checkout"
              className="block group"
            >
              <Button className="w-full h-16 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-primary/20 relative overflow-hidden group-hover:scale-[1.02] transition-transform">
                <span className="relative z-10 flex items-center justify-center gap-3">
                  Thanh toán ngay
                  <CreditCard className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </span>
              </Button>
            </Link>

            <div className="mt-10 pt-8 border-t border-dashed border-border space-y-4">
              <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-accent/20 rounded-2xl">
                <ShieldCheck className="w-6 h-6 text-green-600 shrink-0" />
                <div>
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-1">Bảo mật tuyệt đối</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed">Thông tin cá nhân & thanh toán của bạn luôn được mã hóa 100%.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
