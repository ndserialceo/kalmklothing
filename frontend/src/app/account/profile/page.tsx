"use client";

import { useState } from "react";
import { User, Mail, Phone, Lock, Save, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { auth } from "@/lib/api";
import Button from "@/components/Button";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const [form, setForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile(form);
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwordForm.new_password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setIsChangingPassword(true);
    try {
      await auth.changePassword({
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password,
      });
      toast.success("Password changed successfully");
      setPasswordForm({ old_password: "", new_password: "", confirm_password: "" });
    } catch {
      toast.error("Failed to change password. Check your current password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Info */}
      <div className="bg-white rounded-lg border border-brand-100 p-6">
        <h2 className="font-heading text-lg font-semibold text-brand-900 mb-5">Personal Information</h2>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-brand-600 mb-1.5">First Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-400" />
                <input type="text" value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-600 mb-1.5">Last Name</label>
              <input type="text" value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-600 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-400" />
                <input type="email" value={form.email} readOnly
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-brand-200 rounded-lg bg-brand-50 text-brand-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-600 mb-1.5">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-400" />
                <input type="tel" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+234..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500" />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" size="sm" loading={isSaving}>
              <Save className="h-3.5 w-3.5 mr-1.5" />
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Avatar */}
      <div className="bg-white rounded-lg border border-brand-100 p-6">
        <h2 className="font-heading text-lg font-semibold text-brand-900 mb-5">Profile Photo</h2>
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center">
            <span className="text-xl font-semibold text-brand-600">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </span>
          </div>
          <div>
            <Button variant="secondary" size="sm" onClick={() => toast.error("Avatar upload coming soon")}>
              Upload Photo
            </Button>
            <p className="text-xs text-brand-400 mt-1.5">JPG, PNG or GIF. Max 2MB.</p>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-lg border border-brand-100 p-6">
        <h2 className="font-heading text-lg font-semibold text-brand-900 mb-5">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-medium text-brand-600 mb-1.5">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-400" />
              <input type={showPasswords ? "text" : "password"} required value={passwordForm.old_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-brand-600 mb-1.5">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-400" />
              <input type={showPasswords ? "text" : "password"} required value={passwordForm.new_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                placeholder="Min. 8 characters"
                className="w-full pl-10 pr-10 py-2.5 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500" />
              <button type="button" onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-400 hover:text-brand-600">
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-brand-600 mb-1.5">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-400" />
              <input type={showPasswords ? "text" : "password"} required value={passwordForm.confirm_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500" />
            </div>
          </div>
          <Button type="submit" size="sm" loading={isChangingPassword}>
            <Lock className="h-3.5 w-3.5 mr-1.5" />
            Change Password
          </Button>
        </form>
      </div>
    </div>
  );
}
