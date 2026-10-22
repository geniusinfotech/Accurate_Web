"use client";

import { useEffect, useState, useMemo } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Trash2,
  User,
  ExternalLink,
} from "lucide-react";
import { apiRequest } from "@/lib/api-client";
import { useDialog } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import Modal from "@/components/admin/Modal";
import { PageHeader } from "@/components/admin/AdminShell";

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject?: string;
  message: string;
  status: "unread" | "read" | "replied";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminMessagesPage() {
  const { alert, confirm } = useDialog();
  const toast = useToast();

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "read" | "replied">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    setLoading(true);
    try {
      const res = await apiRequest<{
        items: ContactMessage[];
        total: number;
        unreadCount: number;
      }>("/contact");
      setMessages(Array.isArray(res?.items) ? res.items : []);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load contact messages.");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, newStatus: "unread" | "read" | "replied", notes?: string) {
    setUpdatingStatus(true);
    try {
      const updated = await apiRequest<ContactMessage>(`/contact/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus, ...(notes !== undefined ? { notes } : {}) }),
      });

      setMessages((prev) => prev.map((m) => (m._id === id ? { ...m, ...updated } : m)));
      if (selectedMessage && selectedMessage._id === id) {
        setSelectedMessage((prev) => (prev ? { ...prev, ...updated } : null));
      }
      toast.success(`Message marked as ${newStatus}`);
    } catch (e: any) {
      toast.error(e?.message || "Could not update status.");
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleDelete(id: string) {
    const ok = await confirm(
      "Are you sure you want to delete this contact inquiry? This action cannot be undone.",
      "Delete Message",
    );
    if (!ok) return;

    try {
      await apiRequest(`/contact/${id}`, { method: "DELETE" });
      setMessages((prev) => prev.filter((m) => m._id !== id));
      if (selectedMessage?._id === id) setSelectedMessage(null);
      toast.success("Contact message deleted.");
    } catch (e: any) {
      toast.error(e?.message || "Could not delete message.");
    }
  }

  const counts = useMemo(() => {
    const total = messages.length;
    const unread = messages.filter((m) => m.status === "unread").length;
    const read = messages.filter((m) => m.status === "read").length;
    const replied = messages.filter((m) => m.status === "replied").length;
    return { total, unread, read, replied };
  }, [messages]);

  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      if (activeTab !== "all" && m.status !== activeTab) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchesName = m.name?.toLowerCase().includes(q);
        const matchesEmail = m.email?.toLowerCase().includes(q);
        const matchesPhone = m.phone?.includes(q);
        const matchesSubject = m.subject?.toLowerCase().includes(q);
        const matchesMsg = m.message?.toLowerCase().includes(q);
        return matchesName || matchesEmail || matchesPhone || matchesSubject || matchesMsg;
      }
      return true;
    });
  }, [messages, activeTab, searchTerm]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contact Messages & Inquiries"
        description="Review and respond to messages submitted by visitors on the website contact form."
        actions={
          <button
            onClick={fetchMessages}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        }
      />

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Received</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{counts.total}</p>
        </div>
        <div className="rounded-2xl border border-amber-200/70 bg-amber-50/40 p-4 shadow-xs">
          <p className="text-xs font-medium text-amber-700 uppercase tracking-wider">Unread Inquiries</p>
          <p className="mt-1 text-2xl font-bold text-amber-900">{counts.unread}</p>
        </div>
        <div className="rounded-2xl border border-blue-200/70 bg-blue-50/40 p-4 shadow-xs">
          <p className="text-xs font-medium text-[#244892] uppercase tracking-wider">Read / Viewed</p>
          <p className="mt-1 text-2xl font-bold text-[#244892]">{counts.read}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/40 p-4 shadow-xs">
          <p className="text-xs font-medium text-emerald-700 uppercase tracking-wider">Replied</p>
          <p className="mt-1 text-2xl font-bold text-emerald-900">{counts.replied}</p>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { id: "all", label: "All Messages", count: counts.total },
              { id: "unread", label: "Unread", count: counts.unread },
              { id: "read", label: "Read", count: counts.read },
              { id: "replied", label: "Replied", count: counts.replied },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#244892] text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, phone, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#244892] focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Messages Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <RefreshCw size={24} className="animate-spin text-[#244892] mr-2" />
            <span className="text-sm">Loading messages...</span>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="py-20 text-center">
            <MessageSquare size={36} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No contact messages found</h3>
            <p className="mt-1 text-xs text-slate-500">
              {searchTerm
                ? "Try adjusting your search criteria."
                : "New messages from the contact form will appear here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 uppercase tracking-wider text-[11px] font-semibold">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Subject &amp; Message</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMessages.map((msg) => (
                  <tr
                    key={msg._id}
                    className={`transition-colors hover:bg-slate-50/80 ${
                      msg.status === "unread" ? "bg-amber-50/20 font-medium" : ""
                    }`}
                  >
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                      {new Date(msg.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {msg.status === "unread" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                          <span className="size-1.5 rounded-full bg-amber-600" />
                          Unread
                        </span>
                      )}
                      {msg.status === "read" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                          Read
                        </span>
                      )}
                      {msg.status === "replied" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                          <CheckCircle2 size={11} />
                          Replied
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{msg.name}</div>
                      <a
                        href={`mailto:${msg.email}`}
                        className="text-slate-500 hover:text-[#244892] hover:underline"
                      >
                        {msg.email}
                      </a>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-slate-800">{msg.phone}</span>
                        <a
                          href={`tel:+91${msg.phone}`}
                          title="Call customer"
                          className="grid size-6 place-items-center rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                        >
                          <Phone size={11} />
                        </a>
                        <a
                          href={`https://wa.me/91${msg.phone}?text=Hello%20${encodeURIComponent(
                            msg.name
                          )},%20thank%20you%20for%20contacting%20Accurate%20Liquid.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Chat on WhatsApp"
                          className="grid size-6 place-items-center rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                        >
                          <ExternalLink size={11} />
                        </a>
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      {msg.subject && (
                        <div className="font-semibold text-slate-800 truncate">{msg.subject}</div>
                      )}
                      <div className="text-slate-600 truncate max-w-sm">{msg.message}</div>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedMessage(msg);
                            setAdminNotes(msg.notes || "");
                            if (msg.status === "unread") {
                              updateStatus(msg._id, "read");
                            }
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-[#244892] shadow-xs hover:bg-[#edf2fe] transition-colors cursor-pointer"
                        >
                          <Eye size={12} /> View
                        </button>

                        {msg.status !== "replied" && (
                          <button
                            onClick={() => updateStatus(msg._id, "replied")}
                            title="Mark as Replied"
                            className="rounded-lg border border-slate-200 bg-white p-1 text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 size={13} />
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(msg._id)}
                          title="Delete Message"
                          className="rounded-lg border border-slate-200 bg-white p-1 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Message Details Modal */}
      {selectedMessage && (
        <Modal
          isOpen={!!selectedMessage}
          onClose={() => setSelectedMessage(null)}
          title="Contact Message Details"
        >
          <div className="space-y-5 text-xs text-slate-800">
            {/* Header info */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Sender Name
                  </span>
                  <p className="text-sm font-bold text-slate-900">{selectedMessage.name}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Received On
                  </span>
                  <p className="text-xs text-slate-600">
                    {new Date(selectedMessage.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Email Address
                  </span>
                  <p className="font-semibold text-[#244892]">{selectedMessage.email}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Phone Number
                  </span>
                  <p className="font-mono font-bold text-slate-900">{selectedMessage.phone}</p>
                </div>
              </div>
            </div>

            {/* Subject and Message Body */}
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                Subject
              </span>
              <p className="font-semibold text-slate-900 text-sm mt-0.5">
                {selectedMessage.subject || "General Inquiry"}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                Message Content
              </span>
              <div className="mt-1 rounded-xl border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-700 whitespace-pre-wrap">
                {selectedMessage.message}
              </div>
            </div>

            {/* Quick Action Contact Buttons */}
            <div className="pt-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-2">
                Quick Actions
              </span>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(
                    `Re: ${selectedMessage.subject || "Inquiry to Accurate Liquid"}`
                  )}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#244892] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#1b3773] transition-colors"
                >
                  <Mail size={13} /> Reply by Email
                </a>

                <a
                  href={`https://wa.me/91${selectedMessage.phone}?text=Hello%20${encodeURIComponent(
                    selectedMessage.name
                  )},%20we%20received%20your%20inquiry%20regarding%20Accurate%20Liquid.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
                >
                  <ExternalLink size={13} /> Chat on WhatsApp
                </a>

                <a
                  href={`tel:+91${selectedMessage.phone}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
                >
                  <Phone size={13} /> Call Customer
                </a>
              </div>
            </div>

            {/* Update status and Admin Notes */}
            <div className="pt-3 border-t border-slate-200 space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Change Status
                </label>
                <div className="flex gap-2">
                  {(["unread", "read", "replied"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      disabled={updatingStatus}
                      onClick={() => updateStatus(selectedMessage._id, st, adminNotes)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                        selectedMessage.status === st
                          ? "bg-[#244892] text-white"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Internal Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add private note regarding this customer..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#244892] focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() =>
                    updateStatus(selectedMessage._id, selectedMessage.status, adminNotes)
                  }
                  className="mt-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
