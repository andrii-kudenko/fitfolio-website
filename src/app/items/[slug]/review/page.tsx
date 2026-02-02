'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { itemsApi } from '@/features/items/api/items.api';
import { ItemFullResponse } from '@/features/items/types/items.types';
import { reviewsApi } from '@/features/reviews/api/reviews.api';
import { ReviewCreate } from '@/features/reviews/types/reviews.types';
import { categoriesApi } from '@/features/categories/api/categories.api';
import { CategoryResponse } from '@/features/categories/types/categories.types';
import { usersApi } from '@/features/users/api/users.api';
import { FitProfileResponse } from '@/features/users/types/users.types';

const FIT_OPTIONS = [
  { value: 'too_tight', label: 'Too tight' },
  { value: 'slightly_tight', label: 'Slightly tight' },
  { value: 'perfect_fit', label: 'Perfect fit' },
  { value: 'slightly_loose', label: 'Slightly loose' },
  { value: 'too_loose', label: 'Too loose' },
];

const COMFORT_OPTIONS = [
  { value: 'very_uncomfortable', label: 'Very uncomfortable' },
  { value: 'somewhat_uncomfortable', label: 'Somewhat uncomfortable' },
  { value: 'moderate_comfort', label: 'Moderate comfort' },
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'extremely_comfortable', label: 'Extremely comfortable' },
];

const QUALITY_OPTIONS = [
  { value: 'poor_quality', label: 'Poor quality' },
  { value: 'below_average', label: 'Below average' },
  { value: 'average_quality', label: 'Average quality' },
  { value: 'good_quality', label: 'Good quality' },
  { value: 'premium_quality', label: 'Premium quality' },
];

const TIME_OWNED_OPTIONS = [
  'less than month',
  '1-6 month',
  '6-12 month',
  '1-2 years',
  '2-5 years',
  '5+ years',
];

const WEAR_FREQUENCY_OPTIONS = [
  'Daily',
  'Several times a week',
  'Once a week',
  'A few times a month',
  'Rarely',
];

const CLIMATE_OPTIONS = [
  'Hot',
  'Warm',
  'Moderate',
  'Cool',
  'Cold',
  'All seasons',
];

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL'];

export default function WriteReviewPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [item, setItem] = useState<ItemFullResponse | null>(null);
  const [parentCategory, setParentCategory] = useState<CategoryResponse | null>(null);
  const [fitProfile, setFitProfile] = useState<FitProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [rating, setRating] = useState<number>(7);
  const [fit, setFit] = useState<string>('perfect_fit');
  const [comfort, setComfort] = useState<string>('comfortable');
  const [quality, setQuality] = useState<string>('premium_quality');
  const [timeOwned, setTimeOwned] = useState<string>('');
  const [purchasedSize, setPurchasedSize] = useState<string>('');
  const [wearFrequency, setWearFrequency] = useState<string>('');
  const [climate, setClimate] = useState<string>('');
  const [wouldRecommend, setWouldRecommend] = useState<boolean>(false);
  const [wouldBuyAgain, setWouldBuyAgain] = useState<boolean>(false);
  const [reviewText, setReviewText] = useState<string>('');
  const [reviewTitle, setReviewTitle] = useState<string>('');

  // Ensure page opens at top when navigating to write review
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!slug) return;
    
    setLoading(true);
    itemsApi
      .getBySlugFull(slug)
      .then(async (itemData) => {
        setItem(itemData);
        // Fetch parent category if category has a parentId
        if (itemData.category?.parentId) {
          try {
            const parent = await categoriesApi.getById(itemData.category.parentId);
            setParentCategory(parent);
          } catch (err) {
            console.error('Error fetching parent category:', err);
            // Don't set error, just continue without parent category
          }
        }
      })
      .catch((err) => {
        console.error('Error fetching item:', err);
        setError('Failed to load item');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // Helper function to determine category type
  const getCategoryType = (): 'shoes' | 'accessories' | 'other' => {
    if (!item?.category) return 'other';
    
    const categoryName = item.category.name.toLowerCase().trim();
    const parentCategoryName = parentCategory?.name.toLowerCase().trim() || '';
    
    // Check if category is shoes or parent is shoes (case-insensitive)
    if (categoryName === 'shoes' || categoryName === 'shoe' || 
        parentCategoryName === 'shoes' || parentCategoryName === 'shoe') {
      return 'shoes';
    }
    
    // Check if category is accessories or parent is accessories (case-insensitive)
    if (categoryName === 'accessories' || categoryName === 'accessory' ||
        parentCategoryName === 'accessories' || parentCategoryName === 'accessory') {
      return 'accessories';
    }
    
    return 'other';
  };

  // Fetch fit profile when category is shoes
  useEffect(() => {
    const fetchFitProfile = async () => {
      // Only fetch if category is shoes
      if (getCategoryType() !== 'shoes') {
        setFitProfile(null);
        return;
      }

      // Get userId from localStorage
      const loggedInData = localStorage.getItem('fitfolio_logged_in');
      if (!loggedInData) {
        return; // User not logged in, can't fetch fit profile
      }

      try {
        const user = JSON.parse(loggedInData);
        if (user?.id) {
          const profile = await usersApi.getFitProfile(user.id);
          setFitProfile(profile);
        }
      } catch (err) {
        console.error('Error fetching fit profile:', err);
        // Don't set error, just continue without fit profile
      }
    };

    // Only fetch if item and category are loaded
    if (item?.category) {
      fetchFitProfile();
    }
  }, [item, parentCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!item?.item?.id) {
      setError('Item not found');
      return;
    }

    // Get userId from localStorage
    const loggedInData = localStorage.getItem('fitfolio_logged_in');
    if (!loggedInData) {
      setError('Please log in to submit a review');
      return;
    }

    const user = JSON.parse(loggedInData);
    if (!user?.id) {
      setError('Please log in to submit a review');
      return;
    }

    // Validation checks
    const categoryType = getCategoryType();
    
    if (rating === undefined || rating === null || rating < 0 || rating > 10) {
      setError('Please provide a rating between 0 and 10');
      return;
    }

    if (!fit || fit.trim() === '') {
      setError('Please describe the fit');
      return;
    }

    if (!comfort || comfort.trim() === '') {
      setError('Please describe the comfort');
      return;
    }

    if (!quality || quality.trim() === '') {
      setError('Please describe the quality');
      return;
    }

    if (!timeOwned || timeOwned.trim() === '') {
      setError('Please specify how long you have owned the item');
      return;
    }

    // Size validation based on category
    if (categoryType === 'shoes' && (!purchasedSize || purchasedSize.trim() === '')) {
      setError('Please enter your shoe size');
      return;
    }

    if (categoryType === 'other' && (!purchasedSize || purchasedSize.trim() === '')) {
      setError('Please select the size you purchased');
      return;
    }

    if (!wearFrequency || wearFrequency.trim() === '') {
      setError('Please specify the wear frequency');
      return;
    }

    if (!climate || climate.trim() === '') {
      setError('Please specify the climate');
      return;
    }

    setSubmitting(true);
    setError(null);

    const reviewData: ReviewCreate = {
      userId: user.id,
      itemId: item.item.id,
      rating: rating, // Rating is 0-10 scale
      fit: fit || null,
      comfort: comfort || null,
      quality: quality || null,
      timeOwned: timeOwned || null,
      purchasedSize: purchasedSize || null,
      wearFrequency: wearFrequency || null,
      climate: climate || null,
      wouldRecommend: wouldRecommend,
      wouldBuyAgain: wouldBuyAgain,
      text: reviewText || null,
      title: reviewTitle || null,
      tags: [],
    };

    try {
      await reviewsApi.create(reviewData);
      // Redirect back to item page
      router.push(`/items/${slug}`);
    } catch (err: any) {
      console.error('Error creating review:', err);
      setError(err?.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderSlider = (
    value: string,
    onChange: (value: string) => void,
    options: Array<{ value: string; label: string }>
  ) => {
    return (
      <div className="relative mt-4">
        <div className="flex items-center justify-between relative h-12">
          {/* Slider track */}
          <div className="absolute w-full h-0.5 bg-white/20 top-1/2 -translate-y-1/2" />
          
          {/* Option points */}
          {options.map((option, index) => {
            const isSelected = value === option.value;
            const position = (index / (options.length - 1)) * 100;
            const isFirstOrLast = index === 0 || index === options.length - 1;
            
            return (
              <div
                key={option.value}
                className="absolute z-10 flex flex-col items-center cursor-pointer"
                style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                onClick={() => onChange(option.value)}
              >
                {/* Label above for first and last */}
                {isFirstOrLast && (
                  <span className={`text-xs mb-3 whitespace-nowrap ${isSelected ? 'text-[var(--color-ff-blue)]' : 'text-white/60'}`}>
                    {option.label}
                  </span>
                )}
                
                {/* Circle */}
                <div
                  className={`w-4 h-4 rounded-full border-2 transition ${
                    isSelected
                      ? 'bg-[var(--color-ff-blue)] border-[var(--color-ff-blue)]'
                      : 'bg-black border-white/40'
                  }`}
                />
                
                {/* Label below for middle options */}
                {!isFirstOrLast && (
                  <span className={`text-xs mt-3 whitespace-nowrap ${isSelected ? 'text-[var(--color-ff-blue)]' : 'text-white/60'}`}>
                    {option.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="text-white/60">Loading...</div>
          </div>
        </div>
      </main>
    );
  }

  if (error && !item) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="text-red-400 mb-4">{error}</div>
            <Link href={`/items/${slug}`} className="text-ff-cyan hover:underline">
              Back to item
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <style dangerouslySetInnerHTML={{__html: `
        select option {
          background-color: #000000 !important;
          color: #ffffff !important;
        }
        select option:checked,
        select option:hover {
          background-color: var(--color-ff-blue) !important;
          color: #ffffff !important;
        }
      `}} />
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="text-white/60 text-sm mb-2">Review Page</div>
          <Link href={`/items/${slug}`} className="text-white/60 hover:text-white text-sm">
            ← Back to item
          </Link>
        </div>

        {/* Item Identification */}
        {item?.item && (
          <div className="mb-8 p-4 border border-[var(--color-ff-blue)] rounded-lg flex items-center gap-4">
            {item.item.imageUrl && (
              <div className="relative w-20 h-20 flex-shrink-0">
                <Image
                  src={item.item.imageUrl}
                  alt={item.item.name || ''}
                  fill
                  className="object-contain"
                  sizes="80px"
                />
              </div>
            )}
            <h2 className="text-lg font-semibold">{item.item.name}</h2>
          </div>
        )}

        {/* WRITE YOUR REVIEW Heading */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold uppercase mb-4">WRITE YOUR REVIEW</h1>
          <div className="h-px bg-white/20" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Overall Rating */}
          <div>
            <label className="block text-white mb-2">Your overall rating</label>
            <div className="flex items-center gap-4">
              <span className="text-xl">{rating}/10</span>
              <div className="flex gap-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i + 1)}
                    className={`text-2xl transition ${
                      i < rating ? 'text-yellow-400' : 'text-white/20'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div className="h-px bg-white/20 mt-6" />
          </div>

          {/* Fit Description */}
          <div>
            <label className="block text-white mb-2">How would you describe the fit?</label>
            {renderSlider(fit, setFit, FIT_OPTIONS)}
            <div className="h-px bg-white/20 mt-6" />
          </div>

          {/* Comfort Description */}
          <div>
            <label className="block text-white mb-2">How would you describe the comfort?</label>
            {renderSlider(comfort, setComfort, COMFORT_OPTIONS)}
            <div className="h-px bg-white/20 mt-6" />
          </div>

          {/* Quality Description */}
          <div>
            <label className="block text-white mb-2">How would you describe the quality?</label>
            {renderSlider(quality, setQuality, QUALITY_OPTIONS)}
            <div className="h-px bg-white/20 mt-6" />
          </div>

          {/* Dropdown Questions */}
          <div className="space-y-6">
            <div>
              <label className="block text-white mb-2">For how long have you owned the item?</label>
              <select
                value={timeOwned}
                onChange={(e) => setTimeOwned(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:border-[var(--color-ff-blue)] focus:outline-none"
              >
                <option value="">Choose an option</option>
                {TIME_OWNED_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Size input - conditional based on category */}
            {getCategoryType() === 'shoes' && (
              <div>
                <label className="block text-white mb-2">What is your shoe size?</label>
                <div className="flex gap-2">
                  {/* Shoe size system label (static) */}
                  <div className="px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white flex items-center justify-center" style={{ minWidth: '100px' }}>
                    {fitProfile?.shoeSizeSystem || 'System'}
                  </div>
                  {/* Shoe size value input */}
                  <input
                    type="text"
                    value={purchasedSize}
                    onChange={(e) => setPurchasedSize(e.target.value)}
                    placeholder="Size"
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:border-[var(--color-ff-blue)] focus:outline-none"
                  />
                </div>
              </div>
            )}
            {getCategoryType() === 'other' && (
              <div>
                <label className="block text-white mb-2">What size did you purchase?</label>
                <select
                  value={purchasedSize}
                  onChange={(e) => setPurchasedSize(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:border-[var(--color-ff-blue)] focus:outline-none"
                >
                  <option value="">Choose a size</option>
                  {SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {/* No size input for accessories */}

            <div>
              <label className="block text-white mb-2">What was its wear frequency?</label>
              <select
                value={wearFrequency}
                onChange={(e) => setWearFrequency(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:border-[var(--color-ff-blue)] focus:outline-none"
              >
                <option value="">Choose an option</option>
                {WEAR_FREQUENCY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white mb-2">What climate is it for?</label>
              <select
                value={climate}
                onChange={(e) => setClimate(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:border-[var(--color-ff-blue)] focus:outline-none"
              >
                <option value="">Choose an option</option>
                {CLIMATE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="h-px bg-white/20" />

          {/* Checkbox Questions */}
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={wouldRecommend}
                onChange={(e) => setWouldRecommend(e.target.checked)}
                className="w-5 h-5 rounded border-white/20 bg-transparent text-[var(--color-ff-blue)] focus:ring-[var(--color-ff-blue)] focus:ring-2 focus:ring-offset-0"
              />
              <span className="text-white">Would you recommend?</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={wouldBuyAgain}
                onChange={(e) => setWouldBuyAgain(e.target.checked)}
                className="w-5 h-5 rounded border-white/20 bg-transparent text-[var(--color-ff-blue)] focus:ring-[var(--color-ff-blue)] focus:ring-2 focus:ring-offset-0"
              />
              <span className="text-white">Would you buy again?</span>
            </label>
          </div>

          <div className="h-px bg-white/20" />

          {/* Text Input Fields */}
          <div className="space-y-6">
            <div>
              <label className="block text-white mb-2">
                Tell other people more about the product and your experience with it.
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Your review"
                rows={6}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:border-[var(--color-ff-blue)] focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-white mb-2">
                What&apos;s your opinion in one sentence? Example: Best purchase ever.
              </label>
              <input
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="Review in Short"
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:border-[var(--color-ff-blue)] focus:outline-none"
              />
            </div>
          </div>

          <div className="h-px bg-white/20" />

          {/* Error Message */}
          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-6 py-3 bg-[var(--color-ff-blue)] text-white font-medium rounded-lg hover:bg-[var(--color-ff-blue)]/90 transition disabled:opacity-50 disabled:cursor-not-allowed uppercase"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </main>
  );
}
