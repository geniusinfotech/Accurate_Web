"use client";

import { useEffect, useRef, useState } from "react";
import { apiRequest, apiUpload } from "@/lib/api-client";
import Modal from "@/components/admin/Modal";
import { useDialog } from "@/components/admin/ConfirmDialog";
import { PageHeader } from "@/components/admin/AdminShell";
import { getImageUrl } from "@/lib/api";
import {
  Plus,
  Upload,
  Package,
  IndianRupee,
  FlaskConical,
  ShieldAlert,
  Sparkles,
  Box,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  Droplets,
  Image as ImageIcon,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Star,
  Link2,
  Layers,
} from "lucide-react";
import { activityLoggers } from "@/lib/activity-log";
import { useToast } from "@/components/ui/Toast";
import { DataTable } from "@/components/admin/DataTable";
import { ShortcutHint, LIST_SHORTCUTS } from "@/components/admin/ShortcutHint";
import type { Product, Category, Brand, PaginatedResponse } from "@/lib/types/api";

const PRODUCT_TYPES = [
  { value: "liquid_detergent", label: "Liquid Detergent" },
  { value: "dishwash", label: "Dishwash Gel / Liquid" },
  { value: "fabric_conditioner", label: "Fabric Conditioner" },
  { value: "floor_cleaner", label: "Floor Cleaner" },
  { value: "phenyl", label: "Phenyl" },
  { value: "handwash", label: "Handwash" },
  { value: "toilet_cleaner", label: "Toilet Cleaner" },
  { value: "bathroom_cleaner", label: "Bathroom Cleaner" },
  { value: "multipurpose_cleaner", label: "Multipurpose Cleaner" },
  { value: "glass_cleaner", label: "Glass Cleaner" },
  { value: "tile_cleaner", label: "Tile Cleaner" },
  { value: "fabric_whitener", label: "Fabric Whitener" },
  { value: "kitchen_cleaner", label: "Kitchen Cleaner" },
  { value: "car_cleaner", label: "Car Cleaner" },
  { value: "other", label: "Other Chemical / Liquid" },
];

/** Readable SKU from a name, with a short time suffix so two similar names don't collide. */
const autoSku = (name: string) =>
  `${name.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 20)}-${Date.now().toString(36).toUpperCase().slice(-4)}`;

const VALID_PRODUCT_TYPES = new Set(PRODUCT_TYPES.map((pt) => pt.value));

function normalizeProductType(val?: string): string {
  if (!val) return "liquid_detergent";
  const clean = val.toLowerCase().trim().replace(/[\s-]+/g, "_");
  if (VALID_PRODUCT_TYPES.has(clean)) return clean;
  if (clean.includes("detergent") || clean.includes("laundry"))
    return "liquid_detergent";
  if (clean.includes("dish")) return "dishwash";
  if (clean.includes("floor")) return "floor_cleaner";
  if (clean.includes("toilet")) return "toilet_cleaner";
  if (clean.includes("bath")) return "bathroom_cleaner";
  if (clean.includes("hand")) return "handwash";
  if (clean.includes("glass")) return "glass_cleaner";
  if (clean.includes("tile")) return "tile_cleaner";
  if (clean.includes("car")) return "car_cleaner";
  if (clean.includes("phenyl") || clean.includes("phenyle")) return "phenyl";
  if (clean.includes("condition")) return "fabric_conditioner";
  if (clean.includes("whitener")) return "fabric_whitener";
  if (clean.includes("multi")) return "multipurpose_cleaner";
  if (clean.includes("kitchen")) return "kitchen_cleaner";
  return "other";
}

const PRODUCT_FORMS = [
  "Liquid",
  "Gel",
  "Concentrated Liquid",
  "Foam",
  "Spray",
  "Thick Liquid",
  "Powder",
  "Other",
];

const PACKAGING_TYPES = [
  "Bottle",
  "Can / Jerry Can",
  "Pouch / Refill",
  "Pump Bottle",
  "Spray Bottle",
  "Bucket",
  "Drum",
  "Jar",
];

const PACKAGING_MATERIALS = [
  "HDPE (High Density Polyethylene)",
  "PET (Polyethylene Terephthalate)",
  "PP (Polypropylene)",
  "Recycled Plastic",
  "Glass",
  "Other",
];

const CLOSURE_TYPES = [
  "Screw Cap",
  "Flip Cap",
  "Dispenser Pump",
  "Trigger Spray",
  "Measuring Cap",
  "Child Resistant Cap",
  "Pull-Push Cap",
];

const POPULAR_FRAGRANCES = [
  "Lemon / Citrus",
  "Neem & Aloe",
  "Rose",
  "Lavender",
  "Ocean Breeze",
  "Pine",
  "Jasmine",
  "Eucalyptus",
  "Sandalwood",
  "Fresh Linen",
  "Unscented",
];

const PACK_UNITS = ["ml", "L", "gm", "kg"];

interface VariantForm {
  id: string;
  variantId: string;
  sku: string;
  packSize: string;
  packUnit: string;
  weight: string;
  fragrance: string;
  color: string;
  price: string;
  mrp: string;
  stock: string;
  isActive: boolean;
  /** Saved image URLs (from DB or added-by-URL). Empty => storefront shows default product images. */
  existingImages: string[];
  /** Files staged from computer, uploaded after the product is saved. */
  newFiles: File[];
  newPreviews: { id: string; url: string; name: string }[];
  urlInput: string;
}

function emptyVariant(baseSku = ""): VariantForm {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    variantId: `VAR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    sku: baseSku ? `${baseSku}-VAR` : "",
    packSize: "",
    packUnit: "ml",
    weight: "",
    fragrance: "",
    color: "",
    price: "",
    mrp: "",
    stock: "",
    isActive: true,
    existingImages: [],
    newFiles: [],
    newPreviews: [],
    urlInput: "",
  };
}

const MAX_VARIANT_FILES = 6;

function isImageFile(f: File): boolean {
  return (
    f.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif)$/i.test(f.name)
  );
}

/** "1 kg" / "500ml" -> { packSize, packUnit } for backend compatibility. */
function parseWeightToPack(weight: string): { packSize: string; packUnit: string } {
  const m = weight.trim().replace(/\s+/g, " ").match(/^([\d.,]+)\s*([a-zA-Z]+)?/);
  if (!m) return { packSize: "", packUnit: "ml" };
  const size = m[1].replace(/,/g, "");
  let unit = (m[2] || "ml").toLowerCase();
  if (["g", "gm", "gms", "gram", "grams"].includes(unit)) unit = "gm";
  else if (["kgs", "kilogram", "kilograms"].includes(unit)) unit = "kg";
  else if (["ltr", "ltrs", "litre", "liter", "litres", "liters", "lt"].includes(unit)) unit = "L";
  else if (["mls", "millilitre", "milliliter"].includes(unit)) unit = "ml";
  else if (unit === "l") unit = "L";
  if (!PACK_UNITS.includes(unit)) unit = "ml";
  return { packSize: size, packUnit: unit };
}

function variantLabel(v: VariantForm): string {
  if (v.weight.trim()) return v.weight.trim();
  if (v.packSize) return `${v.packSize} ${v.packUnit}`;
  return "New pack";
}

function BoolToggle({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      onClick={() => onChange(!value)}
      className="flex items-center justify-between p-3.5 rounded-xl border border-border-gray/70 bg-white hover:border-gold/60 cursor-pointer transition-all select-none"
    >
      <div>
        <span className="text-sm font-semibold text-charcoal">{label}</span>
        {description && (
          <p className="text-xs text-charcoal/45 mt-0.5">{description}</p>
        )}
      </div>

      <div
        className={`relative w-11 h-6 rounded-full transition-colors ${
          value ? "bg-gold" : "bg-border-gray"
        }`}
      >
        <div
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
            value ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
    </div>
  );
}

export default function Products() {
  const dialog = useDialog();
  const toast = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "basic" | "formula" | "pricing" | "variants" | "packaging" | "safety" | "media"
  >("basic");
  const [variants, setVariants] = useState<VariantForm[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [newFilePreviews, setNewFilePreviews] = useState<
    { id: string; file: File; url: string; name: string; size: string }[]
  >([]);
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const initialForm = {
    // Basic Info
    name: "",
    sku: "",
    slug: "",
    categoryId: "",
    brandId: "",
    productType: "liquid_detergent",
    productForm: "Liquid",
    shortDescription: "",
    description: "",
    status: "published",

    // Formula & Fragrance
    isConcentrated: false,
    concentration: "",
    phValue: "",
    fragrance: "",
    color: "",
    availableFragrances: "",
    ingredients: "",
    ingredientDescription: "",
    benefits: "",
    features: "",

    // Pricing & Stock
    price: "",
    mrp: "",
    discountPercent: "",
    discount: "",
    stock: "",
    reservedStock: "",

    // Packaging & Logistics
    packagingType: "Bottle",
    packagingMaterial: "HDPE",
    closureType: "Screw Cap",
    hsnCode: "",
    gstRate: "18%",
    batchNumber: "",
    manufacturingDate: "",
    expiryDate: "",
    shelfLife: "24 Months",
    storageInstructions: "Store in a cool, dry place away from direct sunlight.",
    certifications: "",
    warranty: "",

    // Usage & Safety
    usageInstructions: "",
    dilutionInstructions: "",
    recommendedDosage: "",
    suitableFor: "",
    notSuitableFor: "",
    keepAwayFromChildren: true,
    avoidEyeContact: true,
    doNotIngest: true,
    doNotMixWithOtherCleaners: true,
    safetyInstructions: "For external cleaning use only. In case of accidental ingestion, seek medical aid.",
    firstAidInstructions: "Eyes: Rinse thoroughly with water for 15 mins. Skin: Wash with water.",

    // Media & Marketing
    videoUrl: "",
    tags: "",
    keywords: "",
    metaTitle: "",
    metaDescription: "",
    isFeatured: false,
    isNewArrival: false,
    isBestseller: false,
    isPremium: false,
    isActive: true,
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      const data = await apiRequest<PaginatedResponse<Product>>(
        "/products?includeUnpublished=true&limit=1000",
      );
      const list = (data?.items as Product[]) || (data as any)?.products || [];
      setProducts(list);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const data = await apiRequest("/categories");
      const list = Array.isArray(data) ? data : data?.items || [];
      setCategories(list);
    } catch {
      setCategories([]);
    }
  }

  async function fetchBrands() {
    try {
      const data = await apiRequest("/brands");
      const list = Array.isArray(data) ? data : data?.items || [];
      setBrands(list);
    } catch {
      setBrands([]);
    }
  }

  function resetForm() {
    setFormData(initialForm);
    setVariants((prev) => {
      prev.forEach((v) => v.newPreviews.forEach((p) => URL.revokeObjectURL(p.url)));
      return [];
    });
    setExistingImages([]);
    newFilePreviews.forEach((p) => URL.revokeObjectURL(p.url));
    setSelectedFiles([]);
    setNewFilePreviews([]);
    setIsDragging(false);
    setUrlInput("");
    setError("");
    setEditingId(null);
    setActiveTab("basic");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function openCreate() {
    resetForm();
    setIsModalOpen(true);
  }

  function handlePriceChange(field: "price" | "mrp", value: string) {
    const updated = { ...formData, [field]: value };
    const p = parseFloat(field === "price" ? value : formData.price);
    const m = parseFloat(field === "mrp" ? value : formData.mrp);

    if (m > 0 && p >= 0 && m >= p) {
      const discPercent = Math.round(((m - p) / m) * 100);
      const flatDiscount = Math.round(m - p);
      updated.discountPercent = String(discPercent);
      updated.discount = String(flatDiscount);
    } else if (p > 0 && (!m || m < p)) {
      updated.discountPercent = "0";
      updated.discount = "0";
    }

    setFormData(updated);
  }

  function handleFilesSelected(files: FileList | File[] | null) {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);
    const validImages = fileList.filter(
      (f) =>
        f.type.startsWith("image/") ||
        /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(f.name),
    );

    if (validImages.length === 0) {
      toast.error("Please select valid image files (JPG, PNG, WEBP, GIF)");
      return;
    }

    const newPreviews = validImages.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / 1024).toFixed(0) + " KB",
    }));

    setSelectedFiles((prev) => [...prev, ...validImages]);
    setNewFilePreviews((prev) => [...prev, ...newPreviews]);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  }

  function removeExistingImage(index: number) {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  }

  function setCoverExistingImage(index: number) {
    setExistingImages((prev) => {
      if (index === 0) return prev;
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      return [item, ...copy];
    });
  }

  function moveExistingImage(index: number, direction: "left" | "right") {
    setExistingImages((prev) => {
      const targetIndex = direction === "left" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  }

  function removeNewFile(index: number) {
    const item = newFilePreviews[index];
    if (item?.url) {
      URL.revokeObjectURL(item.url);
    }
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setNewFilePreviews((prev) => prev.filter((_, i) => i !== index));
  }

  function setCoverNewFile(index: number) {
    setSelectedFiles((prev) => {
      if (index === 0) return prev;
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      return [item, ...copy];
    });
    setNewFilePreviews((prev) => {
      if (index === 0) return prev;
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      return [item, ...copy];
    });
  }

  function addImageUrl() {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (
      !trimmed.startsWith("http://") &&
      !trimmed.startsWith("https://") &&
      !trimmed.startsWith("/")
    ) {
      toast.error(
        "Please enter a valid URL starting with http://, https://, or /",
      );
      return;
    }
    setExistingImages((prev) => [...prev, trimmed]);
    setUrlInput("");
    toast.success("Image URL added");
  }

  function addVariantImageUrl(variantId: string, raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return;
    if (
      !trimmed.startsWith("http://") &&
      !trimmed.startsWith("https://") &&
      !trimmed.startsWith("/")
    ) {
      toast.error("URL must start with http://, https:// or /");
      return;
    }
    setVariants((prev) =>
      prev.map((item) =>
        item.id === variantId
          ? { ...item, existingImages: [...item.existingImages, trimmed], urlInput: "" }
          : item,
      ),
    );
    toast.success("Variant image URL added");
  }

  function parseCommaList(val: string): string[] {
    return val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  async function handleSubmit() {
    setError("");

    if (!formData.name.trim()) {
      setError("Product Name is required");
      setActiveTab("basic");
      return;
    }
    const productSku = (formData.sku.trim() || autoSku(formData.name)).toUpperCase();
    if (!formData.categoryId) {
      setError("Please select a Category");
      setActiveTab("basic");
      return;
    }
    if (!formData.price || parseFloat(formData.price) < 0) {
      setError("Valid Selling Price is required");
      setActiveTab("pricing");
      return;
    }
    if (formData.stock === "" || parseInt(formData.stock, 10) < 0) {
      setError("Available Stock is required");
      setActiveTab("pricing");
      return;
    }

    setSubmitting(true);

    // Validate variants (at least pack size or weight + sku + price + stock each)
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      const size = v.packSize.trim() || parseWeightToPack(v.weight).packSize;
      if (!size) {
        setError(`Variant ${i + 1}: Pack size (or weight like "500 ml") is required`);
        setActiveTab("variants");
        setSubmitting(false);
        return;
      }
      if (v.price === "" || parseFloat(v.price) < 0) {
        setError(`Variant ${i + 1}: Valid price is required`);
        setActiveTab("variants");
        setSubmitting(false);
        return;
      }
      if (v.stock === "" || parseInt(v.stock, 10) < 0) {
        setError(`Variant ${i + 1}: Valid stock is required`);
        setActiveTab("variants");
        setSubmitting(false);
        return;
      }
    }

    const variantPayload = variants.map((v, i) => {
      const pack = v.packSize.trim()
        ? { packSize: parseFloat(v.packSize), packUnit: v.packUnit }
        : (() => {
            const p = parseWeightToPack(v.weight);
            return { packSize: parseFloat(p.packSize) || 0, packUnit: p.packUnit };
          })();
      const weightLabel = v.weight.trim() || `${pack.packSize} ${pack.packUnit}`;
      return {
        variantId:
          v.variantId.trim() ||
          `VAR-${Date.now().toString(36).toUpperCase()}-${i}${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        sku: (v.sku.trim() || `${productSku}-${pack.packSize}${pack.packUnit}`).toUpperCase(),
        packSize: pack.packSize,
        packUnit: pack.packUnit,
        weight: weightLabel,
        fragrance: v.fragrance.trim() || undefined,
        color: v.color.trim() || undefined,
        price: parseFloat(v.price),
        mrp: v.mrp ? parseFloat(v.mrp) : undefined,
        stock: parseInt(v.stock, 10),
        isActive: v.isActive,
        images: [...v.existingImages],
      };
    });

    /** Upload computer-staged files for each variant (server appends to variant.images). */
    async function uploadStagedVariantFiles(productId: string) {
      for (const v of variants) {
        if (v.newFiles.length === 0) continue;
        const sku = (v.sku.trim() || variantPayload[variants.indexOf(v)].sku).toUpperCase();
        const fd = new FormData();
        v.newFiles.forEach((file) => fd.append("images", file));
        try {
          await apiUpload(
            `/products/${productId}/variants/${encodeURIComponent(sku)}/images`,
            fd,
            "PUT",
          );
        } catch (err: any) {
          toast.error(`Variant ${sku}: image upload failed — ${err?.message || "unknown error"}`);
        }
      }
    }

    try {
      const payload: Record<string, any> = {
        name: formData.name.trim(),
        sku: productSku,
        slug: formData.slug.trim() || undefined,
        categoryId: formData.categoryId,
        brandId: formData.brandId || undefined,
        productType: normalizeProductType(formData.productType),
        productForm: formData.productForm,
        shortDescription: formData.shortDescription.trim() || undefined,
        description: formData.description.trim() || undefined,
        status: formData.status,

        isConcentrated: formData.isConcentrated,
        concentration: formData.concentration.trim() || undefined,
        phValue: formData.phValue ? parseFloat(formData.phValue) : undefined,
        fragrance: formData.fragrance.trim() || undefined,
        color: formData.color.trim() || undefined,
        availableFragrances: parseCommaList(formData.availableFragrances),
        ingredients: parseCommaList(formData.ingredients),
        ingredientDescription: formData.ingredientDescription.trim() || undefined,
        benefits: parseCommaList(formData.benefits),
        features: parseCommaList(formData.features),

        price: parseFloat(formData.price),
        mrp: formData.mrp ? parseFloat(formData.mrp) : undefined,
        discountPercent: formData.discountPercent
          ? parseFloat(formData.discountPercent)
          : undefined,
        discount: formData.discount ? parseFloat(formData.discount) : undefined,
        stock: parseInt(formData.stock, 10),
        reservedStock: formData.reservedStock
          ? parseInt(formData.reservedStock, 10)
          : 0,

        packaging: {
          type: formData.packagingType || undefined,
          material: formData.packagingMaterial || undefined,
          closureType: formData.closureType || undefined,
        },
        hsnCode: formData.hsnCode.trim() || undefined,
        gstRate: formData.gstRate.trim() || undefined,
        batchNumber: formData.batchNumber.trim() || undefined,
        manufacturingDate: formData.manufacturingDate
          ? new Date(formData.manufacturingDate)
          : undefined,
        expiryDate: formData.expiryDate
          ? new Date(formData.expiryDate)
          : undefined,
        shelfLife: formData.shelfLife.trim() || undefined,
        storageInstructions: formData.storageInstructions.trim() || undefined,
        certifications: parseCommaList(formData.certifications),
        warranty: formData.warranty.trim() || undefined,

        usage: {
          usageInstructions: formData.usageInstructions.trim() || undefined,
          dilutionInstructions: formData.dilutionInstructions.trim() || undefined,
          recommendedDosage: formData.recommendedDosage.trim() || undefined,
          suitableFor: parseCommaList(formData.suitableFor),
          notSuitableFor: parseCommaList(formData.notSuitableFor),
        },
        safety: {
          safetyInstructions: formData.safetyInstructions.trim() || undefined,
          firstAidInstructions: formData.firstAidInstructions.trim() || undefined,
          keepAwayFromChildren: formData.keepAwayFromChildren,
          avoidEyeContact: formData.avoidEyeContact,
          doNotIngest: formData.doNotIngest,
          doNotMixWithOtherCleaners: formData.doNotMixWithOtherCleaners,
        },

        videoUrl: formData.videoUrl.trim() || undefined,
        tags: parseCommaList(formData.tags),
        keywords: parseCommaList(formData.keywords),
        metaTitle: formData.metaTitle.trim() || undefined,
        metaDescription: formData.metaDescription.trim() || undefined,

        isFeatured: formData.isFeatured,
        isNewArrival: formData.isNewArrival,
        isBestseller: formData.isBestseller,
        isPremium: formData.isPremium,
        isActive: formData.isActive,
        variants: variantPayload,
      };

      if (editingId) {
        const oldProduct = products.find((p) => p._id === editingId);

        let finalImages = [...existingImages];

        if (selectedFiles.length > 0) {
          const imageFd = new FormData();
          selectedFiles.forEach((file) => {
            imageFd.append("images", file);
          });
          const uploadRes: any = await apiUpload(
            `/products/${editingId}/images`,
            imageFd,
            "PUT",
          );
          const updatedServerImages: string[] = uploadRes?.images || [];
          const newlyAddedUrls = updatedServerImages.slice(
            Math.max(0, updatedServerImages.length - selectedFiles.length),
          );
          finalImages = [...existingImages, ...newlyAddedUrls];
        }

        const updatePayload = {
          ...payload,
          images: finalImages,
        };

        await apiRequest(`/products/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(updatePayload),
        });

        await uploadStagedVariantFiles(editingId);

        if (oldProduct) {
          await activityLoggers.product.updated(
            editingId,
            oldProduct,
            { ...oldProduct, ...updatePayload },
            `Updated product: ${formData.name}`,
          );
        }

        toast.success("Product updated successfully");
      } else {
        const fd = new FormData();

        Object.entries(payload).forEach(([k, v]) => {
          if (v === undefined || v === null) return;
          if (typeof v === "object" && !(v instanceof Date)) {
            fd.append(k, JSON.stringify(v));
          } else if (v instanceof Date) {
            fd.append(k, v.toISOString());
          } else {
            fd.append(k, String(v));
          }
        });

        if (selectedFiles.length > 0) {
          selectedFiles.forEach((file) => {
            fd.append("images", file);
          });
        }

        if (existingImages.length > 0) {
          fd.append("images", JSON.stringify(existingImages));
        }

        const res = await apiUpload("/products/with-image", fd);

        await uploadStagedVariantFiles(res._id || res.id);

        await activityLoggers.product.created(
          res._id || res.id,
          res,
          `Created product: ${formData.name}`,
        );

        toast.success("Product created successfully");
      }

      setIsModalOpen(false);
      resetForm();
      fetchProducts();
    } catch (err: any) {
      const message = err?.message || "Failed to save product";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(product: Product) {
    setEditingId(product._id);

    setFormData({
      ...initialForm,
      name: product.name || "",
      sku: product.sku || "",
      slug: product.slug || "",
      categoryId:
        typeof product.categoryId === "object"
          ? (product.categoryId as any)?._id || ""
          : product.categoryId || "",
      brandId:
        typeof product.brandId === "object"
          ? (product.brandId as any)?._id || ""
          : product.brandId || "",
      productType: normalizeProductType(product.productType),
      productForm: product.productForm || "Liquid",
      shortDescription: product.shortDescription || "",
      description: product.description || "",
      status:
        product.status || (product.isActive === false ? "pending" : "published"),

      isConcentrated: !!product.isConcentrated,
      concentration: product.concentration || "",
      phValue:
        product.phValue !== undefined && product.phValue !== null
          ? String(product.phValue)
          : "",
      fragrance: product.fragrance || "",
      color: product.color || "",
      availableFragrances: Array.isArray(product.availableFragrances)
        ? product.availableFragrances.join(", ")
        : "",
      ingredients: Array.isArray(product.ingredients)
        ? product.ingredients.join(", ")
        : "",
      ingredientDescription: product.ingredientDescription || "",
      benefits: Array.isArray(product.benefits)
        ? product.benefits.join(", ")
        : "",
      features: Array.isArray(product.features)
        ? product.features.join(", ")
        : "",

      price: product.price !== undefined ? String(product.price) : "",
      mrp: product.mrp !== undefined ? String(product.mrp) : "",
      discountPercent:
        product.discountPercent !== undefined
          ? String(product.discountPercent)
          : "",
      discount: product.discount !== undefined ? String(product.discount) : "",
      stock: product.stock !== undefined ? String(product.stock) : "",
      reservedStock:
        product.reservedStock !== undefined
          ? String(product.reservedStock)
          : "",

      packagingType: product.packaging?.type || "Bottle",
      packagingMaterial: product.packaging?.material || "HDPE",
      closureType:
        product.packaging?.closureType ||
        (product as any).closureType ||
        "Screw Cap",
      hsnCode: product.hsnCode || "",
      gstRate: product.gstRate || "18%",
      batchNumber: product.batchNumber || "",
      manufacturingDate: product.manufacturingDate
        ? new Date(product.manufacturingDate).toISOString().slice(0, 10)
        : "",
      expiryDate: product.expiryDate
        ? new Date(product.expiryDate).toISOString().slice(0, 10)
        : "",
      shelfLife: product.shelfLife || "24 Months",
      storageInstructions:
        product.storageInstructions ||
        "Store in a cool, dry place away from direct sunlight.",
      certifications: Array.isArray(product.certifications)
        ? product.certifications.join(", ")
        : "",
      warranty: product.warranty || "",

      usageInstructions: product.usage?.usageInstructions || "",
      dilutionInstructions: product.usage?.dilutionInstructions || "",
      recommendedDosage: product.usage?.recommendedDosage || "",
      suitableFor: Array.isArray(product.usage?.suitableFor)
        ? product.usage!.suitableFor!.join(", ")
        : "",
      notSuitableFor: Array.isArray(product.usage?.notSuitableFor)
        ? product.usage!.notSuitableFor!.join(", ")
        : "",
      keepAwayFromChildren: product.safety?.keepAwayFromChildren !== false,
      avoidEyeContact: product.safety?.avoidEyeContact !== false,
      doNotIngest: product.safety?.doNotIngest !== false,
      doNotMixWithOtherCleaners:
        product.safety?.doNotMixWithOtherCleaners !== false,
      safetyInstructions: product.safety?.safetyInstructions || "",
      firstAidInstructions: product.safety?.firstAidInstructions || "",

      videoUrl: product.videoUrl || "",
      tags: Array.isArray(product.tags) ? product.tags.join(", ") : "",
      keywords: Array.isArray(product.keywords)
        ? product.keywords.join(", ")
        : "",
      metaTitle: product.metaTitle || "",
      metaDescription: product.metaDescription || "",
      isFeatured: !!product.isFeatured,
      isNewArrival: !!product.isNewArrival,
      isBestseller: !!product.isBestseller,
      isPremium: !!product.isPremium,
      isActive: product.isActive !== false,
    });

    const prodImages =
      Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : product.image
        ? [product.image]
        : [];
    setExistingImages(prodImages);
    // Load existing variants (supports both weight-label and packSize+packUnit shapes)
    const loaded: VariantForm[] = Array.isArray((product as any).variants)
      ? (product as any).variants.map((v: any) => {
          let packSize = v.packSize !== undefined && v.packSize !== null ? String(v.packSize) : "";
          let packUnit = v.packUnit || "ml";
          const weight = typeof v.weight === "string" ? v.weight : "";
          if (!packSize && weight) {
            const parsed = parseWeightToPack(weight);
            packSize = parsed.packSize;
            packUnit = parsed.packUnit;
          } else if (typeof v.size === "string" && !packSize) {
            const parsed = parseWeightToPack(v.size);
            packSize = parsed.packSize;
            packUnit = parsed.packUnit;
          }
          return {
            id: String(v.variantId || v._id || v.sku || `${Date.now()}-${Math.random()}`),
            variantId: String(v.variantId || ""),
            sku: String(v.sku || ""),
            packSize,
            packUnit: PACK_UNITS.includes(packUnit) ? packUnit : "ml",
            weight,
            fragrance: String(v.fragrance || ""),
            color: String(v.color || ""),
            price: v.price !== undefined && v.price !== null ? String(v.price) : "",
            mrp: v.mrp !== undefined && v.mrp !== null ? String(v.mrp) : "",
            stock: v.stock !== undefined && v.stock !== null ? String(v.stock) : "",
            isActive: v.isActive !== false,
            existingImages: Array.isArray(v.images) ? v.images.filter(Boolean).map(String) : [],
            newFiles: [],
            newPreviews: [],
            urlInput: "",
          };
        })
      : [];
    setVariants((prev) => {
      prev.forEach((old) => old.newPreviews.forEach((p) => URL.revokeObjectURL(p.url)));
      return loaded;
    });
    newFilePreviews.forEach((p) => URL.revokeObjectURL(p.url));
    setSelectedFiles([]);
    setNewFilePreviews([]);
    setIsDragging(false);
    setUrlInput("");
    setError("");
    setActiveTab("basic");
    setIsModalOpen(true);
  }

  async function handleDelete(id: string) {
    const ok = await dialog.confirm(
      "Are you sure you want to delete this product?",
      "Delete Product",
    );
    if (!ok) return;

    try {
      const productToDelete = products.find((product) => product._id === id);

      await apiRequest(`/products/${id}`, {
        method: "DELETE",
      });

      if (productToDelete) {
        await activityLoggers.product.deleted(
          id,
          productToDelete,
          `Deleted product: ${productToDelete.name}`,
        );
      }

      fetchProducts();
      toast.success("Product deleted successfully");
    } catch (err: any) {
      const message = err?.message || "Failed to delete product";
      await dialog.alert(message, "error");
      toast.error(message);
    }
  }

  const getTypeLabel = (type: string) => {
    return PRODUCT_TYPES.find((t) => t.value === type)?.label || type || "Liquid";
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Products"
        description="Manage liquid cleaning products, formulations, fragrances, stock and pricing"
        actions={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 btn-primary px-5 py-2.5 shadow-sm"
          >
            <Plus size={18} />
            Add Product
          </button>
        }
      />

      {error && (
        <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-sm">
          <AlertCircle size={18} className="shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <DataTable
        trail={[]}
        loading={loading}
        defaultPageSize={25}
        headerRight={`${products.length} product${
          products.length === 1 ? "" : "s"
        }`}
        exportFileName="accurate_liquid_products"
        emptyTitle="No products found"
        emptyDescription="Add your first liquid cleaner, detergent, or disinfectant product."
        columns={[
          {
            key: "images",
            label: "Product",
            render: (_value: any, row: Product) => (
              <div className="flex items-center gap-3 py-1">
                {row.images?.[0] ? (
                  <img
                    src={getImageUrl(row.images[0])}
                    alt={row.name || "Product"}
                    className="w-12 h-12 object-cover rounded-lg border border-border-gray/60 shrink-0 bg-cream"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg border border-border-gray/60 bg-cream-dark/60 flex items-center justify-center shrink-0 text-charcoal/30">
                    <Droplets size={20} />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-charcoal truncate max-w-xs">
                    {row.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-charcoal/50 mt-0.5">
                    <span className="font-mono">{row.sku}</span>
                    {row.fragrance && (
                      <>
                        <span>•</span>
                        <span className="text-gold font-medium">{row.fragrance}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ),
          },
          {
            key: "productType",
            label: "Type & Form",
            render: (_val: any, row: Product) => (
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200/60">
                  {getTypeLabel(row.productType)}
                </span>
                <p className="text-xs text-charcoal/50 mt-1">
                  {row.productForm || "Liquid"}
                  {row.isConcentrated ? " (Concentrate)" : ""}
                </p>
              </div>
            ),
          },
          {
            key: "price",
            label: "Pricing",
            render: (value: number, row: Product) => (
              <div>
                <span className="font-semibold text-charcoal text-sm">
                  ₹{value?.toLocaleString()}
                </span>
                {row.mrp && row.mrp > value && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-charcoal/40 line-through">
                      ₹{row.mrp?.toLocaleString()}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded">
                      {row.discountPercent || Math.round(((row.mrp - value) / row.mrp) * 100)}% off
                    </span>
                  </div>
                )}
              </div>
            ),
          },
          {
            key: "stock",
            label: "Inventory",
            render: (value: number) => {
              const count = Number(value) || 0;
              const isOut = count <= 0;
              const isLow = count > 0 && count < 10;
              return (
                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold ${
                      isOut
                        ? "bg-rose-50 text-rose-700"
                        : isLow
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isOut
                          ? "bg-rose-500"
                          : isLow
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                      }`}
                    />
                    {isOut ? "Out of stock" : `${count} in stock`}
                  </span>
                </div>
              );
            },
          },
          {
            key: "status",
            label: "Status",
            render: (_value: any, row: Product) => (
              <div className="space-y-1">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    row.isActive !== false
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                      : "bg-charcoal/5 text-charcoal/50"
                  }`}
                >
                  {row.isActive !== false ? "Active" : "Inactive"}
                </span>
                {row.status && row.status !== "published" && (
                  <p className="text-[11px] uppercase tracking-wider text-charcoal/40 font-semibold">
                    {row.status}
                  </p>
                )}
              </div>
            ),
          },
        ]}
        data={products}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Search products by name, SKU, fragrance or type…"
      />

      <ShortcutHint keys={LIST_SHORTCUTS} />

      {/* Product Form Modal */}
      <Modal
        isOpen={isModalOpen}
        title={editingId ? "Edit Liquid Product" : "Add New Liquid Product"}
        subtitle={
          editingId
            ? "Update chemical formulation, fragrance, packaging, usage and pricing."
            : "Register a new cleaning or liquid chemical product to catalog."
        }
        maxWidth="max-w-4xl lg:max-w-5xl"
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        onSubmit={handleSubmit}
        submitLabel={
          submitting
            ? "Saving Product..."
            : editingId
              ? "Update Product"
              : "Create Product"
        }
        disabled={submitting}
      >
        <div className="space-y-6">
          <p className="text-[11px] text-charcoal/50 -mb-2">
            <span className="text-rose-600 font-bold">*</span> Required &nbsp;·&nbsp; all other fields are{" "}
            <span className="font-semibold">optional</span>
          </p>
          {error && (
            <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-sm">
              <AlertCircle size={18} className="shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 p-1 bg-cream-dark/60 rounded-xl border border-border-gray/60 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("basic")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeTab === "basic"
                  ? "bg-white text-charcoal shadow-sm border border-border-gray/50"
                  : "text-charcoal/60 hover:text-charcoal"
              }`}
            >
              <Package size={15} className={activeTab === "basic" ? "text-gold" : ""} />
              Basic Info
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("formula")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeTab === "formula"
                  ? "bg-white text-charcoal shadow-sm border border-border-gray/50"
                  : "text-charcoal/60 hover:text-charcoal"
              }`}
            >
              <FlaskConical size={15} className={activeTab === "formula" ? "text-gold" : ""} />
              Formula & Fragrance
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("pricing")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeTab === "pricing"
                  ? "bg-white text-charcoal shadow-sm border border-border-gray/50"
                  : "text-charcoal/60 hover:text-charcoal"
              }`}
            >
              <IndianRupee size={15} className={activeTab === "pricing" ? "text-gold" : ""} />
              Pricing & Stock
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("variants")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeTab === "variants"
                  ? "bg-white text-charcoal shadow-sm border border-border-gray/50"
                  : "text-charcoal/60 hover:text-charcoal"
              }`}
            >
              <Layers size={15} className={activeTab === "variants" ? "text-gold" : ""} />
              Variants
              {variants.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-gold text-white text-[10px] font-bold leading-none">
                  {variants.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("packaging")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeTab === "packaging"
                  ? "bg-white text-charcoal shadow-sm border border-border-gray/50"
                  : "text-charcoal/60 hover:text-charcoal"
              }`}
            >
              <Box size={15} className={activeTab === "packaging" ? "text-gold" : ""} />
              Packaging & Logistics
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("safety")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeTab === "safety"
                  ? "bg-white text-charcoal shadow-sm border border-border-gray/50"
                  : "text-charcoal/60 hover:text-charcoal"
              }`}
            >
              <ShieldAlert size={15} className={activeTab === "safety" ? "text-gold" : ""} />
              Usage & Safety
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("media")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeTab === "media"
                  ? "bg-white text-charcoal shadow-sm border border-border-gray/50"
                  : "text-charcoal/60 hover:text-charcoal"
              }`}
            >
              <Sparkles size={15} className={activeTab === "media" ? "text-gold" : ""} />
              Media & Marketing
            </button>
          </div>

          {/* TAB 1: BASIC INFO */}
          {activeTab === "basic" && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              {/* Read-only system info (edit mode) */}
              {editingId &&
                (() => {
                  const sys = products.find((p) => p._id === editingId);
                  if (!sys) return null;
                  const fmtDate = (d?: string) =>
                    d ? new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";
                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 p-3 rounded-xl border border-border-gray/70 bg-cream-dark/40 text-[11px]">
                      <div>
                        <p className="font-bold uppercase tracking-wider text-charcoal/45">Product ID</p>
                        <p className="font-mono text-charcoal truncate" title={sys._id}>{sys._id}</p>
                      </div>
                      <div>
                        <p className="font-bold uppercase tracking-wider text-charcoal/45">Stock Status</p>
                        <p className="text-charcoal font-semibold">{sys.stockStatus || "—"}</p>
                      </div>
                      <div>
                        <p className="font-bold uppercase tracking-wider text-charcoal/45">Created</p>
                        <p className="text-charcoal">{fmtDate(sys.createdAt)}</p>
                      </div>
                      <div>
                        <p className="font-bold uppercase tracking-wider text-charcoal/45">Updated</p>
                        <p className="text-charcoal">{fmtDate(sys.updatedAt)}</p>
                      </div>
                      <div>
                        <p className="font-bold uppercase tracking-wider text-charcoal/45">Variants</p>
                        <p className="text-charcoal font-semibold">{Array.isArray(sys.variants) ? sys.variants.length : 0}</p>
                      </div>
                    </div>
                  );
                })()}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    Product Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. Accurate Pro Active Liquid Detergent 5L"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                  />
                </div>

                {/* SKU */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    SKU Code <span className="text-charcoal/40 font-normal normal-case">auto-generated if empty</span>
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value.toUpperCase() })
                    }
                    placeholder="e.g. ACC-LIQ-DET-5L"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm font-mono bg-white uppercase"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    Slug <span className="text-charcoal/40 font-normal">optional</span>
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    placeholder="accurate-pro-active-detergent-5l"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                  />
                </div>

                {/* Product Type */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    Product Type <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={formData.productType}
                    onChange={(e) =>
                      setFormData({ ...formData, productType: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                  >
                    {PRODUCT_TYPES.map((pt) => (
                      <option key={pt.value} value={pt.value}>
                        {pt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Product Form */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    Product Form{" "}
                    <span className="text-charcoal/40 font-normal">optional</span>
                  </label>
                  <select
                    value={formData.productForm}
                    onChange={(e) =>
                      setFormData({ ...formData, productForm: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                  >
                    {PRODUCT_FORMS.map((form) => (
                      <option key={form} value={form}>
                        {form}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    Category <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                  >
                    <option value="">Select Category...</option>
                    {categories.map((c: any) => (
                      <option key={c._id || c.id} value={c._id || c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    Brand <span className="text-charcoal/40 font-normal">optional</span>
                  </label>
                  <select
                    value={formData.brandId}
                    onChange={(e) =>
                      setFormData({ ...formData, brandId: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                  >
                    <option value="">None / Default Brand</option>
                    {brands.map((b: any) => (
                      <option key={b._id || b.id} value={b._id || b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    Catalog Status{" "}
                    <span className="text-charcoal/40 font-normal">optional</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "published", label: "Published", desc: "Live on catalog" },
                      { id: "draft", label: "Draft", desc: "Work in progress" },
                      { id: "pending", label: "Pending", desc: "Review needed" },
                      { id: "archived", label: "Archived", desc: "Discontinued" },
                    ].map((st) => (
                      <div
                        key={st.id}
                        onClick={() =>
                          setFormData({ ...formData, status: st.id as any })
                        }
                        className={`p-3 rounded-xl border cursor-pointer transition-all text-center ${
                          formData.status === st.id
                            ? "border-gold bg-gold/5 text-charcoal font-bold"
                            : "border-border-gray/70 bg-white text-charcoal/60 hover:border-gold/40"
                        }`}
                      >
                        <p className="text-xs">{st.label}</p>
                        <p className="text-[10px] text-charcoal/40 font-normal mt-0.5">
                          {st.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Short Description */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    Short Summary <span className="text-charcoal/40 font-normal">for cards & search · optional</span>
                  </label>
                  <input
                    type="text"
                    value={formData.shortDescription}
                    onChange={(e) =>
                      setFormData({ ...formData, shortDescription: e.target.value })
                    }
                    placeholder="High-foaming, power active formula with natural lime extract"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                  />
                </div>

                {/* Detailed Description */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    Full Description{" "}
                    <span className="text-charcoal/40 font-normal">optional</span>
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Provide in-depth information about application, formula highlights, fabric compatibility, and advantages..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FORMULA & FRAGRANCE */}
          {activeTab === "formula" && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Concentration toggle */}
                <div className="md:col-span-2">
                  <BoolToggle
                    label="Is Concentrated Formula"
                    description="Requires dilution prior to usage or offers multi-wash super concentrated strength"
                    value={formData.isConcentrated}
                    onChange={(v) =>
                      setFormData({ ...formData, isConcentrated: v })
                    }
                  />
                </div>

                {/* Concentration details */}
                {formData.isConcentrated && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                      Concentration Strength{" "}
                    <span className="text-charcoal/40 font-normal">optional</span>
                    </label>
                    <input
                      type="text"
                      value={formData.concentration}
                      onChange={(e) =>
                        setFormData({ ...formData, concentration: e.target.value })
                      }
                      placeholder="e.g. 5x Ultra Concentrate, 1:100 Ratio"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                    />
                  </div>
                )}

                {/* pH Value */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    pH Level (0 – 14){" "}
                    <span className="text-charcoal/40 font-normal">optional</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="14"
                      value={formData.phValue}
                      onChange={(e) =>
                        setFormData({ ...formData, phValue: e.target.value })
                      }
                      placeholder="e.g. 7.5 (Neutral)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white pr-20"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-charcoal/40">
                      pH
                    </span>
                  </div>
                  <p className="text-[11px] text-charcoal/40 mt-1">
                    0-6: Acidic • 7: Neutral • 8-14: Alkaline
                  </p>
                </div>

                {/* Fragrance */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    Primary Fragrance{" "}
                    <span className="text-charcoal/40 font-normal">optional</span>
                  </label>
                  <input
                    type="text"
                    list="fragrance-list"
                    value={formData.fragrance}
                    onChange={(e) =>
                      setFormData({ ...formData, fragrance: e.target.value })
                    }
                    placeholder="e.g. Lemon & Tea Tree"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                  />
                  <datalist id="fragrance-list">
                    {POPULAR_FRAGRANCES.map((f) => (
                      <option key={f} value={f} />
                    ))}
                  </datalist>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    Liquid Appearance / Color{" "}
                    <span className="text-charcoal/40 font-normal">optional</span>
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    placeholder="e.g. Ocean Blue, Golden Yellow, Crystal Clear"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                  />
                </div>

                {/* Available Fragrances variants */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    Available Fragrance Options{" "}
                    <span className="text-charcoal/40 font-normal">comma-separated · optional</span>
                  </label>
                  <input
                    type="text"
                    value={formData.availableFragrances}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        availableFragrances: e.target.value,
                      })
                    }
                    placeholder="Lemon, Rose, Lavender, Ocean Breeze"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                  />
                </div>

                {/* Ingredients */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    Active Ingredients{" "}
                    <span className="text-charcoal/40 font-normal">comma-separated · optional</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formData.ingredients}
                    onChange={(e) =>
                      setFormData({ ...formData, ingredients: e.target.value })
                    }
                    placeholder="Sodium Lauryl Sulfate, Alkyl Polyglucoside, Citric Acid, Fragrance Oil, Purified Aqua"
                    className="w-full px-3.5 py-2 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white resize-none"
                  />
                </div>

                {/* Ingredient Description */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    Ingredient Description{" "}
                    <span className="text-charcoal/40 font-normal">optional</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formData.ingredientDescription}
                    onChange={(e) =>
                      setFormData({ ...formData, ingredientDescription: e.target.value })
                    }
                    placeholder="e.g. A balanced blend of anionic surfactants with water softeners and fragrance oils…"
                    className="w-full px-3.5 py-2 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white resize-none"
                  />
                </div>

                {/* Key Benefits */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    Key Benefits{" "}
                    <span className="text-charcoal/40 font-normal">comma-separated · optional</span>
                  </label>
                  <input
                    type="text"
                    value={formData.benefits}
                    onChange={(e) =>
                      setFormData({ ...formData, benefits: e.target.value })
                    }
                    placeholder="Cuts tough grease, Gentle on skin, Long-lasting fragrance, 99.9% Germ Protection"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                  />
                </div>

                {/* Features */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    Product Features{" "}
                    <span className="text-charcoal/40 font-normal">comma-separated · optional</span>
                  </label>
                  <input
                    type="text"
                    value={formData.features}
                    onChange={(e) =>
                      setFormData({ ...formData, features: e.target.value })
                    }
                    placeholder="Bio-degradable, Phosphate Free, Non-toxic, Color Safe"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRICING & STOCK */}
          {activeTab === "pricing" && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Selling Price */}
                <div className="p-4 rounded-xl border border-gold/40 bg-gold/5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                    Selling Price (₹) <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gold text-base">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => handlePriceChange("price", e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal font-semibold text-lg bg-white"
                    />
                  </div>
                  <p className="text-[11px] text-charcoal/45 mt-1.5">
                    Final consumer retail price before taxes.
                  </p>
                </div>

                {/* MRP */}
                <div className="p-4 rounded-xl border border-border-gray/70 bg-cream/40">
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    Maximum Retail Price (MRP) ₹{" "}
                    <span className="text-charcoal/40 font-normal">optional</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-charcoal/40 text-base">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.mrp}
                      onChange={(e) => handlePriceChange("mrp", e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-base bg-white"
                    />
                  </div>
                  <p className="text-[11px] text-charcoal/45 mt-1.5">
                    Printed MRP on container label.
                  </p>
                </div>

                {/* Discount % */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    Discount Percentage (%){" "}
                    <span className="text-charcoal/40 font-normal">optional</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discountPercent}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountPercent: e.target.value,
                        })
                      }
                      placeholder="e.g. 15"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white pr-10"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal/40 font-bold">
                      %
                    </span>
                  </div>
                </div>

                {/* Flat Discount */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    Flat Discount Amount (₹){" "}
                    <span className="text-charcoal/40 font-normal">optional</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData({ ...formData, discount: e.target.value })
                    }
                    placeholder="e.g. 50"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                  />
                </div>

                {/* Available Stock */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    Available Stock <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({ ...formData, stock: e.target.value })
                      }
                      placeholder="0"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white pr-16"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-charcoal/40 uppercase">
                      Units
                    </span>
                  </div>
                </div>

                {/* Reserved Stock */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    Reserved Stock <span className="text-charcoal/40 font-normal">buffer · optional</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.reservedStock}
                    onChange={(e) =>
                      setFormData({ ...formData, reservedStock: e.target.value })
                    }
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: VARIANTS (pack sizes e.g. 500ml / 1L / 5L) */}
          {activeTab === "variants" && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-gold/40 bg-gold/5">
                <div>
                  <h3 className="text-sm font-bold text-charcoal flex items-center gap-2">
                    <Layers size={16} className="text-gold" />
                    Product Variants — Pack Sizes
                  </h3>
                  <p className="text-xs text-charcoal/55 mt-1">
                    Add one row per pack (e.g. 500 ml, 1 L, 5 L). Each variant gets its own SKU, price, MRP and stock. Leave empty if the product has no variants.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setVariants((prev) => [...prev, emptyVariant(formData.sku)])}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gold text-white text-xs font-bold hover:bg-gold-deep transition-colors shadow-sm"
                >
                  <Plus size={14} /> Add Variant
                </button>
              </div>

              {variants.length === 0 ? (
                <div className="text-center py-10 px-4 rounded-xl border border-dashed border-border-gray bg-white/60">
                  <div className="mx-auto w-11 h-11 rounded-full bg-gold/10 flex items-center justify-center text-gold mb-2">
                    <Layers size={20} />
                  </div>
                  <p className="text-sm font-bold text-charcoal">No variants yet</p>
                  <p className="text-xs text-charcoal/50 mt-1">
                    The base Price & Stock (previous tab) will be used. Click “Add Variant” to sell multiple pack sizes.
                  </p>
                  <button
                    type="button"
                    onClick={() => setVariants([emptyVariant(formData.sku)])}
                    className="mt-4 px-4 py-2 rounded-xl border border-gold text-gold text-xs font-bold hover:bg-gold/10 transition-colors"
                  >
                    + Add first variant
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {variants.map((v, idx) => (
                    <div
                      key={v.id}
                      className="rounded-2xl border border-border-gray/80 bg-white overflow-hidden shadow-xs"
                    >
                      <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-cream-dark/50 border-b border-border-gray/60">
                        <span className="text-xs font-bold text-charcoal flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-gold text-white text-[11px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          {variantLabel(v)}
                          <span className="font-mono font-medium text-charcoal/45">
                            {v.sku ? `• ${v.sku.toUpperCase()}` : ""}
                          </span>
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setVariants((prev) =>
                                prev.map((item) =>
                                  item.id === v.id ? { ...item, isActive: !item.isActive } : item,
                                ),
                              )
                            }
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
                              v.isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-charcoal/5 text-charcoal/50 border-border-gray"
                            }`}
                            title="Toggle variant visibility on store"
                          >
                            {v.isActive ? "Active" : "Hidden"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setVariants((prev) => prev.filter((item) => item.id !== v.id))}
                            className="p-1.5 rounded-lg text-admin-red hover:bg-admin-red-soft transition-colors"
                            title="Remove variant"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                            Pack Size <span className="text-rose-600">*</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={v.packSize}
                            onChange={(e) =>
                              setVariants((prev) =>
                                prev.map((item) => (item.id === v.id ? { ...item, packSize: e.target.value } : item)),
                              )
                            }
                            placeholder="e.g. 500"
                            className="w-full px-3 py-2 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                            Unit <span className="text-rose-600">*</span>
                          </label>
                          <select
                            value={v.packUnit}
                            onChange={(e) =>
                              setVariants((prev) =>
                                prev.map((item) => (item.id === v.id ? { ...item, packUnit: e.target.value } : item)),
                              )
                            }
                            className="w-full px-3 py-2 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                          >
                            {PACK_UNITS.map((u) => (
                              <option key={u} value={u}>{u}</option>
                            ))}
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                            Weight Label <span className="text-charcoal/40 font-normal">optional — overrides auto “{v.packSize || "—"} {v.packUnit}”</span>
                          </label>
                          <input
                            type="text"
                            value={v.weight}
                            onChange={(e) =>
                              setVariants((prev) =>
                                prev.map((item) => {
                                  if (item.id !== v.id) return item;
                                  const next = { ...item, weight: e.target.value };
                                  const parsed = parseWeightToPack(e.target.value);
                                  if (parsed.packSize) {
                                    next.packSize = parsed.packSize;
                                    next.packUnit = parsed.packUnit;
                                  }
                                  return next;
                                }),
                              )
                            }
                            placeholder="e.g. 500 ml"
                            className="w-full px-3 py-2 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                            Variant SKU <span className="text-charcoal/40 font-normal normal-case">auto if empty</span>
                          </label>
                          <input
                            type="text"
                            value={v.sku}
                            onChange={(e) =>
                              setVariants((prev) =>
                                prev.map((item) => (item.id === v.id ? { ...item, sku: e.target.value.toUpperCase() } : item)),
                              )
                            }
                            placeholder="e.g. ACC-DET-500ML"
                            className="w-full px-3 py-2 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm font-mono uppercase bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                            Price (₹) <span className="text-rose-600">*</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={v.price}
                            onChange={(e) =>
                              setVariants((prev) =>
                                prev.map((item) => (item.id === v.id ? { ...item, price: e.target.value } : item)),
                              )
                            }
                            placeholder="0.00"
                            className="w-full px-3 py-2 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm font-semibold bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                            MRP (₹){" "}
                            <span className="text-charcoal/40 font-normal">optional</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={v.mrp}
                            onChange={(e) =>
                              setVariants((prev) =>
                                prev.map((item) => (item.id === v.id ? { ...item, mrp: e.target.value } : item)),
                              )
                            }
                            placeholder="0.00"
                            className="w-full px-3 py-2 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                            Stock <span className="text-rose-600">*</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={v.stock}
                            onChange={(e) =>
                              setVariants((prev) =>
                                prev.map((item) => (item.id === v.id ? { ...item, stock: e.target.value } : item)),
                              )
                            }
                            placeholder="0"
                            className="w-full px-3 py-2 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                            Fragrance{" "}
                            <span className="text-charcoal/40 font-normal">optional</span>
                          </label>
                          <input
                            type="text"
                            value={v.fragrance}
                            onChange={(e) =>
                              setVariants((prev) =>
                                prev.map((item) => (item.id === v.id ? { ...item, fragrance: e.target.value } : item)),
                              )
                            }
                            placeholder="e.g. Lemon"
                            className="w-full px-3 py-2 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                            Color{" "}
                            <span className="text-charcoal/40 font-normal">optional</span>
                          </label>
                          <input
                            type="text"
                            value={v.color}
                            onChange={(e) =>
                              setVariants((prev) =>
                                prev.map((item) => (item.id === v.id ? { ...item, color: e.target.value } : item)),
                              )
                            }
                            placeholder="e.g. Ocean Blue"
                            className="w-full px-3 py-2 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                            Variant ID{" "}
                            <span className="text-charcoal/40 font-normal">optional</span>
                          </label>
                          <input
                            type="text"
                            value={v.variantId}
                            onChange={(e) =>
                              setVariants((prev) =>
                                prev.map((item) => (item.id === v.id ? { ...item, variantId: e.target.value } : item)),
                              )
                            }
                            placeholder="VAR-XXXXXX"
                            className="w-full px-3 py-2 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm font-mono bg-cream/40"
                          />
                        </div>
                      </div>

                      {/* Variant Images */}
                      <div className="px-4 pb-4">
                        <div className="rounded-xl border border-border-gray/70 bg-cream/30 p-3 space-y-2.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-charcoal/70">
                              Variant Images{" "}
                              <span className="text-charcoal/40 font-normal">
                                optional — empty shows default product images
                              </span>
                            </label>
                            <span className="text-[11px] font-semibold text-charcoal/50">
                              {v.existingImages.length + v.newPreviews.length} image(s)
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-border-gray text-xs font-bold text-charcoal cursor-pointer hover:border-gold transition-colors">
                              <Upload size={13} className="text-gold" />
                              Upload from computer
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const files = Array.from(e.target.files || []);
                                  e.target.value = "";
                                  if (files.length === 0) return;
                                  const valid = files.filter(isImageFile);
                                  if (valid.length !== files.length) {
                                    toast.error("Only image files (JPG, PNG, WEBP, GIF) are allowed");
                                  }
                                  if (valid.length === 0) return;
                                  setVariants((prev) =>
                                    prev.map((item) => {
                                      if (item.id !== v.id) return item;
                                      const room = Math.max(0, MAX_VARIANT_FILES - (item.existingImages.length + item.newFiles.length));
                                      const take = valid.slice(0, room);
                                      if (take.length < valid.length) {
                                        toast.error(`Max ${MAX_VARIANT_FILES} images per variant`);
                                      }
                                      const previews = take.map((file) => ({
                                        id: `${file.name}-${Date.now()}-${Math.random()}`,
                                        url: URL.createObjectURL(file),
                                        name: file.name,
                                      }));
                                      return { ...item, newFiles: [...item.newFiles, ...take], newPreviews: [...item.newPreviews, ...previews] };
                                    }),
                                  );
                                }}
                              />
                            </label>
                            <div className="flex items-center gap-2 flex-1 min-w-[220px]">
                              <input
                                type="url"
                                value={v.urlInput}
                                onChange={(e) =>
                                  setVariants((prev) =>
                                    prev.map((item) => (item.id === v.id ? { ...item, urlInput: e.target.value } : item)),
                                  )
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    addVariantImageUrl(v.id, v.urlInput);
                                  }
                                }}
                                placeholder="…or paste image URL, e.g. https://…"
                                className="flex-1 px-3 py-2 text-xs rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal bg-white"
                              />
                              <span>
                                <button
                                  type="button"
                                  onClick={() => addVariantImageUrl(v.id, v.urlInput)}
                                  className="px-3 py-2 text-xs font-bold text-white bg-gold rounded-xl hover:bg-gold-deep transition-colors"
                                >
                                  Add
                                </button>
                              </span>
                            </div>
                          </div>

                          {(v.existingImages.length > 0 || v.newPreviews.length > 0) && (
                            <div className="flex flex-wrap gap-2">
                              {v.existingImages.map((img, i) => (
                                <div key={`vimg-${i}-${img}`} className="relative w-14 h-14 rounded-lg border border-border-gray overflow-hidden bg-white group">
                                  <img src={getImageUrl(img)} alt={`Variant image ${i + 1}`} className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setVariants((prev) =>
                                        prev.map((item) =>
                                          item.id === v.id
                                            ? { ...item, existingImages: item.existingImages.filter((_, x) => x !== i) }
                                            : item,
                                        ),
                                      )
                                    }
                                    title="Remove image"
                                    className="absolute top-0.5 right-0.5 p-0.5 rounded-md bg-charcoal/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X size={11} />
                                  </button>
                                </div>
                              ))}
                              {v.newPreviews.map((p, i) => (
                                <div key={p.id} className="relative w-14 h-14 rounded-lg border border-admin-blue/50 overflow-hidden bg-white ring-1 ring-admin-blue/30 group" title={p.name}>
                                  <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                                  <span className="absolute bottom-0 inset-x-0 text-center text-[8px] font-bold bg-admin-blue text-white leading-tight">NEW</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setVariants((prev) =>
                                        prev.map((item) => {
                                          if (item.id !== v.id) return item;
                                          URL.revokeObjectURL(item.newPreviews[i]?.url);
                                          return {
                                            ...item,
                                            newFiles: item.newFiles.filter((_, x) => x !== i),
                                            newPreviews: item.newPreviews.filter((_, x) => x !== i),
                                          };
                                        }),
                                      )
                                    }
                                    title="Remove staged file"
                                    className="absolute top-0.5 right-0.5 p-0.5 rounded-md bg-charcoal/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X size={11} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => setVariants((prev) => [...prev, emptyVariant(formData.sku)])}
                    className="w-full py-3 rounded-xl border-2 border-dashed border-border-gray text-charcoal/60 text-xs font-bold hover:border-gold hover:text-gold transition-all"
                  >
                    + Add another pack size
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PACKAGING & LOGISTICS */}
          {activeTab === "packaging" && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Packaging Type */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    Packaging Type{" "}
                    <span className="text-charcoal/40 font-normal">optional</span>
                  </label>
                  <select
                    value={formData.packagingType}
                    onChange={(e) =>
                      setFormData({ ...formData, packagingType: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                  >
                    {PACKAGING_TYPES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Material */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    Bottle / Can Material{" "}
                    <span className="text-charcoal/40 font-normal">optional</span>
                  </label>
                  <input
                    type="text"
                    list="material-list"
                    value={formData.packagingMaterial}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        packagingMaterial: e.target.value,
                      })
                    }
                    placeholder="HDPE Plastic"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                  />
                  <datalist id="material-list">
                    {PACKAGING_MATERIALS.map((m) => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>
                </div>

                {/* Closure */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    Cap / Closure Type{" "}
                    <span className="text-charcoal/40 font-normal">optional</span>
                  </label>
                  <input
                    type="text"
                    list="closure-list"
                    value={formData.closureType}
                    onChange={(e) =>
                      setFormData({ ...formData, closureType: e.target.value })
                    }
                    placeholder="Screw Cap with Seal"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                  />
                  <datalist id="closure-list">
                    {CLOSURE_TYPES.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>

                {/* HSN Code */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    HSN Code (Tax code){" "}
                    <span className="text-charcoal/40 font-normal">optional</span>
                  </label>
                  <input
                    type="text"
                    value={formData.hsnCode}
                    onChange={(e) =>
                      setFormData({ ...formData, hsnCode: e.target.value })
                    }
                    placeholder="e.g. 3402"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                  />
                </div>

                {/* GST Rate */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    GST Rate{" "}
                    <span className="text-charcoal/40 font-normal">optional</span>
                  </label>
                  <input
                    type="text"
                    value={formData.gstRate}
                    onChange={(e) =>
                      setFormData({ ...formData, gstRate: e.target.value })
                    }
                    placeholder="e.g. 18%"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                  />
                </div>

                {/* Batch Number */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    Batch Number{" "}
                    <span className="text-charcoal/40 font-normal">optional</span>
                  </label>
                  <input
                    type="text"
                    value={formData.batchNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, batchNumber: e.target.value })
                    }
                    placeholder="e.g. ACC-2026-B01"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                  />
                </div>

                {/* Manufacturing Date */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    Mfg Date{" "}
                    <span className="text-charcoal/40 font-normal">optional</span>
                  </label>
                  <input
                    type="date"
                    value={formData.manufacturingDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        manufacturingDate: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                  />
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    Expiry Date{" "}
                    <span className="text-charcoal/40 font-normal">optional</span>
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) =>
                      setFormData({ ...formData, expiryDate: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                  />
                </div>

                {/* Shelf Life */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    Shelf Life Duration{" "}
                    <span className="text-charcoal/40 font-normal">optional</span>
                  </label>
                  <input
                    type="text"
                    value={formData.shelfLife}
                    onChange={(e) =>
                      setFormData({ ...formData, shelfLife: e.target.value })
                    }
                    placeholder="e.g. 24 Months from Mfg"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                  />
                </div>

                {/* Storage Instructions */}
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    Storage Guidelines{" "}
                    <span className="text-charcoal/40 font-normal">optional</span>
                  </label>
                  <input
                    type="text"
                    value={formData.storageInstructions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        storageInstructions: e.target.value,
                      })
                    }
                    placeholder="Store in a cool and well-ventilated dry place. Keep container tightly sealed."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                  />
                </div>

                {/* Certifications */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    Certifications <span className="text-charcoal/40 font-normal">comma-separated · optional</span>
                  </label>
                  <input
                    type="text"
                    value={formData.certifications}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        certifications: e.target.value,
                      })
                    }
                    placeholder="ISO 9001:2015, GMP Certified, Biodegradable"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                  />
                </div>

                {/* Warranty */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    Quality Guarantee / Warranty{" "}
                    <span className="text-charcoal/40 font-normal">optional</span>
                  </label>
                  <input
                    type="text"
                    value={formData.warranty}
                    onChange={(e) =>
                      setFormData({ ...formData, warranty: e.target.value })
                    }
                    placeholder="100% Quality Satisfaction"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: USAGE & SAFETY */}
          {activeTab === "safety" && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Usage Instructions */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    Directions for Use{" "}
                    <span className="text-charcoal/40 font-normal">optional</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formData.usageInstructions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        usageInstructions: e.target.value,
                      })
                    }
                    placeholder="Pour recommended dosage into wash compartment or directly onto damp cloth/sponge. Scrub gently and rinse."
                    className="w-full px-3.5 py-2 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white resize-none"
                  />
                </div>

                {/* Dilution Instructions */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    Dilution Ratio / Guide{" "}
                    <span className="text-charcoal/40 font-normal">optional</span>
                  </label>
                  <input
                    type="text"
                    value={formData.dilutionInstructions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dilutionInstructions: e.target.value,
                      })
                    }
                    placeholder="e.g. 1 cap (20ml) in 4 Liters of water"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                  />
                </div>

                {/* Recommended Dosage */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    Recommended Dosage{" "}
                    <span className="text-charcoal/40 font-normal">optional</span>
                  </label>
                  <input
                    type="text"
                    value={formData.recommendedDosage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recommendedDosage: e.target.value,
                      })
                    }
                    placeholder="e.g. 15ml per 5kg load"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                  />
                </div>

                {/* Suitable For */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    Suitable Surfaces / Fabrics <span className="text-charcoal/40 font-normal">comma-separated · optional</span>
                  </label>
                  <input
                    type="text"
                    value={formData.suitableFor}
                    onChange={(e) =>
                      setFormData({ ...formData, suitableFor: e.target.value })
                    }
                    placeholder="Ceramic tiles, Marble, Granites, Cotton, Linen"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                  />
                </div>

                {/* Not Suitable For */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    Not Suitable For <span className="text-charcoal/40 font-normal">comma-separated · optional</span>
                  </label>
                  <input
                    type="text"
                    value={formData.notSuitableFor}
                    onChange={(e) =>
                      setFormData({ ...formData, notSuitableFor: e.target.value })
                    }
                    placeholder="Unsealed wood, Pure Silk, Raw brass, Aluminum"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                  />
                </div>

                {/* Safety Flags */}
                <div className="md:col-span-2 pt-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-charcoal/60 mb-2">
                    Chemical Safety Safeguards
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <BoolToggle
                      label="Keep Away From Children"
                      description="Include warning emblem on packaging"
                      value={formData.keepAwayFromChildren}
                      onChange={(v) =>
                        setFormData({ ...formData, keepAwayFromChildren: v })
                      }
                    />
                    <BoolToggle
                      label="Avoid Eye Contact"
                      description="Harmful upon contact with eyes"
                      value={formData.avoidEyeContact}
                      onChange={(v) =>
                        setFormData({ ...formData, avoidEyeContact: v })
                      }
                    />
                    <BoolToggle
                      label="Do Not Ingest"
                      description="Harmful or toxic if swallowed"
                      value={formData.doNotIngest}
                      onChange={(v) =>
                        setFormData({ ...formData, doNotIngest: v })
                      }
                    />
                    <BoolToggle
                      label="Do Not Mix Cleaners"
                      description="Never combine with bleach or acids"
                      value={formData.doNotMixWithOtherCleaners}
                      onChange={(v) =>
                        setFormData({
                          ...formData,
                          doNotMixWithOtherCleaners: v,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Safety Instructions */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    Safety Instructions / General Warnings{" "}
                    <span className="text-charcoal/40 font-normal">optional</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formData.safetyInstructions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        safetyInstructions: e.target.value,
                      })
                    }
                    placeholder="e.g. For external cleaning use only. Store in a dry place. Wear gloves if you have sensitive skin."
                    className="w-full px-3.5 py-2 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white resize-none"
                  />
                </div>

                {/* First Aid */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                    First Aid Measures{" "}
                    <span className="text-charcoal/40 font-normal">optional</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formData.firstAidInstructions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        firstAidInstructions: e.target.value,
                      })
                    }
                    placeholder="In case of contact with eyes: Rinse with pure water for 15 minutes. If swallowed: Do not induce vomiting, drink water and consult doctor."
                    className="w-full px-3.5 py-2 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: MEDIA & MARKETING */}
          {activeTab === "media" && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              {/* Image Studio Section */}
              <div className="rounded-2xl border border-border-gray bg-light-gray/40 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border-gray/60">
                  <div>
                    <div className="flex items-center gap-2">
                      <ImageIcon size={18} className="text-gold" />
                      <h3 className="text-sm font-bold text-charcoal">
                        Product Media & Image Gallery
                      </h3>
                    </div>
                    <p className="text-xs text-charcoal/60 mt-0.5">
                      Upload multiple images, rearrange order, set primary cover, or add external image URLs.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white border border-border-gray text-charcoal shadow-xs">
                      Total Images:{" "}
                      <strong className="text-gold">
                        {existingImages.length + newFilePreviews.length}
                      </strong>
                    </span>
                    {newFilePreviews.length > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-admin-blue-soft text-admin-blue border border-admin-blue/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-admin-blue animate-pulse" />
                        {newFilePreviews.length} Staged
                      </span>
                    )}
                  </div>
                </div>

                {/* Upload & URL Bar */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Multi-file Dropzone */}
                  <div className="lg:col-span-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        handleFilesSelected(e.target.files);
                        if (e.target) e.target.value = "";
                      }}
                      className="hidden"
                    />
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`group relative w-full min-h-[140px] rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-5 text-center ${
                        isDragging
                          ? "border-gold bg-gold/10 ring-2 ring-gold/20 scale-[0.99]"
                          : "border-border-gray bg-white hover:border-gold/70 hover:bg-cream/40"
                      }`}
                    >
                      <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/10 text-gold group-hover:scale-110 transition-transform">
                        <Upload size={20} />
                      </div>
                      <p className="text-xs font-bold text-charcoal">
                        Choose Multiple Images or Drag & Drop Here
                      </p>
                      <p className="text-[11px] text-charcoal/50 mt-0.5">
                        PNG, JPG, WEBP, GIF (up to 10MB per image) — Select multiple files at once
                      </p>
                    </div>
                  </div>

                  {/* Add Image by URL */}
                  <div className="flex flex-col justify-between rounded-2xl border border-border-gray bg-white p-4 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-charcoal mb-1">
                        Add Image by URL
                      </label>
                      <p className="text-[11px] text-charcoal/50 mb-2">
                        Paste a direct URL to an image hosted on CDN or web.
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="url"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addImageUrl();
                            }
                          }}
                          placeholder="https://example.com/image.jpg"
                          className="flex-1 px-3 py-2 text-xs rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal bg-white"
                        />
                        <button
                          type="button"
                          onClick={addImageUrl}
                          className="px-3 py-2 text-xs font-bold text-white bg-gold rounded-xl hover:bg-gold-deep transition-colors shrink-0"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                    <div className="text-[11px] text-charcoal/40 italic">
                      Tip: The first image in the gallery is the primary cover image.
                    </div>
                  </div>
                </div>

                {/* Gallery Items Grid */}
                {existingImages.length === 0 && newFilePreviews.length === 0 ? (
                  <div className="text-center py-8 px-4 rounded-xl border border-dashed border-border-gray bg-white/60">
                    <div className="mx-auto w-10 h-10 rounded-full bg-charcoal/5 flex items-center justify-center text-charcoal/40 mb-2">
                      <ImageIcon size={20} />
                    </div>
                    <p className="text-xs font-semibold text-charcoal/70">
                      No images added yet
                    </p>
                    <p className="text-[11px] text-charcoal/40 mt-0.5">
                      Upload one or more container photos to showcase this product.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-charcoal/60 font-semibold px-1">
                      <span>Image Gallery ({existingImages.length + newFilePreviews.length} items)</span>
                      {newFilePreviews.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            newFilePreviews.forEach((p) => URL.revokeObjectURL(p.url));
                            setSelectedFiles([]);
                            setNewFilePreviews([]);
                          }}
                          className="text-[11px] text-admin-red hover:underline font-medium"
                        >
                          Clear staged uploads
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {/* Saved Existing Images */}
                      {existingImages.map((imgUrl, index) => {
                        const isCover = index === 0;
                        return (
                          <div
                            key={`existing-${index}-${imgUrl}`}
                            className={`group relative rounded-xl border overflow-hidden bg-white shadow-xs transition-all flex flex-col ${
                              isCover
                                ? "border-gold ring-2 ring-gold/20"
                                : "border-border-gray hover:border-charcoal/40"
                            }`}
                          >
                            {/* Preview Area */}
                            <div className="relative aspect-square w-full bg-cream/30 flex items-center justify-center p-2 overflow-hidden">
                              <img
                                src={getImageUrl(imgUrl)}
                                alt={`Product image ${index + 1}`}
                                className="w-full h-full object-contain"
                              />
                              {/* Index Badge */}
                              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-charcoal/80 text-white backdrop-blur-xs">
                                #{index + 1}
                              </span>
                              {/* Cover Badge */}
                              {isCover ? (
                                <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-gold text-white shadow-xs flex items-center gap-0.5">
                                  <Star size={10} className="fill-current" /> Cover
                                </span>
                              ) : (
                                <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-charcoal/10 text-charcoal/70">
                                  Saved
                                </span>
                              )}
                            </div>

                            {/* Actions Toolbar */}
                            <div className="p-1.5 bg-light-gray/80 border-t border-border-gray/60 flex items-center justify-between gap-1">
                              <div className="flex items-center gap-0.5">
                                {index > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => moveExistingImage(index, "left")}
                                    title="Move left"
                                    className="p-1 rounded-md text-charcoal/60 hover:text-charcoal hover:bg-white border border-transparent hover:border-border-gray transition-all"
                                  >
                                    <ArrowLeft size={12} />
                                  </button>
                                )}
                                {index < existingImages.length - 1 && (
                                  <button
                                    type="button"
                                    onClick={() => moveExistingImage(index, "right")}
                                    title="Move right"
                                    className="p-1 rounded-md text-charcoal/60 hover:text-charcoal hover:bg-white border border-transparent hover:border-border-gray transition-all"
                                  >
                                    <ArrowRight size={12} />
                                  </button>
                                )}
                                {!isCover && (
                                  <button
                                    type="button"
                                    onClick={() => setCoverExistingImage(index)}
                                    title="Set as cover image"
                                    className="p-1 rounded-md text-gold hover:text-gold-deep hover:bg-gold/10 transition-all text-[11px] font-semibold flex items-center"
                                  >
                                    <Star size={12} />
                                  </button>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => removeExistingImage(index)}
                                title="Remove image"
                                className="p-1 rounded-md text-admin-red hover:text-admin-red-dark hover:bg-admin-red-soft transition-all"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {/* Staged New Files */}
                      {newFilePreviews.map((preview, index) => {
                        const totalIndex = existingImages.length + index + 1;
                        return (
                          <div
                            key={preview.id}
                            className="group relative rounded-xl border border-admin-blue/40 overflow-hidden bg-white shadow-xs transition-all flex flex-col ring-1 ring-admin-blue/20"
                          >
                            {/* Preview Area */}
                            <div className="relative aspect-square w-full bg-admin-blue-soft/30 flex items-center justify-center p-2 overflow-hidden">
                              <img
                                src={preview.url}
                                alt={preview.name}
                                className="w-full h-full object-contain"
                              />
                              {/* Index Badge */}
                              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-admin-blue text-white shadow-xs">
                                #{totalIndex}
                              </span>
                              {/* Staged Badge */}
                              <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-admin-blue text-white shadow-xs flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> New
                              </span>
                            </div>

                            {/* Info */}
                            <div className="px-2 py-1 bg-white border-t border-border-gray/50">
                              <p className="text-[10px] font-medium text-charcoal truncate" title={preview.name}>
                                {preview.name}
                              </p>
                              <p className="text-[9px] text-charcoal/40">{preview.size}</p>
                            </div>

                            {/* Actions Toolbar */}
                            <div className="p-1.5 bg-admin-blue-soft/40 border-t border-admin-blue/20 flex items-center justify-between gap-1">
                              {index > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setCoverNewFile(index)}
                                  title="Move to front of uploads"
                                  className="p-1 rounded-md text-admin-blue hover:text-admin-blue-dark hover:bg-white text-[11px] font-semibold flex items-center gap-0.5"
                                >
                                  <Star size={12} />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => removeNewFile(index)}
                                title="Remove staged file"
                                className="ml-auto p-1 rounded-md text-admin-red hover:text-admin-red-dark hover:bg-admin-red-soft transition-all"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* SEO & Flags Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Video URL */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                      Product Demo Video URL{" "}
                    <span className="text-charcoal/40 font-normal">optional</span>
                    </label>
                    <input
                      type="text"
                      value={formData.videoUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, videoUrl: e.target.value })
                      }
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                      Search Tags <span className="text-charcoal/40 font-normal">comma-separated · optional</span>
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) =>
                        setFormData({ ...formData, tags: e.target.value })
                      }
                      placeholder="detergent, liquid, stain remover, laundry, 5L"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                    />
                  </div>

                  {/* Keywords */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                      SEO Keywords <span className="text-charcoal/40 font-normal">comma-separated · optional</span>
                    </label>
                    <input
                      type="text"
                      value={formData.keywords}
                      onChange={(e) =>
                        setFormData({ ...formData, keywords: e.target.value })
                      }
                      placeholder="best floor cleaner, concentrated dishwash gel"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                    />
                  </div>

                  {/* Meta Title */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                      Meta Title{" "}
                      <span className="text-charcoal/40 font-normal">optional</span>
                    </label>
                    <input
                      type="text"
                      value={formData.metaTitle}
                      onChange={(e) =>
                        setFormData({ ...formData, metaTitle: e.target.value })
                      }
                      placeholder="Accurate Pro Clean | Buy Online"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white"
                    />
                  </div>

                  {/* Meta Description */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                      Meta Description{" "}
                      <span className="text-charcoal/40 font-normal">optional</span>
                    </label>
                    <textarea
                      rows={2}
                      value={formData.metaDescription}
                      onChange={(e) =>
                        setFormData({ ...formData, metaDescription: e.target.value })
                      }
                      placeholder="Short SEO summary shown in search results…"
                      className="w-full px-3.5 py-2 rounded-xl border border-border-gray focus:outline-none focus:border-gold text-charcoal text-sm bg-white resize-none"
                    />
                  </div>
                </div>

                {/* Badges / Promotion Flags */}
                <div className="lg:col-span-5 pt-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-charcoal/60 mb-2">
                    Catalog Badges & Highlights
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <BoolToggle
                      label="Featured"
                      value={formData.isFeatured}
                      onChange={(v) =>
                        setFormData({ ...formData, isFeatured: v })
                      }
                    />
                    <BoolToggle
                      label="New Arrival"
                      value={formData.isNewArrival}
                      onChange={(v) =>
                        setFormData({ ...formData, isNewArrival: v })
                      }
                    />
                    <BoolToggle
                      label="Bestseller"
                      value={formData.isBestseller}
                      onChange={(v) =>
                        setFormData({ ...formData, isBestseller: v })
                      }
                    />
                    <BoolToggle
                      label="Premium Brand"
                      value={formData.isPremium}
                      onChange={(v) =>
                        setFormData({ ...formData, isPremium: v })
                      }
                    />
                  </div>
                </div>

                {/* Active Switch */}
                <div className="lg:col-span-2">
                  <BoolToggle
                    label="Product Visibility (Active)"
                    description="When disabled, this product is completely hidden from user store and search."
                    value={formData.isActive}
                    onChange={(v) =>
                      setFormData({ ...formData, isActive: v })
                    }
                  />
                </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
