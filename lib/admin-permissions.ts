// Mirrors Accurate_Node/src/auth/permissions.enum.ts for the website-only
// permissions. The backend enum still contains shop permissions (inventory,
// raw_materials, dealers, sell, customers, workers) but the frontend no longer
// uses them since those modules were never built.
export type Permission =
  | "dashboard:view"
  | "accounts:view"
  | "accounts:record"
  | "activity_log:view"
  | "orders:view"
  | "orders:update"
  | "orders:print"
  | "reports:view"
  | "products:view"
  | "products:add"
  | "products:edit"
  | "products:delete"
  | "categories:view"
  | "categories:add"
  | "categories:edit"
  | "categories:delete"
  | "banners:view"
  | "banners:add"
  | "banners:edit"
  | "banners:delete"
  | "offers:view"
  | "offers:add"
  | "offers:edit"
  | "offers:toggle"
  | "offers:delete"
  | "coupons:view"
  | "coupons:add"
  | "coupons:edit"
  | "coupons:delete"
  | "shipping:view"
  | "shipping:edit"
  | "testimonials:view"
  | "testimonials:add"
  | "testimonials:edit"
  | "testimonials:toggle"
  | "testimonials:delete";

const permissionMap: Record<string, Permission[]> = {
  "/admin/accounts": ["accounts:view"],
  "/admin/orders": ["orders:view"],
  "/admin/products": ["products:view"],
  "/admin/categories": ["categories:view"],
  "/admin/coupons": ["coupons:view"],
  "/admin/offers": ["offers:view"],
  "/admin/banners": ["banners:view"],
  "/admin/testimonials": ["testimonials:view"],
  "/admin/reports": ["reports:view"],
  "/admin/activity-log": ["activity_log:view"],
};

/**
 * Routes the backend guards with @Roles(Role.ADMIN) rather than a permission,
 * so no manager grant can unlock them. /admin/users and /admin/managers.
 */
const ADMIN_ONLY_PATHS = ["/admin/users", "/admin/managers"];

// Longest prefix first, otherwise "/admin/accounts" shadows the deeper
// "/admin/accounts/party-bills" entry and the specific mapping never resolves.
const ROUTE_ENTRIES = Object.entries(permissionMap).sort(
  (a, b) => b[0].length - a[0].length
);

export function permissionsForPath(pathname: string): Permission[] | undefined {
  const match = ROUTE_ENTRIES.find(([route]) => pathname.startsWith(route));
  return match ? match[1] : undefined;
}

export function isAdminOnlyPath(pathname: string): boolean {
  return ADMIN_ONLY_PATHS.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function hasAnyPermission(
  userPermissions: Permission[] | null | undefined,
  required: Permission[] | undefined
): boolean {
  if (!required || required.length === 0) return true;
  if (!userPermissions || userPermissions.length === 0) return false;
  return required.some((p) => userPermissions.includes(p));
}

export const allPermissionKeys: Permission[] = [
  "dashboard:view",
  "accounts:view",
  "accounts:record",
  "activity_log:view",
  "orders:view",
  "orders:update",
  "orders:print",
  "reports:view",
  "products:view",
  "products:add",
  "products:edit",
  "products:delete",
  "categories:view",
  "categories:add",
  "categories:edit",
  "categories:delete",
  "banners:view",
  "banners:add",
  "banners:edit",
  "banners:delete",
  "offers:view",
  "offers:add",
  "offers:edit",
  "offers:toggle",
  "offers:delete",
  "coupons:view",
  "coupons:add",
  "coupons:edit",
  "coupons:delete",
  "shipping:view",
  "shipping:edit",
  "testimonials:view",
  "testimonials:add",
  "testimonials:edit",
  "testimonials:toggle",
  "testimonials:delete",
];

export const ADMIN_PERMISSION_AREAS = [
  { key: "dashboard", label: "Dashboard", permissions: ["dashboard:view"] },
  { key: "accounts", label: "Accounts", permissions: ["accounts:view", "accounts:record"] },
  { key: "orders", label: "Orders", permissions: ["orders:view", "orders:update", "orders:print"] },
  { key: "reports", label: "Reports", permissions: ["reports:view"] },
  { key: "products", label: "Products", permissions: ["products:view", "products:add", "products:edit", "products:delete"] },
  { key: "categories", label: "Categories", permissions: ["categories:view", "categories:add", "categories:edit", "categories:delete"] },
  { key: "banners", label: "Banners", permissions: ["banners:view", "banners:add", "banners:edit", "banners:delete"] },
  { key: "offers", label: "Offers", permissions: ["offers:view", "offers:add", "offers:edit", "offers:toggle", "offers:delete"] },
  { key: "coupons", label: "Coupons", permissions: ["coupons:view", "coupons:add", "coupons:edit", "coupons:delete"] },
  { key: "shipping", label: "Shipping", permissions: ["shipping:view", "shipping:edit"] },
  { key: "testimonials", label: "Testimonials", permissions: ["testimonials:view", "testimonials:add", "testimonials:edit", "testimonials:toggle", "testimonials:delete"] },
  { key: "activity_log", label: "Activity Log", permissions: ["activity_log:view"] },
];

function groupByPrefix(perms: string[]): { key: string; label: string; actions: { key: string; label: string }[] }[] {
  const groups = new Map<string, { key: string; label: string; actions: { key: string; label: string }[] }>();
  perms.forEach((p) => {
    const [prefix, action] = p.split(':');
    const existing = groups.get(prefix);
    const actionLabel = action.charAt(0).toUpperCase() + action.slice(1).replace(/_/g, ' ');
    if (existing) {
      existing.actions.push({ key: action, label: actionLabel });
    } else {
      groups.set(prefix, { key: prefix, label: prefix.charAt(0).toUpperCase() + prefix.slice(1).replace(/_/g, ' '), actions: [{ key: action, label: actionLabel }] });
    }
  });
  return Array.from(groups.values());
}

export const ADMIN_PERMISSION_AREAS_DETAILED = ADMIN_PERMISSION_AREAS.map((area) => ({
  ...area,
  title: area.label,
  sections: groupByPrefix(area.permissions),
}));

export const ADMIN_ONLY_SECTIONS = ADMIN_ONLY_PATHS;
