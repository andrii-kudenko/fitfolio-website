'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { X, GripVertical } from 'lucide-react';
import { searchApi } from '@/features/search/api/search.api';
import { ItemSearchResult } from '@/features/search/types/search.types';
import { tierlistsApi } from '@/features/tierlists/api/tierlists.api';
import { itemsApi } from '@/features/items/api/items.api';
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

interface TierItem {
  id: string;
  itemId: string;
  imageUrl?: string;
  name: string;
  position: number;
}

interface Tier {
  id: string;
  label: string;
  name: string;
  color: string;
  position: number;
  items: TierItem[];
}

export default function EditTierListPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const slug = params.slug as string;
  const searchRef = useRef<HTMLDivElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [tierListId, setTierListId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    isPublic: true,
    description: '',
  });
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [bufferItems, setBufferItems] = useState<TierItem[]>([]);
  const [itemInput, setItemInput] = useState('');
  const [searchResults, setSearchResults] = useState<ItemSearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<TierItem | null>(null);

  // Load tier list data
  useEffect(() => {
    async function loadTierList() {
      try {
        setLoading(true);
        
        // Fetch tier list detail by slug
        const tierListDetail = await tierlistsApi.getDetailBySlug(slug);
        setTierListId(tierListDetail.id);
        
        // Pre-fill form data
        setFormData({
          title: tierListDetail.title || '',
          isPublic: tierListDetail.isPublic ?? true,
          description: tierListDetail.description || '',
        });

        // Load tiers with items
        const loadedTiers = await Promise.all(
          tierListDetail.tiers.map(async (tier) => {
            const itemsWithDetails = await Promise.all(
              tier.items.map(async (tierItem) => {
                try {
                  const itemDetails = await itemsApi.getById(tierItem.itemId);
                  return {
                    id: tierItem.id,
                    itemId: tierItem.itemId,
                    imageUrl: itemDetails.imageUrl,
                    name: itemDetails.name,
                    position: tierItem.position,
                  };
                } catch (err) {
                  console.error(`Failed to fetch item ${tierItem.itemId}:`, err);
                  return {
                    id: tierItem.id,
                    itemId: tierItem.itemId,
                    imageUrl: undefined,
                    name: '',
                    position: tierItem.position,
                  };
                }
              })
            );
            return {
              id: tier.id,
              label: tier.label || tier.name.charAt(0).toUpperCase(),
              name: tier.name,
              color: tier.color || '#6B7280',
              position: tier.position,
              items: itemsWithDetails.sort((a, b) => a.position - b.position),
            };
          })
        );

        // Sort tiers by position
        loadedTiers.sort((a, b) => a.position - b.position);
        setTiers(loadedTiers);

        // Load buffer items (items with tierId = null)
        const allItemsPage = await tierlistsApi.getItems(tierListDetail.id, {
          size: 100,
          sort: 'position,asc',
        });

        const bufferItemsList = allItemsPage.content
          .filter(item => !item.tierId || item.tierId === null) // Buffer items have null tierId
          .map(item => ({
            id: item.id,
            itemId: item.itemId,
            position: item.position,
            imageUrl: undefined,
            name: '',
          }));

        // Fetch item details for buffer items
        const bufferItemsWithDetails = await Promise.all(
          bufferItemsList.map(async (bufferItem) => {
            try {
              const itemDetails = await itemsApi.getById(bufferItem.itemId);
              return {
                ...bufferItem,
                imageUrl: itemDetails.imageUrl,
                name: itemDetails.name,
              };
            } catch (err) {
              console.error(`Failed to fetch buffer item ${bufferItem.itemId}:`, err);
              return bufferItem;
            }
          })
        );

        setBufferItems(bufferItemsWithDetails.sort((a, b) => a.position - b.position));
      } catch (err) {
        console.error('Error loading tier list:', err);
        alert('Failed to load tier list');
        router.back();
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      loadTierList();
    }
  }, [slug, router]);

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
        .catch(err => {
          if (!isCancelled) {
            console.error('Search error:', err);
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
    // Check if item is already added
    const isAlreadyAdded = 
      bufferItems.some(i => i.itemId === item.id) ||
      tiers.some(tier => tier.items.some(i => i.itemId === item.id));
    
    if (!isAlreadyAdded) {
      const newItem: TierItem = {
        id: `buffer-${Date.now()}-${Math.random()}`,
        itemId: item.id,
        imageUrl: item.imageUrl,
        name: item.name,
        position: bufferItems.length,
      };
      setBufferItems((prev) => [...prev, newItem]);
      setItemInput('');
      setShowSearchResults(false);
    }
  };

  const handleRemoveFromTier = (tierId: string, itemId: string) => {
    setTiers((prev) =>
      prev.map((tier) => {
        if (tier.id === tierId) {
          const removedItem = tier.items.find(item => item.id === itemId);
          if (removedItem) {
            // Move to buffer
            setBufferItems((prevBuffer) => [...prevBuffer, { ...removedItem, position: prevBuffer.length }]);
          }
          return {
            ...tier,
            items: tier.items.filter(item => item.id !== itemId).map((item, idx) => ({ ...item, position: idx })),
          };
        }
        return tier;
      })
    );
  };

  const handleRemoveFromBuffer = (itemId: string) => {
    setBufferItems((prev) => prev.filter(item => item.id !== itemId).map((item, idx) => ({ ...item, position: idx })));
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

    const bufferItem = bufferItems.find(item => item.id === activeIdStr);
    if (bufferItem) {
      sourceItem = bufferItem;
      sourceType = 'buffer';
    } else {
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

    // Check if dropping on a tier (tier IDs are UUIDs in edit mode)
    const targetTier = tiers.find(t => t.id === overIdStr);
    
    // Determine drop target
    if (targetTier) {
      const targetTierId = targetTier.id;
      
      if (sourceType === 'buffer') {
        setBufferItems((prev) => prev.filter(item => item.id !== activeIdStr));
        setTiers((prev) =>
          prev.map((tier) => {
            if (tier.id === targetTierId) {
              return {
                ...tier,
                items: [{ ...sourceItem!, position: 0 }, ...tier.items.map((item, idx) => ({ ...item, position: idx + 1 }))],
              };
            }
            return tier;
          })
        );
      } else if (sourceTierId && sourceTierId !== targetTierId) {
        setTiers((prev) =>
          prev.map((tier) => {
            if (tier.id === sourceTierId) {
              return {
                ...tier,
                items: tier.items.filter(item => item.id !== activeIdStr).map((item, idx) => ({ ...item, position: idx })),
              };
            }
            if (tier.id === targetTierId) {
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
    } else {
      // Dropping on an item (reordering within same container or moving between containers)
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
          // Move to different tier (drop on item in different tier) - insert at start
          setTiers((prev) =>
            prev.map((tier) => {
              if (tier.id === sourceTierId) {
                return {
                  ...tier,
                  items: tier.items.filter(item => item.id !== activeIdStr).map((item, idx) => ({ ...item, position: idx })),
                };
              }
              if (tier.id === targetTier.id) {
                return {
                  ...tier,
                  items: [{ ...sourceItem!, position: 0 }, ...tier.items.map((item, idx) => ({ ...item, position: idx + 1 }))],
                };
              }
              return tier;
            })
          );
        }
      } else if (sourceType === 'buffer' && targetTier) {
        // Move from buffer to tier (dropping on an item in a tier)
        setBufferItems((prev) => prev.filter(item => item.id !== activeIdStr));
        setTiers((prev) =>
          prev.map((tier) => {
            if (tier.id === targetTier.id) {
              return {
                ...tier,
                items: [{ ...sourceItem!, position: 0 }, ...tier.items.map((item, idx) => ({ ...item, position: idx + 1 }))],
              };
            }
            return tier;
          })
        );
      }
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a tier list title');
      return;
    }

    if (!tierListId) {
      alert('Tier list ID not found');
      return;
    }

    try {
      const loggedInUserData = localStorage.getItem('fitfolio_logged_in');
      if (!loggedInUserData) {
        alert('You must be logged in to update a tier list');
        return;
      }
      
      const loggedInUser = JSON.parse(loggedInUserData);
      
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
      
      const updatedTierList = await tierlistsApi.updateComplete(
        tierListId,
        loggedInUser.id,
        payload
      );
      
      const userProfile = await usersApi.getProfile(loggedInUser.id);
      router.push(`/${userProfile.username}/tierlists/${updatedTierList.slug}`);
    } catch (error) {
      console.error('Error updating tier list:', error);
      alert('Failed to update tier list. Please try again.');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const allItemIds = [
    ...bufferItems.map(item => item.id),
    ...tiers.flatMap(tier => tier.items.map(item => item.id)),
  ];

  if (loading) {
    return (
      <main className="min-h-screen bg-ff-black text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-8">
          <div className="text-slate-400">Loading tier list...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ff-black text-white overflow-x-hidden">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header with Cancel, View, and Save */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Edit Tier-list</h1>
          <div className="flex gap-4">
            <button
              onClick={handleCancel}
              className="rounded-full bg-slate-700 px-6 py-2 text-sm font-medium text-white hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <Link
              href={`/${username}/tierlists/${slug}`}
              className="rounded-full bg-slate-700 px-6 py-2 text-sm font-medium text-white hover:bg-slate-600 transition-colors"
            >
              View Tier-list
            </Link>
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
            <h2 className="mb-6 text-xl font-semibold uppercase tracking-wide">EDIT TIER-LIST</h2>

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
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
        style={{ backgroundColor: tier.color }}
      >
        {tier.label}
      </div>

      {/* Items Container */}
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
      className="group relative h-16 w-16 shrink-0 rounded-md overflow-hidden border border-white/10 bg-slate-800"
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
        <div className="h-full w-full bg-slate-700" />
      )}
      <button
        onClick={onRemove}
        className="absolute right-1 top-1 hidden rounded-full bg-red-600 p-1 text-white hover:bg-red-700 group-hover:block transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
      <div
        {...attributes}
        {...listeners}
        className="absolute left-1 top-1 cursor-grab active:cursor-grabbing rounded bg-slate-900/80 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-3 h-3" />
      </div>
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
  const { setNodeRef, isOver } = useDroppable({
    id: 'buffer',
  });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg border p-4 min-h-[100px] transition-colors ${
        isOver 
          ? 'border-ff-cyan bg-slate-900/80' 
          : 'border-slate-800 bg-slate-900/50'
      }`}
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
        <div className="flex items-center text-slate-500 text-sm">
          No items in buffer
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
      className="group relative h-16 w-16 shrink-0 rounded-md overflow-hidden border border-white/10 bg-slate-800"
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
        <div className="h-full w-full bg-slate-700" />
      )}
      <button
        onClick={onRemove}
        className="absolute right-1 top-1 hidden rounded-full bg-red-600 p-1 text-white hover:bg-red-700 group-hover:block transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
      <div
        {...attributes}
        {...listeners}
        className="absolute left-1 top-1 cursor-grab active:cursor-grabbing rounded bg-slate-900/80 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-3 h-3" />
      </div>
    </div>
  );
}
