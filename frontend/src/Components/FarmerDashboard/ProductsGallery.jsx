import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Search, Filter, CheckSquare, Square, ChevronDown, ChevronUp, Eye, Star, TrendingUp, Package, Calendar, DollarSign } from 'lucide-react';
import EditProductModal from './EditProductModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { useNavigate } from 'react-router-dom';

const categoryOptions = ['All', 'Vegetables', 'Fruits', 'Grains', 'Dairy', 'Herbs', 'Seeds'];

const initialProducts = [];

const statusOptions = ['All', 'Active', 'Out of Stock'];
const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating-desc', label: 'Rating: High to Low' },
  { value: 'sales-desc', label: 'Sales: High to Low' },
  { value: 'views-desc', label: 'Views: High to Low' },
];

export default function ProductsGallery() {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');
  const [selected, setSelected] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [editModal, setEditModal] = useState({ open: false, product: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, product: null, bulk: false });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();

  // Fetch products for this farmer with server-side filtering
  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      // Get farmer username from profile
      const profileRes = await fetch('http://localhost:8000/api/profile/', {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (!profileRes.ok) throw new Error('Failed to fetch profile');
      const profileData = await profileRes.json();
      const farmerName = profileData.profile.user.username;
      // Build query params for server-side filtering
      let params = [];
      if (status !== 'All') params.push(`status=${encodeURIComponent(status)}`);
      if (category !== 'All') params.push(`category=${encodeURIComponent(category)}`);
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (sort && sort !== 'newest') {
        if (sort === 'price-asc') params.push('ordering=price');
        else if (sort === 'price-desc') params.push('ordering=-price');
        else if (sort === 'rating-desc') params.push('ordering=-rating');
        else if (sort === 'sales-desc') params.push('ordering=-sales');
        else if (sort === 'views-desc') params.push('ordering=-views');
      } else {
        params.push('ordering=-date_added');
      }
      // Always filter by farmer
      params.push(`farmer_username=${encodeURIComponent(farmerName)}`);
      const url = `http://localhost:8000/api/products/?${params.join('&')}`;
      const prodRes = await fetch(url, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (!prodRes.ok) throw new Error('Failed to fetch products');
      const prodData = await prodRes.json();
      setProducts(prodData);
    } catch (err) {
      setError(err.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [status, category, search, sort]);

  // Filtering logic
  let filteredProducts = products;
  
  // Bulk select logic
  const allSelected = selected.length === filteredProducts.length && filteredProducts.length > 0;
  const toggleSelectAll = () => {
    if (allSelected) setSelected([]);
    else setSelected(filteredProducts.map(p => p.id));
  };
  const toggleSelect = id => {
    setSelected(sel => sel.includes(id) ? sel.filter(i => i !== id) : [...sel, id]);
  };

  // CRUD handlers
  const handleAdd = () => setEditModal({ open: true, product: null });
  const handleEdit = product => setEditModal({ open: true, product });
  const handleDelete = product => setDeleteModal({ open: true, product, bulk: false });
  const handleBulkDelete = () => setDeleteModal({ open: true, product: null, bulk: true });

  // Edit product
  const handleSave = async updated => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      Object.entries(updated).forEach(([key, value]) => {
        if (value !== undefined && value !== null) formData.append(key, value);
      });
      // If image is a file, use it; else skip
      if (updated.image && typeof updated.image !== 'string') {
        formData.set('image', updated.image);
      } else {
        formData.delete('image');
      }
      const res = await fetch(`http://localhost:8000/api/products/${editModal.product.id}/`, {
        method: 'PATCH',
        headers: { 'Authorization': `Token ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || Object.values(data).join(' '));
        setLoading(false);
        return;
      }
      setEditModal({ open: false, product: null });
      setToast({ show: true, message: 'Product updated successfully!', type: 'success' });
      await fetchProducts();
    } catch (err) {
      setError('Failed to update product.');
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (deleteModal.bulk) {
        // Bulk delete
        await Promise.all(selected.map(async id => {
          const res = await fetch(`http://localhost:8000/api/products/${id}/`, {
            method: 'DELETE',
            headers: { 'Authorization': `Token ${token}` },
          });
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.detail || 'Failed to delete product(s).');
          }
        }));
        setSelected([]);
      } else if (deleteModal.product) {
        const res = await fetch(`http://localhost:8000/api/products/${deleteModal.product.id}/`, {
          method: 'DELETE',
          headers: { 'Authorization': `Token ${token}` },
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || 'Failed to delete product.');
        }
        setSelected(sel => sel.filter(id => id !== deleteModal.product.id));
      }
      setToast({ show: true, message: 'Product deleted successfully!', type: 'success' });
      setDeleteModal({ open: false, product: null, bulk: false });
      await fetchProducts();
    } catch (err) {
      setToast({ show: true, message: err.message || 'Failed to delete product(s).', type: 'error' });
      setDeleteModal({ open: false, product: null, bulk: false });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700';
      case 'Out of Stock': return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-700';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    }
  };

  // Toast auto-hide
  useEffect(() => {
    if (toast.show) {
      const t = setTimeout(() => setToast({ ...toast, show: false }), 2500);
      return () => clearTimeout(t);
    }
  }, [toast.show]);

  return (
    <div className="space-y-8 animate-fade-in-up mt-[2rem]">
      {/* Toast notification */}
      {toast.show && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg font-semibold text-lg transition-all duration-300 ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>{toast.message}</div>
      )}
      {/* Enhanced Header and Actions */}
      <div className="relative  overflow-hidden rounded-3xl bg-gradient-to-br from-white/80 to-emerald-50/80 dark:from-gray-800/80 dark:to-gray-700/80 backdrop-blur-xl border border-emerald-100/50 dark:border-gray-600/50 shadow-2xl shadow-emerald-500/10 dark:shadow-gray-900/20 p-8">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 dark:from-emerald-400/10 dark:to-teal-400/10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                  Products Gallery
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
                Manage your product listings, track performance, and grow your sales
              </p>
            </div>
            <div className="flex gap-3 flex-wrap items-center">
              <button 
                onClick={handleAdd} 
                className="group flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-xl hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                <span>Add Product</span>
              </button>
              {selected.length > 0 && (
                <button 
                  onClick={handleBulkDelete} 
                  className="group flex items-center gap-3 px-6 py-4 rounded-2xl bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 font-semibold shadow-lg border border-rose-200 dark:border-rose-700 hover:bg-rose-200 dark:hover:bg-rose-800/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Delete Selected ({selected.length})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filter Bar */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-100/50 dark:border-gray-600/50 p-6">
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          {/* Search */}
          <div className="relative w-full max-w-md">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, price, date..."
              className="w-full py-3 pl-12 pr-4 rounded-2xl bg-white/90 dark:bg-gray-700/90 shadow-lg border border-emerald-100 dark:border-gray-600 focus:ring-2 focus:ring-emerald-400 focus:outline-none text-base placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300 hover:shadow-xl text-gray-900 dark:text-gray-100"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none">
              <Search className="w-5 h-5" />
            </span>
          </div>

          {/* Filters */}
          <div className="flex gap-3 items-center">
            <button 
              onClick={() => setShowFilters(f => !f)} 
              className="group flex items-center gap-2 px-4 py-3 rounded-2xl border border-emerald-200 dark:border-gray-600 bg-white/80 dark:bg-gray-700/80 text-emerald-700 dark:text-emerald-400 font-semibold shadow-lg hover:bg-emerald-100 dark:hover:bg-gray-600 hover:shadow-xl transition-all duration-300"
            >
              <Filter className="w-5 h-5" /> 
              Filters 
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showFilters && (
              <div className="flex gap-3 items-center">
                <select 
                  value={status} 
                  onChange={e => setStatus(e.target.value)} 
                  className="rounded-xl border border-emerald-200 dark:border-gray-600 px-4 py-3 bg-white/80 dark:bg-gray-700/80 focus:ring-emerald-400 shadow-lg hover:shadow-xl transition-all duration-300 text-gray-900 dark:text-gray-100"
                >
                  {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)} 
                  className="rounded-xl border border-emerald-200 dark:border-gray-600 px-4 py-3 bg-white/80 dark:bg-gray-700/80 focus:ring-emerald-400 shadow-lg hover:shadow-xl transition-all duration-300 text-gray-900 dark:text-gray-100"
                >
                  {categoryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Sort and View Mode */}
          <div className="flex items-center gap-3 ml-auto">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700 dark:text-gray-300">Sort:</span>
              <select 
                value={sort} 
                onChange={e => setSort(e.target.value)} 
                className="rounded-xl border border-emerald-200 dark:border-gray-600 px-4 py-3 bg-white/80 dark:bg-gray-700/80 focus:ring-emerald-400 shadow-lg hover:shadow-xl transition-all duration-300 text-gray-900 dark:text-gray-100"
              >
                {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-700/80 rounded-xl p-1 shadow-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'grid' ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-600 dark:text-gray-400 hover:bg-emerald-100 dark:hover:bg-gray-600'}`}
              >
                <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                  <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                </div>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'list' ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-600 dark:text-gray-400 hover:bg-emerald-100 dark:hover:bg-gray-600'}`}
              >
                <div className="w-4 h-4 space-y-0.5">
                  <div className="w-full h-1 bg-current rounded-sm"></div>
                  <div className="w-full h-1 bg-current rounded-sm"></div>
                  <div className="w-full h-1 bg-current rounded-sm"></div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Display */}
      {loading ? (
        <div className="text-center py-12 text-lg text-gray-500 dark:text-gray-400">Loading products...</div>
      ) : error ? (
        <div className="text-center py-12 text-lg text-red-500 dark:text-red-400">{error}</div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-12 h-12 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No products found</h3>
              <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
            </div>
          ) : filteredProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              selected={selected.includes(product.id)}
              onToggleSelect={() => toggleSelect(product.id)}
              onEdit={() => handleEdit(product)}
              onDelete={() => handleDelete(product)}
              getStatusColor={getStatusColor}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-100/50 dark:border-gray-600/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-gray-700/50 dark:to-gray-600/50 border-b border-emerald-100/50 dark:border-gray-600/50">
                  <th className="py-4 px-6 text-left">
                    <button onClick={toggleSelectAll} className="focus:outline-none">
                      {allSelected ? <CheckSquare className="w-5 h-5 text-emerald-500" /> : <Square className="w-5 h-5 text-gray-400 dark:text-gray-500" />}
                    </button>
                  </th>
                  <th className="py-4 px-6 text-left font-semibold text-emerald-800 dark:text-emerald-300">Product</th>
                  <th className="py-4 px-6 text-left font-semibold text-emerald-800 dark:text-emerald-300">Category</th>
                  <th className="py-4 px-6 text-left font-semibold text-emerald-800 dark:text-emerald-300">Price</th>
                  <th className="py-4 px-6 text-left font-semibold text-emerald-800 dark:text-emerald-300">Stock</th>
                  <th className="py-4 px-6 text-left font-semibold text-emerald-800 dark:text-emerald-300">Status</th>
                  <th className="py-4 px-6 text-left font-semibold text-emerald-800 dark:text-emerald-300">Rating</th>
                  <th className="py-4 px-6 text-left font-semibold text-emerald-800 dark:text-emerald-300">Performance</th>
                  <th className="py-4 px-6 text-left font-semibold text-emerald-800 dark:text-emerald-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id} className="border-b border-emerald-50/50 dark:border-gray-600/50 hover:bg-emerald-50/30 dark:hover:bg-gray-700/30 transition-all duration-300">
                    <td className="py-4 px-6">
                      <button onClick={() => toggleSelect(product.id)} className="focus:outline-none">
                        {selected.includes(product.id) ? <CheckSquare className="w-5 h-5 text-emerald-500" /> : <Square className="w-5 h-5 text-gray-400 dark:text-gray-500" />}
                      </button>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-xl border border-emerald-100 dark:border-gray-600 shadow-lg" />
                        <div>
                          <div className="font-semibold text-emerald-900 dark:text-emerald-200">{product.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-emerald-700 dark:text-emerald-400">रु{(typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0).toFixed(2)}</td>
                    <td className="py-4 px-6 text-gray-700 dark:text-gray-300">{product.stock}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(product.status)}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-semibold text-gray-700 dark:text-gray-300">{product.rating}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Eye className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">{product.views}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <TrendingUp className="w-3 h-3 text-emerald-500" />
                          <span className="text-gray-700 dark:text-gray-300">{product.sales}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(product)} className="p-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-gray-600 transition-colors" title="Edit">
                          <Edit className="w-4 h-4 text-emerald-500" />
                        </button>
                        <button onClick={() => handleDelete(product)} className="p-2 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4 text-rose-500" />
                        </button>
                        <button onClick={() => navigate(`/products/${product.id}`)} className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors" title="View Details">
                          <Eye className="w-4 h-4 text-blue-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {editModal.open && (
        <EditProductModal
          open={editModal.open}
          product={editModal.product}
          onSave={handleSave}
          onClose={() => setEditModal({ open: false, product: null })}
          responsive
        />
      )}
      {deleteModal.open && (
        <DeleteConfirmationModal
          open={deleteModal.open}
          productName={deleteModal.product?.name}
          bulk={deleteModal.bulk}
          count={selected.length}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteModal({ open: false, product: null, bulk: false })}
        />
      )}
    </div>
  );
}

function ProductCard({ product, selected, onToggleSelect, onEdit, onDelete, getStatusColor }) {
  // Defensive: ensure price is a number
  let priceNum = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;
  let ratingNum = typeof product.rating === 'number' ? product.rating : parseFloat(product.rating) || 0;
  let stockNum = typeof product.stock === 'number' ? product.stock : parseInt(product.stock) || 0;
  const navigate = useNavigate();
  return (
    <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl border border-emerald-100/50 dark:border-gray-600/50 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
      {/* Selection Checkbox */}
      <div className="absolute top-4 left-4 z-10">
        <button onClick={onToggleSelect} className="focus:outline-none">
          {selected ? <CheckSquare className="w-5 h-5 text-emerald-500" /> : <Square className="w-5 h-5 text-gray-400 dark:text-gray-500" />}
        </button>
      </div>

      {/* Product Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(product.status)}`}>
            {product.status}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button onClick={onEdit} className="p-2 bg-white/90 dark:bg-gray-700/90 rounded-lg shadow-lg hover:bg-emerald-100 dark:hover:bg-emerald-600 transition-colors">
            <Edit className="w-4 h-4 text-emerald-500" />
          </button>
          <button onClick={onDelete} className="p-2 bg-white/90 dark:bg-gray-700/90 rounded-lg shadow-lg hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors">
            <Trash2 className="w-4 h-4 text-rose-500" />
          </button>
          <button onClick={() => navigate(`/products/${product.id}`)} className="p-2 bg-white/90 dark:bg-gray-700/90 rounded-lg shadow-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors" title="View Details">
            <Eye className="w-4 h-4 text-blue-500" />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-200 mb-1">{product.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{product.description}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="font-semibold text-gray-700 dark:text-gray-300">{ratingNum}</span>
          </div>
          <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">रु{priceNum.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>Stock: {stockNum}</span>
          <span>Category: {product.category}</span>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-emerald-100 dark:border-gray-600">
          <div className="text-center p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
            <div className="flex items-center justify-center gap-1 text-sm text-emerald-700 dark:text-emerald-400">
              <Eye className="w-3 h-3" />
              <span className="font-semibold">{product.views}</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Views</div>
          </div>
          <div className="text-center p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-center justify-center gap-1 text-sm text-blue-700 dark:text-blue-400">
              <TrendingUp className="w-3 h-3" />
              <span className="font-semibold">{product.sales}</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Sales</div>
          </div>
        </div>
      </div>
    </div>
  );
} 