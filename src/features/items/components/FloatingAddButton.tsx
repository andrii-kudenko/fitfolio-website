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
        className="group fixed bottom-6 right-6 z-40 flex size-[3.75rem] items-center justify-center rounded-2xl border border-ff-cyan/45 bg-[#000500] text-ff-cyan shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_0_1px_rgba(85,193,255,0.12),0_12px_40px_rgba(0,0,0,0.65),0_0_28px_rgba(85,193,255,0.22)] transition-all duration-300 hover:border-ff-cyan hover:bg-ff-cyan/10 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_0_1px_rgba(85,193,255,0.35),0_16px_48px_rgba(0,0,0,0.5),0_0_48px_rgba(85,193,255,0.35)] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ff-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        aria-label="Add new item"
      >
        <Plus
          className="size-7 transition-transform duration-300 ease-out group-hover:rotate-90 group-hover:scale-110"
          strokeWidth={2.25}
        />
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
