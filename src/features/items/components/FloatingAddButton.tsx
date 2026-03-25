"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { AddItemModal } from "./AddItemModal";

export function FloatingAddButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-ff-cyan text-black shadow-lg hover:bg-ff-cyan/90 transition-colors"
        aria-label="Add new item"
      >
        <Plus className="h-7 w-7" strokeWidth={2.5} />
      </button>

      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </>
  );
}
