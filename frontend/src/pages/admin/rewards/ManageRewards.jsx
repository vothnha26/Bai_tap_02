import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Trophy, Award, Plus, Edit2, Trash2, Save, X, ChevronRight, Settings, Coins, Sparkles, Gift } from 'lucide-react';
import rewardService from '../../../services/reward.service';
import { productApi } from '../../../services/product.service';
import DynamicBenefitForm from './DynamicBenefitForm';
import { toast } from 'sonner';

export default function ManageRewards() {
  const [tiers, setTiers] = useState([]);
  const [benefits, setBenefits] = useState([]);
  const [rules, setRules] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tiers');
  const [editingTier, setEditingTier] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingRule, setEditingRule] = useState(null);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [ruleForm, setRuleForm] = useState({
    productId: '',
    rewardPoints: 0,
    isActive: true
  });

  const { register, handleSubmit, reset, control, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      code: '',
      name: '',
      minPoints: 0,
      benefits: []
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tiersRes, benefitsRes, rulesRes, productsRes] = await Promise.all([
        rewardService.getAllTiers(),
        rewardService.getAllBenefits(),
        rewardService.getProductRewardRules(),
        productApi.getAll()
      ]);
      setTiers(Array.isArray(tiersRes) ? tiersRes : (tiersRes?.data || []));
      setBenefits(Array.isArray(benefitsRes) ? benefitsRes : (benefitsRes?.data || []));
      setRules(Array.isArray(rulesRes) ? rulesRes : (rulesRes?.data || []));
      setProducts(productsRes.data?.data?.products || productsRes.data?.products || []);
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (tier = null) => {
    if (tier) {
      setEditingTier(tier);
      reset({
        code: tier.code,
        name: tier.name,
        minPoints: tier.minPoints,
        benefits: tier.benefits.map(b => ({
          benefitId: b.benefitId?._id || b.benefitId,
          value: b.value
        }))
      });
    } else {
      setEditingTier(null);
      reset({
        code: '',
        name: '',
        minPoints: 0,
        benefits: []
      });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingTier) {
        await rewardService.updateTier(editingTier.id, data);
        toast.success('Cập nhật hạng thành công');
      } else {
        await rewardService.createTier(data);
        toast.success('Tạo hạng mới thành công');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Lỗi: ' + error.message);
    }
  };

  const handleDeleteTier = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa hạng này?')) return;
    try {
      await rewardService.deleteTier(id);
      toast.success('Xóa hạng thành công');
      fetchData();
    } catch (error) {
      toast.error('Lỗi khi xóa: ' + error.message);
    }
  };

  const handleOpenRuleModal = (rule = null) => {
    if (rule) {
      setEditingRule(rule);
      setRuleForm({
        productId: rule.productId?._id || rule.productId,
        rewardPoints: rule.rewardPoints,
        isActive: rule.isActive
      });
    } else {
      setEditingRule(null);
      setRuleForm({
        productId: '',
        rewardPoints: 0,
        isActive: true
      });
    }
    setIsRuleModalOpen(true);
  };

  const handleRuleSubmit = async (e) => {
    e.preventDefault();
    if (!ruleForm.productId) {
      toast.error('Vui lòng chọn sản phẩm');
      return;
    }
    if (ruleForm.rewardPoints < 0) {
      toast.error('Điểm thưởng phải >= 0');
      return;
    }
    try {
      await rewardService.upsertProductRewardRule(ruleForm);
      toast.success(editingRule ? 'Cập nhật luật thành công' : 'Thêm luật điểm thưởng thành công');
      setIsRuleModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Lỗi: ' + error.message);
    }
  };

  const handleDeleteRule = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa luật điểm thưởng này?')) return;
    try {
      await rewardService.deleteProductRewardRule(id);
      toast.success('Xóa luật thành công');
      fetchData();
    } catch (error) {
      toast.error('Lỗi khi xóa: ' + error.message);
    }
  };

  if (loading && !tiers.length) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <Trophy className="w-10 h-10 text-yellow-500" />
            Hệ thống Hạng & Thưởng
          </h1>
          <p className="text-gray-500 font-medium mt-1">Quản lý các cấp bậc thành viên, quyền lợi và điểm thưởng sản phẩm.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
          <button
            onClick={() => setActiveTab('tiers')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'tiers' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Hạng thành viên
          </button>
          <button
            onClick={() => setActiveTab('benefits')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'benefits' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Danh mục quyền lợi
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'rules' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Điểm thưởng sản phẩm
          </button>
        </div>
      </div>

      {activeTab === 'tiers' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            >
              <Plus className="w-5 h-5" />
              Thêm hạng mới
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <div 
                key={tier.id} 
                className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
              >
                <div className={`h-2 bg-gradient-to-r ${
                  tier.code === 'GOLD' ? 'from-yellow-400 to-yellow-600' : 
                  tier.code === 'SILVER' ? 'from-gray-300 to-gray-500' : 'from-orange-400 to-orange-600'
                }`} />
                
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-gray-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <Award className={`w-8 h-8 ${
                        tier.code === 'GOLD' ? 'text-yellow-600' : 
                        tier.code === 'SILVER' ? 'text-gray-600' : 'text-orange-600'
                      }`} />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(tier)}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteTier(tier.id)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-gray-900">{tier.name}</h3>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-tighter mb-4">{tier.code}</p>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-bold text-gray-400 uppercase">Điểm tối thiểu</span>
                      <span className="text-lg font-black text-blue-600 tabular-nums">{tier.minPoints.toLocaleString()}</span>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                      <span className="text-xs font-bold text-gray-400 uppercase mb-3 block">Quyền lợi ({tier.benefits.length})</span>
                      <ul className="space-y-2">
                        {tier.benefits.map((b, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                            <ChevronRight className="w-3 h-3 text-blue-500" />
                            <span className="font-medium">{b.benefitId?.name || 'Unknown'}:</span>
                            <span className="font-bold text-gray-900">
                              {typeof b.value === 'boolean' ? (b.value ? 'Có' : 'Không') : b.value}
                              {b.benefitId?.valueType === 'PERCENTAGE' ? '%' : ''}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'benefits' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Mã</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tên quyền lợi</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Mô tả</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Kiểu dữ liệu</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {benefits.map((benefit) => (
                  <tr key={benefit.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-bold text-blue-600">{benefit.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{benefit.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{benefit.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase">
                        {benefit.valueType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Settings className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => handleOpenRuleModal()}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-100"
            >
              <Plus className="w-5 h-5" />
              Thêm điểm thưởng sản phẩm
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Mã sản phẩm</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Điểm thưởng nhận được</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rules.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-medium">
                        Chưa cấu hình điểm thưởng cho sản phẩm nào.
                      </td>
                    </tr>
                  ) : (
                    rules.map((rule) => {
                      const matchedProd = products.find(p => p.id === rule.productId || p._id === (rule.productId?._id || rule.productId));
                      return (
                        <tr key={rule._id || rule.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {matchedProd?.image ? (
                                <img src={matchedProd.image} alt={matchedProd.name} className="w-10 h-10 object-cover rounded-lg border" />
                              ) : (
                                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 font-bold border border-emerald-100">
                                  <Gift className="w-5 h-5" />
                                </div>
                              )}
                              <div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {matchedProd?.name || rule.productId?.name || 'Sản phẩm không xác định'}
                                </div>
                                <div className="text-[11px] font-bold text-gray-400 uppercase">
                                  Price: {matchedProd?.price ? matchedProd.price.toLocaleString() + ' ₫' : '-'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                            {matchedProd?.id || matchedProd?._id || rule.productId?._id || rule.productId || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-emerald-600 font-black">
                              <Coins className="w-4 h-4" />
                              <span>+{rule.rewardPoints} points</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                              rule.isActive 
                                ? 'bg-emerald-50 text-emerald-600' 
                                : 'bg-gray-100 text-gray-400'
                            }`}>
                              {rule.isActive ? 'Kích hoạt' : 'Tạm khóa'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => handleOpenRuleModal(rule)}
                                className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteRule(rule._id || rule.id)}
                                className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tier Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-black text-gray-900">
                {editingTier ? 'Chỉnh sửa Hạng' : 'Thêm Hạng mới'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Mã định danh (CODE)</label>
                  <input
                    {...register('code', { required: 'Mã là bắt buộc' })}
                    placeholder="VD: GOLD_VIP"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono uppercase"
                  />
                  {errors.code && <p className="mt-1 text-xs text-red-500 font-medium">{errors.code.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tên hạng hiển thị</label>
                  <input
                    {...register('name', { required: 'Tên là bắt buộc' })}
                    placeholder="VD: Hạng Kim Cương"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500 font-medium">{errors.name.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Điểm tích lũy tối thiểu (Rolling 12M)</label>
                  <input
                    type="number"
                    {...register('minPoints', { required: 'Điểm là bắt buộc', valueAsNumber: true })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-black text-blue-600"
                  />
                  {errors.minPoints && <p className="mt-1 text-xs text-red-500 font-medium">{errors.minPoints.message}</p>}
                </div>
              </div>

              <DynamicBenefitForm 
                control={control} 
                register={register} 
                errors={errors} 
                benefitMetadata={benefits}
                watch={watch}
              />

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {isSubmitting ? 'Đang lưu...' : 'Lưu cấu hình'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Reward Rule Form Modal */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10 rounded-t-3xl">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                <Coins className="w-6 h-6 text-emerald-500" />
                {editingRule ? 'Chỉnh sửa Điểm thưởng' : 'Thêm Điểm thưởng sản phẩm'}
              </h2>
              <button onClick={() => setIsRuleModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleRuleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Chọn sản phẩm</label>
                <select
                  disabled={!!editingRule}
                  value={ruleForm.productId}
                  onChange={(e) => setRuleForm({ ...ruleForm, productId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-700 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">-- Chọn sản phẩm --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.price?.toLocaleString()} ₫)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Số điểm thưởng nhận được khi mua</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={ruleForm.rewardPoints}
                    onChange={(e) => setRuleForm({ ...ruleForm, rewardPoints: parseInt(e.target.value) || 0 })}
                    placeholder="VD: 50"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-black text-emerald-600 text-lg"
                  />
                  <Coins className="w-6 h-6 text-emerald-500 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <input
                  type="checkbox"
                  id="ruleActive"
                  checked={ruleForm.isActive}
                  onChange={(e) => setRuleForm({ ...ruleForm, isActive: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="ruleActive" className="text-sm font-bold text-gray-700 cursor-pointer select-none">
                  Kích hoạt luật điểm thưởng này lập tức
                </label>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRuleModalOpen(false)}
                  className="flex-1 px-6 py-3.5 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
                >
                  <Save className="w-5 h-5" />
                  Lưu thiết lập
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
