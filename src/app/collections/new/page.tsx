'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Eye, MessageCircle, X, Trash2, GripVertical } from 'lucide-react';
import { searchApi } from '@/features/search/api/search.api';
import { ItemSearchResult } from '@/features/search/types/search.types';
import { collectionsApi } from '@/features/collections/api/collections.api';
import { usersApi } from '@/features/users/api/users.api';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function CreateCollectionPage() {
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    isPublic: true, // boolean: true for public, false for private
    isRanked: false,
    description: '',
  });
  const [items, setItems] = useState<(ItemSearchResult & { rank: number })[]>([]);
  const [itemInput, setItemInput] = useState('');
  const [searchResults, setSearchResults] = useState<ItemSearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Search items when input changes
  useEffect(() => {
    let isCancelled = false;
    
    if (itemInput.trim()) {
      searchApi.search({ query: itemInput, limit: 10 })
        .then(results => {
          if (!isCancelled) {
            setSearchResults(results);
            setShowSearchResults(true);
          }
        })
        .catch(error => {
          console.error("Search error:", error);
          if (!isCancelled) {
            setSearchResults([]);
          }
        });
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
    
    return () => {
      isCancelled = true;
    };
  }, [itemInput]);

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectItem = (item: ItemSearchResult) => {
    // Check if item is already in the collection
    if (!items.find(i => i.id === item.id)) {
      const newRank = items.length + 1; // Rank starts at 1
      setItems((prev) => [...prev, { ...item, rank: newRank }]);
    }
    setItemInput('');
    setShowSearchResults(false);
  };

  const handleRemoveItem = (itemId: string) => {
    setItems((prev) => {
      const filtered = prev.filter((item) => item.id !== itemId);
      // Recalculate ranks after removal
      return filtered.map((item, index) => ({
        ...item,
        rank: index + 1,
      }));
    });
  };

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const reorderedItems = arrayMove(items, oldIndex, newIndex);
        // Update ranks based on new positions
        return reorderedItems.map((item, index) => ({
          ...item,
          rank: index + 1, // Rank starts at 1
        }));
      });
    }
  };

  function formatCount(count: number): string {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
  }

  const handleSave = async () => {
    // Validation
    if (!formData.title.trim()) {
      alert('Please enter a collection title');
      return;
    }

    if (items.length === 0) {
      alert('Please add at least one item to the collection');
      return;
    }

    try {
      // Get logged-in user
      const loggedInUserData = localStorage.getItem('fitfolio_logged_in');
      if (!loggedInUserData) {
        alert('You must be logged in to create a collection');
        return;
      }
      
      const loggedInUser = JSON.parse(loggedInUserData);
      
      // Prepare collection data with items
      const collectionData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        coverImageUrl: null,
        isPublic: formData.isPublic,
        isRanked: formData.isRanked,
        items: items.map((item) => ({
          itemId: item.id,
          rank: item.rank, // Always include rank, regardless of isRanked flag
        })),
      };
      
      // Create collection via API
      const createdCollection = await collectionsApi.createForUser(
        loggedInUser.id,
        collectionData
      );
      
      // Fetch user profile to get username for redirect
      const userProfile = await usersApi.getProfile(loggedInUser.id);
      
      // Redirect to the created collection using the new route structure
      router.push(`/${userProfile.username}/collections/${createdCollection.slug}`);
    } catch (error) {
      console.error('Error creating collection:', error);
      alert('Failed to create collection. Please try again.');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header with Cancel and Save */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Create Collection</h1>
          <div className="flex gap-4">
            <button
              onClick={handleCancel}
              className="rounded-full bg-slate-700 px-6 py-2 text-sm font-medium text-white hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded-full bg-ff-cyan px-6 py-2 text-sm font-medium text-black hover:bg-ff-cyan/90 transition-colors"
            >
              Save
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Main Form */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-8">
            <h2 className="mb-6 text-xl font-semibold uppercase tracking-wide">NEW COLLECTION</h2>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Left Column - Collection Details */}
              <div className="space-y-6">
                {/* Title Field */}
                <div>
                  <label htmlFor="title" className="mb-2 block text-sm font-medium text-slate-200">
                    Name
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter collection name"
                    className="w-full rounded-lg border border-white bg-black px-4 py-2 text-white placeholder:text-slate-500 focus:border-ff-cyan focus:outline-none"
                  />
                </div>

                {/* Who can view Field */}
                <div>
                  <label htmlFor="isPublic" className="mb-2 block text-sm font-medium text-slate-200">
                    Who can view?
                  </label>
                  <select
                    id="isPublic"
                    value={formData.isPublic ? 'public' : 'private'}
                    onChange={(e) => handleInputChange('isPublic', e.target.value === 'public')}
                    className="w-full rounded-lg border border-white bg-black px-4 py-2 text-white focus:border-ff-cyan focus:outline-none"
                  >
                    <option value="public">Anyone - Public collection</option>
                    <option value="private">Only me - Private collection</option>
                  </select>
                </div>

                {/* Ranked Collection Checkbox */}
                <div className="flex items-start gap-3">
                  <input
                    id="isRanked"
                    type="checkbox"
                    checked={formData.isRanked}
                    onChange={(e) => handleInputChange('isRanked', e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-600 bg-black text-ff-cyan focus:ring-ff-cyan"
                  />
                  <div>
                    <label htmlFor="isRanked" className="text-sm font-medium text-slate-200">
                      Ranked collection
                    </label>
                    <p className="mt-1 text-xs text-slate-400">Show position for each item.</p>
                  </div>
                </div>
              </div>

              {/* Right Column - Description */}
              <div>
                <label htmlFor="description" className="mb-2 block text-sm font-medium text-slate-200">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter collection description"
                  rows={10}
                  className="w-full rounded-lg border border-white bg-black px-4 py-2 text-white placeholder:text-slate-500 focus:border-ff-cyan focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Add Item Section with Search */}
          <div className="relative" ref={searchRef}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <button
                className="rounded-full bg-ff-cyan px-6 py-2 text-sm font-medium text-black hover:bg-ff-cyan/90 transition-colors whitespace-nowrap"
              >
                ADD AN ITEM
              </button>
              <div className="relative flex-1">
                <input
                  type="text"
                  value={itemInput}
                  onChange={(e) => setItemInput(e.target.value)}
                  onFocus={() => itemInput.trim() && setShowSearchResults(true)}
                  placeholder="Enter name of an item..."
                  className="w-full rounded-lg border border-white bg-black px-4 py-2 text-white placeholder:text-slate-500 focus:border-ff-cyan focus:outline-none"
                />
                
                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-slate-950 border border-slate-800 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                    {searchResults.map((item) => {
                      const imageUrl = item.imageUrl || '/tnf-jacket.jpg';
                      const price = item.price ? `$${item.price.toFixed(2)}` : '';
                      const isAlreadyAdded = items.some(i => i.id === item.id);
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => !isAlreadyAdded && handleSelectItem(item)}
                          disabled={isAlreadyAdded}
                          className={`w-full flex items-center px-4 py-3 gap-4 hover:bg-slate-900 transition-colors ${
                            isAlreadyAdded ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                        >
                          <div className="rounded-lg bg-slate-800 overflow-hidden flex-shrink-0">
                            <Image 
                              src={imageUrl} 
                              alt={item.name} 
                              width={60} 
                              height={60}
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm text-white truncate font-medium">{item.name}</p>
                            {item.subTitle && (
                              <p className="text-xs text-slate-400 mt-1">{item.subTitle}</p>
                            )}
                            {price && (
                              <p className="text-xs text-slate-500 mt-1">{price}</p>
                            )}
                          </div>
                          {isAlreadyAdded && (
                            <span className="text-xs text-slate-500">Added</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
                
                {showSearchResults && itemInput.trim() && searchResults.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-slate-950 border border-slate-800 rounded-lg shadow-xl z-50 p-4 text-center">
                    <p className="text-slate-400 text-sm">No items found. Try a different search.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items List - Below the form */}
          {items.length > 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6 overflow-hidden relative">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={items.map((item) => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3 max-h-[600px] overflow-y-auto overflow-x-hidden relative">
                    {items.map((item, index) => (
                      <SortableItem
                        key={item.id}
                        item={item}
                        index={index}
                        isRanked={formData.isRanked}
                        onRemove={handleRemoveItem}
                      />
                    ))}
                  </div>
                </SortableContext>
                <DragOverlay>
                  {activeId ? (() => {
                    const activeItem = items.find(i => i.id === activeId);
                    return (
                      <div className="flex items-center gap-4 p-4 rounded-lg border border-slate-700 bg-slate-900 w-full opacity-90">
                        {formData.isRanked && activeItem && (
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-ff-cyan text-black text-sm font-semibold flex-shrink-0">
                            {activeItem.rank}
                          </div>
                        )}
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-slate-700">
                          <Image
                            src={activeItem?.imageUrl || '/tnf-jacket.jpg'}
                            alt={activeItem?.name || ''}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white text-sm font-medium truncate">
                            {activeItem?.name}
                          </h3>
                        </div>
                      </div>
                    );
                  })() : null}
                </DragOverlay>
              </DndContext>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-12 text-center">
              <p className="text-xl font-bold text-white">Your collection is empty.</p>
              <p className="mt-2 text-sm text-slate-400">Add items using the field above</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// Sortable Item Component
function SortableItem({
  item,
  index,
  isRanked,
  onRemove,
}: {
  item: ItemSearchResult & { rank: number };
  index: number;
  isRanked: boolean;
  onRemove: (itemId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-4 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 transition-colors w-full min-w-0 max-w-full ${
        isDragging ? 'cursor-grabbing opacity-50' : 'cursor-grab'
      }`}
    >
      {/* Rank Number - Only show if collection is ranked */}
      {isRanked && (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-ff-cyan text-black text-sm font-semibold flex-shrink-0">
          {item.rank}
        </div>
      )}

      {/* Item Image */}
      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-slate-700">
        <Image
          src={item.imageUrl || '/tnf-jacket.jpg'}
          alt={item.name}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>

      {/* Item Name */}
      <div className="flex-1 min-w-0">
        <h3 className="text-white text-sm font-medium truncate">
          {item.name}
        </h3>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Delete Button */}
        <button
          onClick={() => onRemove(item.id)}
          className="p-2 text-slate-400 hover:text-red-400 transition-colors"
          aria-label="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Reorder Handle */}
        <button
          {...attributes}
          {...listeners}
          className="p-2 text-slate-400 hover:text-slate-300 transition-colors cursor-grab active:cursor-grabbing touch-none"
          aria-label="Reorder item"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
