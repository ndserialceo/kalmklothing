"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus, Edit, Trash2, Star, X } from "lucide-react";
import { addresses as addressesApi } from "@/lib/api";
import { NIGERIAN_STATES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import EmptyState from "@/components/EmptyState";
import toast from "react-hot-toast";
import type { Address } from "@/lib/types";

const defaultForm = {
  label: "Home",
  first_name: "",
  last_name: "",
  phone: "",
  address_line_1: "",
  address_line_2: "",
  city: "",
  state: "Lagos",
  country: "Nigeria",
  is_default: false,
};

export default function AddressesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);

  const { data, isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => addressesApi.getAddresses(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => addressesApi.createAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setIsModalOpen(false);
      setForm(defaultForm);
      toast.success("Address added");
    },
    onError: () => toast.error("Failed to add address"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => addressesApi.updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setIsModalOpen(false);
      setEditingId(null);
      setForm(defaultForm);
      toast.success("Address updated");
    },
    onError: () => toast.error("Failed to update address"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => addressesApi.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address deleted");
    },
  });

  const defaultMutation = useMutation({
    mutationFn: (id: string) => addressesApi.setDefaultAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Default address updated");
    },
  });

  const addresses = data?.data?.results || [];

  const openCreateModal = () => {
    setEditingId(null);
    setForm(defaultForm);
    setIsModalOpen(true);
  };

  const openEditModal = (addr: Address) => {
    setEditingId(addr.id);
    setForm({
      label: addr.label,
      first_name: addr.first_name,
      last_name: addr.last_name,
      phone: addr.phone,
      address_line_1: addr.address_line_1,
      address_line_2: addr.address_line_2 || "",
      city: addr.city,
      state: addr.state,
      country: addr.country,
      is_default: addr.is_default,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-brand-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-lg font-semibold text-brand-900">Saved Addresses</h2>
          <Button size="sm" onClick={openCreateModal}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Address
          </Button>
        </div>

        {addresses.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="No saved addresses"
            description="Add a delivery address to make checkout faster."
            actionLabel="Add Address"
            onAction={openCreateModal}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr: Address) => (
              <div key={addr.id}
                className={cn("relative p-4 rounded-lg border-2 transition-colors",
                  addr.is_default ? "border-brand-900 bg-brand-50" : "border-brand-100 hover:border-brand-300")}>
                {addr.is_default && (
                  <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 bg-brand-900 text-white text-[10px] font-medium rounded-full">
                    <Star className="h-2.5 w-2.5" /> Default
                  </span>
                )}
                <p className="text-xs font-medium text-brand-400 uppercase tracking-wider mb-2">{addr.label}</p>
                <div className="text-sm text-brand-700 space-y-0.5">
                  <p className="font-medium text-brand-900">{addr.first_name} {addr.last_name}</p>
                  <p>{addr.address_line_1}</p>
                  {addr.address_line_2 && <p>{addr.address_line_2}</p>}
                  <p>{addr.city}, {addr.state}</p>
                  <p>{addr.country}</p>
                  <p className="pt-1">{addr.phone}</p>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-brand-100">
                  <button onClick={() => openEditModal(addr)}
                    className="text-xs text-brand-600 hover:text-brand-900 font-medium flex items-center gap-1">
                    <Edit className="h-3 w-3" /> Edit
                  </button>
                  {!addr.is_default && (
                    <button onClick={() => defaultMutation.mutate(addr.id)}
                      className="text-xs text-accent-600 hover:text-accent-700 font-medium">
                      Set as Default
                    </button>
                  )}
                  <button onClick={() => deleteMutation.mutate(addr.id)}
                    className="ml-auto text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Address" : "Add New Address"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-brand-600 mb-1.5">Label</label>
            <input type="text" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="Home, Office, etc."
              className="w-full px-3 py-2.5 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-brand-600 mb-1.5">First Name</label>
              <input type="text" required value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-600 mb-1.5">Last Name</label>
              <input type="text" required value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-brand-600 mb-1.5">Phone</label>
            <input type="tel" required value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-brand-600 mb-1.5">Address Line 1</label>
            <input type="text" required value={form.address_line_1}
              onChange={(e) => setForm({ ...form, address_line_1: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-brand-600 mb-1.5">Address Line 2</label>
            <input type="text" value={form.address_line_2}
              onChange={(e) => setForm({ ...form, address_line_2: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-brand-600 mb-1.5">City</label>
              <input type="text" required value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-600 mb-1.5">State</label>
              <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="w-full appearance-none px-3 py-2.5 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500 bg-white">
                {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_default}
              onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
              className="w-4 h-4 rounded border-brand-300 text-accent-600 focus:ring-accent-500" />
            <span className="text-sm text-brand-700">Set as default address</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
              {editingId ? "Save Changes" : "Add Address"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
