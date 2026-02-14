'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { X, GripVertical } from 'lucide-react';
import { searchApi } from '@/features/search/api/search.api';
import { ItemSearchResult } from '@/features/search/types/search.types';
import { tierlistsApi } from '@/features/tierlists/api/tierlists.api';
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
  useDroppable,
  pointerWithin,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Default tier configuration
const DEFAULT_TIERS = [
  { label: 'S', name: 'S', color: '#3B82F6', position: 0 }, // Blue
  { label: 'A', name: 'A', color: '#10B981', position: 1 }, // Green
  { label: 'B', name: 'B', color: '#F59E0B', position: 2 }, // Yellow/Orange
  { label: 'C', name: 'C', color: '#F97316', position: 3 }, // Orange
  { label: 'D', name: 'D', color: '#EF4444', position: 4 }, // Red
];

interface TierItem {
  id: string; // Unique ID for drag and drop
  itemId: string; // Actual item ID from API
  imageUrl?: string;
  name: string;
  position: number;
}

interface Tier {
  id: string; // Temporary ID until saved
  label: string;
  name: string;
  color: string;
  position: number;
  items: TierItem[];
}

export default function CreateTierListPage() {
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    isPublic: true,
    description: '',
  });
  const [tiers, setTiers] = useState<Tier[]>(
    DEFAULT_TIERS.map((tier, index) => ({
      id: `tier-${index}`,
      label: tier.label,
      name: tier.name,
      color: tier.color,
      position: tier.position,
      items: [],
    }))
  );
  const [bufferItems, setBufferItems] = useState<TierItem[]>([]);
  const [itemInput, setItemInput] = useState('');
  const [searchResults, setSearchResults] = useState<ItemSearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<TierItem | null>(null);

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
    // Check if item is already in buffer or any tier
    const isAlreadyAdded = 
      bufferItems.some(i => i.itemId === item.id) ||
      tiers.some(tier => tier.items.some(i => i.itemId === item.id));
    
    if (!isAlreadyAdded) {
      const newItem: TierItem = {
        id: `item-${Date.now()}-${Math.random()}`,
        itemId: item.id,
        imageUrl: item.imageUrl,
        name: item.name,
        position: bufferItems.length,
      };
      setBufferItems((prev) => [...prev, newItem]);
    }
    setItemInput('');
    setShowSearchResults(false);
  };

  const handleRemoveFromBuffer = (itemId: string) => {
    setBufferItems((prev) => prev.filter(item => item.id !== itemId));
  };

  const handleRemoveFromTier = (tierId: string, itemId: string) => {
    setTiers((prev) =>
      prev.map((tier) => {
        if (tier.id === tierId) {
          return {
            ...tier,
            items: tier.items.filter((item) => item.id !== itemId),
          };
        }
        return tier;
      })
    );
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
    
    // Find the active item
    const bufferItem = bufferItems.find(item => item.id === event.active.id);
    if (bufferItem) {
      setActiveItem(bufferItem);
      return;
    }
    
    for (const tier of tiers) {
      const tierItem = tier.items.find(item => item.id === event.active.id);
      if (tierItem) {
        setActiveItem(tierItem);
        return;
      }
    }
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveItem(null);

    if (!over) return;

    const activeIdStr = active.id as string;
    const overIdStr = over.id as string;

    // Find source (buffer or tier)
    let sourceItem: TierItem | null = null;
    let sourceType: 'buffer' | 'tier' = 'buffer';
    let sourceTierId: string | null = null;

    // Check buffer first
    const bufferItem = bufferItems.find(item => item.id === activeIdStr);
    if (bufferItem) {
      sourceItem = bufferItem;
      sourceType = 'buffer';
    } else {
      // Check tiers
      for (const tier of tiers) {
        const tierItem = tier.items.find(item => item.id === activeIdStr);
        if (tierItem) {
          sourceItem = tierItem;
          sourceType = 'tier';
          sourceTierId = tier.id;
          break;
        }
      }
    }

    if (!sourceItem) return;

    // Determine drop target
    if (overIdStr.startsWith('tier-')) {
      // Dropping into a tier
      const targetTierId = overIdStr;
      const targetTier = tiers.find(t => t.id === targetTierId);
      
      if (sourceType === 'buffer') {
        // Move from buffer to tier - add at the start (position 0)
        setBufferItems((prev) => prev.filter(item => item.id !== activeIdStr));
        setTiers((prev) =>
          prev.map((tier) => {
            if (tier.id === targetTierId) {
              // Insert at the start
              return {
                ...tier,
                items: [{ ...sourceItem!, position: 0 }, ...tier.items.map((item, idx) => ({ ...item, position: idx + 1 }))],
              };
            }
            return tier;
          })
        );
      } else if (sourceTierId && sourceTierId !== targetTierId) {
        // Move from one tier to another - add at the start
        setTiers((prev) =>
          prev.map((tier) => {
            if (tier.id === sourceTierId) {
              return {
                ...tier,
                items: tier.items.filter(item => item.id !== activeIdStr).map((item, idx) => ({ ...item, position: idx })),
              };
            }
            if (tier.id === targetTierId) {
              // Insert at the start
              return {
                ...tier,
                items: [{ ...sourceItem!, position: 0 }, ...tier.items.map((item, idx) => ({ ...item, position: idx + 1 }))],
              };
            }
            return tier;
          })
        );
      }
    } else if (overIdStr === 'buffer') {
      // Dropping into buffer
      if (sourceType === 'tier' && sourceTierId) {
        setTiers((prev) =>
          prev.map((tier) => {
            if (tier.id === sourceTierId) {
              return {
                ...tier,
                items: tier.items.filter(item => item.id !== activeIdStr),
              };
            }
            return tier;
          })
        );
        setBufferItems((prev) => [...prev, { ...sourceItem!, position: prev.length }]);
      }
    } else if (overIdStr.startsWith('item-')) {
      // Dropping on another item - check if it's in the same container or different
      const targetInBuffer = bufferItems.some(item => item.id === overIdStr);
      const targetTier = tiers.find(tier => tier.items.some(item => item.id === overIdStr));
      
      if (sourceType === 'buffer' && targetInBuffer) {
        // Reorder within buffer
        const oldIndex = bufferItems.findIndex(item => item.id === activeIdStr);
        const newIndex = bufferItems.findIndex(item => item.id === overIdStr);
        if (oldIndex !== -1 && newIndex !== -1) {
          const reordered = arrayMove(bufferItems, oldIndex, newIndex);
          setBufferItems(reordered.map((item, index) => ({ ...item, position: index })));
        }
      } else if (sourceType === 'tier' && sourceTierId && targetTier) {
        if (sourceTierId === targetTier.id) {
          // Reorder within same tier
          const sourceTier = tiers.find(t => t.id === sourceTierId);
          if (sourceTier) {
            const oldIndex = sourceTier.items.findIndex(item => item.id === activeIdStr);
            const newIndex = sourceTier.items.findIndex(item => item.id === overIdStr);
            if (oldIndex !== -1 && newIndex !== -1) {
              setTiers((prev) =>
                prev.map((tier) => {
                  if (tier.id === sourceTierId) {
                    const reordered = arrayMove(tier.items, oldIndex, newIndex);
                    return {
                      ...tier,
                      items: reordered.map((item, index) => ({ ...item, position: index })),
                    };
                  }
                  return tier;
                })
              );
            }
          }
        } else {
          // Move to different tier (drop on item in different tier)
          setTiers((prev) =>
            prev.map((tier) => {
              if (tier.id === sourceTierId) {
                return {
                  ...tier,
                  items: tier.items.filter(item => item.id !== activeIdStr),
                };
              }
              if (tier.id === targetTier.id) {
                return {
                  ...tier,
                  items: [...tier.items, { ...sourceItem!, position: tier.items.length }],
                };
              }
              return tier;
            })
          );
        }
      }
    }
  };

  const handleSave = async () => {
    // Validation
    if (!formData.title.trim()) {
      alert('Please enter a tier list title');
      return;
    }

    try {
      // Get logged-in user
      const loggedInUserData = localStorage.getItem('fitfolio_logged_in');
      if (!loggedInUserData) {
        alert('You must be logged in to create a tier list');
        return;
      }
      
      const loggedInUser = JSON.parse(loggedInUserData);
      
      // Prepare payload for single-transaction creation
      const payload = {
        tierList: {
          title: formData.title.trim(),
          description: formData.description?.trim() || null,
          coverImageUrl: null,
          isPublic: formData.isPublic,
        },
        tiers: tiers.map((tier) => ({
          position: tier.position,
          label: tier.label,
          name: tier.name,
          color: tier.color,
          items: tier.items.map((item) => ({
            itemId: item.itemId,
            position: item.position,
          })),
        })),
        buffer: bufferItems.map((item) => ({
          itemId: item.itemId,
          position: item.position,
        })),
      };
      
      // Create tier list with tiers and items in one transaction
      const createdTierList = await tierlistsApi.createComplete(
        loggedInUser.id,
        payload
      );
      
      // Fetch user profile to get username for redirect
      const userProfile = await usersApi.getProfile(loggedInUser.id);
      
      // Redirect to the created tier list
      router.push(`/${userProfile.username}/tierlists/${createdTierList.slug}`);
    } catch (error) {
      console.error('Error creating tier list:', error);
      alert('Failed to create tier list. Please try again.');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  // Get all item IDs for SortableContext
  const allItemIds = [
    ...bufferItems.map(item => item.id),
    ...tiers.flatMap(tier => tier.items.map(item => item.id)),
  ];

  return (
    <main className="min-h-screen bg-ff-black text-white overflow-x-hidden">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header with Cancel and Save */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Create Tier-list</h1>
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
            <h2 className="mb-6 text-xl font-semibold uppercase tracking-wide">NEW TIER-LIST</h2>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Left Column - Tier List Details */}
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
                    placeholder="Enter tier list name"
                    className="w-full rounded-lg border border-white bg-black px-4 py-2 text-white placeholder:text-slate-500 focus:border-ff-cyan focus:outline-none"
                  />
                </div>

                {/* Tags Field */}
                <div>
                  <label htmlFor="tags" className="mb-2 block text-sm font-medium text-slate-200">
                    Tags
                  </label>
                  <input
                    id="tags"
                    type="text"
                    placeholder="eg. top 10"
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
                    <option value="public">Anyone - Public tier-list</option>
                    <option value="private">Only me - Private tier-list</option>
                  </select>
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
                  placeholder="Enter tier list description"
                  rows={10}
                  className="w-full rounded-lg border border-white bg-black px-4 py-2 text-white placeholder:text-slate-500 focus:border-ff-cyan focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Tiers Section */}
          <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="space-y-2">
              {tiers.map((tier) => (
                <TierRow
                  key={tier.id}
                  tier={tier}
                  items={tier.items}
                  onRemoveItem={(itemId) => handleRemoveFromTier(tier.id, itemId)}
                />
              ))}
            </div>

            {/* Buffer Section */}
            <div className="mt-8">
              <h3 className="mb-4 text-lg font-semibold text-slate-200">Buffer</h3>
              <BufferZone
                items={bufferItems}
                onRemoveItem={handleRemoveFromBuffer}
              />
            </div>

            <DragOverlay>
              {activeItem ? (
                <div className="relative w-16 h-16 rounded-md overflow-hidden border-2 border-ff-cyan bg-slate-900">
                  <Image
                    src={activeItem.imageUrl || '/tnf-jacket.jpg'}
                    alt={activeItem.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

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
                      const isAlreadyAdded = 
                        bufferItems.some(i => i.itemId === item.id) ||
                        tiers.some(tier => tier.items.some(i => i.itemId === item.id));
                      
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
        </div>
      </div>
    </main>
  );
}

// Tier Row Component
function TierRow({
  tier,
  items,
  onRemoveItem,
}: {
  tier: Tier;
  items: TierItem[];
  onRemoveItem: (itemId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: tier.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex items-center gap-3 rounded-lg border p-3 min-h-[80px] transition-colors ${
        isOver 
          ? 'border-ff-cyan bg-slate-900/80' 
          : 'border-slate-800 bg-slate-900/50'
      }`}
    >
      {/* Tier Label */}
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold flex-shrink-0"
        style={{ backgroundColor: tier.color }}
      >
        {tier.label}
      </div>

      {/* Items Container - Make it droppable too */}
      <div className="flex flex-1 gap-2 flex-wrap min-h-[64px] w-full">
        {items.length > 0 ? (
          <SortableContext items={items.map(item => item.id)} strategy={horizontalListSortingStrategy}>
            {items.map((item) => (
              <TierItemComponent
                key={item.id}
                item={item}
                onRemove={() => onRemoveItem(item.id)}
              />
            ))}
          </SortableContext>
        ) : (
          <div className="flex items-center text-slate-500 text-sm">
            The tier is empty
          </div>
        )}
      </div>
    </div>
  );
}

// Tier Item Component (sortable)
function TierItemComponent({
  item,
  onRemove,
}: {
  item: TierItem;
  onRemove: () => void;
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
      className={`relative w-16 h-16 rounded-md overflow-hidden border border-slate-700 bg-slate-800 group ${
        isDragging ? 'cursor-grabbing opacity-50' : 'cursor-grab'
      }`}
    >
      {item.imageUrl ? (
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          className="object-cover"
          sizes="64px"
        />
      ) : (
        <div className="w-full h-full bg-slate-700" />
      )}
      <button
        {...attributes}
        {...listeners}
        className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/50 flex items-center justify-center transition-opacity"
      >
        <GripVertical className="w-4 h-4 text-white" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-600 rounded-full p-1 transition-opacity"
      >
        <X className="w-3 h-3 text-white" />
      </button>
    </div>
  );
}

// Buffer Zone Component
function BufferZone({
  items,
  onRemoveItem,
}: {
  items: TierItem[];
  onRemoveItem: (itemId: string) => void;
}) {
  const { setNodeRef } = useDroppable({
    id: 'buffer',
  });

  return (
    <div
      ref={setNodeRef}
      className="rounded-lg border-2 border-dashed border-slate-700 bg-slate-900/30 p-4 min-h-[120px]"
    >
      {items.length > 0 ? (
        <SortableContext items={items.map(item => item.id)} strategy={horizontalListSortingStrategy}>
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <BufferItemComponent
                key={item.id}
                item={item}
                onRemove={() => onRemoveItem(item.id)}
              />
            ))}
          </div>
        </SortableContext>
      ) : (
        <div className="flex items-center justify-center h-full text-slate-500 text-sm">
          Add items here, then drag them into tiers
        </div>
      )}
    </div>
  );
}

// Buffer Item Component (sortable)
function BufferItemComponent({
  item,
  onRemove,
}: {
  item: TierItem;
  onRemove: () => void;
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
      className={`relative w-16 h-16 rounded-md overflow-hidden border border-slate-700 bg-slate-800 group ${
        isDragging ? 'cursor-grabbing opacity-50' : 'cursor-grab'
      }`}
    >
      {item.imageUrl ? (
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          className="object-cover"
          sizes="64px"
        />
      ) : (
        <div className="w-full h-full bg-slate-700" />
      )}
      <button
        {...attributes}
        {...listeners}
        className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/50 flex items-center justify-center transition-opacity"
      >
        <GripVertical className="w-4 h-4 text-white" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-600 rounded-full p-1 transition-opacity"
      >
        <X className="w-3 h-3 text-white" />
      </button>
    </div>
  );
}
