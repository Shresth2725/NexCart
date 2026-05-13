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
  LayoutGrid,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomerLayout from '../../components/CustomerLayout';

// --- Components ---

const ProductCard = ({ product, navigate }) => {
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  
  return (
    <div 
      onClick={() => navigate(`/product/${product._id}`)}
      className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden hover:shadow-lg hover:shadow-stone-200/50 dark:hover:shadow-stone-900/50 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer flex flex-col h-full"
    >
      <div className="relative h-52 bg-stone-100 dark:bg-stone-800 flex items-center justify-center overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center text-stone-300 dark:text-stone-600">
            <Package className="h-12 w-12" />
            <span className="text-xs mt-1.5 text-stone-400">No image</span>
          </div>
        )}
        
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {hasDiscount && (
                <span className="bg-blue-600 text-white text-[11px] font-semibold px-2 py-0.5 rounded-md">
                    Sale
                </span>
            )}
            {product.stock <= 5 && product.stock > 0 && (
                <span className="bg-amber-500 text-white text-[11px] font-semibold px-2 py-0.5 rounded-md">
                    Low stock
                </span>
            )}
            {product.stock === 0 && (
                <span className="bg-stone-800 text-white text-[11px] font-semibold px-2 py-0.5 rounded-md">
                    Sold out
                </span>
            )}
        </div>

        <button 
          className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm rounded-full text-stone-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
            <Heart className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded">
                {product.category}
            </span>
            <div className="flex items-center gap-1 text-amber-500 ml-auto">
                <Star className="h-3 w-3 fill-current" />
                <span className="text-xs font-medium text-stone-500">4.8</span>
            </div>
        </div>

        <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-100 line-clamp-2 leading-snug mb-1.5 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        <p className="text-xs text-stone-400 dark:text-stone-500 line-clamp-2 mb-3 leading-relaxed">
            {product.description}
        </p>

        <div className="mt-auto pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div>
            {hasDiscount ? (
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-stone-900 dark:text-white">₹{product.discountPrice}</span>
                <span className="text-xs text-stone-400 line-through">₹{product.price}</span>
              </div>
            ) : (
              <span className="text-lg font-bold text-stone-900 dark:text-white">₹{product.price}</span>
            )}
          </div>
          
          <button className="w-9 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors active:scale-95">
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const CategoryPill = ({ label, icon, active, onClick }) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium whitespace-nowrap ${
            active 
            ? 'bg-blue-600 text-white' 
            : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800'
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

  const filterInputClass = "w-full mt-1.5 px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-800 text-sm border border-stone-200 dark:border-stone-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all text-stone-700 dark:text-stone-200 placeholder-stone-400";

  const sidebarContent = (
    <div className="pb-4">
        <button 
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="w-full flex items-center justify-between p-2.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-sm font-medium mb-3 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
        >
            <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
            </div>
            {isFiltersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        
        {isFiltersOpen && (
            <div className="space-y-4 px-0.5 animate-fade-in">
                <div>
                    <label className="text-xs font-medium text-stone-500">Brand</label>
                    <input 
                        type="text" 
                        placeholder="e.g. Nike, Apple" 
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        className={filterInputClass}
                    />
                </div>

                <div>
                    <label className="text-xs font-medium text-stone-500">Category</label>
                    <input 
                        type="text" 
                        placeholder="e.g. Electronics" 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className={filterInputClass}
                    />
                </div>

                <div>
                    <label className="text-xs font-medium text-stone-500">Price range (₹)</label>
                    <div className="grid grid-cols-2 gap-2 mt-1.5">
                        <input type="number" placeholder="Min" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} className={filterInputClass + ' !mt-0'} />
                        <input type="number" placeholder="Max" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className={filterInputClass + ' !mt-0'} />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-medium text-stone-500">Min. rating</label>
                    <div className="flex gap-1 mt-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} onClick={() => setRating(star)} className={`p-1.5 rounded-md transition-colors ${rating >= star ? 'text-amber-500 bg-amber-50 dark:bg-amber-500/10' : 'text-stone-300 hover:text-stone-400'}`}>
                                <Star className={`h-4 w-4 ${rating >= star ? 'fill-current' : ''}`} />
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-xs font-medium text-stone-500">Sort by price</label>
                    <select value={sort} onChange={(e) => setSort(e.target.value)} className={filterInputClass}>
                        <option value="asc">Lowest first</option>
                        <option value="desc">Highest first</option>
                    </select>
                </div>

                <button onClick={() => handleFilter()} className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors active:scale-[0.98]">
                    Apply Filters
                </button>
                
                <button onClick={fetchRandomProducts} className="w-full py-2.5 border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 rounded-lg text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors flex items-center justify-center gap-2">
                    <RotateCcw className="h-3.5 w-3.5" /> Reset
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
        <div className="p-6 lg:p-8">
            <div className="mb-8 space-y-5">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-stone-900 dark:text-white tracking-tight">
                            Browse products
                        </h1>
                        <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">Find exactly what you need from our curated selection.</p>
                    </div>
                    <div className="flex gap-2">
                        {isSearching && (
                            <button onClick={fetchRandomProducts} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
                                <X className="h-3.5 w-3.5" /> Clear
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    <CategoryPill label="All" icon={<Zap className="h-4 w-4" />} active={category === '' && !brand && !rating} onClick={() => fetchRandomProducts()} />
                    <CategoryPill label="Electronics" icon={<Package className="h-4 w-4" />} active={category === 'Electronics'} onClick={() => handleCategoryClick('Electronics')} />
                    <CategoryPill label="Fashion" icon={<Tag className="h-4 w-4" />} active={category === 'Fashion'} onClick={() => handleCategoryClick('Fashion')} />
                    <CategoryPill label="Home & Living" icon={<LayoutGrid className="h-4 w-4" />} active={category === 'Home'} onClick={() => handleCategoryClick('Home')} />
                    <CategoryPill label="Beauty" icon={<Star className="h-4 w-4" />} active={category === 'Beauty'} onClick={() => handleCategoryClick('Beauty')} />
                </div>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                </div>
            ) : error ? (
                <div className="p-6 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-200 dark:border-red-800 text-center">
                    <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
                    <button onClick={fetchRandomProducts} className="mt-3 text-sm text-red-700 underline">Retry</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 animate-fade-in">
                    {products.map((product) => (
                        <ProductCard key={product._id} product={product} navigate={navigate} />
                    ))}
                    {products.length === 0 && (
                        <div className="col-span-full py-16 text-center space-y-3">
                            <div className="w-16 h-16 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto">
                                <Search className="h-6 w-6 text-stone-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-stone-700 dark:text-stone-200">No products found</h3>
                            <p className="text-sm text-stone-500">Try adjusting your search or filters.</p>
                            <button onClick={fetchRandomProducts} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Browse all</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    </CustomerLayout>
  );
};

export default CustomerHome;
