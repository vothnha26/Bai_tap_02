import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router';
import { Truck, Phone, MapPin, CreditCard, ChevronRight, Package, ShieldCheck, AlertCircle, ShoppingBag, Tag, Gift, Trash, Coins } from 'lucide-react';
import orderService from '../services/order.service';
import { promotionApi } from '../services/promotion.service';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { getAddresses } from '../services/user.service';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const Checkout = () => {
  const { cart, loading: cartLoading, clearCart, itemCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    note: '',
    paymentMethod: 'COD',
    promotionCode: ''
  });

  // State cho multiple addresses
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [isNewAddress, setIsNewAddress] = useState(false);

  // Địa chỉ chi tiết và Bản đồ
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [coordinates, setCoordinates] = useState({ lat: 10.8231, lng: 106.6297 }); // Mặc định TP.HCM

  // Map state
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [tempCoordinates, setTempCoordinates] = useState(null);
  const [tempAddress, setTempAddress] = useState('');
  const [geocoding, setGeocoding] = useState(false);
  const mapRef = useRef(null);

  // Promotion states
  const [promotionCode, setPromotionCode] = useState('');
  const [appliedPromotion, setAppliedPromotion] = useState(null);
  const [applicablePromotions, setApplicablePromotions] = useState([]);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  // Lấy danh sách địa chỉ đã lưu của user
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const res = await getAddresses();
        const addrList = res.data?.addresses || res.addresses || res;
        setAddresses(addrList || []);
        
        if (addrList && addrList.length > 0) {
          // Tìm địa chỉ mặc định
          const defaultAddr = addrList.find(a => a.isDefault);
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr._id);
          } else {
            setSelectedAddressId(addrList[0]._id);
          }
          setIsNewAddress(false);
        } else {
          setIsNewAddress(true);
        }
      } catch (err) {
        console.error('Lỗi tải danh sách địa chỉ:', err);
        setIsNewAddress(true);
      }
    };

    if (user) {
      setFormData(prev => ({
        ...prev,
        phone: user.phone || ''
      }));
      loadAddresses();
    }
  }, [user]);

  // Load danh sách tỉnh
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await axios.get('https://provinces.open-api.vn/api/v2/p/');
        const data = res.data || [];
        setProvinces(data);
        
        if (user?.address && typeof user.address === 'string' && !selectedProvince) {
          const parts = user.address.split(',').map(p => p.trim());
          const provinceName = parts[parts.length - 1];
          const matched = findBestMatch(provinceName, data, 'province');
          if (matched) setSelectedProvince(matched.code.toString());
        }
      } catch (err) {
        console.error('Lỗi tải danh sách tỉnh thành:', err);
      }
    };
    fetchProvinces();
  }, [user]);

  // Load danh sách xã khi tỉnh thay đổi (API v2 loại bỏ cấp Quận/Huyện)
  useEffect(() => {
    if (!selectedProvince) {
      setWards([]);
      return;
    }
    const fetchWards = async () => {
      try {
        const res = await axios.get(`https://provinces.open-api.vn/api/v2/p/${selectedProvince}?depth=2`);
        const data = res.data.wards || [];
        setWards(data);
        
        if (user?.address && typeof user.address === 'string' && !selectedWard) {
          const parts = user.address.split(',').map(p => p.trim());
          for (let i = parts.length - 2; i >= 0; i--) {
            const matched = findBestMatch(parts[i], data, 'ward');
            if (matched) {
              setSelectedWard(matched.code.toString());
              break;
            }
          }
        }
      } catch (err) {
        console.error('Lỗi tải danh sách phường xã:', err);
      }
    };
    fetchWards();
  }, [selectedProvince, user]);

  // Logic map Leaflet
  useEffect(() => {
    if (!isMapModalOpen) return;
    
    const timer = setTimeout(() => {
      if (!mapRef.current) return;
      
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      const currentCoords = tempCoordinates || coordinates;
      const map = L.map(mapRef.current).setView([currentCoords.lat, currentCoords.lng], 15);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      let marker = L.marker([currentCoords.lat, currentCoords.lng], { draggable: true }).addTo(map);

      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        handleLocationSelect(lat, lng);
      });

      marker.on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng();
        handleLocationSelect(lat, lng);
      });
      
      return () => {
        map.remove();
      };
    }, 200);

    return () => clearTimeout(timer);
  }, [isMapModalOpen]);

  const handleLocationSelect = async (lat, lng) => {
    setTempCoordinates({ lat, lng });
    setGeocoding(true);
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: { 'Accept-Language': 'vi' }
      });
      if (res.data) {
        setTempAddress(res.data.display_name);
      }
    } catch (err) {
      console.error('Lỗi định vị địa chỉ:', err);
    } finally {
      setGeocoding(false);
    }
  };

  const cleanName = (name) => {
    if (!name) return '';
    return name.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/^(tinh|thanh pho|quan|huyen|thi xa|thi tran|phuong|xa|duong|district|city|province|ward|county|suburb|quarter|neighbourhood|village|town)\s+/gi, '')
      .replace(/\s+(tinh|thanh pho|quan|huyen|thi xa|thi tran|phuong|xa|duong|district|city|province|ward|county|suburb|quarter|neighbourhood|village|town)$/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const findBestMatch = (osmName, list, type = 'district') => {
    if (!osmName || !list || list.length === 0) return null;
    const cleanOSM = cleanName(osmName);
    
    const exactMatch = list.find(item => cleanName(item.name) === cleanOSM);
    if (exactMatch) return exactMatch;
    
    const subMatch = list.find(item => {
      const cleanItem = cleanName(item.name);
      return cleanOSM.includes(cleanItem) || cleanItem.includes(cleanOSM);
    });
    if (subMatch) return subMatch;

    if (type === 'district' && (cleanOSM.includes('thu duc') || cleanOSM === '2' || cleanOSM === '9')) {
      return list.find(item => cleanName(item.name).includes('thu duc'));
    }

    return null;
  };

  const confirmMapSelection = async () => {
    if (!tempCoordinates) return;
    
    setCoordinates(tempCoordinates);
    setIsMapModalOpen(false);

    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${tempCoordinates.lat}&lon=${tempCoordinates.lng}&zoom=18&addressdetails=1`, {
        headers: { 'Accept-Language': 'vi' }
      });
      
      if (res.data && res.data.address) {
        const addr = res.data.address;
        const displayName = res.data.display_name || '';
        
        // 1. Match Tỉnh/Thành phố
        const osmProvince = addr.city || addr.state || addr.province || addr.city_district || '';
        let matchedProv = findBestMatch(osmProvince, provinces, 'province');
        
        if (!matchedProv) {
          const parts = displayName.split(',').map(p => p.trim());
          for (const part of parts.slice(-3)) {
            matchedProv = findBestMatch(part, provinces, 'province');
            if (matchedProv) break;
          }
        }
        
        if (matchedProv) {
          const provCode = matchedProv.code.toString();
          setSelectedProvince(provCode);
          
          const wardRes = await axios.get(`https://provinces.open-api.vn/api/v2/p/${provCode}?depth=2`);
          const tempWards = wardRes.data.wards || [];
          setWards(tempWards);
          
          // 2. Match Phường/Xã
          const osmWardCandidates = [addr.ward, addr.quarter, addr.suburb, addr.village, addr.town, addr.neighbourhood];
          let matchedWard = null;
          
          for (const candidate of osmWardCandidates) {
            if (!candidate) continue;
            matchedWard = findBestMatch(candidate, tempWards, 'ward');
            if (matchedWard) break;
          }
          
          if (!matchedWard) {
            const parts = displayName.split(',').map(p => p.trim());
            for (const part of parts.slice(0, 4)) {
              matchedWard = findBestMatch(part, tempWards, 'ward');
              if (matchedWard) break;
            }
          }
          
          if (matchedWard) {
            setSelectedWard(matchedWard.code.toString());
          }
        }
        
        const streetParts = [];
        if (addr.house_number) streetParts.push(addr.house_number);
        if (addr.road) streetParts.push(addr.road);
        
        if (streetParts.length > 0) {
          setStreetAddress(streetParts.join(' '));
        } else {
          const firstPart = displayName.split(',')[0] || '';
          const isGeneric = ['phuong', 'quan', 'thanh pho', 'huyen', 'xa'].some(k => firstPart.toLowerCase().includes(k));
          if (!isGeneric) {
            setStreetAddress(firstPart);
          }
        }
      }
    } catch (err) {
      console.error('Lỗi phân tích địa chỉ:', err);
    }
  };

  const openMapModal = () => {
    setIsMapModalOpen(true);
    setTempAddress('Đang xác định vị trí hiện tại...');
    setGeocoding(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const coords = { lat: latitude, lng: longitude };
          setTempCoordinates(coords);
          handleLocationSelect(latitude, longitude);
        },
        (error) => {
          console.warn('Không lấy được vị trí GPS, dùng vị trí mặc định:', error);
          setTempCoordinates(coordinates);
          handleLocationSelect(coordinates.lat, coordinates.lng);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setTempCoordinates(coordinates);
      handleLocationSelect(coordinates.lat, coordinates.lng);
    }
  };

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

    let shippingAddress;

    if (isNewAddress) {
      if (!selectedProvince || !selectedWard || !streetAddress.trim()) {
        alert('Vui lòng nhập đầy đủ thông tin địa chỉ nhận hàng (Tỉnh/Thành phố, Phường/Xã và Số nhà/Tên đường).');
        setLoading(false);
        return;
      }
      shippingAddress = {
        province: provinces.find(p => p.code.toString() === selectedProvince)?.name || '',
        district: '',
        ward: wards.find(w => w.code.toString() === selectedWard)?.name || '',
        street: streetAddress.trim(),
        coordinates: coordinates
      };
    } else {
      const selectedAddr = addresses.find(a => a._id === selectedAddressId);
      if (!selectedAddr) {
        alert('Vui lòng chọn địa chỉ nhận hàng!');
        setLoading(false);
        return;
      }
      shippingAddress = {
        province: selectedAddr.province,
        district: '',
        ward: selectedAddr.ward,
        street: selectedAddr.street,
        coordinates: selectedAddr.coordinates || { lat: 10.8231, lng: 106.6297 }
      };
    }

    const orderPayload = {
      ...formData,
      shippingAddress
    };

    try {
      const order = await orderService.createOrder(orderPayload);
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
              <div className="space-y-2 flex flex-col">
                <label className="text-sm font-bold text-foreground flex items-center gap-2 mb-1">
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
                  autoComplete="tel"
                />
              </div>

              {/* Multiple Addresses Selection */}
              {addresses.length > 0 && (
                <div className="md:col-span-2 space-y-3">
                  <label className="text-sm font-bold text-foreground block mb-2">Chọn địa chỉ nhận hàng</label>
                  <div className="grid grid-cols-1 gap-3">
                    {addresses.map((addr) => (
                      <label 
                        key={addr._id} 
                        className={`flex items-start p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                          !isNewAddress && selectedAddressId === addr._id 
                            ? 'border-primary bg-primary/5 shadow-sm' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="mt-1 flex items-center justify-center">
                          <input
                            type="radio"
                            name="checkoutAddress"
                            checked={!isNewAddress && selectedAddressId === addr._id}
                            onChange={() => {
                              setSelectedAddressId(addr._id);
                              setIsNewAddress(false);
                            }}
                            className="w-4 h-4 text-primary focus:ring-primary/20"
                          />
                        </div>
                        <div className="ml-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground text-sm capitalize">{addr.street}</span>
                            {addr.isDefault && (
                              <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[9px] font-black uppercase rounded">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <p className="text-muted-foreground text-xs mt-1">{addr.fullText}</p>
                        </div>
                      </label>
                    ))}

                    <label 
                      className={`flex items-start p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                        isNewAddress 
                          ? 'border-primary bg-primary/5 shadow-sm' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="mt-1 flex items-center justify-center">
                        <input
                          type="radio"
                          name="checkoutAddress"
                          checked={isNewAddress}
                          onChange={() => setIsNewAddress(true)}
                          className="w-4 h-4 text-primary focus:ring-primary/20"
                        />
                      </div>
                      <div className="ml-3">
                        <span className="font-bold text-foreground text-sm">Nhập địa chỉ mới</span>
                        <p className="text-muted-foreground text-xs mt-1">Sử dụng địa chỉ nhận hàng khác chưa được lưu</p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {isNewAddress && (
                <>
                  {/* Tích hợp ghim bản đồ trực quan */}
                  <div className="md:col-span-2 flex justify-between items-center bg-primary/5 p-5 rounded-2xl border border-primary/10">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-foreground">Bạn muốn ghim vị trí trên bản đồ?</p>
                        <p className="text-xs text-muted-foreground font-medium">Tự động điền địa chỉ & định vị tọa độ giao hàng chính xác</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={openMapModal}
                      className="bg-primary hover:bg-primary/95 text-white text-xs font-black px-4 py-3 rounded-xl flex items-center gap-1.5 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                      🗺️ Ghim bản đồ
                    </button>
                  </div>

                  {/* Dropdowns địa chỉ 3 cấp */}
                  <div className="space-y-2 flex flex-col">
                    <label className="text-sm font-bold text-foreground flex items-center gap-1.5 mb-1">
                      Tỉnh / Thành phố <span className="text-red-500">*</span>
                    </label>
                    <select
                      required={isNewAddress}
                      value={selectedProvince}
                      onChange={(e) => {
                        setSelectedProvince(e.target.value);
                        setSelectedWard('');
                      }}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold"
                    >
                      <option value="">Chọn Tỉnh / Thành phố</option>
                      {provinces.map(p => (
                        <option key={p.code} value={p.code}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 flex flex-col">
                    <label className="text-sm font-bold text-foreground flex items-center gap-1.5 mb-1">
                      Phường / Xã / Thị trấn <span className="text-red-500">*</span>
                    </label>
                    <select
                      required={isNewAddress}
                      disabled={!selectedProvince}
                      value={selectedWard}
                      onChange={(e) => setSelectedWard(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-50 text-sm font-semibold"
                    >
                      <option value="">Chọn Phường / Xã</option>
                      {wards.map(w => (
                        <option key={w.code} value={w.code}>{w.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 flex flex-col">
                    <label className="text-sm font-bold text-foreground flex items-center gap-1.5 mb-1">
                      Số nhà, ngõ, tên đường <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required={isNewAddress}
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-semibold"
                      placeholder="Ví dụ: Số 97 Man Thiện"
                    />
                  </div>
                </>
              )}

              <div className="md:col-span-2 space-y-2 flex flex-col">
                <label className="text-sm font-bold text-foreground mb-1">Ghi chú (tùy chọn)</label>
                <input
                  type="text"
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
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

              {cart.totalRewardPoints > 0 && (
                <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-2xl my-2">
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-emerald-600 animate-pulse" />
                    Điểm thưởng tích lũy
                  </span>
                  <span className="text-emerald-800 dark:text-emerald-300 font-black text-sm">+{cart.totalRewardPoints} pts</span>
                </div>
              )}

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

      {/* Map selection Modal */}
      {isMapModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-card w-full max-w-3xl rounded-3xl border border-border overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/10">
              <div>
                <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" /> Ghim vị trí nhận hàng
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 font-medium">Click chuột hoặc kéo ghim để định vị chính xác vị trí nhận hàng</p>
              </div>
              <button 
                type="button" 
                onClick={() => setIsMapModalOpen(false)}
                className="text-foreground hover:text-primary transition-colors text-lg font-bold w-8 h-8 flex items-center justify-center hover:bg-muted rounded-full cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="flex-1 relative min-h-[350px] md:min-h-[450px]">
              <div ref={mapRef} className="absolute inset-0 z-10 w-full h-full" />
              {geocoding && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-background/90 backdrop-blur-md px-4 py-2 rounded-full border border-border shadow-lg flex items-center gap-2 text-xs font-semibold text-foreground">
                  <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Đang xác định địa chỉ...
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-border bg-muted/5 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
              <div className="text-xs font-bold text-foreground bg-muted/40 p-3.5 rounded-2xl border border-border flex-1">
                <span className="text-muted-foreground block mb-0.5 uppercase tracking-widest text-[9px]">Địa chỉ định vị:</span>
                {tempAddress || "Chưa có vị trí được chọn"}
              </div>
              <div className="flex gap-3 shrink-0">
                <Button type="button" variant="outline" onClick={() => setIsMapModalOpen(false)} className="rounded-xl font-bold h-11 px-5">Hủy</Button>
                <Button type="button" onClick={confirmMapSelection} disabled={!tempAddress || geocoding} className="rounded-xl font-bold h-11 px-5">Xác nhận vị trí</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
