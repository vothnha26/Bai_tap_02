import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { User, Package, MapPin, Phone, Mail, Camera, ChevronRight, Clock, CheckCircle, Truck, XCircle, AlertTriangle, CreditCard, X, ShieldCheck, LogOut, Trophy, History, Star, Zap } from "lucide-react";
import { getProfile, updateProfile, getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from "../services/user.service";
import orderService from "../services/order.service";
import { Button } from "../components/ui/button";
import TierProgressBar from "./Profile/TierProgressBar";
import RewardHistory from "./Profile/RewardHistory";
import rewardService from "../services/reward.service";
import axios from "axios";
import { formatAddress } from "../utils/utils";

import { ORDER_STATUS, USER_ROLES } from "../utils/constants";

const statusConfig = {
  [ORDER_STATUS.PENDING]: { label: 'Đơn hàng mới', color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: Clock },
  [ORDER_STATUS.CONFIRMED]: { label: 'Đã xác nhận', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: CheckCircle },
  [ORDER_STATUS.PROCESSING]: { label: 'Đang chuẩn bị hàng', color: 'text-purple-500', bg: 'bg-purple-500/10', icon: Package },
  [ORDER_STATUS.SHIPPING]: { label: 'Đang giao hàng', color: 'text-orange-500', bg: 'bg-orange-500/10', icon: Truck },
  [ORDER_STATUS.DELIVERED]: { label: 'Giao thành công', color: 'text-green-500', bg: 'bg-green-500/10', icon: CheckCircle },
  [ORDER_STATUS.CANCELLED]: { label: 'Đã hủy', color: 'text-red-500', bg: 'bg-red-500/10', icon: XCircle },
  [ORDER_STATUS.CANCELLATION_REQUESTED]: { label: 'Yêu cầu hủy', color: 'text-gray-400', bg: 'bg-gray-400/10', icon: AlertTriangle },
};

const OrderDetailModal = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border relative shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-accent rounded-full text-muted-foreground hover:text-foreground transition-all"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Chi tiết đơn hàng</h2>
              <p className="text-primary font-mono text-sm">#{order.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Thông tin giao hàng
              </h3>
              <div className="bg-accent/30 p-4 rounded-xl border border-border space-y-2">
                <p className="text-foreground text-sm flex gap-2">
                   <Phone className="w-4 h-4 text-muted-foreground" />
                   <span>{order.phone}</span>
                </p>
                <p className="text-foreground text-sm flex gap-2">
                   <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                   <span>{formatAddress(order.shippingAddress)}</span>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Thanh toán
              </h3>
              <div className="bg-accent/30 p-4 rounded-xl border border-border space-y-2">
                <p className="text-foreground text-sm"><span className="text-muted-foreground">Phương thức:</span> {order.paymentMethod}</p>
                <p className="text-foreground text-sm"><span className="text-muted-foreground">Trạng thái:</span> <span className="text-green-600 font-medium">{order.paymentStatus}</span></p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Sản phẩm đã chọn</h3>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex gap-4 p-3 bg-accent/20 rounded-xl border border-border items-center">
                  <img src={item.imageUrl} alt={item.name} className="w-14 h-14 object-cover rounded-lg border border-border" />
                  <div className="flex-1">
                    <p className="text-foreground text-sm font-semibold line-clamp-1">{item.name}</p>
                    <p className="text-muted-foreground text-xs">x{item.quantity}</p>
                  </div>
                  <p className="text-foreground font-bold">{(item.price * item.quantity).toLocaleString()}đ</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border flex justify-between items-center">
            <span className="text-muted-foreground font-bold uppercase text-sm">Tổng thanh toán</span>
            <span className="text-2xl font-black text-primary">{order.totalAmount.toLocaleString()}đ</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info"); // info, orders, addresses
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    avatarUrl: "",
    status: "",
    role: "",
  });

  // State cho danh sách địa chỉ và Modal
  const [addresses, setAddresses] = useState([]);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  
  const [modalProvince, setModalProvince] = useState('');
  const [modalWard, setModalWard] = useState('');
  const [modalStreet, setModalStreet] = useState('');
  const [modalIsDefault, setModalIsDefault] = useState(false);
  const [modalWards, setModalWards] = useState([]);

  // Địa chỉ chi tiết (giữ lại các state cũ để form info chạy tương thích hoặc chuyển sang tab mới)
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [streetAddress, setStreetAddress] = useState('');

  const isAdmin = profile.role === USER_ROLES.ADMIN;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [membership, setMembership] = useState({
    rollingPoints: 0,
    currentPoints: 0,
    tierId: null,
  });
  const [tiers, setTiers] = useState([]);
  const [rewardLogs, setRewardLogs] = useState([]);

  useEffect(() => {
    fetchProfile();
    fetchMembershipAndRewards();
    fetchUserAddresses();
  }, []);

  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    }
  }, [activeTab]);

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

    return null;
  };

  const fetchUserAddresses = async () => {
    try {
      const data = await getAddresses();
      setAddresses(data.addresses || []);
    } catch (error) {
      console.error("Lỗi lấy danh sách địa chỉ:", error);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      setProfile({
        fullName: data.fullName || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        avatarUrl: data.avatarUrl || "",
        status: data.status || "",
        role: data.role || "",
        createdAt: data.createdAt || null,
      });

      // Phân tách địa chỉ nếu có
      if (data.address) {
        if (typeof data.address === 'object') {
          setStreetAddress(data.address.street || '');
          setSelectedProvince(data.address.provinceCode?.toString() || '');
          setSelectedWard(data.address.wardCode?.toString() || '');
        } else if (typeof data.address === 'string') {
          setStreetAddress(data.address);
        }
      }
    } catch (error) {
      setMessage({ type: "error", text: "Không thể tải thông tin người dùng." });
    } finally {
      setLoading(false);
    }
  };

  // Load danh sách tỉnh
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await axios.get('https://provinces.open-api.vn/api/v2/p/');
        const data = res.data || [];
        setProvinces(data);
        
        if (profile?.address && typeof profile.address === 'string' && !selectedProvince) {
          const parts = profile.address.split(',').map(p => p.trim());
          const provinceName = parts[parts.length - 1];
          const matched = findBestMatch(provinceName, data, 'province');
          if (matched) setSelectedProvince(matched.code.toString());
        }
      } catch (err) {
        console.error('Lỗi tải danh sách tỉnh thành:', err);
      }
    };
    fetchProvinces();
  }, [profile.address]);

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
        
        if (profile?.address && typeof profile.address === 'string' && !selectedWard) {
          const parts = profile.address.split(',').map(p => p.trim());
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
  }, [selectedProvince, profile.address]);

  // Load danh sách phường xã cho Modal khi modalProvince thay đổi
  useEffect(() => {
    if (!modalProvince) {
      setModalWards([]);
      return;
    }
    const fetchModalWards = async () => {
      try {
        const res = await axios.get(`https://provinces.open-api.vn/api/v2/p/${modalProvince}?depth=2`);
        setModalWards(res.data.wards || []);
      } catch (err) {
        console.error('Lỗi tải danh sách phường xã cho modal:', err);
      }
    };
    fetchModalWards();
  }, [modalProvince]);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const provinceObj = provinces.find(p => p.code.toString() === modalProvince.toString());
      const wardObj = modalWards.find(w => w.code.toString() === modalWard.toString());

      if (!provinceObj || !wardObj || !modalStreet) {
        alert("Vui lòng điền đầy đủ thông tin địa chỉ!");
        setSaving(false);
        return;
      }

      const addressData = {
        street: modalStreet,
        province: provinceObj.name,
        provinceCode: modalProvince,
        ward: wardObj.name,
        wardCode: modalWard,
        fullText: `${modalStreet}, ${wardObj.name}, ${provinceObj.name}`,
        isDefault: modalIsDefault
      };

      let updatedAddresses;
      if (editingAddress) {
        const res = await updateAddress(editingAddress._id, addressData);
        updatedAddresses = res.data || res;
      } else {
        const res = await addAddress(addressData);
        updatedAddresses = res.data || res;
      }

      setAddresses(updatedAddresses.addresses || updatedAddresses);
      setAddressModalOpen(false);
      setEditingAddress(null);
      // Reset form
      setModalStreet('');
      setModalProvince('');
      setModalWard('');
      setModalIsDefault(false);
    } catch (error) {
      console.error("Lỗi khi lưu địa chỉ:", error);
      alert(error.response?.data?.message || "Lưu địa chỉ thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;
    try {
      const result = await deleteAddress(addressId);
      const updatedAddresses = result.data || result;
      setAddresses(updatedAddresses.addresses || updatedAddresses);
    } catch (error) {
      console.error("Lỗi khi xóa địa chỉ:", error);
      alert(error.response?.data?.message || "Xóa địa chỉ thất bại");
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const result = await setDefaultAddress(addressId);
      const updatedAddresses = result.data || result;
      setAddresses(updatedAddresses.addresses || updatedAddresses);
    } catch (error) {
      console.error("Lỗi khi đặt địa chỉ mặc định:", error);
      alert(error.response?.data?.message || "Đặt địa chỉ mặc định thất bại");
    }
  };

  const openAddAddressModal = () => {
    setEditingAddress(null);
    setModalStreet('');
    setModalProvince('');
    setModalWard('');
    setModalIsDefault(false);
    setAddressModalOpen(true);
  };

  const openEditAddressModal = (addr) => {
    setEditingAddress(addr);
    setModalStreet(addr.street);
    setModalProvince(addr.provinceCode.toString());
    setModalWard(addr.wardCode.toString());
    setModalIsDefault(addr.isDefault);
    setAddressModalOpen(true);
  };

  const fetchMembershipAndRewards = async () => {
    try {
      const [membershipData, tiersData, logsData] = await Promise.all([
        rewardService.getMyMembership(),
        rewardService.getAllTiers(),
        rewardService.getMyRewardLogs()
      ]);
      setMembership(membershipData || { rollingPoints: 0, currentPoints: 0, tierId: null });
      setTiers(Array.isArray(tiersData) ? tiersData : []);
      setRewardLogs(Array.isArray(logsData) ? logsData : []);
    } catch (error) {
      console.error("Error fetching membership or rewards:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const data = await orderService.getUserOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    const provinceObj = provinces.find(p => p.code.toString() === selectedProvince);
    const wardObj = wards.find(w => w.code.toString() === selectedWard);

    const structuredAddress = {
      street: streetAddress,
      province: provinceObj?.name || "",
      provinceCode: selectedProvince,
      district: "",
      districtCode: "",
      ward: wardObj?.name || "",
      wardCode: selectedWard,
      fullText: `${streetAddress}${wardObj ? ', ' + wardObj.name : ''}${provinceObj ? ', ' + provinceObj.name : ''}`
    };

    try {
      const result = await updateProfile({
        fullName: profile.fullName,
        phone: profile.phone,
        address: structuredAddress,
        avatarUrl: profile.avatarUrl,
      });
      
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...storedUser, ...result.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setMessage({ type: "success", text: result.message || "Cập nhật thành công!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Cập nhật thất bại." });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;
    try {
      await orderService.cancelOrder(orderId);
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || "Không thể hủy đơn hàng");
    }
  };

  const handleLogout = () => {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
      localStorage.clear();
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* Sidebar */}
        <div className="w-full md:w-80 shrink-0">
          <div className="bg-white dark:bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border flex flex-col items-center">
              <div className="relative group mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-accent flex justify-center items-center border-4 border-white shadow-md">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt={profile.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 p-1.5 bg-primary text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <h2 className="text-xl font-bold text-foreground">{profile.fullName}</h2>
              <p className="text-muted-foreground text-sm">{profile.email}</p>
              
              {profile.createdAt && (
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-2">
                  Ngày tham gia: <span className="text-primary font-bold">{new Date(profile.createdAt).toLocaleDateString('vi-VN')}</span>
                </p>
              )}
              
              {isAdmin && (
                <div className="mt-3 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  QUẢN TRỊ VIÊN
                </div>
              )}
            </div>

            <nav className="p-2">
              <button
                onClick={() => setActiveTab("info")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === "info" 
                    ? "bg-primary text-primary-foreground font-bold shadow-md" 
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <User className="w-5 h-5" />
                <span>Thông tin tài khoản</span>
                <ChevronRight className={`ml-auto w-4 h-4 ${activeTab === "info" ? "opacity-100" : "opacity-0"}`} />
              </button>

              <button
                onClick={() => setActiveTab("addresses")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === "addresses" 
                    ? "bg-primary text-primary-foreground font-bold shadow-md" 
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <MapPin className="w-5 h-5" />
                <span>Địa chỉ nhận hàng</span>
                <ChevronRight className={`ml-auto w-4 h-4 ${activeTab === "addresses" ? "opacity-100" : "opacity-0"}`} />
              </button>
              
              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === "orders" 
                    ? "bg-primary text-primary-foreground font-bold shadow-md" 
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Package className="w-5 h-5" />
                <span>Lịch sử đơn hàng</span>
                <ChevronRight className={`ml-auto w-4 h-4 ${activeTab === "orders" ? "opacity-100" : "opacity-0"}`} />
              </button>

              <button
                onClick={() => setActiveTab("rewards")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === "rewards" 
                    ? "bg-primary text-primary-foreground font-bold shadow-md" 
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Trophy className="w-5 h-5" />
                <span>Ưu đãi & Hạng</span>
                {membership?.tierId && (
                  <span className="ml-auto px-2 py-0.5 bg-yellow-400 text-black text-[10px] font-black rounded-lg">
                    {membership.tierId.code}
                  </span>
                )}
                <ChevronRight className={`ml-auto w-4 h-4 ${activeTab === "rewards" ? "opacity-100" : "opacity-0"} ${membership?.tierId ? 'hidden' : ''}`} />
              </button>

              <button
                onClick={() => setActiveTab("history")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === "history" 
                    ? "bg-primary text-primary-foreground font-bold shadow-md" 
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <History className="w-5 h-5" />
                <span>Lịch sử ví điểm</span>
                <ChevronRight className={`ml-auto w-4 h-4 ${activeTab === "history" ? "opacity-100" : "opacity-0"}`} />
              </button>

              <div className="h-px bg-border my-2 mx-4" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all font-medium"
              >
                <LogOut className="w-5 h-5" />
                <span>Đăng xuất</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full">
          {activeTab === "info" ? (
            <div className="bg-white dark:bg-card rounded-2xl border border-border shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="p-8 border-b border-border flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">Hồ sơ cá nhân</h3>
                  <p className="text-muted-foreground text-sm mt-1">Quản lý thông tin cá nhân của bạn để bảo mật tài khoản</p>
                </div>
                {profile.createdAt && (
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Ngày tham gia</p>
                    <p className="text-foreground font-bold text-sm">
                      {new Date(profile.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-8">
                {message.text && (
                  <div className={`p-4 mb-8 rounded-xl flex items-center gap-3 border ${
                    message.type === 'error' 
                      ? 'bg-destructive/10 text-destructive border-destructive/20' 
                      : 'bg-green-500/10 text-green-600 border-green-500/20'
                  }`}>
                    {message.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                    <span className="font-medium">{message.text}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-2 flex flex-col">
                      <label className="text-sm font-bold text-foreground flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-muted-foreground" />
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={profile.fullName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-background"
                        required
                        autoComplete="name"
                      />
                    </div>

                    <div className="space-y-2 flex flex-col">
                      <label className="text-sm font-bold text-foreground flex items-center gap-2 mb-1">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        Email
                      </label>
                      <input
                        type="email"
                        value={profile.email}
                        className="w-full px-4 py-3 border border-border rounded-xl bg-accent/50 text-muted-foreground cursor-not-allowed outline-none"
                        disabled
                        autoComplete="email"
                      />
                    </div>

                    <div className="space-y-2 flex flex-col">
                      <label className="text-sm font-bold text-foreground flex items-center gap-2 mb-1">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={profile.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-background"
                        placeholder="VD: 0987654321"
                        autoComplete="tel"
                      />
                    </div>

                    <div className="space-y-2 flex flex-col">
                      <label className="text-sm font-bold text-foreground flex items-center gap-2 mb-1">
                        <Camera className="w-4 h-4 text-muted-foreground" />
                        Link ảnh đại diện
                      </label>
                      <input
                        type="text"
                        name="avatarUrl"
                        value={profile.avatarUrl}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-background"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-border">
                    <Button
                      type="submit"
                      disabled={saving}
                      size="lg"
                      className="px-10 rounded-xl"
                    >
                      {saving ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          ) : activeTab === "addresses" ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">Sổ địa chỉ nhận hàng</h3>
                  <p className="text-muted-foreground text-sm mt-1">Quản lý các địa chỉ nhận hàng của bạn để thanh toán nhanh hơn</p>
                </div>
                <Button 
                  onClick={openAddAddressModal} 
                  className="rounded-xl font-bold flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  Thêm địa chỉ mới
                </Button>
              </div>

              {addresses.length === 0 ? (
                <div className="bg-white dark:bg-card rounded-3xl border border-border p-16 text-center shadow-sm">
                  <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                    <MapPin className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h4 className="text-xl font-bold text-foreground mb-2">Chưa lưu địa chỉ nào</h4>
                  <p className="text-muted-foreground mb-8 max-w-sm mx-auto font-medium">
                    Hãy thêm địa chỉ giao hàng đầu tiên của bạn để thuận tiện khi mua sắm.
                  </p>
                  <Button onClick={openAddAddressModal} className="rounded-xl">Thêm địa chỉ ngay</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.map((addr) => (
                    <div 
                      key={addr._id} 
                      className={`bg-white dark:bg-card rounded-2xl border p-6 shadow-sm transition-all duration-300 flex flex-col justify-between ${
                        addr.isDefault ? 'border-primary ring-1 ring-primary/20 bg-primary/[0.01]' : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="font-bold text-foreground text-base capitalize">{addr.street}</span>
                          {addr.isDefault && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase rounded">
                              Mặc định
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm mb-1">Xã/Phường: {addr.ward}</p>
                        <p className="text-muted-foreground text-sm mb-1">Tỉnh/Thành phố: {addr.province}</p>
                        <p className="text-foreground text-sm font-medium mt-3 bg-accent/20 p-3 rounded-lg border border-border/50">
                          {addr.fullText}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border/50">
                        {!addr.isDefault && (
                          <button 
                            onClick={() => handleSetDefaultAddress(addr._id)}
                            className="text-xs font-bold text-primary hover:underline mr-auto"
                            type="button"
                          >
                            Đặt làm mặc định
                          </button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openEditAddressModal(addr)}
                          className="rounded-lg text-xs h-8 px-3"
                          type="button"
                        >
                          Sửa
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDeleteAddress(addr._id)}
                          className="rounded-lg text-xs h-8 px-3"
                          type="button"
                        >
                          Xóa
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === "orders" ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">Lịch sử đơn hàng</h3>
                  <p className="text-muted-foreground text-sm mt-1">Theo dõi và quản lý các đơn hàng bạn đã đặt</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-xl border border-border shadow-sm text-xs font-bold text-muted-foreground">
                  Tổng cộng: <span className="text-primary">{orders.length}</span>
                </div>
              </div>

              {ordersLoading ? (
                <div className="bg-white dark:bg-card rounded-3xl border border-border p-16 flex flex-col items-center justify-center shadow-sm">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                  <p className="text-muted-foreground font-medium text-sm">Đang tải danh sách đơn hàng...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white dark:bg-card rounded-3xl border border-border p-16 text-center shadow-sm">
                  <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h4 className="text-xl font-black text-foreground mb-2 uppercase tracking-tight">Chưa có đơn hàng nào</h4>
                  <p className="text-muted-foreground mb-8 max-w-sm mx-auto font-medium">Bạn chưa thực hiện đơn hàng nào trên PubliCast. Bắt đầu mua sắm ngay!</p>
                  <Link to="/">
                    <Button variant="default" size="lg" className="rounded-2xl px-10 h-12 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20">Mua sắm ngay</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order, index) => {
                    const Config = statusConfig[order.status] || statusConfig.PENDING;
                    const Icon = Config.icon;
                    
                    return (
                      <div 
                        key={order.id} 
                        className="bg-white dark:bg-card rounded-3xl border border-border overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all duration-300 group animate-in fade-in slide-in-from-bottom-4 duration-500"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="p-8">
                          <div className="flex flex-wrap justify-between items-start gap-6 mb-8 pb-6 border-b border-border/50">
                            <div className="flex gap-6">
                              <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Mã đơn hàng</p>
                                <p className="text-primary font-mono font-bold text-base">#{order.id}</p>
                              </div>
                              <div className="w-px h-8 bg-border hidden sm:block" />
                              <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Ngày đặt</p>
                                <p className="text-foreground font-bold text-sm">
                                  {new Date(order.createdAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' })}
                                  <span className="text-muted-foreground font-normal ml-2">
                                    {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                  </span>
                                </p>
                              </div>
                            </div>
                            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${Config.bg} ${Config.color} border-current/10 shadow-sm`}>
                              <Icon className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-black uppercase tracking-widest">{Config.label}</span>
                            </div>
                          </div>

                          <div className="space-y-4 mb-8">
                            {order.items.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="flex gap-4 items-center">
                                <div className="w-14 h-14 shrink-0 rounded-xl overflow-hidden border border-border shadow-sm">
                                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-foreground font-bold text-sm line-clamp-1">{item.name}</p>
                                  <p className="text-muted-foreground text-xs font-medium mt-0.5">x{item.quantity} • {item.price.toLocaleString()}đ</p>
                                </div>
                                <p className="text-foreground font-black text-sm">{(item.price * item.quantity).toLocaleString()}đ</p>
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <p className="text-[10px] text-muted-foreground font-bold italic pl-18 uppercase tracking-widest">... và {order.items.length - 2} sản phẩm khác</p>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-border/50">
                            <div className="flex items-center gap-6">
                              <div>
                                <p className="text-[10px] text-muted-foreground uppercase font-black mb-1 tracking-widest">Tổng cộng</p>
                                <p className="text-2xl font-black text-primary tracking-tighter">{order.totalAmount.toLocaleString()}đ</p>
                              </div>
                            </div>

                            <div className="flex gap-3">
                              <Button 
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedOrder(order)}
                                className="rounded-xl font-bold px-5 border-border h-10"
                              >
                                Chi tiết
                              </Button>
                              
                              {(order.status === 'PENDING' || order.status === 'CONFIRMED' || order.status === 'PROCESSING') && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleCancelOrder(order.id)}
                                  className="rounded-xl font-bold px-5 h-10 shadow-lg shadow-destructive/10"
                                >
                                  Hủy đơn
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : activeTab === "rewards" ? (
            <div className="space-y-8">
              <TierProgressBar 
                currentPoints={membership.rollingPoints} 
                tiers={tiers} 
                currentTier={membership.tierId} 
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-8 border border-border shadow-sm">
                  <h4 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-3">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    Đặc quyền hạng {membership.tierId?.name}
                  </h4>
                  <div className="space-y-4">
                    {membership.tierId?.benefits.map((b, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="mt-1">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{b.benefitId?.name}</p>
                          <p className="text-xs text-gray-500 mt-1">{b.benefitId?.description}</p>
                          <p className="mt-2 text-sm font-black text-blue-600">
                            Giá trị: {typeof b.value === 'boolean' ? (b.value ? 'Có' : 'Không') : b.value}
                            {b.benefitId?.valueType === 'PERCENTAGE' ? '%' : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 text-white shadow-xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-lg font-black mb-2 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      Mẹo tích điểm nhanh
                    </h4>
                    <p className="text-blue-100 text-sm font-medium leading-relaxed">
                      Mỗi 10,000đ chi tiêu sẽ mang về cho bạn 1 điểm tích lũy. Đặc biệt, hãy thường xuyên đánh giá sản phẩm để nhận ngay 50 điểm/đánh giá thành công!
                    </p>
                  </div>
                  <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Ví điểm khả dụng</p>
                      <p className="text-3xl font-black tabular-nums">{membership.currentPoints.toLocaleString()}</p>
                    </div>
                    <Link to="/search">
                      <Button variant="secondary" size="sm" className="rounded-xl font-bold bg-white text-blue-700 hover:bg-blue-50">Sắm ngay</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <RewardHistory logs={rewardLogs} />
            </div>
          )}
        </div>
      </div>

      {/* Modal chi tiết đơn hàng */}
      {selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      )}

      {/* Address Form Modal */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-card w-full max-w-lg overflow-y-auto rounded-2xl border border-border relative shadow-2xl">
            <button 
              onClick={() => setAddressModalOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-accent rounded-full text-muted-foreground hover:text-foreground transition-all"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
                  </h2>
                  <p className="text-muted-foreground text-xs">Cung cấp địa chỉ giao hàng chính xác</p>
                </div>
              </div>

              <form onSubmit={handleSaveAddress} className="space-y-6">
                <div className="space-y-2 flex flex-col">
                  <label className="text-sm font-bold text-foreground">Tỉnh / Thành phố</label>
                  <select
                    value={modalProvince}
                    onChange={(e) => {
                      setModalProvince(e.target.value);
                      setModalWard('');
                    }}
                    className="w-full px-4 py-3 border border-border rounded-xl bg-background text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  >
                    <option value="">Chọn Tỉnh / Thành phố</option>
                    {provinces.map(p => (
                      <option key={p.code} value={p.code}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 flex flex-col">
                  <label className="text-sm font-bold text-foreground">Phường / Xã</label>
                  <select
                    disabled={!modalProvince}
                    value={modalWard}
                    onChange={(e) => setModalWard(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-xl bg-background text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                    required
                  >
                    <option value="">Chọn Phường / Xã</option>
                    {modalWards.map(w => (
                      <option key={w.code} value={w.code}>{w.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 flex flex-col">
                  <label className="text-sm font-bold text-foreground">Số nhà, tên đường</label>
                  <input
                    type="text"
                    value={modalStreet}
                    onChange={(e) => setModalStreet(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-xl bg-background outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Ví dụ: Số 123 Võ Văn Ngân"
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="modalIsDefault" 
                    checked={modalIsDefault}
                    onChange={(e) => setModalIsDefault(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary/20"
                  />
                  <label htmlFor="modalIsDefault" className="text-sm font-bold text-foreground cursor-pointer select-none">
                    Đặt làm địa chỉ mặc định
                  </label>
                </div>

                <div className="flex gap-4 pt-4 border-t border-border">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setAddressModalOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="flex-1"
                  >
                    {saving ? 'Đang lưu...' : 'Lưu địa chỉ'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
