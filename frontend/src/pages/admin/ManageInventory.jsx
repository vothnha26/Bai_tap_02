import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { inventoryApi } from '../../services/inventory.service';
import { Warehouse, History } from 'lucide-react';

// Sub-components
import InventoryStats from './inventory/InventoryStats';
import InventoryControlBar from './inventory/InventoryControlBar';
import InventoryTable from './inventory/InventoryTable';
import InventoryActionModal from './inventory/InventoryActionModal';
import InventoryTransactionTable from './inventory/InventoryTransactionTable';

export default function ManageInventory() {
  const navigate = useNavigate();
  
  // View mode switcher: 'stock' (Danh sách tồn kho) or 'history' (Lịch sử biến động)
  const [viewMode, setViewMode] = useState('stock'); 

  // Stock list state
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  // Search & Filter state for Stock list
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Transaction Logs state
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(false);
  const [txPage, setTxPage] = useState(1);
  const [txTotalPages, setTxTotalPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');

  // Stats
  const [lowStockCount, setLowStockCount] = useState(0);

  // Edit/Stocktake Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [activeTab, setActiveTab] = useState('update'); // 'update' or 'stocktake'
  
  // Form States
  const [updateForm, setUpdateForm] = useState({
    lowStockThreshold: 10,
    warehouseLocation: ''
  });
  const [stockTakeForm, setStockTakeForm] = useState({
    actualStock: 0,
    reason: ''
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'ADMIN') {
      navigate('/login');
      return;
    }
  }, [navigate]);

  const fetchInventory = async (pageNum = 1) => {
    setIsLoading(true);
    try {
      const response = await inventoryApi.getInventory({
        page: pageNum,
        limit: 10,
        search: searchQuery,
        lowStockOnly: lowStockOnly
      });
      if (response?.success) {
        setInventory(response.data.inventory);
        setTotalPages(response.data.pagination.totalPages);
        setTotalItems(response.data.pagination.totalItems);
        setPage(response.data.pagination.currentPage);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async (pageNum = 1) => {
    setTxLoading(true);
    try {
      const response = await inventoryApi.getTransactions({
        page: pageNum,
        limit: 10,
        search: searchQuery,
        type: typeFilter
      });
      if (response?.success) {
        setTransactions(response.data.transactions);
        setTxTotalPages(response.data.pagination.totalPages);
        setTxPage(response.data.pagination.currentPage);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setTxLoading(false);
    }
  };

  const fetchLowStockCount = async () => {
    try {
      const response = await inventoryApi.getLowStock();
      if (response?.success) {
        setLowStockCount(response.data.length);
      }
    } catch (error) {
    }
  };

  // Fetch logic based on active tab and filters
  useEffect(() => {
    if (viewMode === 'stock') {
      fetchInventory(page);
    } else {
      fetchTransactions(txPage);
    }
  }, [page, txPage, searchQuery, lowStockOnly, typeFilter, viewMode]);

  useEffect(() => {
    fetchLowStockCount();
  }, [inventory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(searchTerm);
    if (viewMode === 'stock') {
      setPage(1);
    } else {
      setTxPage(1);
    }
  };

  const handleResetSearch = () => {
    setSearchTerm('');
    setSearchQuery('');
    setTypeFilter('');
    if (viewMode === 'stock') {
      setPage(1);
    } else {
      setTxPage(1);
    }
  };

  const openEditModal = (item) => {
    setSelectedInventory(item);
    setUpdateForm({
      lowStockThreshold: item.lowStockThreshold ?? 10,
      warehouseLocation: item.warehouseLocation ?? ''
    });
    setStockTakeForm({
      actualStock: item.stock,
      reason: ''
    });
    setActiveTab('update');
    setIsModalOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInventory) return;
    setIsActionLoading(true);
    try {
      const productId = selectedInventory.productId.id || selectedInventory.productId._id;
      const response = await inventoryApi.updateInventory(productId, {
        lowStockThreshold: updateForm.lowStockThreshold,
        warehouseLocation: updateForm.warehouseLocation
      });
      if (response?.success) {
        setIsModalOpen(false);
        fetchInventory(page);
      }
    } catch (error) {
      alert('Lỗi cập nhật: ' + error.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleStockTakeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInventory) return;
    setIsActionLoading(true);
    try {
      const productId = selectedInventory.productId.id || selectedInventory.productId._id;
      const response = await inventoryApi.submitStockTake(productId, {
        actualStock: stockTakeForm.actualStock,
        reason: stockTakeForm.reason
      });
      if (response?.success) {
        setIsModalOpen(false);
        fetchInventory(page);
      }
    } catch (error) {
      alert('Lỗi kiểm kho: ' + error.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Warehouse className="w-8 h-8 text-blue-600" />
            Quản lý tồn kho
          </h2>
          <p className="text-gray-500 text-sm mt-1">Theo dõi vị trí, cập nhật số lượng và kiểm tra ngưỡng an toàn hàng hóa.</p>
        </div>

        {/* Stats Grid */}
        <InventoryStats totalItems={totalItems} lowStockCount={lowStockCount} />
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-gray-200 mb-6 bg-white p-1 rounded-xl shadow-sm max-w-md">
        <button
          onClick={() => { 
            setViewMode('stock'); 
            handleResetSearch();
          }}
          className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
            viewMode === 'stock'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Warehouse size={16} />
          Kho hàng hiện tại
        </button>
        <button
          onClick={() => { 
            setViewMode('history'); 
            handleResetSearch();
          }}
          className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
            viewMode === 'history'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <History size={16} />
          Lịch sử biến động kho
        </button>
      </div>

      {/* Control Bar & Main Render based on View Mode */}
      {viewMode === 'stock' ? (
        <>
          <InventoryControlBar 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            lowStockOnly={lowStockOnly}
            setLowStockOnly={setLowStockOnly}
            onSubmitSearch={handleSearchSubmit}
            onResetSearch={handleResetSearch}
            searchQuery={searchQuery}
          />

          <InventoryTable 
            inventory={inventory}
            isLoading={isLoading}
            onEdit={openEditModal}
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            setPage={setPage}
          />
        </>
      ) : (
        <>
          {/* Lọc lịch sử biến động */}
          <form onSubmit={handleSearchSubmit} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setTxPage(1); }}
                className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              >
                <option value="">Tất cả loại giao dịch</option>
                <option value="STOCK_TAKE">Kiểm kho (Stock-take)</option>
                <option value="SALE">Bán hàng (Sale)</option>
                <option value="RESTOCK">Nhập kho (Restock)</option>
                <option value="RETURN">Hoàn hàng (Return)</option>
                <option value="SYSTEM_UPDATE">Cập nhật hệ thống</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all"
              >
                Tìm kiếm
              </button>
              {(searchQuery || typeFilter) && (
                <button
                  type="button"
                  onClick={handleResetSearch}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                >
                  Đặt lại
                </button>
              )}
            </div>
          </form>

          <InventoryTransactionTable 
            transactions={transactions}
            loading={txLoading}
            pagination={{
              currentPage: txPage,
              totalPages: txTotalPages
            }}
            onPageChange={setTxPage}
          />
        </>
      )}

      {/* Adjust / Stock Take Modal */}
      <InventoryActionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedInventory={selectedInventory}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        updateForm={updateForm}
        setUpdateForm={setUpdateForm}
        stockTakeForm={stockTakeForm}
        setStockTakeForm={setStockTakeForm}
        onUpdateSubmit={handleUpdateSubmit}
        onStockTakeSubmit={handleStockTakeSubmit}
        isActionLoading={isActionLoading}
        existingLocations={[
          ...new Set(
            inventory
              .map((item) => item.warehouseLocation)
              .filter((loc) => loc && loc.trim() !== '')
          )
        ]}
      />
    </div>
  );
}
 );
}
