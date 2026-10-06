"use client";

import { useState, useEffect, useMemo } from "react";
import { apiRequest } from "@/lib/api-client";
import { validatePhone, isValidPhone } from "@/lib/utils";
import Modal from "@/components/admin/Modal";
import { useDialog } from "@/components/admin/ConfirmDialog";
import { PageHeader, StatStrip } from "@/components/admin/AdminShell";
import { DataTable, type ColumnDef } from "@/components/admin/DataTable";
import {
  Plus,
  RefreshCw,
  Key,
  Lock,
  Power,
  Trash2,
  LayoutDashboard,
  Wallet,
  ShoppingBag,
  BarChart3,
  Package,
  Tags,
  Star,
  Image as ImageIcon,
  Percent,
  Tag,
  Truck,
  Activity,
  Eye,
  EyeOff,
  ChevronDown,
} from "lucide-react";
import {
  ADMIN_PERMISSION_AREAS_DETAILED as ADMIN_PERMISSION_AREAS,
  ADMIN_ONLY_SECTIONS,
  allPermissionKeys,
} from "@/lib/admin-permissions";
import {
  modalInputCls,
  stackedLabelCls,
  formatBillDate,
} from "@/lib/admin-ui";
import { useToast } from "@/components/ui/Toast";
import type { Manager } from "@/lib/types/api";

interface ManagerRecord extends Manager {
  permissions: string[];
  status: "active" | "inactive";
}

interface ManagerRow extends Record<string, any> {
  id: string;
  name: string;
  email: string;
  phone: string;
  permissionCount: number;
  status: "active" | "inactive";
  createdAt: string;
  _raw: ManagerRecord;
}

const SECTION_ICONS: Record<
  string,
  React.ComponentType<{ size?: number | string; className?: string }>
> = {
  dashboard: LayoutDashboard,
  accounts: Wallet,
  orders: ShoppingBag,
  reports: BarChart3,
  products: Package,
  categories: Tags,
  banners: ImageIcon,
  offers: Percent,
  coupons: Tag,
  shipping: Truck,
  testimonials: Star,
  activity_log: Activity,
};

const ALL_KEYS = allPermissionKeys;

function permsToObject(perms: string[]) {
  const obj: Record<string, boolean> = {};
  ALL_KEYS.forEach((k) => {
    obj[k] = perms.includes(k);
  });
  return obj;
}

function getUserId(m: ManagerRecord): string {
  const u: any = m.user;
  return typeof u === "string" ? u : (u?._id ?? m._id);
}

function fullName(m: ManagerRecord): string {
  const u: any = m.user;
  if (!u || typeof u === "string") return "Manager";
  return `${u.firstname || ""} ${u.lastname || ""}`.trim() || "Manager";
}

function userEmail(m: ManagerRecord): string {
  const u: any = m.user;
  return typeof u === "string" ? "" : (u?.email ?? "");
}

function userPhone(m: ManagerRecord): string {
  const u: any = m.user;
  return typeof u === "string" ? "" : (u?.phone ?? "");
}

const emptyForm = {
  firstname: "",
  lastname: "",
  email: "",
  phone: "",
  password: "",
  permissions: permsToObject([]),
};

export default function Managers() {
  const { alert, confirm } = useDialog();
  const toast = useToast();
  const [managers, setManagers] = useState<ManagerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingManager, setEditingManager] = useState<ManagerRecord | null>(
    null,
  );
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ ...emptyForm });

  // Row-level busy state for status toggle / delete.
  const [busyId, setBusyId] = useState<string | null>(null);

  // Reset-password modal state.
  const [resetTarget, setResetTarget] = useState<ManagerRecord | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState("");

  const allSections = ADMIN_PERMISSION_AREAS.flatMap((a) => a.sections).map(
    (s) => s.key,
  );
  const allOpen = allSections.every((k) => openSections.has(k));

  function toggleSection(key: string) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const expandAllSections = () => setOpenSections(new Set(allSections));
  const collapseAllSections = () => setOpenSections(new Set());

  async function fetchManagers() {
    setLoading(true);
    try {
      const data: any = await apiRequest("/managers");
      const list = Array.isArray(data) ? data : data?.items || [];
      setManagers(list);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load managers");
      setManagers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchManagers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetForm() {
    setFormData({ ...emptyForm, permissions: permsToObject([]) });
    setEditingManager(null);
    setError("");
    setShowPassword(false);
  }

  function openCreate() {
    resetForm();
    setOpenSections(new Set());
    setIsModalOpen(true);
  }

  function openEdit(manager: ManagerRecord) {
    setEditingManager(manager);
    setFormData({
      firstname: (manager.user as any)?.firstname ?? "",
      lastname: (manager.user as any)?.lastname ?? "",
      email: userEmail(manager),
      phone: userPhone(manager),
      password: "",
      permissions: permsToObject(manager.permissions || []),
    });
    setOpenSections(new Set());
    setError("");
    setIsModalOpen(true);
  }

  const grantedKeys = ALL_KEYS.filter((k) => formData.permissions[k]);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
  const passwordOk = formData.password.length >= 8;
  const phoneOk =
    !formData.phone.trim() || isValidPhone(formData.phone.trim());
  const newManagerValid =
    formData.firstname.trim() &&
    formData.lastname.trim() &&
    emailValid &&
    passwordOk &&
    phoneOk;
  const valid = editingManager ? true : !!newManagerValid;

  async function handleSubmit() {
    setError("");

    if (!editingManager) {
      if (!formData.firstname.trim() || !formData.lastname.trim()) {
        return setError("First and last name are both required.");
      }
      if (!emailValid) return setError("Enter a valid email address.");
      if (!phoneOk)
        return setError("Enter a valid 10-digit mobile number or leave it blank.");
      if (!passwordOk)
        return setError("The password must be at least 8 characters.");
    }

    if (grantedKeys.length === 0) {
      const ok = await confirm(
        "This manager has no permissions granted, so they will see an empty dashboard. Save anyway?",
        "No Permissions Granted",
      );
      if (!ok) return;
    }

    setSubmitting(true);
    try {
      if (editingManager) {
        await apiRequest(`/managers/${getUserId(editingManager)}/permissions`, {
          method: "PATCH",
          body: JSON.stringify({ permissions: grantedKeys }),
        });
        toast.success("Manager permissions updated");
      } else {
        await apiRequest("/managers", {
          method: "POST",
          body: JSON.stringify({
            firstname: formData.firstname.trim(),
            lastname: formData.lastname.trim(),
            email: formData.email.trim().toLowerCase(),
            phone: formData.phone.trim() || undefined,
            password: formData.password,
            permissions: grantedKeys,
          }),
        });
        toast.success("Manager created successfully");
      }

      setIsModalOpen(false);
      resetForm();
      await fetchManagers();
      await alert(
        editingManager ? "Permissions updated." : "Manager created.",
        "success",
      );
    } catch (err: any) {
      setError(err.message || "Failed to save manager");
      toast.error(err.message || "Failed to save manager");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleStatus(manager: ManagerRecord) {
    const newStatus = manager.status === "active" ? "inactive" : "active";
    if (newStatus === "inactive") {
      const ok = await confirm(
        `Deactivate ${fullName(manager)}? They won't be able to sign in.`,
        "Deactivate Manager",
      );
      if (!ok) return;
    }
    setBusyId(manager._id);
    try {
      await apiRequest(`/managers/${getUserId(manager)}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      await fetchManagers();
      toast.success(
        newStatus === "active" ? "Manager activated" : "Manager deactivated",
      );
    } catch (err: any) {
      await alert(err.message || "Failed to update status", "error");
      toast.error(err.message || "Failed to update status");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(manager: ManagerRecord) {
    const ok = await confirm(
      `Delete ${fullName(manager)} (${userEmail(manager)})? They will be signed out immediately and won't be able to log in. This cannot be undone.`,
      "Delete Manager",
    );
    if (!ok) return;
    setBusyId(manager._id);
    try {
      await apiRequest(`/managers/${getUserId(manager)}`, {
        method: "DELETE",
      });
      await fetchManagers();
      toast.success("Manager deleted");
    } catch (err: any) {
      await alert(err.message || "Failed to delete manager", "error");
      toast.error(err.message || "Failed to delete manager");
    } finally {
      setBusyId(null);
    }
  }

  function openReset(manager: ManagerRecord) {
    setResetTarget(manager);
    setResetPassword("");
    setShowResetPassword(false);
    setResetError("");
  }

  async function handleResetPassword() {
    if (!resetTarget) return;
    setResetError("");
    if (resetPassword.length < 8) {
      return setResetError("The new password must be at least 8 characters.");
    }
    setResetting(true);
    try {
      await apiRequest(`/managers/${getUserId(resetTarget)}/password`, {
        method: "PATCH",
        body: JSON.stringify({ password: resetPassword }),
      });
      setResetTarget(null);
      setResetPassword("");
      toast.success(`Password reset for ${fullName(resetTarget)}`);
      await alert(
        `The password for ${fullName(resetTarget)} has been updated. Share it with them directly — it isn't emailed.`,
        "success",
      );
    } catch (err: any) {
      setResetError(err.message || "Failed to reset password");
      toast.error(err.message || "Failed to reset password");
    } finally {
      setResetting(false);
    }
  }

  const rows: ManagerRow[] = useMemo(
    () =>
      managers.map((m) => ({
        id: m._id,
        _id: m._id,
        name: fullName(m),
        email: userEmail(m),
        phone: userPhone(m) || "—",
        permissionCount: (m.permissions || []).length,
        status: m.status,
        createdAt: (m as any).createdAt || "",
        _raw: m,
      })),
    [managers],
  );

  const activeCount = managers.filter((m) => m.status === "active").length;
  const inactiveCount = managers.length - activeCount;

  const columns: ColumnDef<ManagerRow>[] = [
    {
      key: "name",
      label: "Manager",
      render: (_val, r) => (
        <div className="min-w-0">
          <p className="font-medium text-charcoal truncate">{r.name}</p>
          <p className="text-xs text-charcoal/50 truncate">{r.email}</p>
        </div>
      ),
      sortValue: (r) => r.name.toLowerCase(),
    },
    {
      key: "phone",
      label: "Phone",
      hideOnMobile: true,
      render: (v: string) => (
        <span className="font-mono text-xs text-charcoal/70">{v}</span>
      ),
    },
    {
      key: "permissionCount",
      label: "Permissions",
      align: "center",
      render: (v: number) => (
        <span
          className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full tabular-nums ${
            v === ALL_KEYS.length
              ? "bg-emerald-50 text-emerald-700"
              : v > 0
                ? "bg-gold/15 text-gold-deep"
                : "bg-charcoal/5 text-charcoal/45"
          }`}
        >
          {v}/{ALL_KEYS.length}
        </span>
      ),
      sortValue: (r) => r.permissionCount,
    },
    {
      key: "status",
      label: "Status",
      align: "center",
      render: (v: string) =>
        v === "active" ? (
          <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700">
            Active
          </span>
        ) : (
          <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-charcoal/5 text-charcoal/55">
            Inactive
          </span>
        ),
    },
    {
      key: "createdAt",
      label: "Added",
      hideOnMobile: true,
      render: (v: string) => (
        <span className="text-xs text-charcoal/60">
          {v ? formatBillDate(v) : "—"}
        </span>
      ),
      sortValue: (r) => (r.createdAt ? new Date(r.createdAt).getTime() : 0),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Managers"
        description="Create manager logins and control what each manager can see and do"
        actions={
          <>
            <button
              onClick={fetchManagers}
              className="btn-secondary flex items-center gap-2 text-xs py-2 px-3"
              disabled={loading}
            >
              <RefreshCw
                size={14}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 btn-primary px-5 py-2.5"
            >
              <Plus size={18} /> Add Manager
            </button>
          </>
        }
      />

      <StatStrip
        stats={[
          { label: "Total Managers", value: managers.length },
          { label: "Active", value: activeCount, tone: "good" },
          { label: "Inactive", value: inactiveCount, tone: "due" },
        ]}
        columns={3}
      />

      <DataTable<ManagerRow>
        columns={columns}
        data={rows}
        loading={loading}
        headerRight={`${rows.length} manager${rows.length === 1 ? "" : "s"}`}
        searchPlaceholder="Search by name, email or phone…"
        exportFileName="managers"
        emptyTitle="No managers yet"
        emptyDescription="Create the first manager login to delegate work without sharing the admin account."
        emptyAction={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 btn-primary px-5 py-2.5 mt-1"
          >
            <Plus size={16} /> Add Manager
          </button>
        }
        onEdit={(row) => openEdit(row._raw)}
        customActions={(row) => (
          <>
            <button
              type="button"
              disabled={busyId === row.id}
              onClick={() => toggleStatus(row._raw)}
              title={
                row.status === "active"
                  ? "Deactivate manager"
                  : "Activate manager"
              }
              className={`inline-flex items-center gap-1 rounded px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors disabled:opacity-50 ${
                row.status === "active"
                  ? "bg-charcoal/5 text-charcoal/60 hover:bg-rose-gold/10 hover:text-rose-gold"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              <Power size={13} />
              {row.status === "active" ? "Deactivate" : "Activate"}
            </button>
            <button
              type="button"
              onClick={() => openReset(row._raw)}
              title="Reset password"
              className="p-1.5 text-gold-deep hover:text-gold rounded hover:bg-gold/10 transition-colors"
            >
              <Key size={16} />
            </button>
            <button
              type="button"
              disabled={busyId === row.id}
              onClick={() => handleDelete(row._raw)}
              title="Delete manager"
              className="p-1.5 text-rose-gold hover:text-rose-gold/80 rounded hover:bg-rose-gold/10 transition-colors disabled:opacity-50"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      />

      {/* Add / Edit Manager Modal */}
      <Modal
        isOpen={isModalOpen}
        title={editingManager ? "Edit Permissions" : "Add Manager"}
        subtitle={
          editingManager
            ? `${fullName(editingManager)} · ${userEmail(editingManager)}`
            : "Create the account, then tick what they're allowed to do."
        }
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        onSubmit={handleSubmit}
        submitLabel={editingManager ? "Update Permissions" : "Create Manager"}
        submitting={submitting}
        disabled={!valid}
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-rose-gold/10 border border-rose-gold/25 text-rose-gold px-3 py-2 rounded-sm text-sm">
              {error}
            </div>
          )}

          {!editingManager && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={stackedLabelCls}>
                    First Name <span className="text-rose-gold">*</span>
                  </label>
                  <input
                    type="text"
                    tabIndex={1}
                    value={formData.firstname}
                    onChange={(e) => {
                      setFormData({ ...formData, firstname: e.target.value });
                      setError("");
                    }}
                    placeholder="First name"
                    className={modalInputCls}
                  />
                </div>
                <div>
                  <label className={stackedLabelCls}>
                    Last Name <span className="text-rose-gold">*</span>
                  </label>
                  <input
                    type="text"
                    tabIndex={2}
                    value={formData.lastname}
                    onChange={(e) => {
                      setFormData({ ...formData, lastname: e.target.value });
                      setError("");
                    }}
                    placeholder="Last name"
                    className={modalInputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={stackedLabelCls}>
                    Email <span className="text-rose-gold">*</span>
                  </label>
                  <input
                    type="email"
                    tabIndex={3}
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      setError("");
                    }}
                    placeholder="manager@accurateliquid.com"
                    className={`${modalInputCls} ${formData.email && !emailValid ? "border-rose-gold" : ""}`}
                  />
                </div>
                <div>
                  <label className={stackedLabelCls}>Phone</label>
                  <input
                    type="tel"
                    tabIndex={4}
                    inputMode="numeric"
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone: validatePhone(e.target.value),
                      })
                    }
                    placeholder="9876543210"
                    className={`${modalInputCls} ${formData.phone && !phoneOk ? "border-rose-gold" : ""}`}
                  />
                  {formData.phone && !phoneOk && (
                    <p className="text-[11px] text-rose-gold mt-1">
                      Enter a valid 10-digit mobile number.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className={stackedLabelCls}>
                  Password <span className="text-rose-gold">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    tabIndex={5}
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      setError("");
                    }}
                    placeholder="At least 8 characters"
                    className={`${modalInputCls} pr-10 ${formData.password && !passwordOk ? "border-rose-gold" : ""}`}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-charcoal/40 hover:text-charcoal rounded"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p
                  className={`text-[11px] mt-1 ${formData.password && !passwordOk ? "text-rose-gold" : "text-charcoal/50"}`}
                >
                  Minimum 8 characters. Share it with them directly.
                </p>
              </div>
            </>
          )}

          <div>
            <div className="flex items-center justify-between gap-2 mb-3 sticky top-0 bg-white py-1 z-10">
              <div className="flex items-center gap-2">
                <Key size={15} className="text-gold" />
                <label className="text-sm font-semibold text-charcoal">
                  Permissions
                </label>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    grantedKeys.length === 0
                      ? "bg-rose-gold/10 text-rose-gold"
                      : "bg-gold/15 text-gold-deep"
                  }`}
                >
                  {grantedKeys.length} / {ALL_KEYS.length}
                </span>
              </div>
              <button
                type="button"
                onClick={allOpen ? collapseAllSections : expandAllSections}
                className="text-xs font-semibold text-gold-deep hover:underline transition-colors"
              >
                {allOpen ? "Collapse all" : "Expand all"}
              </button>
            </div>

            {grantedKeys.length === 0 && (
              <p className="text-[11px] text-rose-gold mb-2">
                Nothing granted yet — this manager would see an empty dashboard.
              </p>
            )}

            <div
              className="space-y-4 max-h-80 overflow-y-auto pr-1"
              data-lenis-prevent
            >
              {ADMIN_PERMISSION_AREAS.map((area) => (
                <div
                  key={area.title}
                  className="bg-cream/40 rounded-sm p-3.5 border border-cream-dark space-y-2.5"
                >
                  <h4 className="font-semibold text-sm text-charcoal flex items-center gap-2 border-b border-cream-dark pb-1.5">
                    {area.title}
                  </h4>
                  <div className="space-y-1.5">
                    {area.sections.map((section) => {
                      const SectionIcon = SECTION_ICONS[section.key];
                      const isOpen = openSections.has(section.key);
                      const sectionKeys = section.actions.map(
                        (a) => `${section.key}:${a.key}`,
                      );
                      const granted = sectionKeys.filter(
                        (k) => formData.permissions[k],
                      ).length;
                      const allGranted = granted === sectionKeys.length;
                      return (
                        <div
                          key={section.key}
                          className="rounded-sm border border-border-gray bg-white overflow-hidden"
                        >
                          <div className="w-full flex items-center justify-between gap-2 px-3 py-2 hover:bg-cream transition-colors">
                            <button
                              type="button"
                              onClick={() => toggleSection(section.key)}
                              className="flex-1 flex items-center gap-1.5 text-left min-w-0"
                            >
                              <ChevronDown
                                size={14}
                                className={`text-charcoal/50 transition-transform shrink-0 ${isOpen ? "" : "-rotate-90"}`}
                              />
                              {SectionIcon && (
                                <SectionIcon
                                  size={13}
                                  className="text-gold flex-shrink-0"
                                />
                              )}
                              <span className="text-xs font-semibold text-charcoal truncate">
                                {section.label}
                              </span>
                            </button>
                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                                  allGranted
                                    ? "bg-emerald-50 text-emerald-700"
                                    : granted > 0
                                      ? "bg-gold/15 text-gold-deep"
                                      : "bg-border-gray/40 text-charcoal/40"
                                }`}
                              >
                                {granted}/{sectionKeys.length}
                              </span>
                              {/* Grant or revoke a whole section in one click. */}
                              <button
                                type="button"
                                onClick={() => {
                                  const next = { ...formData.permissions };
                                  sectionKeys.forEach((k) => {
                                    next[k] = !allGranted;
                                  });
                                  setFormData({
                                    ...formData,
                                    permissions: next,
                                  });
                                }}
                                className="text-[10px] font-semibold text-gold-deep hover:underline"
                              >
                                {allGranted ? "None" : "All"}
                              </button>
                            </div>
                          </div>

                          {isOpen && (
                            <div className="space-y-2 px-3 pb-2.5 pt-2 border-t border-border-gray">
                              {section.actions.map((action) => {
                                const actionKey = `${section.key}:${action.key}`;
                                const isChecked =
                                  !!formData.permissions[actionKey];
                                return (
                                  <button
                                    type="button"
                                    key={actionKey}
                                    onClick={() =>
                                      setFormData({
                                        ...formData,
                                        permissions: {
                                          ...formData.permissions,
                                          [actionKey]: !isChecked,
                                        },
                                      })
                                    }
                                    className="w-full flex items-center justify-between gap-3 group text-left"
                                    aria-pressed={isChecked}
                                  >
                                    <span className="min-w-0">
                                      <span className="block text-xs text-charcoal font-medium group-hover:text-gold-deep transition-colors truncate">
                                        {action.label}
                                      </span>
                                      <span className="block text-[10px] text-charcoal/45 truncate font-mono">
                                        {actionKey}
                                      </span>
                                    </span>
                                    <span
                                      className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
                                        isChecked ? "bg-gold" : "bg-border-gray"
                                      }`}
                                    >
                                      <span
                                        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                                          isChecked
                                            ? "translate-x-4"
                                            : "translate-x-0"
                                        }`}
                                      />
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Admin Only sections */}
              <div className="bg-cream/40 rounded-sm p-3.5 border border-cream-dark space-y-2.5">
                <h4 className="font-semibold text-sm text-charcoal flex items-center gap-2 border-b border-cream-dark pb-1.5">
                  <Lock size={14} className="text-gold" /> Administrator Only
                </h4>
                <p className="text-[11px] text-charcoal/55">
                  These screens can never be granted to a manager.
                </p>
                <div className="space-y-1.5">
                  {ADMIN_ONLY_SECTIONS.map((s) => (
                    <div
                      key={s}
                      className="flex items-center justify-between gap-3"
                    >
                      <p className="text-xs text-charcoal/65 font-medium truncate">
                        {s.replace("/admin/", "")}
                      </p>
                      <Lock
                        size={12}
                        className="text-charcoal/30 flex-shrink-0"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={!!resetTarget}
        title={`Reset Password — ${resetTarget ? fullName(resetTarget) : ""}`}
        subtitle={
          resetTarget
            ? `${userEmail(resetTarget)} · they will need the new password to sign in`
            : undefined
        }
        onClose={() => {
          setResetTarget(null);
          setResetPassword("");
          setResetError("");
        }}
        onSubmit={handleResetPassword}
        submitLabel="Reset Password"
        submitting={resetting}
        disabled={resetPassword.length < 8}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          {resetError && (
            <div className="bg-rose-gold/10 border border-rose-gold/25 text-rose-gold px-3 py-2 rounded-sm text-sm">
              {resetError}
            </div>
          )}
          <div>
            <label className={stackedLabelCls}>
              New Password <span className="text-rose-gold">*</span>
            </label>
            <div className="relative">
              <input
                type={showResetPassword ? "text" : "password"}
                value={resetPassword}
                onChange={(e) => {
                  setResetPassword(e.target.value);
                  setResetError("");
                }}
                placeholder="At least 8 characters"
                className={`${modalInputCls} pr-10 ${resetPassword && resetPassword.length < 8 ? "border-rose-gold" : ""}`}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowResetPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-charcoal/40 hover:text-charcoal rounded"
                title={showResetPassword ? "Hide password" : "Show password"}
              >
                {showResetPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p
              className={`text-[11px] mt-1 ${resetPassword && resetPassword.length < 8 ? "text-rose-gold" : "text-charcoal/50"}`}
            >
              Minimum 8 characters. Share it with them directly — it isn&apos;t
              emailed.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
