import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

const ProductModal = ({ isOpen, onClose, onSubmit, product = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    brand: '',
    stock: '',
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || '',
        brand: product.brand || '',
        stock: product.stock || '',
      });
      // For existing products, we might have image URLs
      if (product.images) {
        setPreviews(product.images);
      }
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        brand: '',
        stock: '',
      });
      setImages([]);
      setPreviews([]);
    }
  }, [product, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    images.forEach(image => data.append('images', image));
    
    onSubmit(data);
  };

  if (!isOpen) return null;

  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-700 dark:text-stone-200 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all placeholder-stone-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in border border-stone-200 dark:border-stone-800">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-stone-900 dark:text-white">
            {product ? 'Edit product' : 'New product'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors text-stone-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-1.5 block">Product name</label>
              <input required name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Wireless Headphones" className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-1.5 block">Category</label>
              <input required name="category" value={formData.category} onChange={handleChange} placeholder="e.g. Electronics" className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-1.5 block">Price ($)</label>
              <input required type="number" name="price" value={formData.price} onChange={handleChange} placeholder="0.00" className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-1.5 block">Stock</label>
              <input required type="number" name="stock" value={formData.stock} onChange={handleChange} placeholder="100" className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-1.5 block">Brand</label>
              <input required name="brand" value={formData.brand} onChange={handleChange} placeholder="e.g. Sony" className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-1.5 block">Description</label>
              <textarea required name="description" value={formData.description} onChange={handleChange} rows="3" placeholder="Describe your product…" className={inputClass + ' resize-none'} />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-2 block">
              Images <span className="text-stone-400 font-normal">(max 10)</span>
            </label>
            <div className="flex flex-wrap gap-3">
              {previews.map((preview, index) => (
                <div key={index} className="relative w-20 h-20 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 group">
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ))}
              {previews.length < 10 && (
                <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-stone-300 dark:border-stone-600 rounded-xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all">
                  <Plus className="h-5 w-5 text-stone-400" />
                  <span className="text-[10px] mt-0.5 text-stone-400">Add</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-5 border-t border-stone-200 dark:border-stone-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-semibold"
          >
            {product ? 'Save changes' : 'Create product'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
