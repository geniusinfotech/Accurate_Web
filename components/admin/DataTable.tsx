"use client";

import { useState, useMemo } from "react";
import { Search, Download, Edit2, Trash2, Eye, ChevronUp, ChevronDown } from "lucide-react";

export interface ColumnDef<T = any> {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  width?: string;
  hideOnMobile?: boolean;
  sortable?: boolean;
  sortValue?: (row: T) => any;
  render?: (val: any, row: T) => React.ReactNode;
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  trail?: string[];
  headerRight?: React.ReactNode;
  searchPlaceholder?: string;
  exportFileName?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  toolbar?: React.ReactNode;
  customActions?: (row: T) => React.ReactNode;
  onEdit?: (row: T) => void;
  onDelete?: (id: string) => void;
  onView?: (row: T) => void;
  defaultPageSize?: number;
  rowClassName?: (row: T) => string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  headerRight,
  searchPlaceholder,
  exportFileName,
  emptyTitle = "No records found",
  emptyDescription = "There are no entries to display at this time.",
  emptyAction,
  toolbar,
  customActions,
  onEdit,
  onDelete,
  onView,
  defaultPageSize = 25,
  rowClassName,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  // Search filter
  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some((val) => {
        if (val === null || val === undefined) return false;
        if (typeof val === "object") {
          return JSON.stringify(val).toLowerCase().includes(q);
        }
        return String(val).toLowerCase().includes(q);
      })
    );
  }, [data, search]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    const col = columns.find((c) => c.key === sortKey);
    return [...filteredData].sort((a, b) => {
      let valA = col?.sortValue ? col.sortValue(a) : a[sortKey];
      let valB = col?.sortValue ? col.sortValue(b) : b[sortKey];

      if (valA === undefined || valA === null) valA = "";
      if (valB === undefined || valB === null) valB = "";

      if (typeof valA === "number" && typeof valB === "number") {
        return sortDir === "asc" ? valA - valB : valB - valA;
      }
      return sortDir === "asc"
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredData, sortKey, sortDir, columns]);

  // Paginate
  const totalPages = Math.ceil(sortedData.length / defaultPageSize) || 1;
  const currentPage = Math.min(page, totalPages);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * defaultPageSize;
    return sortedData.slice(start, start + defaultPageSize);
  }, [sortedData, currentPage, defaultPageSize]);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handleExport = () => {
    if (!exportFileName || sortedData.length === 0) return;
    const headers = columns.map((c) => c.label).join(",");
    const rows = sortedData.map((row) =>
      columns
        .map((c) => {
          const val = row[c.key];
          const str = val === undefined || val === null ? "" : String(val);
          return `"${str.replace(/"/g, '""')}"`;
        })
        .join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${exportFileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasActions = Boolean(onEdit || onDelete || onView || customActions);

  return (
    <div className="space-y-3">
      {/* Top toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md">
          {searchPlaceholder && (
            <div className="relative w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 border border-border-gray rounded-md text-sm bg-white text-charcoal placeholder:text-charcoal/35 focus:border-gold focus:ring-1 focus:ring-gold/20 transition-colors"
              />
            </div>
          )}
          {toolbar}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {headerRight && <div className="text-xs text-charcoal/60 font-medium">{headerRight}</div>}
          {exportFileName && (
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 border border-border-gray px-3 py-1.5 rounded-md text-xs font-semibold text-charcoal hover:bg-cream transition-colors"
            >
              <Download size={14} /> Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-border-gray rounded-xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-light-gray border-b border-border-gray text-[11px] uppercase tracking-wider font-semibold text-charcoal/70">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable !== false && toggleSort(col.key)}
                    className={`px-4 py-3 ${col.width || ""} ${
                      col.align === "center"
                        ? "text-center"
                        : col.align === "right"
                        ? "text-right"
                        : "text-left"
                    } ${col.hideOnMobile ? "hidden sm:table-cell" : ""} ${
                      col.sortable !== false ? "cursor-pointer select-none hover:text-charcoal" : ""
                    }`}
                  >
                    <div
                      className={`inline-flex items-center gap-1 ${
                        col.align === "center"
                          ? "justify-center"
                          : col.align === "right"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {col.label}
                      {sortKey === col.key && (
                        <span>{sortDir === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />}</span>
                      )}
                    </div>
                  </th>
                ))}
                {hasActions && <th className="px-4 py-3 text-right">Actions</th>}
              </tr>
            </thead>

            <tbody className="divide-y divide-border-gray/60 text-charcoal">
              {loading ? (
                <tr>
                  <td colSpan={columns.length + (hasActions ? 1 : 0)} className="py-12 text-center text-charcoal/50">
                    <div className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-gold border-t-transparent animate-spin" />
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (hasActions ? 1 : 0)} className="py-12 text-center">
                    <p className="font-serif text-base font-semibold text-charcoal">{emptyTitle}</p>
                    <p className="text-xs text-charcoal/50 mt-1 max-w-sm mx-auto">{emptyDescription}</p>
                    {emptyAction && <div className="mt-4">{emptyAction}</div>}
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, idx) => (
                  <tr
                    key={row.id || row._id || idx}
                    className={`hover:bg-cream/40 transition-colors ${
                      rowClassName ? rowClassName(row) : ""
                    }`}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-3 ${
                          col.align === "center"
                            ? "text-center"
                            : col.align === "right"
                            ? "text-right"
                            : "text-left"
                        } ${col.hideOnMobile ? "hidden sm:table-cell" : ""}`}
                      >
                        {col.render ? col.render(row[col.key], row) : row[col.key] ?? "—"}
                      </td>
                    ))}
                    {hasActions && (
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1">
                          {customActions && customActions(row)}
                          {onView && (
                            <button
                              type="button"
                              onClick={() => onView(row)}
                              className="p-1.5 text-charcoal/60 hover:text-charcoal rounded hover:bg-light-gray transition-colors"
                              title="View"
                            >
                              <Eye size={16} />
                            </button>
                          )}
                          {onEdit && (
                            <button
                              type="button"
                              onClick={() => onEdit(row)}
                              className="p-1.5 text-gold-deep hover:text-gold rounded hover:bg-gold/10 transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              type="button"
                              onClick={() => onDelete(row._id || row.id)}
                              className="p-1.5 text-rose-gold hover:text-rose-gold/80 rounded hover:bg-rose-gold/10 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer pagination */}
        {!loading && sortedData.length > defaultPageSize && (
          <div className="flex items-center justify-between border-t border-border-gray px-4 py-3 bg-light-gray/50 text-xs">
            <span className="text-charcoal/60">
              Showing {(currentPage - 1) * defaultPageSize + 1} to{" "}
              {Math.min(currentPage * defaultPageSize, sortedData.length)} of {sortedData.length} entries
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 border border-border-gray rounded bg-white font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-cream transition-colors"
              >
                Previous
              </button>
              <span className="px-2 text-charcoal/70">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 border border-border-gray rounded bg-white font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-cream transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
