"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/admin/Modal";
import { useDialog } from "@/components/admin/ConfirmDialog";
import { PageHeader } from "@/components/admin/AdminShell";
import { modalInputCls, stackedLabelCls, formatBillDate } from "@/lib/admin-ui";
import { Plus, Power, Eye, EyeOff, Info } from "lucide-react";
import { apiRequest } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import { DataTable } from "@/components/admin/DataTable";
import { useAuth } from "@/context/AuthContext";
import type { User } from "@/lib/types/api";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  manager: "Manager",
  user: "Customer",
};

const emptyForm = { name: "", email: "", role: "manager", password: "" };

export default function Users() {
  const { alert, confirm } = useDialog();
  const toast = useToast();
  const { user: me } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ ...emptyForm });

  const loadData = async () => {
    try {
      const data = await apiRequest("/users");
      setUsers(
        (Array.isArray(data) ? data : data?.items || []).map((u: any) => ({
          id: u._id,
          name: `${u.firstname || ""} ${u.lastname || ""}`.trim() || "—",
          email: u.email,
          role: u.roles?.[0] || "user",
          isActive: !!u.isActive,
          joinDate: u.createdAt,
          original: u,
        })),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setFormData({ ...emptyForm });
    setError("");
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
  const emailTaken = users.some(
    (u) => u.email?.toLowerCase() === formData.email.trim().toLowerCase(),
  );
  const passwordOk = formData.password.length >= 8;
  const valid =
    formData.name.trim().length > 0 &&
    emailValid &&
    !emailTaken &&
    passwordOk &&
    formData.role === "manager";

  const handleSubmit = async () => {
    setError("");
    if (formData.role !== "manager") {
      setError(
        "Only manager accounts can be created here. Change an existing account's role in the table instead.",
      );
      return;
    }
    if (!formData.name.trim()) return setError("Enter the person's full name.");
    if (!emailValid) return setError("That email address doesn't look right.");
    if (emailTaken)
      return setError("An account with that email already exists.");
    if (!passwordOk)
      return setError("The password must be at least 8 characters.");

    setSubmitting(true);
    try {
      const [firstname, ...rest] = formData.name.trim().split(" ");
      await apiRequest("/users/manager", {
        method: "POST",
        body: JSON.stringify({
          firstname,
          lastname: rest.join(" ") || firstname,
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });
      setIsModalOpen(false);
      setFormData({ ...emptyForm });
      loadData();
      await alert("Manager account created.", "success");
      toast.success("Manager account created successfully");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to create the account.");
      toast.error(err?.message || "Failed to create the account.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (row: any, newRole: string) => {
    if (newRole === row.role) return;
    const ok = await confirm(
      `Change ${row.name}'s role from ${ROLE_LABELS[row.role] || row.role} to ${ROLE_LABELS[newRole]}? This changes what they can see and do straight away.`,
      "Change Role",
    );
    if (!ok) {
      // Re-render so the select snaps back to the stored role.
      setUsers((u) => [...u]);
      return;
    }
    try {
      await apiRequest(`/users/${row.id}/roles`, {
        method: "PATCH",
        body: JSON.stringify({ roles: [newRole] }),
      });
      loadData();
      toast.success("User role updated");
    } catch (err: any) {
      console.error(err);
      await alert(err?.message || "Failed to update the role", "error");
      toast.error(err?.message || "Failed to update the role");
    }
  };

  const handleStatusChange = async (row: any) => {
    const turningOff = row.isActive;
    if (turningOff) {
      const ok = await confirm(
        `Deactivate ${row.name}? They will be signed out and won't be able to log in.`,
        "Deactivate User",
      );
      if (!ok) return;
    }
    try {
      await apiRequest(`/users/${row.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !row.isActive }),
      });
      loadData();
      toast.success(row.isActive ? "User deactivated" : "User activated");
    } catch (err: any) {
      console.error(err);
      await alert(err?.message || "Failed to update the status", "error");
      toast.error(err?.message || "Failed to update the status");
    }
  };

  const activeCount = users.filter((u) => u.isActive).length;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Users & Roles"
        description="Who can sign in, and what each person is allowed to do"
        actions={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 btn-primary px-5 py-2.5"
          >
            <Plus size={18} /> Add Manager
          </button>
        }
      />

      <DataTable
        trail={[]}
        headerRight={`${activeCount} active of ${users.length}`}
        loading={loading}
        defaultPageSize={25}
        columns={[
          { key: "name", label: "Name" },
          { key: "email", label: "Email", hideOnMobile: true },
          {
            key: "role",
            label: "Role",
            render: (_v: any, row: any) => (
              <select
                value={row.role}
                // Can't demote yourself: you'd lock yourself out of this page.
                disabled={row.id === me?.id}
                onChange={(e) => handleRoleChange(row, e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm disabled:opacity-50"
              >
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            ),
          },
          {
            key: "isActive",
            label: "Status",
            align: "center",
            sortValue: (r: any) => (r.isActive ? 1 : 0),
            render: (_v: any, row: any) => (
              <button
                type="button"
                onClick={() => handleStatusChange(row)}
                disabled={row.id === me?.id}
                title={row.isActive ? "Deactivate" : "Activate"}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold disabled:opacity-50 ${
                  row.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                }`}
              >
                <Power size={12} /> {row.isActive ? "Active" : "Inactive"}
              </button>
            ),
          },
          {
            key: "joinDate",
            label: "Joined",
            hideOnMobile: true,
            render: (v: string) => (v ? formatBillDate(v) : "—"),
          },
        ]}
        data={users}
        searchPlaceholder="Search users by name or email…"
        exportFileName="users"
        emptyTitle="No users yet"
        emptyDescription="Accounts appear here once people register."
      />

      <Modal
        isOpen={isModalOpen}
        title="Add Manager"
        subtitle="Creates a manager account. Promote it to Administrator afterwards if needed."
        onClose={() => {
          setIsModalOpen(false);
          setFormData({ ...emptyForm });
          setError("");
        }}
        onSubmit={handleSubmit}
        submitLabel="Create User"
        submitting={submitting}
        disabled={!valid}
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-rose-gold/10 border border-rose-gold/25 text-rose-gold px-3 py-2 rounded-sm text-sm">
              {error}
            </div>
          )}

          <div>
            <label className={stackedLabelCls}>
              Full Name <span className="text-rose-gold">*</span>
            </label>
            <input
              type="text"
              tabIndex={1}
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setError("");
              }}
              placeholder="e.g. Jatin Jajal"
              className={modalInputCls}
            />
          </div>

          <div>
            <label className={stackedLabelCls}>
              Email <span className="text-rose-gold">*</span>
            </label>
            <input
              type="email"
              tabIndex={2}
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                setError("");
              }}
              placeholder="person@example.com"
              className={`${modalInputCls} ${
                formData.email && (!emailValid || emailTaken)
                  ? "border-rose-gold"
                  : ""
              }`}
            />
            {formData.email && !emailValid && (
              <p className="text-[11px] text-rose-gold mt-1">
                Enter a valid email address.
              </p>
            )}
            {emailTaken && (
              <p className="text-[11px] text-rose-gold mt-1">
                This email is already in use.
              </p>
            )}
          </div>

          <div>
            <label className={stackedLabelCls}>
              Password <span className="text-rose-gold">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                tabIndex={3}
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  setError("");
                }}
                placeholder="At least 8 characters"
                className={`${modalInputCls} pr-10 ${
                  formData.password && !passwordOk ? "border-rose-gold" : ""
                }`}
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
              Minimum 8 characters. Share it with the person directly — it isn't
              emailed.
            </p>
          </div>

          <div>
            <label className={stackedLabelCls}>Role</label>
            <select
              tabIndex={4}
              value={formData.role}
              onChange={(e) => {
                setFormData({ ...formData, role: e.target.value });
                setError("");
              }}
              className={modalInputCls}
            >
              <option value="manager">Manager</option>
              <option value="admin">Administrator</option>
              <option value="user">Customer</option>
            </select>
            {formData.role !== "manager" && (
              <p className="text-[11px] text-rose-gold mt-1">
                New accounts are created as managers. Create it, then change the
                role in the table.
              </p>
            )}
          </div>

          <div className="bg-gold/10 p-3.5 rounded-sm border border-gold/25 flex gap-3">
            <Info size={15} className="text-gold-deep shrink-0 mt-0.5" />
            <div className="text-xs text-charcoal/75 space-y-0.5">
              <p>
                <strong className="text-charcoal">Administrator</strong> — full
                access to everything.
              </p>
              <p>
                <strong className="text-charcoal">Manager</strong> — only the
                areas you allow on the Managers page.
              </p>
              <p>
                <strong className="text-charcoal">Customer</strong> — storefront
                account, no admin access.
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
