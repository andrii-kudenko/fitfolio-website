"use client";

import { useEffect, useState } from "react";

const LS_KEY = "fitfolio_settings_privacy";

type PrivacySettings = {
  profileVisibility: "public" | "private";
  showCollections: boolean;
  showActivity: boolean;
};

export default function PrivacySettingsPage() {
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: "public",
    showCollections: true,
    showActivity: true,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) setSettings(JSON.parse(raw));
  }, []);

  function save(next: PrivacySettings) {
    setSettings(next);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  }

  function ToggleRow({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: boolean;
    onChange: (v: boolean) => void;
  }) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
        <div className="text-sm text-white/90">{label}</div>
        <button
          onClick={() => onChange(!value)}
          className={`px-4 h-10 rounded-xl text-sm font-semibold transition ${
            value ? "bg-[#1E90FF] text-white" : "bg-white/10 text-white/80 hover:bg-white/15"
          }`}
        >
          {value ? "On" : "Off"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[28px] font-bold text-white">Privacy</h2>
        <p className="text-sm text-white/60">Control who can see your content.</p>
      </div>

      {saved && (
        <div className="rounded-xl border border-ff-cyan/40 bg-ff-cyan/10 px-4 py-3 text-white">
          Saved!
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-white/90 mb-2">Profile visibility</label>
        <select
          className="w-full h-12 px-4 rounded-xl bg-[#000500] text-white outline-none ring-1 ring-white/15 focus:ring-2 focus:ring-ff-cyan transition"
          value={settings.profileVisibility}
          onChange={(e) =>
            save({ ...settings, profileVisibility: e.target.value as PrivacySettings["profileVisibility"] })
          }
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
      </div>

      <div className="space-y-3">
        <ToggleRow
          label="Show my collections on my profile"
          value={settings.showCollections}
          onChange={(v) => save({ ...settings, showCollections: v })}
        />
        <ToggleRow
          label="Show my recent activity"
          value={settings.showActivity}
          onChange={(v) => save({ ...settings, showActivity: v })}
        />
      </div>
    </div>
  );
}
