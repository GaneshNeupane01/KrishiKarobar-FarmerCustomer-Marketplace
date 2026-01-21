import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

const statusOptions = ['Active', 'Out of Stock'];
const categoryOptions = ['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Meat', 'Other'];
const unitOptions = ['kg', 'g', 'pieces', 'dozen', 'bundle', 'liters', 'ml'];

export default function EditProductModal({ open, onClose, product, onSave }) {
  const [form, setForm] = useState({
    image: product?.image || '',
    name: product?.name || '',
    category: product?.category || '',
    subcategory: product?.subcategory || '',
    price: product?.price !== undefined && product?.price !== null ? product.price : '',
    min_order: product?.min_order !== undefined && product?.min_order !== null ? product.min_order : '',
    unit: product?.unit || '',
    province: product?.province || '',
    product_address: product?.product_address || '',
    stock: product?.stock !== undefined && product?.stock !== null ? product.stock : '',
    status: product?.status || 'Active',
    description: product?.description || '',
  });
  const [preview, setPreview] = useState(product?.image || '');
  const [error, setError] = useState('');
  const fileInput = useRef();

  if (!open) return null;

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };
  const handleImage = e => {
    const file = e.target.files[0];
    if (file) {
      setForm(f => ({ ...f, image: file }));
      const reader = new FileReader();
      reader.onload = ev => setPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };
  const handleSubmit = e => {
    e.preventDefault();
    if (!form.name || !form.category || !form.price || !form.unit || !form.province || !form.stock) {
      setError('Please fill all required fields.');
      return;
    }
    setError('');
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center  animate-fade-in-up">
      <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-100 w-full max-w-lg p-8 animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-emerald-100 transition-colors"><X className="w-6 h-6 text-emerald-500" /></button>
        <h2 className="text-2xl font-bold text-emerald-800 mb-6">{product ? 'Edit Product' : 'Add Product'}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Image upload */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-28 h-28 rounded-xl bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center overflow-hidden shadow">
              {preview ? (
                <img src={preview} alt="Preview" className="object-cover w-full h-full" />
              ) : (
                <ImageIcon className="w-10 h-10 text-emerald-300" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInput}
              onChange={handleImage}
              className="hidden"
            />
            <button type="button" onClick={() => fileInput.current.click()} className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow hover:scale-105 transition-all text-sm">
              <Upload className="w-4 h-4" /> Upload Image
            </button>
          </div>
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-emerald-700 mb-1">Name *</label>
            <input name="name" value={form.name} onChange={handleChange} className="w-full rounded-lg border border-emerald-200 px-3 py-2 bg-white/80 focus:ring-emerald-400" required />
          </div>
          {/* Category, Subcategory */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-emerald-700 mb-1">Category *</label>
              <select name="category" value={form.category} onChange={handleChange} className="w-full rounded-lg border border-emerald-200 px-3 py-2 bg-white/80 focus:ring-emerald-400" required>
                <option value="">Select Category</option>
                {categoryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-emerald-700 mb-1">Subcategory</label>
              <input name="subcategory" value={form.subcategory} onChange={handleChange} className="w-full rounded-lg border border-emerald-200 px-3 py-2 bg-white/80 focus:ring-emerald-400" />
            </div>
          </div>
          {/* Price, Min Order */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-emerald-700 mb-1">Price (रु) *</label>
              <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} className="w-full rounded-lg border border-emerald-200 px-3 py-2 bg-white/80 focus:ring-emerald-400" required />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-emerald-700 mb-1">Min Order</label>
              <input name="min_order" type="number" min="1" value={form.min_order} onChange={handleChange} className="w-full rounded-lg border border-emerald-200 px-3 py-2 bg-white/80 focus:ring-emerald-400" />
            </div>
          </div>
          {/* Unit, Province */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-emerald-700 mb-1">Unit *</label>
              <select name="unit" value={form.unit} onChange={handleChange} className="w-full rounded-lg border border-emerald-200 px-3 py-2 bg-white/80 focus:ring-emerald-400" required>
                <option value="">Select Unit</option>
                {unitOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-emerald-700 mb-1">Province *</label>
              <select name="province" value={form.province} onChange={handleChange} className="w-full rounded-lg border border-emerald-200 px-3 py-2 bg-white/80 focus:ring-emerald-400" required>
                <option value="">Select Province</option>
                <option value="Koshi">Koshi</option>
                <option value="Madhesh">Madhesh</option>
                <option value="Bagmati">Bagmati</option>
                <option value="Gandaki">Gandaki</option>
                <option value="Lumbini">Lumbini</option>
                <option value="Karnali">Karnali</option>
                <option value="Sudurpashchim">Sudurpashchim</option>
              </select>
            </div>
          </div>
          {/* Product Address */}
          <div>
            <label className="block text-sm font-semibold text-emerald-700 mb-1">Product Address</label>
            <input name="product_address" value={form.product_address} onChange={handleChange} className="w-full rounded-lg border border-emerald-200 px-3 py-2 bg-white/80 focus:ring-emerald-400" />
          </div>
          {/* Stock, Status */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-emerald-700 mb-1">Stock *</label>
              <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} className="w-full rounded-lg border border-emerald-200 px-3 py-2 bg-white/80 focus:ring-emerald-400" required />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-emerald-700 mb-1">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="w-full rounded-lg border border-emerald-200 px-3 py-2 bg-white/80 focus:ring-emerald-400">
                {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>
          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-emerald-700 mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="w-full rounded-lg border border-emerald-200 px-3 py-2 bg-white/80 focus:ring-emerald-400 resize-none min-h-[60px]" />
          </div>
          {error && <div className="text-rose-600 text-sm font-semibold text-center">{error}</div>}
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 font-semibold hover:bg-gray-200 transition-all">Cancel</button>
            <button type="submit" className="px-6 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow hover:scale-105 transition-all">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
} 