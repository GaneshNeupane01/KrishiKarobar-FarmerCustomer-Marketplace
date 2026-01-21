import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiUrl } from '../../api/baseUrl';

const categories = {
  Vegetables: ['Potato', 'Tomato', 'Onion', 'Lettuce', 'Spinach', 'Carrot'],
  Fruits: ['Apple', 'Banana', 'Orange', 'Blueberry', 'Grape'],
  Grains: ['Rice', 'Wheat', 'Corn', 'Barley'],
  Dairy: ['Milk', 'Cheese', 'Yogurt', 'Eggs'],
  Herbs: ['Mint', 'Basil', 'Coriander', 'Parsley'],
  Seeds: ['Pumpkin Seed', 'Almond', 'Sunflower Seed'],
};
const categoryOptions = Object.keys(categories);
const statusOptions = ['Active', 'Out of Stock'];
const unitOptions = ['kg', 'g', 'lb', 'piece', 'dozen', 'bunch', 'litre', 'ml', 'pack', 'crate', 'other'];
const provinceOptions = [
  'Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim'
];

// Reusable Input Field Component
const FormInput = ({ label, name, value, onChange, type = 'text', required = false, placeholder = '', disabled = false }) => (
  <div className="relative">
    <label htmlFor={name} className="block text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-1">{label} {required && '*'}</label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className="w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all duration-300  focus:outline-none py-2  text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
    />
  </div>
);

// Reusable Select Field Component
const FormSelect = ({ label, name, value, onChange, options, required = false, disabled = false }) => (
  <div className="relative">
    <label htmlFor={name} className="block text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-1">{label} {required && '*'}</label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className="w-full bg-transparent appearance-none dark:bg-gray-800/50 border-b-2 border-emerald-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-none py-2 transition-colors duration-300 appearance-none text-gray-900 dark:text-gray-100"
    >
      {options}
    </select>
    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
      <svg className="w-4 h-4 fill-current text-emerald-500 dark:text-emerald-400" viewBox="0 0 20 20"><path d="M5.516 7.548c.436-.446 1.144-.446 1.58 0L10 10.42l2.904-2.872c.436-.446 1.144-.446 1.58 0 .436.445.436 1.162 0 1.608l-3.694 3.664c-.436.446-1.144.446-1.58 0L5.516 9.156c-.436-.446-.436-1.162 0-1.608z"/></svg>
    </div>
  </div>
);

export default function AddProduct() {
  const { userType, isAuthenticated, profile } = useAuth();
  const [form, setForm] = useState({
    name: '',
    category: '',
    subcategory: '',
    image: '',
    price: '',
    min_order: '',
    unit: '',
    province: '',
    productAddress: '',
    description: '',
    stock: '',
    status: 'Active',
    date: '',
  });
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInput = useRef();

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (name === 'category') setForm(f => ({ ...f, subcategory: '' }));
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
  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.category || !form.price || !form.stock || !form.unit || !form.province) {
      setError('Please fill all required fields.');
      setSuccess(false);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // Fix field name mapping
          if (key === 'productAddress') {
            formData.append('product_address', value);
          } else {
            formData.append(key, value);
          }
        }
      });
      // Image: if file, use file, else skip
      if (form.image && typeof form.image !== 'string') {
        formData.set('image', form.image);
      } else {
        formData.delete('image');
      }
      const res = await fetch(apiUrl('/api/products/'), {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || Object.values(data).join(' '));
        setSuccess(false);
        setLoading(false);
        return;
      }
      setSuccess(true);
      setError('');
      setForm({
        name: '', category: '', subcategory: '', image: '', price: '', min_order: '', unit: '', province: '', productAddress: '', description: '', stock: '', status: 'Active', date: '',
      });
      setPreview('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to add product. Please try again.');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in-up mt-[2rem]">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-100 dark:border-gray-600 p-8 flex flex-col gap-6">
        <h2 className="text-3xl font-bold text-emerald-800 dark:text-emerald-300 mb-4 text-center">Add New Product</h2>
        
        {/* Image upload */}
        <div className="flex flex-col items-center gap-4">
          <div 
            className="w-40 h-40 rounded-2xl bg-emerald-50/50 dark:bg-gray-700/50 border-2 border-dashed border-emerald-300 dark:border-gray-500 flex items-center justify-center overflow-hidden shadow-inner cursor-pointer"
            onClick={() => fileInput.current.click()}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="object-cover w-full h-full" />
            ) : (
              <div className="text-center text-emerald-500 dark:text-emerald-400">
                <ImageIcon className="w-12 h-12 mx-auto" />
                <p className="text-sm mt-1">Click to upload</p>
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInput}
            onChange={handleImage}
            className="hidden"
          />
          <button type="button" onClick={() => fileInput.current.click()} className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow hover:scale-105 transition-all text-sm">
            <Upload className="w-4 h-4" /> Upload Image
          </button>
        </div>

        {/* Name */}
        <FormInput label="Name" name="name" value={form.name} onChange={handleChange} required />
        
        {/* Category & Subcategory */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormSelect 
            label="Category" 
            name="category" 
            value={form.category} 
            onChange={handleChange} 
            required
            options={
              <>
                <option value="">Select</option>
                {categoryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </>
            }
          />
          <FormInput 
            label="Subcategory" 
            name="subcategory"
            value={form.subcategory} 
            onChange={handleChange} 
            required={false}
            placeholder={form.category ? `e.g., Roma, Cherry` : 'Choose category first'}
            disabled={!form.category}
          />
        </div>

        {/* Price, Min Order, Unit, Stock */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput label="Price (रु)" name="price" type="number" value={form.price} onChange={handleChange} required />
          <FormInput label="Min Order" name="min_order" type="number" value={form.min_order} onChange={handleChange} placeholder="Optional" required={false} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormSelect 
            label="Unit" 
            name="unit" 
            value={form.unit} 
            onChange={handleChange} 
            required
            options={
              <>
                <option value="">Select Unit</option>
                {unitOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </>
            }
          />
          <FormInput label="Stock" name="stock" type="number" value={form.stock} onChange={handleChange} required />
        </div>

        {/* Status & Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormSelect 
            label="Status" 
            name="status" 
            value={form.status} 
            onChange={handleChange}
            options={
              <>
                <option value="">Select Status</option>
                {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </>
            }
          />
          <FormInput label="Date" name="date" type="text" value={form.date} onChange={handleChange} placeholder="mm/dd/yyyy" required={false} />
        </div>

        {/* Province & Product Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormSelect 
            label="Province" 
            name="province" 
            value={form.province} 
            onChange={handleChange} 
            required
            options={
              <>
                <option value="">Select Province</option>
                {provinceOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </>
            }
          />
          <FormInput label="Product Address" name="productAddress" value={form.productAddress} onChange={handleChange} placeholder="e.g. Farm location, warehouse, etc." required={false} />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-1">Description</label>
          <textarea 
            id="description"
            name="description" 
            value={form.description} 
            onChange={handleChange} 
            className="w-full bg-transparent border-b-2 border-emerald-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-none py-2 transition-colors duration-300 resize-none min-h-[80px] text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" 
            rows="3"
          />
        </div>

        {error && <div className="text-rose-600 dark:text-rose-400 text-sm font-semibold text-center flex items-center justify-center gap-2 p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl"><XCircle className="w-5 h-5" /> {error}</div>}
        {success && <div className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold text-center flex items-center justify-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl"><CheckCircle className="w-5 h-5" /> Product added successfully!</div>}
        
        <button type="submit" className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all text-lg mt-4" disabled={loading}>{loading ? 'Adding...' : 'Add Product'}</button>
      </form>
    </div>
  );
} 