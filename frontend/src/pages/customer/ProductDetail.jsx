import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { ArrowLeft, ShoppingCart, Star, Send, Minus, Plus, Package, Truck, Shield, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import CustomerLayout from '../../components/CustomerLayout';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [cartMsg, setCartMsg] = useState('');

  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Active image
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products/customer/product/${id}`);
      setProduct(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load product');
    }
    setLoading(false);
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/products/reviews/getReviews/${id}`);
      setReviews(res.data.data || []);
    } catch (err) {
      setReviews([]);
    }
  };

  const handleAddToCart = async () => {
    setAddingToCart(true);
    setCartMsg('');
    try {
      await api.post('/cart/cart/add', { productId: id, quantity });
      setCartMsg('✓ Added to cart!');
      setTimeout(() => setCartMsg(''), 3000);
    } catch (err) {
      setCartMsg(err.response?.data?.message || 'Failed to add to cart');
    }
    setAddingToCart(false);
  };

  const handleBuyNow = async () => {
    setBuyingNow(true);
    setCartMsg('');
    try {
      await api.post('/cart/cart/add', { productId: id, quantity });
      navigate('/cart?checkout=true');
    } catch (err) {
      setCartMsg(err.response?.data?.message || 'Failed to add to cart');
      setBuyingNow(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await api.post('/products/reviews/add', {
        productId: id,
        rating: reviewRating,
        comment: reviewComment,
      });
      setShowReviewForm(false);
      setReviewComment('');
      setReviewRating(5);
      fetchReviews();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    }
    setSubmittingReview(false);
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
        <CustomerLayout searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSearch={() => navigate(`/home?search=${encodeURIComponent(searchQuery)}`)}>
            <div className="flex flex-col items-center justify-center py-20">
                <p className="text-red-500 font-bold mb-4">{error || 'Product not found'}</p>
                <button onClick={() => navigate('/home')} className="px-6 py-2 bg-indigo-600 text-white rounded-2xl font-bold flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back to Home
                </button>
            </div>
        </CustomerLayout>
    );
  }

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <CustomerLayout 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        onSearch={() => navigate(`/home?search=${encodeURIComponent(searchQuery)}`)}
    >
        <div className="p-8">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-bold text-sm mb-8 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to Search
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* LEFT — Images */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-[40px] border border-gray-100 dark:border-gray-700 overflow-hidden aspect-square flex items-center justify-center shadow-sm">
                        {product.images && product.images.length > 0 ? (
                            <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center text-gray-300">
                                <Package className="h-24 w-24" />
                                <span className="mt-2 text-sm font-black uppercase tracking-widest opacity-50">No Preview</span>
                            </div>
                        )}
                    </div>
                    {/* Thumbnails */}
                    {product.images && product.images.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                            {product.images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImage(i)}
                                    className={`shrink-0 w-24 h-24 rounded-3xl border-4 overflow-hidden transition-all ${
                                        activeImage === i ? 'border-indigo-600 scale-95 shadow-lg shadow-indigo-600/20' : 'border-white dark:border-gray-800 opacity-60 hover:opacity-100'
                                    }`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT — Details */}
                <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full">
                            {product.brand}
                        </span>
                        <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest bg-purple-50 dark:bg-purple-500/10 px-3 py-1 rounded-full">
                            {product.category}
                        </span>
                    </div>

                    <h1 className="text-4xl font-black text-gray-900 dark:text-white leading-tight tracking-tight mb-4">{product.name}</h1>

                    <div className="flex items-center gap-6 mb-8">
                        {avgRating && (
                            <div className="flex items-center gap-2">
                                <div className="flex text-amber-500">
                                    {[1,2,3,4,5].map(s => <Star key={s} className={`h-4 w-4 ${s <= Math.round(avgRating) ? 'fill-current' : ''}`} />)}
                                </div>
                                <span className="text-sm font-black dark:text-white">{avgRating}</span>
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">({reviews.length} Reviews)</span>
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-8 mb-8 border border-gray-100 dark:border-gray-800">
                        <div className="flex items-baseline gap-4 mb-2">
                            {product.discountPrice ? (
                                <>
                                    <span className="text-5xl font-black text-indigo-600 dark:text-indigo-400">₹{product.discountPrice}</span>
                                    <span className="text-2xl text-gray-400 line-through font-bold">₹{product.price}</span>
                                    <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ml-auto shadow-sm">
                                        Save {discount}%
                                    </span>
                                </>
                            ) : (
                                <span className="text-5xl font-black text-gray-900 dark:text-white">₹{product.price}</span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 font-medium">Inclusive of all taxes & free standard shipping</p>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Product Information</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">{product.description}</p>
                    </div>

                    {/* Seller Card */}
                    <div className="p-5 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center font-black text-indigo-600 uppercase">
                            {product.seller?.storeName?.[0] || 'S'}
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Premium Seller</p>
                            <p className="text-sm font-bold dark:text-white">{product.seller?.storeName || 'NexCart Official'}</p>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 ml-auto" />
                    </div>

                    {/* Actions */}
                    {product.stock > 0 ? (
                        <div className="mt-auto space-y-4">
                            <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900 p-2 rounded-2xl border border-gray-100 dark:border-gray-800 w-fit">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all"><Minus className="h-4 w-4" /></button>
                                <span className="w-12 text-center font-black dark:text-white">{quantity}</span>
                                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all"><Plus className="h-4 w-4" /></button>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={addingToCart}
                                    className="flex-1 py-4 border-2 border-indigo-600 text-indigo-600 font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                                >
                                    <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                    {addingToCart ? 'Adding...' : 'Add to Bag'}
                                </button>
                                <button
                                    onClick={handleBuyNow}
                                    disabled={buyingNow}
                                    className="flex-1 py-4 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 active:scale-95"
                                >
                                    {buyingNow ? 'Processing...' : 'Buy Now'}
                                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                            {cartMsg && <p className={`text-center text-xs font-black uppercase tracking-wider ${cartMsg.includes('Added') ? 'text-emerald-600' : 'text-red-600'}`}>{cartMsg}</p>}
                        </div>
                    ) : (
                        <div className="mt-auto p-4 bg-red-50 dark:bg-red-500/10 rounded-2xl text-center border border-red-100 dark:border-red-500/20">
                            <p className="text-red-600 dark:text-red-400 font-black uppercase tracking-widest">Out of Stock</p>
                        </div>
                    )}
                </div>
            </div>

            {/* REVIEWS SECTION */}
            <div className="mt-20">
                <div className="flex items-center justify-between mb-10 border-b border-gray-100 dark:border-gray-800 pb-6">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Verified Reviews</h2>
                    <button onClick={() => setShowReviewForm(!showReviewForm)} className="px-6 py-2 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 transition-all">
                        {showReviewForm ? 'Cancel Review' : 'Write a Review'}
                    </button>
                </div>

                {showReviewForm && (
                    <form onSubmit={handleSubmitReview} className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-8 mb-10 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="mb-6">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block">Your Experience</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button key={star} type="button" onClick={() => setReviewRating(star)} className="transition-transform hover:scale-110">
                                        <Star className={`h-8 w-8 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="mb-6">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block">Detailed Feedback</label>
                            <textarea
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                rows="4"
                                className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white text-sm"
                                placeholder="What did you love about this product?"
                            />
                        </div>
                        <button type="submit" disabled={submittingReview} className="px-10 py-3 bg-indigo-600 text-white font-black uppercase rounded-2xl shadow-lg shadow-indigo-600/20 active:scale-95">
                            {submittingReview ? <Loader2 className="animate-spin h-5 w-5" /> : 'Publish Review'}
                        </button>
                    </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reviews.length === 0 ? (
                        <div className="col-span-full py-12 text-center bg-gray-50 dark:bg-gray-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                            <p className="text-gray-500 font-medium">No reviews yet. Share your experience with others.</p>
                        </div>
                    ) : (
                        reviews.map((review) => (
                            <div key={review._id} className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-between group hover:border-indigo-500 transition-all shadow-sm">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex text-amber-400">
                                            {[1,2,3,4,5].map(s => <Star key={s} className={`h-3 w-3 ${s <= review.rating ? 'fill-current' : ''}`} />)}
                                        </div>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 text-sm italic leading-relaxed">"{review.comment}"</p>
                                </div>
                                <div className="mt-6 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-[10px] font-black text-indigo-600">U</div>
                                    <p className="text-xs font-bold dark:text-white">Verified Customer</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    </CustomerLayout>
  );
};

export default ProductDetail;
