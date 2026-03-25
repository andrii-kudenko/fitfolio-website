"use client";

import { useState, useEffect, useCallback } from "react";
import { categoriesApi } from "@/features/categories/api/categories.api";
import { brandsApi } from "@/features/brands/api/brands.api";
import { imagesApi } from "@/features/images/api/images.api";
import { enrichmentApi } from "@/features/enrichment/api/enrichment.api";
import { itemsApi } from "@/features/items/api/items.api";
import type { CategoryResponse } from "@/features/categories/types/categories.types";
import type { BrandResponse } from "@/features/brands/types/brands.types";
import type { ItemCreate } from "@/features/items/types/items.types";
import { ITEM_FILTER_COLORS } from "@/features/items/constants/colors";

const DEPARTMENTS = [
  { value: "Men", label: "Men" },
  { value: "Women", label: "Women" },
  { value: "Unisex", label: "Unisex" },
] as const;

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddItemModal({ isOpen, onClose, onSuccess }: AddItemModalProps) {
  const [name, setName] = useState("");
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
  const [error, setError] = useState<string | null>(null);

  // Load categories and brands
  useEffect(() => {
    categoriesApi.getAllSimple().then(setCategories).catch(() => setCategories([]));
    brandsApi.getAllSimple({ size: 200 }).then(setBrands).catch(() => setBrands([]));
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

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
        setError("Please select a JPEG or PNG image");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Name is required");
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
        name: name.trim(),
        category: selectedCategory?.name ?? "",
        brand: selectedBrand?.name ?? "",
      });

      // 2. Upload image to get imageUrl
      const { publicUrl } = await imagesApi.uploadImage(imageFile, "item");

      // 3. Create item with metadata
      const itemCreate: ItemCreate = {
        name: name.trim(),
        status: "draft",
        brandId: brandId || undefined,
        categoryId: selectedCategoryId || undefined,
        imageUrl: publicUrl,
        department: department || undefined,
        primaryColor: primaryColor || undefined,
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
    setName("");
    setImageFile(null);
    setImagePreview(null);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-xl">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white text-xl"
          aria-label="Close"
        >
          ×
        </button>

        <h2 className="text-xl font-semibold text-white mb-6">ADD NEW ITEM</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">Name of your item</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="w-full rounded-lg border border-slate-600 bg-black px-4 py-2 text-white placeholder:text-slate-500 focus:border-ff-cyan focus:outline-none"
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">Would you like to add a photo?</label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleImageChange}
                className="hidden"
                id="item-image"
              />
              <label
                htmlFor="item-image"
                className="flex items-center gap-2 cursor-pointer rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700 transition-colors"
              >
                <span>+</span> Upload image
              </label>
              {imagePreview && (
                <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-600 flex-shrink-0">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Category 1st layer */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">Choose category</label>
            <select
              value={category1Id}
              onChange={(e) => setCategory1Id(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-black px-4 py-2 text-white focus:border-ff-cyan focus:outline-none"
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
              <label className="block text-sm text-slate-300 mb-1">Choose sub-category</label>
              <select
                value={category2Id}
                onChange={(e) => setCategory2Id(e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-black px-4 py-2 text-white focus:border-ff-cyan focus:outline-none"
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
              <label className="block text-sm text-slate-300 mb-1">Choose sub-category</label>
              <select
                value={category3Id}
                onChange={(e) => setCategory3Id(e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-black px-4 py-2 text-white focus:border-ff-cyan focus:outline-none"
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
            <label className="block text-sm text-slate-300 mb-1">Choose brand</label>
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-black px-4 py-2 text-white focus:border-ff-cyan focus:outline-none"
            >
              <option value="">Choose an option</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">Choose department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-black px-4 py-2 text-white focus:border-ff-cyan focus:outline-none"
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
            <label className="block text-sm text-slate-300 mb-2">Choose primary color</label>
            <div className="flex flex-wrap gap-2">
              {ITEM_FILTER_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setPrimaryColor(primaryColor === c.value ? "" : c.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-colors ${
                    primaryColor === c.value
                      ? "border-ff-cyan scale-110"
                      : "border-slate-600 hover:border-slate-500"
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.label}
                  aria-label={c.label}
                />
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-4 w-full rounded-lg bg-ff-cyan py-3 text-sm font-medium text-black hover:bg-ff-cyan/90 disabled:opacity-60 transition-colors"
          >
            {submitting ? "Submitting..." : "SUBMIT ITEM"}
          </button>
        </form>
      </div>
    </div>
  );
}
