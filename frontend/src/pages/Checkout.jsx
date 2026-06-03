import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router';
import { Truck, Phone, MapPin, CreditCard, ChevronRight, Package, ShieldCheck, AlertCircle, ShoppingBag, Tag, Trash, Coins, X, ArrowLeft, Loader2, Zap } from 'lucide-react';
import orderService from '../services/order.service';
import { promotionApi } from '../services/promotion.service';
import locationService from '../services/location.service';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { getAddresses } from '../services/user.service';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

import CheckoutSkeleton from './Checkout/components/CheckoutSkeleton';
import AddressSelector from './Checkout/components/AddressSelector';
import OrderSummaryFocus from './Checkout/components/OrderSummaryFocus';
import PromotionInput from './Checkout/components/PromotionInput';

const Checkout = () => {
  const { cart, loading: cartLoading, clearCart, itemCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacing, setIsPlacing] = useState(false);
  
  const [formData, setFormData] = useState({
    phone: '',
    note: '',
    paymentMethod: 'COD'
  });

  // Multiple addresses states
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [isNewAddress, setIsNewAddress] = useState(false);

  // Address details & Map (API v2 - không còn quận/huyện)
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [coordinates, setCoordinates] = useState({ lat: 10.8231, lng: 106.6297 });

  // Map state
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [tempCoordinates, setTempCoordinates] = useState(null);
  const [tempAddress, setTempAddress] = useState('');
  const [tempComponents, setTempComponents] = useState(null);
  const [geocoding, setGeocoding] = useState(false);
  const mapRef = useRef(null);

  // Auto-mapping refs
  const targetDistrictName = useRef('');
  const targetWardName = useRef('');

  // Promotion states
  const [promotionCode, setPromotionCode] = useState('');
  const [appliedPromotion, setAppliedPromotion] = useState(null);
  const [applicablePromotions, setApplicablePromotions] = useState([]);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  useEffect(() => {
    if (!cartLoading && (!cart || !cart.items || cart.items.length === 0)) {
      toast.error('Giỏ hàng của bạn đang trống');
      navigate('/cart');
    }
  }, [cart, cartLoading, navigate]);

  const [locationLoading, setLocationLoading] = useState(false);

  // Load initial data (Addresses, Provinces)
  useEffect(() => {
    const loadStaticData = async () => {
      try {
        const [addrRes, provData] = await Promise.all([
          getAddresses(),
          locationService.getProvinces()
        ]);

        const addrList = addrRes.data?.addresses || addrRes.addresses || addrRes;
        setAddresses(addrList || []);
        setProvinces(provData || []);

        if (addrList?.length > 0) {
          const defaultAddr = addrList.find(a => a.isDefault) || addrList[0];
          setSelectedAddressId(defaultAddr._id);
          setFormData(prev => ({ ...prev, phone: defaultAddr.phone }));
        } else {
          setIsNewAddress(true);
          if (user?.phone) setFormData(prev => ({ ...prev, phone: user.phone }));
        }
      } catch (err) {
        console.error('Lỗi tải dữ liệu tĩnh:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) loadStaticData();
  }, [user]);

  // Load applicable promotions when cart items are ready
  useEffect(() => {
    const loadPromotions = async () => {
      if (!cart?.items?.length) return;
      try {
        const promoRes = await promotionApi.getApplicable(cart.items, 0);
        setApplicablePromotions(promoRes.data || []);
      } catch (err) {
        console.error('Lỗi tải khuyến mãi:', err);
      }
    };
    loadPromotions();
  }, [cart?.items]);

  const handleApplyPromotion = async (codeOverride) => {
    const codeToApply = codeOverride || promotionCode;
    if (!codeToApply) return;
    setPromoLoading(true);
    setPromoError('');
    try {
      const res = await promotionApi.apply(codeToApply, cart.items, 0);
      setAppliedPromotion({
        code: codeToApply,
        discountAmount: res.data.discountAmount,
        type: res.data.type
      });
      toast.success(`Đã áp dụng mã ${codeToApply}!`);
    } catch (err) {
      setPromoError(err.message || 'Mã khuyến mãi không hợp lệ');
      setAppliedPromotion(null);
    } finally {
      setPromoLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId && isNewAddress && (!selectedProvince || !selectedWard || !streetAddress || !formData.phone)) {
      toast.error('Vui lòng nhập đầy đủ địa chỉ giao hàng (tỉnh, phường/xã, số nhà, số điện thoại)');
      return;
    }
    
    setIsPlacing(true);
    try {
      const orderData = {
        paymentMethod: formData.paymentMethod,
        note: formData.note,
        promotionCode: appliedPromotion?.code || null
      };

      if (isNewAddress) {
        orderData.newAddress = {
          province: provinces.find(p => p.code.toString() === selectedProvince)?.name || '',
          ward: wards.find(w => w.code.toString() === selectedWard)?.name || '',
          street: streetAddress,
          phone: formData.phone,
          coordinates
        };
      } else {
        orderData.addressId = selectedAddressId;
      }

      const res = await orderService.placeOrder(orderData);
      clearCart();
      toast.success('Đặt hàng thành công!');
      navigate(`/order-success?id=${res.data.id || res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng');
    } finally {
      setIsPlacing(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Trình duyệt của bạn không hỗ trợ định vị');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newCoords = { lat: latitude, lng: longitude };
        
        setTempCoordinates(newCoords);
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 18);
          // Find the marker and update it
          mapRef.current.eachLayer((layer) => {
            if (layer instanceof L.Marker) layer.setLatLng([latitude, longitude]);
          });
        }
        reverseGeocode(latitude, longitude);
        setLocationLoading(false);
        toast.success('Đã xác định vị trí hiện tại');
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Không thể lấy vị trí. Vui lòng cho phép quyền truy cập vị trí.');
        setLocationLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // Normalize tên hành chính VN: bỏ prefix Tỉnh/Thành phố/Phường/Xã/Quận...
  const normalizeAdminName = (str = '') =>
    str
      .toLowerCase()
      .replace(/^(thành phố|tp\.?|tỉnh|quận|huyện|thị xã|phường|xã|thị trấn|khu phố)\s+/i, '')
      .trim();

  // Map logic functions
  const reverseGeocode = async (lat, lng) => {
    setGeocoding(true);
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=vi`
      );
      if (res.data) {
        const addr = res.data.address;
        setTempAddress(res.data.display_name);

        // VN Nominatim: state = tỉnh/thành, city = quận/thành phố con, suburb/quarter = phường
        setTempComponents({
          province: addr.state || addr.province || addr.city || '',
          district: addr.city || addr.city_district || addr.county || addr.district || addr.suburb || '',
          ward: addr.quarter || addr.neighbourhood || addr.suburb || addr.village || ''
        });
      }
    } catch (err) {
      console.error('Lỗi định vị địa chỉ:', err);
    } finally {
      setGeocoding(false);
    }
  };

  const handleMapConfirm = () => {
    if (tempCoordinates && tempComponents) {
      setCoordinates(tempCoordinates);
      setStreetAddress(tempAddress);

      const normProvince = normalizeAdminName(tempComponents.province);

      // Match tỉnh/thành: normalize cả 2 phía trước khi so sánh
      const matchedProv = provinces.find((p) => {
        const normP = normalizeAdminName(p.name);
        return normP === normProvince ||
          normP.includes(normProvince) ||
          normProvince.includes(normP);
      });

      if (matchedProv) {
        setSelectedProvince(matchedProv.code.toString());
        // Lưu cả district và ward để useEffect fetchWards dùng
        targetDistrictName.current = tempComponents.district;
        targetWardName.current = tempComponents.ward;
      } else {
        toast.error('Không tìm được tỉnh/thành tương ứng. Vui lòng chọn thủ công.');
      }

      setIsMapModalOpen(false);
      toast.success('Đã cập nhật vị trí — đang tự động điền thông tin...');
    }
  };

  // Fetch wards khi province thay đổi (API v2 — Flattened view, bỏ qua bước chọn Quận)
  useEffect(() => {
    const fetchWards = async () => {
      if (!selectedProvince) {
        setWards([]);
        return;
      }
      try {
        const data = await locationService.getWards(selectedProvince);
        const wardsList = data || [];
        setWards(wardsList);

        // Auto-map phường từ bản đồ (không cần quận trung gian)
        if (targetWardName.current) {
          const normWard = normalizeAdminName(targetWardName.current);

          const matchedWard = wardsList.find((w) => {
            const normW = normalizeAdminName(w.name);
            return normW === normWard ||
              normW.includes(normWard) ||
              normWard.includes(normW);
          });

          if (matchedWard) setSelectedWard(matchedWard.code.toString());

          // Reset sau khi đã dùng
          targetDistrictName.current = '';
          targetWardName.current = '';
        }
      } catch (err) {
        console.error('Lỗi tải dữ liệu hành chính:', err);
        toast.error("Lỗi kết nối máy chủ địa chỉ. Vui lòng thử lại sau.");
      }
    };
    fetchWards();
  }, [selectedProvince]);

  useEffect(() => {
    if (isMapModalOpen && !mapRef.current) {
      setTimeout(() => {
        const container = document.getElementById('checkout-map');
        if (!container) return;

        const map = L.map(container).setView([coordinates.lat, coordinates.lng], 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap'
        }).addTo(map);

        const marker = L.marker([coordinates.lat, coordinates.lng], { draggable: true }).addTo(map);

        marker.on('dragend', (e) => {
          const pos = e.target.getLatLng();
          setTempCoordinates({ lat: pos.lat, lng: pos.lng });
          reverseGeocode(pos.lat, pos.lng);
        });

        map.on('click', (e) => {
          marker.setLatLng(e.latlng);
          setTempCoordinates({ lat: e.latlng.lat, lng: e.latlng.lng });
          reverseGeocode(e.latlng.lat, e.latlng.lng);
        });

        mapRef.current = map;
        setTempCoordinates(coordinates);
        reverseGeocode(coordinates.lat, coordinates.lng);
      }, 100);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isMapModalOpen]);

  if (isLoading || cartLoading) return <CheckoutSkeleton />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      {/* Focus Mode Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-6 mb-12 sticky top-0 z-50 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <Link to="/cart" className="flex items-center gap-3 text-slate-400 hover:text-blue-600 transition-all group">
            <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-blue-50">
               <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">Quay lại giỏ hàng</span>
          </Link>
          <div className="text-center">
             <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Thanh toán</h1>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">An toàn • Bảo mật • Nhanh chóng</p>
          </div>
          <div className="w-24 hidden sm:block" /> {/* Spacer */}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Left Column: Form Sections */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Address Section */}
            <section className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
              <AddressSelector 
                addresses={addresses}
                selectedId={selectedAddressId}
                onSelect={(id) => {
                  setSelectedAddressId(id);
                  setIsNewAddress(false);
                  const addr = addresses.find(a => a._id === id);
                  if (addr) setFormData(prev => ({ ...prev, phone: addr.phone }));
                }}
                onAddNew={() => {
                  setIsNewAddress(true);
                  setSelectedAddressId('');
                  if (user?.phone) setFormData(prev => ({ ...prev, phone: user.phone }));
                }}
                isNewAddress={isNewAddress}
              />

              <AnimatePresence>
                {isNewAddress && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-10 pt-10 border-t border-slate-50 dark:border-slate-800"
                  >
                    <div className="flex justify-between items-center mb-8">
                       <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Cấu hình địa chỉ mới</p>
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         onClick={() => setIsMapModalOpen(true)}
                         className="rounded-xl font-black uppercase text-[9px] tracking-widest text-emerald-600 hover:bg-emerald-50"
                       >
                         <MapPin className="w-3.5 h-3.5 mr-1.5" /> Chọn từ bản đồ
                       </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Số điện thoại nhận hàng</label>
                        <input 
                          type="text" 
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Ví dụ: 0912345678"
                          className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-600/20 outline-none text-sm font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Tỉnh / Thành phố</label>
                        <select 
                          value={selectedProvince}
                          onChange={(e) => { setSelectedProvince(e.target.value); setSelectedWard(''); }}
                          className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-600/20 outline-none text-sm font-bold appearance-none"
                        >
                          <option value="">Chọn tỉnh thành</option>
                          {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Phường / Xã</label>
                        <select 
                          value={selectedWard}
                          disabled={!selectedProvince}
                          onChange={(e) => setSelectedWard(e.target.value)}
                          className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-600/20 outline-none text-sm font-bold appearance-none disabled:opacity-50"
                        >
                          <option value="">Chọn phường xã</option>
                          {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Địa chỉ chi tiết (Số nhà, tên đường)</label>
                        <input 
                          type="text" 
                          value={streetAddress}
                          onChange={(e) => setStreetAddress(e.target.value)}
                          placeholder="Ví dụ: 123 Đường ABC"
                          className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-600/20 outline-none text-sm font-bold"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Payment Method Section */}
            <section className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8">Phương thức thanh toán</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: 'COD', label: 'Tiền mặt (COD)', icon: Truck, desc: 'Thanh toán khi nhận hàng' },
                  { id: 'BANK_TRANSFER', label: 'Chuyển khoản', icon: CreditCard, desc: 'Quét mã QR hoặc ATM' }
                ].map((method) => (
                  <label 
                    key={method.id}
                    className={`relative p-6 rounded-[2rem] border cursor-pointer transition-all duration-500 flex flex-col gap-4 ${
                      formData.paymentMethod === method.id 
                        ? 'bg-blue-50/50 border-blue-600 dark:bg-blue-900/10 shadow-lg shadow-blue-600/5' 
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-blue-200'
                    }`}
                  >
                    <input 
                      type="radio" 
                      className="hidden" 
                      name="paymentMethod" 
                      value={method.id}
                      checked={formData.paymentMethod === method.id}
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    />
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                      formData.paymentMethod === method.id ? 'bg-blue-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'
                    }`}>
                      <method.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{method.label}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{method.desc}</p>
                    </div>
                    {formData.paymentMethod === method.id && (
                       <div className="absolute top-6 right-6 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg">
                          <Check className="w-3 h-3 stroke-[4px]" />
                       </div>
                    )}
                  </label>
                ))}
              </div>
            </section>

            {/* Note & Promotion Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8 flex items-center gap-2">
                   Ghi chú đơn hàng
                </h3>
                <textarea 
                  value={formData.note}
                  onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="Lời nhắn cho shipper hoặc shop..."
                  className="flex-1 w-full p-6 bg-slate-50 dark:bg-slate-800 border border-slate-100 rounded-[2rem] focus:ring-2 focus:ring-blue-600/20 outline-none text-sm font-medium resize-none min-h-[120px]"
                />
              </section>

              <section className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                <PromotionInput 
                  code={promotionCode}
                  setCode={setPromotionCode}
                  onApply={handleApplyPromotion}
                  isLoading={promoLoading}
                  error={promoError}
                  applied={!!appliedPromotion}
                  onRemove={() => {
                    setAppliedPromotion(null);
                    setPromotionCode('');
                  }}
                  applicablePromotions={applicablePromotions}
                  onQuickApply={(code) => {
                    setPromotionCode(code);
                    handleApplyPromotion(code);
                  }}
                />
              </section>
            </div>
          </div>

          {/* Right Column: Summary Sticky */}
          <aside className="lg:col-span-1">
             <OrderSummaryFocus 
               cart={cart}
               itemCount={itemCount}
               onPlaceOrder={handlePlaceOrder}
               isPlacing={isPlacing}
               appliedPromotion={appliedPromotion}
             />
          </aside>
        </div>
      </main>

      {/* Map Modal - Liquid Glass */}
      <AnimatePresence>
        {isMapModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setIsMapModalOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[3rem] shadow-2xl border border-white/20 relative z-10 overflow-hidden flex flex-col max-h-full"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl text-emerald-600">
                      <MapPin className="w-6 h-6" />
                   </div>
                   <div>
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Định vị địa chỉ</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Kéo thả ghim hoặc sử dụng GPS để lấy vị trí chính xác</p>
                   </div>
                </div>
                <div className="flex gap-3">
                   <Button 
                     variant="outline" 
                     size="sm" 
                     onClick={handleGetCurrentLocation}
                     disabled={locationLoading}
                     className="rounded-xl font-black uppercase text-[9px] tracking-widest border-slate-100 hover:bg-blue-50"
                   >
                     {locationLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> : <Zap className="w-3 h-3 mr-1.5 text-blue-600" />}
                     Sử dụng GPS
                   </Button>
                   <button onClick={() => setIsMapModalOpen(false)} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 hover:text-slate-900 transition-all">
                     <X className="w-5 h-5" />
                   </button>
                </div>
              </div>

              <div id="checkout-map" className="flex-1 min-h-[400px] z-0 shadow-inner" />

              <div className="p-8 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-800 shrink-0">
                 <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-1 space-y-2">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vị trí hiện tại:</p>
                       <div className="flex items-center gap-3">
                          {geocoding ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 line-clamp-2">{tempAddress || 'Đang lấy địa chỉ...'}</p>
                       </div>
                    </div>
                    <Button 
                      onClick={handleMapConfirm}
                      disabled={geocoding || !tempAddress}
                      className="w-full md:w-auto h-14 px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20"
                    >
                      Xác nhận vị trí
                    </Button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Processing Overlay */}
      <AnimatePresence>
        {isPlacing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-xl"
          >
            <div className="text-center space-y-8">
               <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 border-8 border-blue-100 rounded-full" />
                  <div className="absolute inset-0 border-8 border-blue-600 rounded-full border-t-transparent animate-spin" />
               </div>
               <div className="space-y-2">
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Đang xử lý đơn hàng</h2>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">Vui lòng không tắt trình duyệt</p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function CheckCircle2({ className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function Check({ className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export default Checkout;
