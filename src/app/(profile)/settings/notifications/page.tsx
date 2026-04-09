"use client";

import { useEffect, useState } from "react";

const LS_KEY = "fitfolio_settings_notifications";

type NotificationSettings = {
  emailOnComment: boolean;
  emailOnFollow: boolean;
  appOnComment: boolean;
  appOnFollow: boolean;
};

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings>({
    emailOnComment: true,
    emailOnFollow: true,
    appOnComment: true,
    appOnFollow: true,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) setSettings(JSON.parse(raw));
  }, []);

  function save(next: NotificationSettings) {
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
        <h2 className="text-[28px] font-bold text-white">Notifications</h2>
        <p className="text-sm text-white/60">Choose what you want to be notified about.</p>
      </div>

      {saved && (
        <div className="rounded-xl border border-ff-cyan/40 bg-ff-cyan/10 px-4 py-3 text-white">
          Saved!
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white/90">Email</h3>
        <ToggleRow
          label="Email me when someone comments on my review"
          value={settings.emailOnComment}
          onChange={(v) => save({ ...settings, emailOnComment: v })}
        />
        <ToggleRow
          label="Email me when someone follows me"
          value={settings.emailOnFollow}
          onChange={(v) => save({ ...settings, emailOnFollow: v })}
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white/90">In-app</h3>
        <ToggleRow
          label="In-app notifications for comments"
          value={settings.appOnComment}
          onChange={(v) => save({ ...settings, appOnComment: v })}
        />
        <ToggleRow
          label="In-app notifications for follows"
          value={settings.appOnFollow}
          onChange={(v) => save({ ...settings, appOnFollow: v })}
        />
      </div>
    </div>
  );
}
