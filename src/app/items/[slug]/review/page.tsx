'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
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

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL'] as const;
/** Select sentinel; not a valid API value on its own. */
const APPAREL_SIZE_CUSTOM = '__custom__';
const MAX_PURCHASED_SIZE_LEN = 32;

const MAX_CATEGORY_ANCESTORS = 32;

async function fetchCategoryChain(leaf: CategoryResponse): Promise<CategoryResponse[]> {
  const chain: CategoryResponse[] = [];
  let current: CategoryResponse | null = leaf;
  for (let i = 0; i < MAX_CATEGORY_ANCESTORS && current; i++) {
    chain.push(current);
    if (!current.parentId) break;
    try {
      current = await categoriesApi.getById(current.parentId);
    } catch {
      break;
    }
  }
  return chain;
}

function categoryIsShoes(c: CategoryResponse): boolean {
  const slug = c.slug.toLowerCase();
  const name = c.name.toLowerCase().trim();
  return slug === 'shoes' || slug === 'shoe' || name === 'shoes' || name === 'shoe';
}

function categoryIsAccessories(c: CategoryResponse): boolean {
  const slug = c.slug.toLowerCase();
  const name = c.name.toLowerCase().trim();
  return (
    slug === 'accessories' ||
    slug === 'accessory' ||
    name === 'accessories' ||
    name === 'accessory'
  );
}

function readLoggedInUserId(): string | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('fitfolio_logged_in');
  if (!raw) return null;
  try {
    const u = JSON.parse(raw) as { id?: string };
    return typeof u?.id === 'string' ? u.id : null;
  } catch {
    return null;
  }
}

export default function WriteReviewPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [item, setItem] = useState<ItemFullResponse | null>(null);
  /** Leaf → … → root (full ancestor walk; not only immediate parent). */
  const [categoryChain, setCategoryChain] = useState<CategoryResponse[]>([]);
  const [fitProfile, setFitProfile] = useState<FitProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [rating, setRating] = useState<number>(0);
  const [fit, setFit] = useState<string>('perfect_fit');
  const [comfort, setComfort] = useState<string>('comfortable');
  const [quality, setQuality] = useState<string>('premium_quality');
  const [timeOwned, setTimeOwned] = useState<string>('');
  const [purchasedSize, setPurchasedSize] = useState<string>('');
  /** When true, "What size" uses custom text instead of a preset letter size. */
  const [apparelSizeCustom, setApparelSizeCustom] = useState(false);
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
    setApparelSizeCustom(false);
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    
    setLoading(true);
    setCategoryChain([]);
    itemsApi
      .getBySlugFull(slug, readLoggedInUserId())
      .then(async (itemData) => {
        let chain: CategoryResponse[] = [];
        if (itemData.category) {
          try {
            chain = await fetchCategoryChain(itemData.category);
          } catch (err) {
            console.error('Error fetching category ancestors:', err);
            chain = [itemData.category];
          }
        }
        setCategoryChain(chain);
        setItem(itemData);
      })
      .catch((err) => {
        console.error('Error fetching item:', err);
        setError('Failed to load item');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const getCategoryType = (): 'shoes' | 'accessories' | 'other' => {
    if (!item?.category) return 'other';

    const chain =
      categoryChain.length > 0 ? categoryChain : [item.category];

    if (chain.some(categoryIsShoes)) return 'shoes';
    if (chain.some(categoryIsAccessories)) return 'accessories';
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
  }, [item, categoryChain]);

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
      setError('Please select or enter the size you purchased');
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

  const sectionLabelClass =
    'block text-[11px] font-medium uppercase tracking-[0.18em] text-white/45 mb-1';

  const renderSlider = (
    value: string,
    onChange: (value: string) => void,
    options: Array<{ value: string; label: string }>
  ) => {
    return (
      <div className="relative mt-6 px-0.5">
        <div className="relative flex min-h-[5.25rem] items-center justify-between">
          <div
            className="pointer-events-none absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-white/[0.14]"
            aria-hidden
          />
          {options.map((option, index) => {
            const isSelected = value === option.value;
            const position = (index / (options.length - 1)) * 100;
            const labelAbove = index % 2 === 0;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                className="group absolute z-10 flex flex-col items-center gap-2.5 focus:outline-none"
                style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                aria-pressed={isSelected}
                aria-label={option.label}
              >
                {labelAbove && (
                  <span
                    className={`max-w-[7.5rem] text-center text-[11px] leading-tight transition-colors ${
                      isSelected
                        ? 'font-semibold text-white'
                        : 'text-white/38 group-hover:text-white/55'
                    }`}
                  >
                    {option.label}
                  </span>
                )}
                <span
                  className={`shrink-0 rounded-full border-2 border-white/35 bg-black transition-all duration-200 ${
                    isSelected
                      ? 'h-[17px] w-[17px] border-[var(--color-ff-blue)] shadow-[0_0_0_1px_rgba(35,148,234,0.35),0_0_16px_rgba(35,148,234,0.55)]'
                      : 'h-2.5 w-2.5 border-white/30 group-hover:border-white/50'
                  }`}
                />
                {!labelAbove && (
                  <span
                    className={`max-w-[7.5rem] text-center text-[11px] leading-tight transition-colors ${
                      isSelected
                        ? 'font-semibold text-white'
                        : 'text-white/38 group-hover:text-white/55'
                    }`}
                  >
                    {option.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white antialiased">
        <div className="mx-auto max-w-xl px-4 py-10 sm:px-5 sm:py-12">
          <div className="border-b border-white/[0.1] pb-5 font-mono text-[10px] uppercase tracking-[0.28em] text-white/35">
            Review / Input
          </div>
          <div className="py-20 text-center text-sm text-white/45">Loading…</div>
        </div>
      </main>
    );
  }

  if (error && !item) {
    return (
      <main className="min-h-screen bg-black text-white antialiased">
        <div className="mx-auto max-w-xl px-4 py-10 sm:px-5 sm:py-12">
          <div className="py-16 text-center">
            <div className="mb-5 text-sm text-red-300">{error}</div>
            <Link
              href={`/items/${slug}`}
              className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--color-ff-cyan)] hover:text-white"
            >
              ← Back to item
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const fieldBaseClass =
    'rounded-md border border-white/[0.14] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white transition placeholder:text-white/35 focus:border-[var(--color-ff-blue)] focus:outline-none focus:shadow-[0_0_0_1px_rgba(35,148,234,0.25)]';
  const fieldClass = `${fieldBaseClass} w-full`;
  const selectFieldClass = `${fieldClass} mt-2 appearance-none bg-[length:12px_8px] bg-[right_12px_center] bg-no-repeat pr-10 [background-image:url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%228%22%20fill%3D%22none%22%3E%3Cpath%20stroke%3D%22%23ffffff%22%20stroke-opacity%3D%220.35%22%20stroke-width%3D%221.2%22%20d%3D%22M1%201l5%205%205-5%22%2F%3E%3C%2Fsvg%3E')]`;

  return (
    <main className="min-h-screen bg-black text-white antialiased">
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
      <div className="mx-auto max-w-xl px-4 py-10 sm:px-5 sm:py-12">
        <div className="mb-8 flex items-baseline justify-between gap-4 border-b border-white/[0.1] pb-5">
          <Link
            href={`/items/${slug}`}
            className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/40 transition hover:text-white/70"
          >
            ← Item
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/30">
            Review / Input
          </span>
        </div>

        {item?.item && (
          <div className="mb-10 flex items-center gap-4 rounded-md border border-white/[0.14] bg-white/[0.02] px-4 py-3">
            {item.item.imageUrl && (
              <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded border border-white/[0.1] bg-white">
                <Image
                  src={item.item.imageUrl}
                  alt={item.item.name || ''}
                  fill
                  className="object-contain p-1"
                  sizes="72px"
                />
              </div>
            )}
            <h2 className="text-[15px] font-semibold leading-snug tracking-tight text-white">
              {item.item.name}
            </h2>
          </div>
        )}

        <div className="mb-10">
          <h1 className="text-xl font-bold uppercase tracking-[0.12em] text-white sm:text-[22px]">
            Write your review
          </h1>
          <div className="mt-4 h-px bg-white/[0.12]" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div>
            <label className={sectionLabelClass}>Your overall rating</label>
            <div className="mt-3 flex flex-wrap items-center gap-5">
              <span className="inline-flex items-baseline font-mono text-lg tabular-nums text-white sm:text-2xl">
                <span className="inline-block w-[2ch] text-right">{rating}</span>
                <span className="text-white/35">/10</span>
              </span>
              <div className="flex gap-0.5" role="group" aria-label="Rating out of 10">
                {Array.from({ length: 10 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i + 1)}
                    className={`rounded p-0.5 transition hover:opacity-90 ${
                      i < rating ? '' : 'text-white/20 hover:text-white/30'
                    }`}
                    aria-label={`Overall rating ${i + 1} of 10`}
                  >
                    <Star
                      className={`size-5.5 shrink-0 ${
                        i < rating
                          ? 'fill-yellow-300 text-yellow-300 drop-shadow-[0_0_6px_rgba(253,224,71,0.35)]'
                          : 'fill-none text-current'
                      }`}
                      aria-hidden
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-8 h-px bg-white/[0.1]" />
          </div>

          <div>
            <label className={sectionLabelClass}>How would you describe the fit?</label>
            {renderSlider(fit, setFit, FIT_OPTIONS)}
            <div className="mt-8 h-px bg-white/[0.1]" />
          </div>

          <div>
            <label className={sectionLabelClass}>How would you describe the comfort?</label>
            {renderSlider(comfort, setComfort, COMFORT_OPTIONS)}
          </div>

          <div>
            <label className={sectionLabelClass}>How would you describe the quality?</label>
            {renderSlider(quality, setQuality, QUALITY_OPTIONS)}
            <div className="mt-8 h-px bg-white/[0.1]" />
          </div>

          <div className="space-y-6">
            <div>
              <label className={sectionLabelClass}>
                For how long have you owned the item?
              </label>
              <select
                value={timeOwned}
                onChange={(e) => setTimeOwned(e.target.value)}
                className={selectFieldClass}
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
                <label className={sectionLabelClass}>What is your shoe size?</label>
                <div className="mt-2 flex min-w-0 gap-2">
                  <div
                    className={`${fieldBaseClass} flex min-w-[4.25rem] max-w-[7rem] shrink-0 items-center justify-center font-mono text-xs text-white/80`}
                  >
                    {fitProfile?.shoeSizeSystem || 'System'}
                  </div>
                  <input
                    type="text"
                    value={purchasedSize}
                    onChange={(e) => setPurchasedSize(e.target.value)}
                    placeholder="Size"
                    className={`${fieldBaseClass} min-w-0 flex-1`}
                  />
                </div>
              </div>
            )}
            {getCategoryType() === 'other' && (
              <div>
                <label className={sectionLabelClass}>What size did you purchase?</label>
                <select
                  value={
                    apparelSizeCustom
                      ? APPAREL_SIZE_CUSTOM
                      : SIZE_OPTIONS.includes(purchasedSize as (typeof SIZE_OPTIONS)[number])
                        ? purchasedSize
                        : ''
                  }
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === APPAREL_SIZE_CUSTOM) {
                      setApparelSizeCustom(true);
                      setPurchasedSize('');
                    } else {
                      setApparelSizeCustom(false);
                      setPurchasedSize(v);
                    }
                  }}
                  className={selectFieldClass}
                >
                  <option value="">Choose a size</option>
                  {SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                  <option value={APPAREL_SIZE_CUSTOM}>Custom…</option>
                </select>
                {apparelSizeCustom && (
                  <input
                    type="text"
                    value={purchasedSize}
                    onChange={(e) =>
                      setPurchasedSize(
                        e.target.value.slice(0, MAX_PURCHASED_SIZE_LEN)
                      )
                    }
                    placeholder="Enter your size (max 32 characters)"
                    maxLength={MAX_PURCHASED_SIZE_LEN}
                    className={`${fieldClass} mt-2`}
                  />
                )}
              </div>
            )}
            {/* No size input for accessories */}

            <div>
              <label className={sectionLabelClass}>What was its wear frequency?</label>
              <select
                value={wearFrequency}
                onChange={(e) => setWearFrequency(e.target.value)}
                className={selectFieldClass}
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
              <label className={sectionLabelClass}>What climate is it for?</label>
              <select
                value={climate}
                onChange={(e) => setClimate(e.target.value)}
                className={selectFieldClass}
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

          <div className="h-px bg-white/[0.1]" />

          <div className="space-y-3">
            <label className="flex cursor-pointer items-start gap-3 rounded-md border border-transparent py-1 transition hover:border-white/[0.08]">
              <input
                type="checkbox"
                checked={wouldRecommend}
                onChange={(e) => setWouldRecommend(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border border-white/25 bg-black accent-[var(--color-ff-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--color-ff-blue)] focus:ring-offset-0"
              />
              <span className="text-sm text-white/90">Would you recommend?</span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-md border border-transparent py-1 transition hover:border-white/[0.08]">
              <input
                type="checkbox"
                checked={wouldBuyAgain}
                onChange={(e) => setWouldBuyAgain(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border border-white/25 bg-black accent-[var(--color-ff-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--color-ff-blue)] focus:ring-offset-0"
              />
              <span className="text-sm text-white/90">Would you buy again?</span>
            </label>
          </div>

          <div className="h-px bg-white/[0.1]" />

          <div className="space-y-6">
            <div>
              <label className={sectionLabelClass}>
                Tell other people more about the product and your experience with it.
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Your review"
                rows={6}
                className={`${fieldClass} mt-2 resize-none`}
              />
            </div>

            <div>
              <label className={sectionLabelClass}>
                What&apos;s your opinion in one sentence? Example: Best purchase ever.
              </label>
              <input
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="Review in Short"
                className={`${fieldClass} mt-2`}
              />
            </div>
          </div>

          <div className="h-px bg-white/[0.1]" />

          {error && (
            <div className="rounded-md border border-red-500/35 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md border border-[var(--color-ff-blue)] bg-[var(--color-ff-blue)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white shadow-[0_0_24px_rgba(35,148,234,0.28)] transition hover:bg-[#1a85d6] hover:shadow-[0_0_28px_rgba(35,148,234,0.38)] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
          >
            {submitting ? 'Submitting…' : 'Submit review'}
          </button>
        </form>
      </div>
    </main>
  );
}
