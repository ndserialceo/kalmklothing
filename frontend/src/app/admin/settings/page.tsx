"use client";

import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { admin } from "@/lib/api";
import type { Setting } from "@/lib/types";

const tabs = ["General", "Shipping", "Payment", "Email"] as const;
type Tab = (typeof tabs)[number];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("General");
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await admin.settings.get();
      setSettings(data.data);
      const values: Record<string, string> = {};
      data.data.forEach((s) => {
        values[s.key] = s.value;
      });
      setFormValues(values);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await admin.settings.update(formValues);
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const getSettingsForTab = (tab: string) => {
    const prefixes: Record<string, string[]> = {
      General: ["store_name", "store_email", "store_phone", "store_address", "currency"],
      Shipping: ["shipping_fee", "free_shipping_min", "shipping_days_min", "shipping_days_max"],
      Payment: ["paystack_key", "flutterwave_key", "payment_methods"],
      Email: ["smtp_host", "smtp_port", "smtp_user", "smtp_password", "from_email"],
    };

    const tabPrefixes = prefixes[tab] || [];
    if (tabPrefixes.length === 0) {
      return settings;
    }
    return settings.filter((s) =>
      tabPrefixes.some((p) => s.key.startsWith(p))
    );
  };

  const renderField = (setting: Setting) => {
    const isPassword = setting.key.includes("password") || setting.key.includes("secret");
    const isTextarea =
      setting.key.includes("address") || setting.key.includes("message");

    if (isTextarea) {
      return (
        <textarea
          value={formValues[setting.key] || ""}
          onChange={(e) => handleChange(setting.key, e.target.value)}
          rows={3}
          className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"
        />
      );
    }

    return (
      <input
        type={isPassword ? "password" : "text"}
        value={formValues[setting.key] || ""}
        onChange={(e) => handleChange(setting.key, e.target.value)}
        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-500"
      />
    );
  };

  const currentSettings = getSettingsForTab(activeTab);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-800 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent-600 text-white rounded-lg text-sm font-medium hover:bg-accent-700 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Changes
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="border-b border-gray-800">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-accent-500 text-white"
                    : "border-transparent text-gray-400 hover:text-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 space-y-6">
          {currentSettings.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No settings found for this section.
            </div>
          ) : (
            currentSettings.map((setting) => (
              <div key={setting.id}>
                <label className="block text-sm font-medium text-gray-300 mb-1.5 capitalize">
                  {setting.key.replace(/_/g, " ")}
                </label>
                {setting.description && (
                  <p className="text-xs text-gray-500 mb-2">
                    {setting.description}
                  </p>
                )}
                {renderField(setting)}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
