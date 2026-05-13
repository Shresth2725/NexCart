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
      setCartMsg('Added to cart');
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
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
        <CustomerLayout searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSearch={() => navigate(`/home?search=${encodeURIComponent(searchQuery)}`)}>
            <div className="flex flex-col items-center justify-center py-20">
                <p className="text-red-500 font-medium mb-4">{error || 'Product not found'}</p>
                <button onClick={() => navigate('/home')} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to home
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
        <div className="p-6 lg:p-8">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 text-sm font-medium mb-6 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* LEFT — Images */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden aspect-square flex items-center justify-center">
                        {product.images && product.images.length > 0 ? (
                            <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center text-stone-300 dark:text-stone-600">
                                <Package className="h-20 w-20" />
                                <span className="mt-2 text-sm text-stone-400">No image</span>
                            </div>
                        )}
                    </div>
                    {/* Thumbnails */}
                    {product.images && product.images.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                            {product.images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImage(i)}
                                    className={`shrink-0 w-20 h-20 rounded-xl border-2 overflow-hidden transition-all ${
                                        activeImage === i ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-stone-200 dark:border-stone-700 opacity-60 hover:opacity-100'
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
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded">
                            {product.brand}
                        </span>
                        <span className="text-xs font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 px-2 py-0.5 rounded">
                            {product.category}
                        </span>
                    </div>

                    <h1 className="text-2xl lg:text-3xl font-bold text-stone-900 dark:text-white leading-tight mb-3">{product.name}</h1>

                    <div className="flex items-center gap-4 mb-6">
                        {avgRating && (
                            <div className="flex items-center gap-2">
                                <div className="flex text-amber-500">
                                    {[1,2,3,4,5].map(s => <Star key={s} className={`h-4 w-4 ${s <= Math.round(avgRating) ? 'fill-current' : ''}`} />)}
                                </div>
                                <span className="text-sm font-semibold text-stone-700 dark:text-stone-200">{avgRating}</span>
                                <span className="text-sm text-stone-400">({reviews.length} reviews)</span>
                            </div>
                        )}
                    </div>

                    <div className="bg-stone-50 dark:bg-stone-900 rounded-xl p-5 mb-6 border border-stone-200 dark:border-stone-800">
                        <div className="flex items-baseline gap-3 mb-1">
                            {product.discountPrice ? (
                                <>
                                    <span className="text-3xl font-bold text-stone-900 dark:text-white">₹{product.discountPrice}</span>
                                    <span className="text-lg text-stone-400 line-through">₹{product.price}</span>
                                    <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 text-xs font-semibold px-2 py-0.5 rounded ml-auto">
                                        {discount}% off
                                    </span>
                                </>
                            ) : (
                                <span className="text-3xl font-bold text-stone-900 dark:text-white">₹{product.price}</span>
                            )}
                        </div>
                        <p className="text-xs text-stone-400">Inclusive of all taxes • Free standard shipping</p>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">About this product</h3>
                        <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed">{product.description}</p>
                    </div>

                    {/* Seller Card */}
                    <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-sm font-semibold text-blue-600">
                            {product.seller?.storeName?.[0] || 'S'}
                        </div>
                        <div>
                            <p className="text-xs text-stone-400">Sold by</p>
                            <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">{product.seller?.storeName || 'NexCart Official'}</p>
                        </div>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto" />
                    </div>

                    {/* Actions */}
                    {product.stock > 0 ? (
                        <div className="mt-auto space-y-4">
                            <div className="flex items-center gap-3 bg-stone-100 dark:bg-stone-800 p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 w-fit">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 flex items-center justify-center text-stone-500 hover:bg-white dark:hover:bg-stone-700 rounded-md transition-colors">
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-10 text-center font-semibold text-stone-800 dark:text-white text-sm">{quantity}</span>
                                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="w-9 h-9 flex items-center justify-center text-stone-500 hover:bg-white dark:hover:bg-stone-700 rounded-md transition-colors">
                                  <Plus className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={addingToCart}
                                    className="flex-1 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                                >
                                    <ShoppingCart className="h-4 w-4" />
                                    {addingToCart ? 'Adding…' : 'Add to cart'}
                                </button>
                                <button
                                    onClick={handleBuyNow}
                                    disabled={buyingNow}
                                    className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] text-sm"
                                >
                                    {buyingNow ? 'Processing…' : 'Buy now'}
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                            {cartMsg && <p className={`text-center text-sm font-medium ${cartMsg.includes('Added') ? 'text-emerald-600' : 'text-red-600'}`}>{cartMsg}</p>}
                        </div>
                    ) : (
                        <div className="mt-auto p-4 bg-stone-100 dark:bg-stone-800 rounded-xl text-center border border-stone-200 dark:border-stone-700">
                            <p className="text-stone-600 dark:text-stone-400 font-semibold text-sm">Out of stock</p>
                        </div>
                    )}
                </div>
            </div>

            {/* REVIEWS SECTION */}
            <div className="mt-16">
                <div className="flex items-center justify-between mb-8 border-b border-stone-200 dark:border-stone-800 pb-4">
                    <h2 className="text-xl font-bold text-stone-900 dark:text-white">Reviews</h2>
                    <button onClick={() => setShowReviewForm(!showReviewForm)} className="px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-sm font-medium rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">
                        {showReviewForm ? 'Cancel' : 'Write a review'}
                    </button>
                </div>

                {showReviewForm && (
                    <form onSubmit={handleSubmitReview} className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 mb-8 animate-fade-in">
                        <div className="mb-5">
                            <label className="text-sm font-medium text-stone-600 dark:text-stone-400 mb-2 block">Your rating</label>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button key={star} type="button" onClick={() => setReviewRating(star)} className="transition-transform hover:scale-110">
                                        <Star className={`h-7 w-7 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-stone-200 dark:text-stone-600'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="mb-5">
                            <label className="text-sm font-medium text-stone-600 dark:text-stone-400 mb-2 block">Your review</label>
                            <textarea
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                rows="3"
                                className="w-full p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm text-stone-700 dark:text-stone-200"
                                placeholder="Share your experience with this product…"
                            />
                        </div>
                        <button type="submit" disabled={submittingReview} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 active:scale-[0.98]">
                            {submittingReview ? <Loader2 className="animate-spin h-4 w-4" /> : 'Submit review'}
                        </button>
                    </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reviews.length === 0 ? (
                        <div className="col-span-full py-10 text-center bg-stone-50 dark:bg-stone-900 rounded-xl border border-dashed border-stone-300 dark:border-stone-700">
                            <p className="text-stone-400 text-sm">No reviews yet. Be the first to share your experience.</p>
                        </div>
                    ) : (
                        reviews.map((review) => (
                            <div key={review._id} className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 flex flex-col justify-between hover:border-stone-300 dark:hover:border-stone-700 transition-colors">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex text-amber-400">
                                            {[1,2,3,4,5].map(s => <Star key={s} className={`h-3.5 w-3.5 ${s <= review.rating ? 'fill-current' : ''}`} />)}
                                        </div>
                                        <span className="text-xs text-stone-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed">"{review.comment}"</p>
                                </div>
                                <div className="mt-4 flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-xs font-semibold text-blue-600">U</div>
                                    <p className="text-xs font-medium text-stone-500">Verified buyer</p>
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
