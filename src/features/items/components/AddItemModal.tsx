"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { categoriesApi } from "@/features/categories/api/categories.api";
import { brandsApi } from "@/features/brands/api/brands.api";
import { imagesApi } from "@/features/images/api/images.api";
import { fileToNormalizedJpeg } from "@/features/images/lib/normalizeImageFile";
import { enrichmentApi } from "@/features/enrichment/api/enrichment.api";
import { itemsApi } from "@/features/items/api/items.api";
import type { CategoryResponse } from "@/features/categories/types/categories.types";
import type { BrandResponse } from "@/features/brands/types/brands.types";
import type { ItemCreate } from "@/features/items/types/items.types";
import { ITEM_FILTER_COLORS } from "@/features/items/constants/colors";
import { ITEM_IMAGE_STORE_SIZE_PX } from "@/features/items/constants/imageUpload";

const DEPARTMENTS = [
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "unisex", label: "Unisex" },
] as const;

const labelClass =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.2em] text-ff-cyan/85";

const fieldClass =
  "w-full rounded-xl border border-white/15 bg-[#000500]/95 px-4 py-2.5 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] placeholder:text-slate-500 outline-none transition focus:border-ff-cyan/55 focus:shadow-[0_0_0_1px_rgba(85,193,255,0.25)]";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ITEM_CREATE_NAME_MAX = 120;

export function AddItemModal({ isOpen, onClose, onSuccess }: AddItemModalProps) {
  const [userPrompt, setUserPrompt] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [category1Id, setCategory1Id] = useState<string>("");
  const [category2Id, setCategory2Id] = useState<string>("");
  const [category3Id, setCategory3Id] = useState<string>("");
  const [brandId, setBrandId] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [primaryColor, setPrimaryColor] = useState<string>("");

  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [imageProcessing, setImageProcessing] = useState(false);
  const imageProcessingRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  // Load categories and brands
  useEffect(() => {
    categoriesApi.getAllSimple().then(setCategories).catch(() => setCategories([]));
    brandsApi.getAllList().then(setBrands).catch(() => setBrands([]));
  }, []);

  // Layer 1: top-level (Apparel, Shoes, Accessories) - parentId is null
  const layer1Categories = categories.filter((c) => !c.parentId);
  // Layer 2: children of selected layer 1
  const layer2Categories = categories.filter((c) => c.parentId === category1Id);
  // Layer 3: children of selected layer 2
  const layer3Categories = categories.filter((c) => c.parentId === category2Id);

  // Reset layer 2 and 3 when layer 1 or 2 changes
  useEffect(() => {
    setCategory2Id("");
    setCategory3Id("");
  }, [category1Id]);
  useEffect(() => {
    setCategory3Id("");
  }, [category2Id]);

  const selectedCategoryId = category3Id || category2Id || category1Id || "";
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const selectedBrand = brands.find((b) => b.id === brandId);

  const brandsSorted = useMemo(
    () =>
      [...brands].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      ),
    [brands]
  );

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const input = e.target;
    if (!file) return;
    if (imageProcessingRef.current) return;

    const looksLikeImage =
      file.type.startsWith("image/") ||
      /\.(jpe?g|png|gif|webp|bmp|avif|heic|heif)$/i.test(file.name);

    if (!looksLikeImage) {
      setError("Please select an image file");
      input.value = "";
      return;
    }

    setError(null);
    imageProcessingRef.current = true;
    setImageProcessing(true);

    void (async () => {
      try {
        const normalized = await fileToNormalizedJpeg(file, {
          squareSide: ITEM_IMAGE_STORE_SIZE_PX,
          fit: "contain",
        });
        setImageFile(normalized);
        setImagePreview((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(normalized);
        });
      } catch {
        setError(
          "Could not process this image. Try another file or open it in Preview and export as JPEG."
        );
        setImageFile(null);
        setImagePreview((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return null;
        });
      } finally {
        imageProcessingRef.current = false;
        setImageProcessing(false);
        input.value = "";
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!userPrompt.trim()) {
      setError("Please add a short description of the item");
      return;
    }
    if (!imageFile) {
      setError("Please upload an image");
      return;
    }
    if (!selectedCategoryId) {
      setError("Please select a category");
      return;
    }
    if (!brandId) {
      setError("Please select a brand");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Call enrichment to get metadata
      const metadata = await enrichmentApi.getMetadata({
        image: imageFile,
        itemPrompt: userPrompt.trim(),
        category: selectedCategory?.name ?? "",
        brand: selectedBrand?.name ?? "",
      });

      const resolvedName = (metadata.itemName?.trim() || userPrompt.trim()).slice(
        0,
        ITEM_CREATE_NAME_MAX
      );

      // 2. Upload image to get imageUrl
      const { publicUrl } = await imagesApi.uploadImage(imageFile, "item");

      // 3. Create item with metadata
      const itemCreate: ItemCreate = {
        name: resolvedName,
        status: "draft",
        brandId: brandId || undefined,
        categoryId: selectedCategoryId || undefined,
        imageUrl: publicUrl,
        department: department || undefined,
        primaryColor: primaryColor || undefined,
        description: metadata.description?.trim() || undefined,
        themesTags: metadata.themes,
        occasionsTags: metadata.occasions,
        vibesTags: metadata.vibes,
        stylesTags: metadata.styles,
        aestheticTags: metadata.aesthetic,
        fitTags: metadata.fit,
        seasonTags: metadata.season,
        functionTags: metadata.function,
      };

      await itemsApi.create(itemCreate);
      onSuccess?.();
      handleClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setUserPrompt("");
    setImageFile(null);
    setImagePreview(null);
    imageProcessingRef.current = false;
    setImageProcessing(false);
    setCategory1Id("");
    setCategory2Id("");
    setCategory3Id("");
    setBrandId("");
    setDepartment("");
    setPrimaryColor("");
    setError(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    onClose();
  };

  if (!isOpen) return null;


  console.log(brandsSorted.length);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-item-modal-title"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-ff-cyan/30 bg-gradient-to-b from-slate-950/98 via-[#030708] to-[#000500] shadow-[0_0_0_1px_rgba(85,193,255,0.06),0_28px_90px_rgba(0,0,0,0.85),0_0_80px_rgba(85,193,255,0.08)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ff-cyan/75 to-transparent" />
        <div className="pointer-events-none absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

        <button
          type="button"
          onClick={handleClose}
          className="absolute right-3 top-3 z-10 flex size-10 items-center justify-center rounded-xl border border-white/10 bg-[#000500]/90 text-slate-400 backdrop-blur-sm transition hover:border-ff-cyan/45 hover:bg-ff-cyan/10 hover:text-ff-cyan"
          aria-label="Close"
        >
          <X className="size-5" strokeWidth={2} />
        </button>

        <div className="scrollbar-hide max-h-[90vh] overflow-y-auto p-6 pt-8">
          <header className="mb-7 pr-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-ff-cyan/65">
              Catalogue sync
            </p>
            <h2
              id="add-item-modal-title"
              className="mt-1.5 text-2xl font-bold tracking-tight text-white"
            >
              Add new item
            </h2>
            <p className="mt-2 max-w-sm text-xs leading-relaxed text-slate-400">
              Describe the piece in your own words. On submit we suggest a catalog title, tags, and product
              copy from your photo and notes.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* User description → model derives item name */}
            <div>
              <label htmlFor="item-user-prompt" className={labelClass}>
                Your description
              </label>
              <textarea
                id="item-user-prompt"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Short prompt: color, fabric, fit, vibe — whatever helps identify the piece."
                rows={3}
                className={`${fieldClass} min-h-[5.5rem] resize-y`}
              />
            </div>

            {/* Image */}
            <div>
              <span className={labelClass}>Hero image</span>
              <div className="flex flex-wrap items-stretch gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="item-image"
                />
                <label
                  htmlFor="item-image"
                  className={`flex min-h-[5.5rem] flex-1 min-w-[10rem] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/[0.03] px-4 py-4 text-center transition hover:border-ff-cyan/40 hover:bg-ff-cyan/[0.06] ${
                    imageProcessing ? "pointer-events-none opacity-55" : ""
                  }`}
                >
                  {imageProcessing ? (
                    <Loader2 className="size-7 text-ff-cyan animate-spin" strokeWidth={2} />
                  ) : (
                    <ImagePlus className="size-7 text-ff-cyan/90" strokeWidth={1.75} />
                  )}
                  <span className="text-xs font-medium text-white">
                    {imageProcessing ? "Optimizing…" : "Upload or drop image"}
                  </span>
                  <span className="text-[11px] text-slate-500">JPEG, PNG, WebP…</span>
                </label>
                {imagePreview && (
                  <div className="relative size-[5.5rem] shrink-0 overflow-hidden rounded-xl border border-ff-cyan/35 bg-black shadow-[0_0_24px_rgba(85,193,255,0.15)]">
                    <img src={imagePreview} alt="" className="size-full object-cover" />
                    <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]" />
                  </div>
                )}
              </div>
            </div>

            {/* Category 1st layer */}
            <div>
              <label htmlFor="item-category-1" className={labelClass}>
                Category
              </label>
              <select
                id="item-category-1"
                value={category1Id}
                onChange={(e) => setCategory1Id(e.target.value)}
                className={fieldClass}
              >
              <option value="">Choose an option</option>
              {layer1Categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory 2nd layer */}
          {layer2Categories.length > 0 && (
            <div>
              <label htmlFor="item-category-2" className={labelClass}>
                Sub-category
              </label>
              <select
                id="item-category-2"
                value={category2Id}
                onChange={(e) => setCategory2Id(e.target.value)}
                className={fieldClass}
              >
                <option value="">Choose an option</option>
                {layer2Categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Subcategory 3rd layer */}
          {layer3Categories.length > 0 && (
            <div>
              <label htmlFor="item-category-3" className={labelClass}>
                Sub-category
              </label>
              <select
                id="item-category-3"
                value={category3Id}
                onChange={(e) => setCategory3Id(e.target.value)}
                className={fieldClass}
              >
                <option value="">Choose an option</option>
                {layer3Categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Brand */}
          <div>
            <label htmlFor="item-brand" className={labelClass}>
              Brand
            </label>
            <select
              id="item-brand"
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className={fieldClass}
            >
              <option value="">Choose an option</option>
              {brandsSorted.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label htmlFor="item-department" className={labelClass}>
              Department
            </label>
            <select
              id="item-department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className={fieldClass}
            >
              <option value="">Choose an option</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Primary color */}
          <div>
            <span className={labelClass}>Primary color</span>
            <div className="mt-1 flex flex-wrap gap-2.5 rounded-xl border border-white/10 bg-white/[0.02] p-3">
              {ITEM_FILTER_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setPrimaryColor(primaryColor === c.value ? "" : c.value)}
                  className={`size-9 rounded-full border-2 transition-all ${
                    primaryColor === c.value
                      ? "border-ff-cyan scale-110 shadow-[0_0_16px_rgba(85,193,255,0.45)] ring-2 ring-ff-cyan/30"
                      : "border-white/20 hover:border-ff-cyan/40 hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.label}
                  aria-label={c.label}
                  aria-pressed={primaryColor === c.value}
                />
              ))}
            </div>
          </div>

          {error && (
            <p className="rounded-xl border border-red-500/35 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || imageProcessing}
            className="mt-1 w-full rounded-xl border border-ff-cyan/50 bg-gradient-to-r from-ff-cyan via-[#6ecfff] to-ff-blue py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-black shadow-[0_0_28px_rgba(85,193,255,0.28)] transition hover:brightness-110 disabled:pointer-events-none disabled:opacity-50"
          >
            {submitting ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin" strokeWidth={2.5} />
                Submitting…
              </span>
            ) : (
              "Commit item"
            )}
          </button>
          </form>
        </div>
      </div>
    </div>
  );
}
