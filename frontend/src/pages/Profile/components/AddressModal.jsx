import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Phone, X, Zap, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import axios from 'axios';
import locationService from '../../../services/location.service';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

const AddressModal = ({ isOpen, onClose, onSave, editingAddress, provinces: initialProvinces, defaultPhone }) => {
  const [formData, setFormData] = useState({
    phone: '',
    street: '',
    province: '',
    provinceCode: '',
    ward: '',
    wardCode: '',
    isDefault: false,
    coordinates: { lat: 10.8231, lng: 106.6297 }
  });

  const [provinces, setProvinces] = useState(initialProvinces || []);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  
  // Map states
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [tempCoordinates, setTempCoordinates] = useState(null);
  const [tempAddress, setTempAddress] = useState('');
  const [tempComponents, setTempComponents] = useState(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Auto-mapping refs
  const targetWardName = useRef('');

  useEffect(() => {
    if (isOpen) {
      if (editingAddress) {
        setFormData({
          phone: editingAddress.phone || defaultPhone || '',
          street: editingAddress.street || '',
          province: editingAddress.province || '',
          provinceCode: editingAddress.provinceCode || '',
          ward: editingAddress.ward || '',
          wardCode: editingAddress.wardCode || '',
          isDefault: editingAddress.isDefault || false,
          coordinates: editingAddress.coordinates || { lat: 10.8231, lng: 106.6297 }
        });
      } else {
        setFormData({
          phone: defaultPhone || '',
          street: '',
          province: '',
          provinceCode: '',
          ward: '',
          wardCode: '',
          isDefault: false,
          coordinates: { lat: 10.8231, lng: 106.6297 }
        });
      }
    }
  }, [isOpen, editingAddress, defaultPhone]);

  useEffect(() => {
    const fetchProvinces = async () => {
      if (provinces.length > 0) return;
      try {
        const data = await locationService.getProvinces();
        setProvinces(data || []);
      } catch (err) {
        console.error('Lỗi tải tỉnh thành:', err);
      }
    };
    if (isOpen) fetchProvinces();
  }, [isOpen]);

  // Load Wards directly from Province (v2 API Flattened)
  useEffect(() => {
    const fetchWards = async () => {
      if (!formData.provinceCode) {
        setWards([]);
        return;
      }
      try {
        const data = await locationService.getWards(formData.provinceCode);
        const wardsList = data || [];
        setWards(wardsList);

        // Auto-match ward from map
        if (targetWardName.current) {
          const normWard = normalizeAdminName(targetWardName.current);
          const matched = wardsList.find(w => {
            const n = normalizeAdminName(w.name);
            return n === normWard || n.includes(normWard) || normWard.includes(n);
          });
          if (matched) {
            setFormData(prev => ({ 
              ...prev, 
              ward: matched.name, 
              wardCode: matched.code.toString() 
            }));
          }
          targetWardName.current = '';
        }
      } catch (err) {
        console.error('Lỗi tải dữ liệu hành chính:', err);
        toast.error("Lỗi kết nối máy chủ địa chỉ. Vui lòng thử lại sau.");
      }
    };
    fetchWards();
  }, [formData.provinceCode]);

  const normalizeAdminName = (str = '') =>
    str.toLowerCase()
      .replace(/^(thành phố|tp\.?|tỉnh|quận|huyện|thị xã|phường|xã|thị trấn|khu phố)\s+/i, '')
      .trim();

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Trình duyệt không hỗ trợ định vị');
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
          if (markerRef.current) markerRef.current.setLatLng([latitude, longitude]);
        }
        reverseGeocode(latitude, longitude);
        setLocationLoading(false);
      },
      () => {
        toast.error('Không thể lấy vị trí');
        setLocationLoading(false);
      }
    );
  };

  const reverseGeocode = async (lat, lng) => {
    setGeocoding(true);
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=vi`);
      if (res.data) {
        setTempAddress(res.data.display_name);
        const addr = res.data.address;
        setTempComponents({
          province: addr.state || addr.province || addr.city || '',
          ward: addr.quarter || addr.neighbourhood || addr.suburb || addr.village || ''
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeocoding(false);
    }
  };

  const handleMapConfirm = () => {
    if (tempCoordinates && tempComponents) {
      const normProvince = normalizeAdminName(tempComponents.province);
      const matchedProv = provinces.find((p) => {
        const normP = normalizeAdminName(p.name);
        return normP === normProvince || normP.includes(normProvince) || normProvince.includes(normP);
      });

      setFormData(prev => ({
        ...prev,
        coordinates: tempCoordinates,
        street: tempAddress,
        province: matchedProv ? matchedProv.name : prev.province,
        provinceCode: matchedProv ? matchedProv.code.toString() : prev.provinceCode
      }));

      if (matchedProv) {
        targetWardName.current = tempComponents.ward;
      }
      setIsMapOpen(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.phone || !formData.provinceCode || !formData.wardCode || !formData.street) {
      toast.error('Vui lòng điền đầy đủ thông tin địa chỉ');
      return;
    }

    const fullText = [
      formData.street,
      formData.ward,
      formData.province
    ].filter(Boolean).join(', ');

    setLoading(true);
    try {
      await onSave({
        ...formData,
        fullText
      });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Không thể lưu địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isMapOpen && !mapRef.current) {
      setTimeout(() => {
        const container = document.getElementById('modal-map');
        if (!container) return;
        const coords = formData.coordinates;
        const map = L.map(container).setView([coords.lat, coords.lng], 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        const marker = L.marker([coords.lat, coords.lng], { draggable: true }).addTo(map);
        
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
        markerRef.current = marker;
        setTempCoordinates(coords);
        reverseGeocode(coords.lat, coords.lng);
      }, 100);
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isMapOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} 
          />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3.5rem] shadow-2xl relative z-10 overflow-hidden"
          >
            <div className="p-10 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                    <MapPin className="w-6 h-6" />
                 </div>
                 <h2 className="text-2xl font-black uppercase tracking-tighter">
                   {editingAddress ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}
                 </h2>
              </div>
              <button onClick={onClose} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-full transition-all"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Số điện thoại nhận hàng: Sync with Profile */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Số điện thoại nhận hàng</label>
                  <div className="relative group">
                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      type="text" value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="Số điện thoại..."
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-600/20 outline-none"
                    />
                  </div>
                  <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest pl-2">
                    Lấy từ sđt hồ sơ: <span className="underline">{defaultPhone || 'N/A'}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Tỉnh / Thành phố</label>
                  <select 
                    value={formData.provinceCode}
                    onChange={(e) => {
                      const p = provinces.find(x => x.code.toString() === e.target.value);
                      setFormData({...formData, provinceCode: e.target.value, province: p?.name || '', ward: '', wardCode: ''});
                    }}
                    className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 rounded-2xl font-bold appearance-none"
                  >
                    <option value="">Chọn tỉnh thành</option>
                    {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Phường / Xã</label>
                  <select 
                    value={formData.wardCode} disabled={!formData.provinceCode}
                    onChange={(e) => {
                      const w = wards.find(x => x.code.toString() === e.target.value);
                      setFormData({...formData, wardCode: e.target.value, ward: w?.name || ''});
                    }}
                    className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 rounded-2xl font-bold appearance-none disabled:opacity-50"
                  >
                    <option value="">Chọn phường xã</option>
                    {wards.map(w => <option key={w.code} value={w.code}>{w.fullName || w.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Địa chỉ chi tiết</label>
                  <input 
                    type="text" value={formData.street}
                    onChange={(e) => setFormData({...formData, street: e.target.value})}
                    placeholder="Ví dụ: 123 Đường ABC..."
                    className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-600/20 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pl-2">
                <input 
                  type="checkbox" id="isDefault" checked={formData.isDefault}
                  onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                  className="w-6 h-6 rounded-lg border-slate-200 text-blue-600 focus:ring-blue-600/20"
                />
                <label htmlFor="isDefault" className="text-sm font-bold text-slate-600 dark:text-slate-400">Đặt làm địa chỉ mặc định</label>
              </div>

              <div className="pt-6 border-t border-slate-50 flex flex-col md:flex-row gap-4">
                <Button 
                  type="button" variant="outline" 
                  onClick={() => setIsMapOpen(true)}
                  className="h-16 flex-1 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest border-emerald-100 text-emerald-600 hover:bg-emerald-50"
                >
                  <MapPin className="w-4 h-4 mr-2" /> Chọn từ bản đồ
                </Button>
                <Button 
                  type="submit" disabled={loading}
                  className="h-16 flex-1 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-600/20"
                >
                  {loading ? <Loader2 className="animate-spin mr-2" /> : editingAddress ? 'Cập nhật thông tin' : 'Thêm địa chỉ này'}
                </Button>
              </div>
            </form>
          </motion.div>

          {/* Nested Map Modal */}
          <AnimatePresence>
            {isMapOpen && (
              <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-20">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" />
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-[3.5rem] relative z-10 overflow-hidden h-full flex flex-col shadow-2xl">
                  <div className="p-10 flex justify-between items-center bg-white dark:bg-slate-900 z-20 border-b border-slate-50">
                    <div>
                       <h3 className="text-2xl font-black uppercase tracking-tight">Kéo thả ghim để xác định vị trí</h3>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Hệ thống tự động bỏ qua Quận/Huyện theo yêu cầu</p>
                    </div>
                    <Button variant="ghost" className="rounded-full w-12 h-12 p-0" onClick={() => setIsMapOpen(false)}><X /></Button>
                  </div>
                  <div id="modal-map" className="flex-1 z-10" />
                  <div className="p-10 bg-slate-50 dark:bg-slate-800 flex flex-col md:flex-row gap-6 items-center z-20">
                    <div className="flex-1 space-y-2">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vị trí đã chọn:</p>
                       <div className="flex items-center gap-3">
                          {geocoding ? <Loader2 className="w-5 h-5 animate-spin text-blue-600" /> : <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 line-clamp-2">{tempAddress || 'Vui lòng chọn một điểm trên bản đồ'}</p>
                       </div>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                       <Button variant="outline" className="h-14 px-8 rounded-2xl font-black uppercase text-[10px]" onClick={handleGetCurrentLocation} disabled={locationLoading}>
                         <Zap className="w-4 h-4 mr-2" /> GPS
                       </Button>
                       <Button className="h-14 px-10 rounded-2xl font-black uppercase text-[10px] flex-1 md:flex-none" onClick={handleMapConfirm} disabled={geocoding || !tempAddress}>Xác nhận vị trí</Button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddressModal;
