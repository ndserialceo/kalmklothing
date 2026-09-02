"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import { admin } from "@/lib/api";
import { cn, getImageUrl } from "@/lib/utils";
import type { Category, Product } from "@/lib/types";
import toast from "react-hot-toast";

interface VariantForm {
  id: string;
  name: string;
  sku: string;
  price: string;
  stock: number;
  color_name: string;
  color_hex: string;
  size: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<{ id: string; image: string; alt_text?: string }[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [variants, setVariants] = useState<VariantForm[]>([]);

  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "",
    description: "",
    short_description: "",
    price: "",
    compare_at_price: "",
    cost_price: "",
    stock: "0",
    low_stock_threshold: "10",
    weight: "",
    meta_title: "",
    meta_description: "",
    is_active: true,
    is_featured: false,
    is_new_arrival: false,
    is_bestseller: false,
    tags: "",
  });

  useEffect(() => {
    Promise.all([
      admin.products.get(productId),
      admin.categories.list({ page_size: 100 }),
    ])
      .then(([productRes, categoriesRes]) => {
        const product = productRes.data.data;
        setForm({
          name: product.name,
          sku: product.sku || "",
          category: product.category?.id || "",
          description: product.description,
          short_description: product.short_description || "",
          price: product.price,
          compare_at_price: product.compare_at_price || "",
          cost_price: "",
          stock: String(product.stock),
          low_stock_threshold: "10",
          weight: "",
          meta_title: "",
          meta_description: "",
          is_active: product.is_active,
          is_featured: product.is_featured,
          is_new_arrival: product.is_new_arrival,
          is_bestseller: product.is_bestseller,
          tags: product.tags?.join(", ") || "",
        });
        setExistingImages(product.images || []);
        setVariants(
          (product.variants || []).map((v) => ({
            id: v.id,
            name: v.name,
            sku: v.sku,
            price: v.price,
            stock: v.stock,
            color_name: v.options?.color_name || "",
            color_hex: v.options?.color_hex || "#000000",
            size: v.options?.size || "",
          }))
        );
        setCategories(categoriesRes.data.results);
      })
      .catch(() => {
        toast.error("Failed to load product");
        router.push("/admin/products");
      })
      .finally(() => setLoading(false));
  }, [productId, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewImages((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    setNewImages((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        name: "",
        sku: "",
        price: "",
        stock: 0,
        color_name: "",
        color_hex: "#000000",
        size: "",
      },
    ]);
  };

  const updateVariant = (index: number, field: keyof VariantForm, value: string | number) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("sku", form.sku);
      formData.append("category", form.category);
      formData.append("description", form.description);
      if (form.short_description) formData.append("short_description", form.short_description);
      formData.append("price", form.price);
      if (form.compare_at_price) formData.append("compare_at_price", form.compare_at_price);
      if (form.cost_price) formData.append("cost_price", form.cost_price);
      formData.append("stock", form.stock);
      formData.append("low_stock_threshold", form.low_stock_threshold);
      if (form.weight) formData.append("weight", form.weight);
      if (form.meta_title) formData.append("meta_title", form.meta_title);
      if (form.meta_description) formData.append("meta_description", form.meta_description);
      formData.append("is_active", form.is_active.toString());
      formData.append("is_featured", form.is_featured.toString());
      formData.append("is_new_arrival", form.is_new_arrival.toString());
      formData.append("is_bestseller", form.is_bestseller.toString());
      if (form.tags) formData.append("tags", form.tags);

      existingImages.forEach((img) => {
        formData.append("existing_images[]", img.id);
      });

      newImages.forEach((image) => {
        formData.append("images", image);
      });

      variants.forEach((v, i) => {
        formData.append(`variants[${i}]id`, v.id);
        formData.append(`variants[${i}]name`, v.name);
        formData.append(`variants[${i}]sku`, v.sku);
        if (v.price) formData.append(`variants[${i}]price`, v.price);
        formData.append(`variants[${i}]stock`, v.stock.toString());
        formData.append(`variants[${i}]color_name`, v.color_name);
        formData.append(`variants[${i}]color_hex`, v.color_hex);
        formData.append(`variants[${i}]size`, v.size);
      });

      await admin.products.update(productId, formData);
      toast.success("Product updated successfully");
      router.push("/admin/products");
    } catch {
      toast.error("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-brand-800 rounded animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-brand-900 border border-brand-800 rounded-xl p-6">
            <div className="h-6 w-32 bg-brand-800 rounded mb-4 animate-pulse" />
            <div className="space-y-3">
              {[1, 2].map((j) => (
                <div key={j} className="h-10 bg-brand-800 rounded animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 rounded-lg text-brand-400 hover:text-white hover:bg-brand-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Edit Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-brand-900 border border-brand-800 rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Basic Info</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-brand-300 mb-1.5">Product Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-brand-800 border border-brand-700 rounded-lg text-white placeholder-brand-400 focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-300 mb-1.5">SKU *</label>
              <input
                type="text"
                required
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-brand-800 border border-brand-700 rounded-lg text-white placeholder-brand-400 focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-300 mb-1.5">Category *</label>
            <select
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-brand-800 border border-brand-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-accent-500"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-300 mb-1.5">Description *</label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-brand-800 border border-brand-700 rounded-lg text-white placeholder-brand-400 focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-300 mb-1.5">Short Description</label>
            <textarea
              rows={2}
              value={form.short_description}
              onChange={(e) => setForm({ ...form, short_description: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-brand-800 border border-brand-700 rounded-lg text-white placeholder-brand-400 focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500 resize-none"
            />
          </div>
        </div>

        <div className="bg-brand-900 border border-brand-800 rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Pricing & Stock</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-brand-300 mb-1.5">Price (₦) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-brand-800 border border-brand-700 rounded-lg text-white placeholder-brand-400 focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-300 mb-1.5">Discount Price (₦)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.compare_at_price}
                onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-brand-800 border border-brand-700 rounded-lg text-white placeholder-brand-400 focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-300 mb-1.5">Cost Price (₦)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.cost_price}
                onChange={(e) => setForm({ ...form, cost_price: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-brand-800 border border-brand-700 rounded-lg text-white placeholder-brand-400 focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-300 mb-1.5">Stock *</label>
              <input
                type="number"
                required
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-brand-800 border border-brand-700 rounded-lg text-white placeholder-brand-400 focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-brand-300 mb-1.5">Low Stock Threshold</label>
              <input
                type="number"
                min="0"
                value={form.low_stock_threshold}
                onChange={(e) => setForm({ ...form, low_stock_threshold: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-brand-800 border border-brand-700 rounded-lg text-white placeholder-brand-400 focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-300 mb-1.5">Weight (kg)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-brand-800 border border-brand-700 rounded-lg text-white placeholder-brand-400 focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-brand-900 border border-brand-800 rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Images</h2>

          {existingImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {existingImages.map((img, i) => (
                <div key={img.id} className="relative group">
                  <img
                    src={getImageUrl(img.image)}
                    alt={img.alt_text || `Image ${i + 1}`}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(i)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 text-[10px] font-medium bg-accent-600 text-white rounded">
                      Main
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center transition-colors",
              dragOver
                ? "border-accent-500 bg-accent-500/10"
                : "border-brand-700 hover:border-brand-600"
            )}
          >
            <Upload className="h-10 w-10 text-brand-400 mx-auto mb-3" />
            <p className="text-sm text-brand-300 mb-1">
              Drag and drop images here, or{" "}
              <label className="text-accent-400 hover:text-accent-300 cursor-pointer">
                browse
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </p>
            <p className="text-xs text-brand-500">PNG, JPG up to 5MB each</p>
          </div>

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {imagePreviews.map((preview, i) => (
                <div key={i} className="relative group">
                  <img
                    src={preview}
                    alt={`New ${i + 1}`}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(i)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-brand-900 border border-brand-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Variants</h2>
            <button
              type="button"
              onClick={addVariant}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-brand-800 text-brand-300 rounded-lg hover:text-white hover:bg-brand-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Variant
            </button>
          </div>

          {variants.length === 0 && (
            <p className="text-sm text-brand-400">No variants.</p>
          )}

          <div className="space-y-4">
            {variants.map((variant, index) => (
              <div
                key={variant.id}
                className="bg-brand-800 border border-brand-700 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-brand-300">
                    Variant {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="p-1 text-brand-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="Name"
                    value={variant.name}
                    onChange={(e) => updateVariant(index, "name", e.target.value)}
                    className="px-3 py-1.5 text-sm bg-brand-900 border border-brand-700 rounded-lg text-white placeholder-brand-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                  />
                  <input
                    type="text"
                    placeholder="SKU"
                    value={variant.sku}
                    onChange={(e) => updateVariant(index, "sku", e.target.value)}
                    className="px-3 py-1.5 text-sm bg-brand-900 border border-brand-700 rounded-lg text-white placeholder-brand-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    min="0"
                    value={variant.price}
                    onChange={(e) => updateVariant(index, "price", e.target.value)}
                    className="px-3 py-1.5 text-sm bg-brand-900 border border-brand-700 rounded-lg text-white placeholder-brand-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    min="0"
                    value={variant.stock}
                    onChange={(e) => updateVariant(index, "stock", parseInt(e.target.value) || 0)}
                    className="px-3 py-1.5 text-sm bg-brand-900 border border-brand-700 rounded-lg text-white placeholder-brand-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                  />
                  <input
                    type="text"
                    placeholder="Color name"
                    value={variant.color_name}
                    onChange={(e) => updateVariant(index, "color_name", e.target.value)}
                    className="px-3 py-1.5 text-sm bg-brand-900 border border-brand-700 rounded-lg text-white placeholder-brand-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={variant.color_hex}
                      onChange={(e) => updateVariant(index, "color_hex", e.target.value)}
                      className="w-8 h-8 rounded border-0 cursor-pointer"
                    />
                    <span className="text-xs text-brand-400">{variant.color_hex}</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Size"
                    value={variant.size}
                    onChange={(e) => updateVariant(index, "size", e.target.value)}
                    className="px-3 py-1.5 text-sm bg-brand-900 border border-brand-700 rounded-lg text-white placeholder-brand-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-brand-900 border border-brand-800 rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Tags & Flags</h2>

          <div>
            <label className="block text-xs font-medium text-brand-300 mb-1.5">Tags</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-brand-800 border border-brand-700 rounded-lg text-white placeholder-brand-400 focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500"
              placeholder="Comma-separated tags"
            />
          </div>

          <div className="flex flex-wrap gap-6">
            {[
              { key: "is_featured", label: "Featured" },
              { key: "is_new_arrival", label: "New Arrival" },
              { key: "is_bestseller", label: "Best Seller" },
              { key: "is_active", label: "Active" },
            ].map((flag) => (
              <label key={flag.key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean((form as unknown as Record<string, boolean>)[flag.key])}
                  onChange={(e) =>
                    setForm({ ...form, [flag.key]: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-brand-600 bg-brand-800 text-accent-500 focus:ring-accent-500"
                />
                <span className="text-sm text-brand-300">{flag.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-brand-900 border border-brand-800 rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">SEO</h2>

          <div>
            <label className="block text-xs font-medium text-brand-300 mb-1.5">Meta Title</label>
            <input
              type="text"
              value={form.meta_title}
              onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-brand-800 border border-brand-700 rounded-lg text-white placeholder-brand-400 focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-300 mb-1.5">Meta Description</label>
            <textarea
              rows={2}
              value={form.meta_description}
              onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-brand-800 border border-brand-700 rounded-lg text-white placeholder-brand-400 focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500 resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pb-8">
          <Link
            href="/admin/products"
            className="px-6 py-2.5 text-sm font-medium text-brand-300 bg-brand-800 rounded-lg hover:text-white hover:bg-brand-700 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 text-sm font-medium bg-accent-600 text-white rounded-lg hover:bg-accent-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Update Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
