import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { 
  ShoppingCart, 
  Star, 
  Search, 
  Loader2, 
  X, 
  Package, 
  Zap, 
  Tag, 
  Heart, 
  RotateCcw,
  LayoutDashboard,
  ChevronDown,
  ChevronUp,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomerLayout from '../../components/CustomerLayout';

// --- Components ---

const ProductCard = ({ product, navigate }) => {
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  
  return (
    <div 
      onClick={() => navigate(`/product/${product._id}`)}
      className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col h-full"
    >
      <div className="relative h-56 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center text-gray-300">
            <Package className="h-16 w-16" />
            <span className="text-xs mt-2 uppercase font-black tracking-widest opacity-50">No Preview</span>
          </div>
        )}
        
        <div className="absolute top-4 left-4 flex flex-col gap-2">
            {hasDiscount && (
                <span className="bg-indigo-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-lg">
                    Sale
                </span>
            )}
            {product.stock <= 5 && product.stock > 0 && (
                <span className="bg-amber-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-lg">
                    Low Stock
                </span>
            )}
            {product.stock === 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-lg">
                    Out of Stock
                </span>
            )}
        </div>

        <button className="absolute top-4 right-4 p-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full text-gray-400 hover:text-red-500 transition-colors shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <Heart className="h-4 w-4" />
        </button>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded">
                {product.category}
            </span>
            <div className="flex items-center gap-0.5 text-amber-500 ml-auto">
                <Star className="h-3 w-3 fill-current" />
                <span className="text-[10px] font-bold">4.8</span>
            </div>
        </div>

        <h3 className="text-base font-bold text-gray-800 dark:text-white line-clamp-2 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">
          {product.name}
        </h3>

        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed">
            {product.description}
        </p>

        <div className="mt-auto pt-4 border-t border-gray-50 dark:border-gray-700/50 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Starting from</span>
            <div className="flex items-baseline gap-2">
              {hasDiscount ? (
                <>
                  <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">₹{product.discountPrice}</span>
                  <span className="text-xs text-gray-400 line-through font-bold">₹{product.price}</span>
                </>
              ) : (
                <span className="text-xl font-black text-gray-900 dark:text-white">₹{product.price}</span>
              )}
            </div>
          </div>
          
          <button className="w-10 h-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-all shadow-lg shadow-indigo-600/20 group-hover:scale-110 active:scale-95">
            <ShoppingCart className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const CategoryPill = ({ label, icon, active, onClick }) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl transition-all font-bold text-sm whitespace-nowrap ${
            active 
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-[1.02]' 
            : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700'
        }`}
    >
        {icon}
        {label}
    </button>
);

const CustomerHome = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Filters state
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [rating, setRating] = useState('');
  const [sort, setSort] = useState('asc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);

  useEffect(() => {
    fetchRandomProducts();
  }, []);

  const fetchRandomProducts = async () => {
    setLoading(true);
    setError('');
    setIsSearching(false);
    setSearchQuery('');
    setCategory('');
    setBrand('');
    setPriceMin('');
    setPriceMax('');
    setRating('');
    setSort('asc');
    try {
      const res = await api.get('/products/customer/randomProductSuggestion?count=20');
      setProducts(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchRandomProducts();
      return;
    }
    setLoading(true);
    setError('');
    setIsSearching(true);
    try {
      const res = await api.get(`/products/customer/search?query=${encodeURIComponent(searchQuery)}`);
      setProducts(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed');
      setProducts([]);
    }
    setLoading(false);
  };

  const handleFilter = async (overrides = {}) => {
    setLoading(true);
    setError('');
    setIsSearching(true);
    try {
      const params = new URLSearchParams();
      const currentBrand = overrides.brand !== undefined ? overrides.brand : brand;
      const currentCategory = overrides.category !== undefined ? overrides.category : category;
      const currentRating = overrides.rating !== undefined ? overrides.rating : rating;
      const currentSort = overrides.sort !== undefined ? overrides.sort : sort;
      
      if (currentBrand) params.append('brand', currentBrand);
      if (currentCategory) params.append('category', currentCategory);
      if (currentRating) params.append('rating', currentRating);
      if (priceMin) params.append('priceRange[min]', priceMin);
      if (priceMax) params.append('priceRange[max]', priceMax);
      params.append('sort', currentSort);
      params.append('page', page);
      params.append('limit', limit);

      const res = await api.get(`/products/customer/filter?${params.toString()}`);
      setProducts(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Filter failed');
      setProducts([]);
    }
    setLoading(false);
  };

  const handleCategoryClick = (cat) => {
    if (category === cat) {
        setCategory('');
        fetchRandomProducts();
    } else {
        setCategory(cat);
        handleFilter({ category: cat });
    }
  };

  const sidebarContent = (
    <div className="pb-6">
        <button 
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-sm mb-4"
        >
            <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Advanced Filters
            </div>
            {isFiltersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        
        {isFiltersOpen && (
            <div className="space-y-5 px-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Brand</label>
                    <input 
                        type="text" 
                        placeholder="e.g. Nike, Apple..." 
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs border border-transparent focus:border-indigo-500 outline-none transition-all dark:text-white"
                    />
                </div>

                <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Category</label>
                    <input 
                        type="text" 
                        placeholder="e.g. Electronics..." 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs border border-transparent focus:border-indigo-500 outline-none transition-all dark:text-white"
                    />
                </div>

                <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Price Range (₹)</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                        <input type="number" placeholder="Min" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs border border-transparent focus:border-indigo-500 outline-none dark:text-white" />
                        <input type="number" placeholder="Max" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs border border-transparent focus:border-indigo-500 outline-none dark:text-white" />
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Minimum Rating</label>
                    <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} onClick={() => setRating(star)} className={`p-1.5 rounded-lg transition-all ${rating >= star ? 'text-amber-500 bg-amber-50 dark:bg-amber-500/10' : 'text-gray-300 hover:text-gray-400'}`}>
                                <Star className={`h-4 w-4 ${rating >= star ? 'fill-current' : ''}`} />
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Sort By Price</label>
                    <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs border border-transparent focus:border-indigo-500 outline-none dark:text-white appearance-none">
                        <option value="asc">Lowest First</option>
                        <option value="desc">Highest First</option>
                    </select>
                </div>

                <button onClick={() => handleFilter()} className="w-full py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                    Apply Filters
                </button>
                
                <button onClick={fetchRandomProducts} className="w-full py-3 border border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
                    <RotateCcw className="h-3 w-3" /> Reset All
                </button>
            </div>
        )}
    </div>
  );

  return (
    <CustomerLayout 
        sidebarContent={sidebarContent} 
        onSearch={handleSearch} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery}
    >
        <div className="p-8">
            <div className="mb-10 space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                            Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Excellence</span>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Curated premium selection just for you.</p>
                    </div>
                    <div className="flex gap-2">
                        {isSearching && (
                            <button onClick={fetchRandomProducts} className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-red-100 transition-all">
                                <X className="h-4 w-4" /> Clear Results
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                    <CategoryPill label="All Products" icon={<Zap className="h-4 w-4" />} active={category === '' && !brand && !rating} onClick={() => fetchRandomProducts()} />
                    <CategoryPill label="Electronics" icon={<Package className="h-4 w-4" />} active={category === 'Electronics'} onClick={() => handleCategoryClick('Electronics')} />
                    <CategoryPill label="Fashion" icon={<Tag className="h-4 w-4" />} active={category === 'Fashion'} onClick={() => handleCategoryClick('Fashion')} />
                    <CategoryPill label="Home & Living" icon={<LayoutDashboard className="h-4 w-4" />} active={category === 'Home'} onClick={() => handleCategoryClick('Home')} />
                    <CategoryPill label="Beauty" icon={<Star className="h-4 w-4" />} active={category === 'Beauty'} onClick={() => handleCategoryClick('Beauty')} />
                </div>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                </div>
            ) : error ? (
                <div className="p-8 bg-red-50 dark:bg-red-500/10 rounded-3xl border border-red-100 dark:border-red-500/20 text-center">
                    <p className="text-red-600 dark:text-red-400 font-bold">{error}</p>
                    <button onClick={fetchRandomProducts} className="mt-4 text-sm text-red-700 underline font-medium">Retry loading</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {products.map((product) => (
                        <ProductCard key={product._id} product={product} navigate={navigate} />
                    ))}
                    {products.length === 0 && (
                        <div className="col-span-full py-20 text-center space-y-4">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                                <Search className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold dark:text-white">No products found</h3>
                            <button onClick={fetchRandomProducts} className="px-6 py-2 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">Return Home</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    </CustomerLayout>
  );
};

export default CustomerHome;
