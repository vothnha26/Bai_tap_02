import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { User, Package, MapPin, Phone, Mail, Camera, ChevronRight, ShoppingBag, Settings, Trophy, LogOut, ShieldCheck, Zap, Coins, Loader2, X } from "lucide-react";
import { getProfile, updateProfile, getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from "../services/user.service";
import orderService from "../services/order.service";
import locationService from "../services/location.service";
import { Button } from "../components/ui/button";
import rewardService from "../services/reward.service";
import { formatAddress } from "../utils/utils";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { ORDER_STATUS } from "../utils/constants";
import MembershipTab from "./Profile/components/MembershipTab";
import OrderDetailView from "./Orders/components/OrderDetailView";
import AddressModal from "./Profile/components/AddressModal";

const statusConfig = {
  PENDING: { label: 'Đơn hàng mới', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'text-blue-600', bg: 'bg-blue-50' },
  PROCESSING: { label: 'Đang chuẩn bị', color: 'text-purple-600', bg: 'bg-purple-50' },
  SHIPPING: { label: 'Đang giao hàng', color: 'text-orange-600', bg: 'bg-orange-50' },
  DELIVERED: { label: 'Thành công', color: 'text-green-600', bg: 'bg-green-50' },
  CANCELLED: { label: 'Đã hủy', color: 'text-red-600', bg: 'bg-red-50' },
  CANCELLATION_REQUESTED: { label: 'Yêu cầu hủy', color: 'text-gray-600', bg: 'bg-gray-100' },
};

const Profile = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'info';
  const orderIdParam = searchParams.get('orderId');

  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    avatarUrl: "",
    status: "",
    role: "",
  });

  const [addresses, setAddresses] = useState([]);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [provinces, setProvinces] = useState([]);

  const [orders, setOrders] = useState([]);
  const [orderFilters, setOrderFilters] = useState({
    status: 'ALL',
    startDate: '2025-06-03',
    endDate: '2026-06-03',
    page: 1,
    limit: 5
  });
  const [orderMeta, setOrderMeta] = useState({ total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [membership, setMembership] = useState(null);
  const [tiers, setTiers] = useState([]);
  const [rewardLogs, setRewardLogs] = useState([]);
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const targetDistrictName = useRef('');
  const targetWardName = useRef('');

  // Load basic data and header stats on mount
  useEffect(() => {
    const fetchBaseData = async () => {
      try {
        const [profileRes, provRes, orderRes, memRes] = await Promise.allSettled([
          getProfile(),
          locationService.getProvinces(),
          orderService.getUserOrders(),
          rewardService.getMyMembership()
        ]);

        if (profileRes.status === 'fulfilled') {
          const u = profileRes.value.data || profileRes.value;
          setProfile({
            fullName: u.fullName || "",
            email: u.email || "",
            phone: u.phone || "",
            address: u.address || "",
            avatarUrl: u.avatarUrl || "",
            status: u.status || "",
            role: u.role || "CUSTOMER",
          });
        }
        if (provRes.status === 'fulfilled') {
          setProvinces(provRes.value.data || provRes.value || []);
        }
        if (orderRes.status === 'fulfilled') {
          const orderData = orderRes.value.data || orderRes.value;
          const initialOrders = Array.isArray(orderData) ? orderData : (orderData.orders || []);
          setOrders(initialOrders);
        }
        if (memRes.status === 'fulfilled') {
          setMembership(memRes.value.data || memRes.value || null);
        }

      } catch (err) {
        toast.error("Không thể tải thông tin cá nhân");
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };
    fetchBaseData();
  }, []);

  // Handle selected order from URL
  useEffect(() => {
    if (orderIdParam) {
      const fetchOrderDetail = async () => {
        try {
          const order = await orderService.getOrderById(orderIdParam);
          setSelectedOrder(order);
        } catch (err) {
          toast.error("Không tìm thấy thông tin đơn hàng");
          setSearchParams({ tab: 'orders' });
        }
      };
      fetchOrderDetail();
    } else {
      setSelectedOrder(null);
    }
  }, [orderIdParam, setSearchParams]);

  // Fetch detailed tab data when active tab changes
  useEffect(() => {
    if (activeTab === "orders") {
      const fetchOrders = async () => {
        setOrdersLoading(true);
        try {
          const res = await orderService.getUserOrders(orderFilters);
          const data = res.data || res;
          setOrders(data.orders || []);
          setOrderMeta({
            total: data.total || 0,
            totalPages: Math.ceil((data.total || 0) / orderFilters.limit)
          });
        } catch (err) {
          console.error(err);
          toast.error("Lỗi tải danh sách đơn hàng");
        } finally {
          setOrdersLoading(false);
        }
      };
      fetchOrders();
    }

    if (activeTab === "addresses") {
      fetchAddresses();
    }

    if (activeTab === "rewards") {
      const fetchRewardsDetails = async () => {
        setMembershipLoading(true);
        try {
          const [logsRes, tiersRes] = await Promise.all([
            rewardService.getMyRewardLogs(),
            rewardService.getAllTiers()
          ]);
          setRewardLogs(logsRes.data || logsRes || []);
          setTiers(tiersRes.data || tiersRes || []);
        } catch (err) {
          console.error(err);
        } finally {
          setMembershipLoading(false);
        }
      };
      fetchRewardsDetails();
    }
  }, [activeTab, orderFilters]);

  const fetchAddresses = async () => {
    try {
      const addrRes = await getAddresses();
      const addrList = addrRes.data?.addresses || addrRes.addresses || addrRes;
      setAddresses(addrList || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const handleShowOrderDetail = (id) => {
    setSearchParams({ tab: 'orders', orderId: id });
  };

  const handleSaveAddress = async (data) => {
    try {
      if (editingAddress) {
        await updateAddress(editingAddress._id, data);
        toast.success("Cập nhật địa chỉ thành công");
      } else {
        await addAddress(data);
        toast.success("Thêm địa chỉ mới thành công");
      }
      fetchAddresses();
      setAddressModalOpen(false);
    } catch (err) {
      toast.error(err.message || "Lỗi lưu địa chỉ");
      throw err;
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;
    try {
      await deleteAddress(id);
      toast.success("Xóa địa chỉ thành công");
      fetchAddresses();
    } catch (err) {
      toast.error(err.message || "Lỗi xóa địa chỉ");
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultAddress(id);
      toast.success("Đã đặt làm địa chỉ mặc định");
      fetchAddresses();
    } catch (err) {
      toast.error(err.message || "Lỗi thiết lập");
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(profile);
      toast.success("Cập nhật thông tin thành công!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi cập nhật");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Đang đồng bộ dữ liệu...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "info", label: "Thông tin", icon: User },
    { id: "orders", label: "Đơn hàng", icon: ShoppingBag },
    { id: "addresses", label: "Địa chỉ", icon: MapPin },
    { id: "rewards", label: "Ưu đãi & Hạng", icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-24">
      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-[3rem] overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl relative z-10">
                <img 
                  src={profile?.avatarUrl || `https://ui-avatars.com/api/?name=${profile?.fullName || 'User'}&background=random`} 
                  alt={profile?.fullName || 'User'} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="absolute inset-0 bg-blue-600/20 blur-3xl rounded-full scale-110 -z-10 group-hover:scale-125 transition-transform duration-700" />
              <button className="absolute bottom-2 right-2 p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 hover:bg-blue-600 hover:text-white transition-all z-20">
                <Camera className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{profile?.fullName || 'Người dùng'}</h1>
                <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                  <ShieldCheck className="w-3.5 h-3.5" /> {profile?.role || 'Khách hàng'}
                </div>
              </div>
              <p className="text-slate-400 font-medium text-lg flex items-center justify-center md:justify-start gap-2">
                <Mail className="w-5 h-5" /> {profile?.email || 'Email chưa cập nhật'}
              </p>
              
              {/* Stats Mini Grid */}
              <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-4">
                 <div className="flex items-center gap-2">
                    <span className="text-blue-600 font-black text-xl tabular-nums">{orders?.length || 0}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đơn hàng</span>
                 </div>
                 <div className="w-px h-4 bg-slate-200 mt-2" />
                 <div className="flex items-center gap-2 text-emerald-600">
                    <Coins className="w-5 h-5" />
                    <span className="font-black text-xl tabular-nums">{membership?.currentPoints || 0}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Điểm thưởng</span>
                 </div>
              </div>
            </div>

            <Button 
              variant="outline"
              onClick={handleLogout}
              className="h-14 px-8 rounded-2xl border-rose-100 text-rose-500 hover:bg-rose-50 font-black uppercase text-[10px] tracking-widest transition-all"
            >
              <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-30">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-2 rounded-[2rem] border border-white dark:border-slate-800 shadow-xl inline-flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest transition-all ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "info" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                 <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-10 md:p-12 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-10">Hồ sơ cá nhân</h3>
                    <form onSubmit={handleUpdateProfile} className="space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Họ và tên</label>
                             <input 
                                type="text"
                                value={profile.fullName}
                                onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-600/20 outline-none"
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Email (Không thể sửa)</label>
                             <input 
                                type="email"
                                value={profile.email}
                                disabled
                                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 rounded-2xl font-bold opacity-60 cursor-not-allowed"
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Số điện thoại</label>
                             <input 
                                type="text"
                                value={profile.phone}
                                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-600/20 outline-none"
                             />
                          </div>
                       </div>
                       <Button 
                          type="submit" 
                          disabled={saving}
                          className="h-16 px-12 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
                       >
                          {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Settings className="w-5 h-5 mr-2" />}
                          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                       </Button>
                    </form>
                 </div>
                 
                 <div className="space-y-6">
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 p-8 rounded-[2.5rem] border border-emerald-100/50 dark:border-emerald-900/30">
                       <ShieldCheck className="w-10 h-10 text-emerald-600 mb-6" />
                       <h4 className="text-lg font-black text-emerald-900 dark:text-emerald-100 uppercase tracking-tight mb-2">Bảo mật tài khoản</h4>
                       <p className="text-emerald-800/60 dark:text-emerald-400/60 text-sm font-medium leading-relaxed">Tài khoản của bạn đã được xác thực và bảo vệ bằng mật mã 2 lớp.</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-8 rounded-[2.5rem] border border-blue-100/50 dark:border-blue-900/30">
                       <Zap className="w-10 h-10 text-blue-600 mb-6" />
                       <h4 className="text-lg font-black text-blue-900 dark:text-blue-100 uppercase tracking-tight mb-2">Thông báo</h4>
                       <p className="text-blue-800/60 dark:text-blue-400/60 text-sm font-medium leading-relaxed">Bạn có 2 ưu đãi mới sắp hết hạn trong tuần này. Kiểm tra ngay!</p>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="space-y-10">
                 <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                       <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Đơn hàng đã mua</h3>
                       
                       {/* Date Filter */}
                       <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                          <div className="flex flex-col px-4">
                             <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Từ ngày</span>
                             <input 
                                type="date" value={orderFilters.startDate}
                                onChange={(e) => setOrderFilters({...orderFilters, startDate: e.target.value, page: 1})}
                                className="text-xs font-bold outline-none bg-transparent"
                             />
                          </div>
                          <div className="w-px h-8 bg-slate-100" />
                          <div className="flex flex-col px-4">
                             <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Đến ngày</span>
                             <input 
                                type="date" value={orderFilters.endDate}
                                onChange={(e) => setOrderFilters({...orderFilters, endDate: e.target.value, page: 1})}
                                className="text-xs font-bold outline-none bg-transparent"
                             />
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Status Chips */}
                 <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'ALL', label: 'Tất cả' },
                      { id: 'PENDING', label: 'Chờ xử lý' },
                      { id: 'CONFIRMED', label: 'Đã xác nhận' },
                      { id: 'PROCESSING', label: 'Đang chuẩn bị' },
                      { id: 'SHIPPING', label: 'Đang giao' },
                      { id: 'CANCELLED', label: 'Đã hủy' },
                      { id: 'DELIVERED', label: 'Thành công' },
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setOrderFilters({...orderFilters, status: s.id, page: 1})}
                        className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                          orderFilters.status === s.id 
                            ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20' 
                            : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                 </div>

                 {ordersLoading ? (
                    <div className="space-y-6">
                       {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-[2.5rem]" />)}
                    </div>
                 ) : (
                    <div className="space-y-6">
                       {orders.length === 0 ? (
                          <div className="bg-white dark:bg-slate-900 p-20 rounded-[3rem] text-center border border-slate-100 dark:border-slate-800 shadow-sm">
                             <Package className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                             <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Không tìm thấy đơn hàng phù hợp</p>
                          </div>
                       ) : (
                          <>
                            <div className="grid grid-cols-1 gap-6">
                              {orders.map((order) => {
                                const firstItem = order.items?.[0] || {};
                                return (
                                  <div key={order.id || order._id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-8 group hover:border-blue-200 transition-all shadow-sm">
                                      <div className="flex items-center gap-6 flex-1 w-full">
                                        <div className="w-24 h-24 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-50 dark:border-slate-800 shadow-inner group-hover:border-blue-100 transition-all">
                                            {firstItem.imageUrl ? (
                                              <ImageWithFallback 
                                                src={firstItem.imageUrl} 
                                                className="w-full h-full object-contain p-2"
                                              />
                                            ) : (
                                              <ShoppingBag className="w-8 h-8 text-slate-300" />
                                            )}
                                        </div>
                                        <div className="space-y-1.5 flex-1 min-w-0">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
                                              Đơn hàng: <span className="text-slate-900 dark:text-white font-mono">#{(order.id || order._id).toUpperCase()}</span>
                                            </p>
                                            <div className="flex items-center gap-2">
                                              <div className={`px-2.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${statusConfig[order.status]?.bg} ${statusConfig[order.status]?.color} border border-current/10`}>
                                                {statusConfig[order.status]?.label}
                                              </div>
                                              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                            <h4 className="text-sm font-black text-slate-900 dark:text-white line-clamp-1">{firstItem.name || 'Đơn hàng PubliCast'}</h4>
                                            
                                            <div className="flex items-center gap-3">
                                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng tiền:</span>
                                              <div className="flex items-center gap-2">
                                                <span className="text-base font-black text-blue-600">{(order.finalAmount || order.totalAmount || 0).toLocaleString()}₫</span>
                                                {(order.discountAmount > 0 || order.shippingDiscountAmount > 0) && (
                                                  <span className="text-[10px] font-bold text-slate-400 line-through opacity-60">{(order.totalAmount || 0).toLocaleString()}₫</span>
                                                )}
                                              </div>
                                            </div>
                                        </div>
                                      </div>
                                      
                                      <Button 
                                        variant="outline" 
                                        className="rounded-xl font-black uppercase text-[9px] tracking-widest px-8 h-12 border-slate-100 hover:bg-slate-50 hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm w-full md:w-auto" 
                                        onClick={() => handleShowOrderDetail(order.id || order._id)}
                                      >
                                        Xem chi tiết
                                      </Button>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Pagination */}
                            {orderMeta.totalPages > 1 && (
                              <div className="flex justify-center items-center gap-4 pt-10">
                                 <Button 
                                    variant="ghost" disabled={orderFilters.page === 1}
                                    onClick={() => setOrderFilters({...orderFilters, page: orderFilters.page - 1})}
                                    className="rounded-xl w-12 h-12 p-0"
                                 >
                                    <ChevronRight className="w-4 h-4 rotate-180" />
                                 </Button>
                                 <div className="flex gap-2">
                                    {[...Array(orderMeta.totalPages)].map((_, i) => (
                                      <button
                                        key={i}
                                        onClick={() => setOrderFilters({...orderFilters, page: i + 1})}
                                        className={`w-12 h-12 rounded-xl text-xs font-black transition-all ${
                                          orderFilters.page === i + 1 
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                                            : 'bg-white text-slate-400 hover:bg-slate-50'
                                        }`}
                                      >
                                        {i + 1}
                                      </button>
                                    ))}
                                 </div>
                                 <Button 
                                    variant="ghost" disabled={orderFilters.page === orderMeta.totalPages}
                                    onClick={() => setOrderFilters({...orderFilters, page: orderFilters.page + 1})}
                                    className="rounded-xl w-12 h-12 p-0"
                                 >
                                    <ChevronRight className="w-4 h-4" />
                                 </Button>
                              </div>
                            )}
                          </>
                       )}
                    </div>
                 )}
              </div>
            )}

            {activeTab === "addresses" && (
              <div className="space-y-10">
                 <div className="flex items-center justify-between">
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Sổ địa chỉ</h3>
                    <Button onClick={() => { setEditingAddress(null); setAddressModalOpen(true); }} className="rounded-2xl font-black uppercase text-[10px] tracking-widest h-12 px-8">Thêm địa chỉ mới</Button>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((addr) => (
                       <div key={addr._id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm relative group hover:border-blue-200 transition-all">
                          <div className="flex items-start justify-between mb-6">
                             <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600">
                                <MapPin className="w-6 h-6" />
                             </div>
                             <div className="flex gap-2">
                               {addr.isDefault && (
                                  <span className="bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg shadow-emerald-500/20">Mặc định</span>
                               )}
                               {!addr.isDefault && (
                                 <button onClick={() => handleSetDefault(addr._id)} className="text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600">Đặt mặc định</button>
                               )}
                             </div>
                          </div>
                          <p className="text-slate-900 dark:text-white font-black text-base mb-2 tabular-nums">{addr.phone}</p>
                          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed line-clamp-2 mb-8">{formatAddress(addr)}</p>
                          
                          <div className="flex gap-4">
                             <Button 
                                variant="ghost" size="sm" 
                                onClick={() => { setEditingAddress(addr); setAddressModalOpen(true); }}
                                className="rounded-lg font-black uppercase text-[9px] tracking-widest px-4 hover:bg-blue-50 text-blue-600"
                             >
                                Sửa
                             </Button>
                             {!addr.isDefault && (
                                <Button 
                                  variant="ghost" size="sm" 
                                  onClick={() => handleDeleteAddress(addr._id)}
                                  className="rounded-lg font-black uppercase text-[9px] tracking-widest px-4 hover:bg-rose-50 text-rose-500"
                                >
                                  Xóa
                                </Button>
                             )}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
            )}

            {activeTab === "rewards" && (
              <MembershipTab 
                membership={membership}
                tiers={tiers}
                logs={rewardLogs}
                isLoading={membershipLoading}
                error={null}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailView 
            order={selectedOrder} 
            onClose={() => setSearchParams({ tab: 'orders' })} 
          />
        )}
      </AnimatePresence>

      <AddressModal 
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        onSave={handleSaveAddress}
        editingAddress={editingAddress}
        provinces={provinces}
        defaultPhone={profile.phone}
      />
    </div>
  );
};

export default Profile;
