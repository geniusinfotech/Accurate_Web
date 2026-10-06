export interface ShortcutMenuItem {
  key: string;
  label: string;
  description?: string;
  hint?: string;
  route?: string;
  children?: ShortcutMenuItem[];
}

export interface ShortcutRoot {
  key: string;
  label: string;
  route?: string;
  items: ShortcutMenuItem[];
}

export const SALES_ENTRY_FOCUS_EVENT = "sales-entry-focus";

export const shortcutRoots: ShortcutRoot[] = [
  {
    key: "p",
    label: "Products",
    route: "/admin/products",
    items: [
      {
        key: "a",
        label: "All Products",
        description: "View and manage products",
        route: "/admin/products",
      },
      {
        key: "c",
        label: "Categories",
        description: "Manage product categories",
        route: "/admin/categories",
      },
    ],
  },
  {
    key: "o",
    label: "Orders",
    route: "/admin/orders",
    items: [
      {
        key: "a",
        label: "All Orders",
        description: "View all orders",
        route: "/admin/orders",
      },
      {
        key: "p",
        label: "Pending",
        description: "View pending orders",
        route: "/admin/orders?status=pending",
      },
    ],
  },
  {
    key: "a",
    label: "Accounts",
    route: "/admin/accounts",
    items: [
      {
        key: "a",
        label: "All Accounts",
        description: "View all accounts",
        route: "/admin/accounts",
      },
    ],
  },
  {
    key: "r",
    label: "Reports",
    route: "/admin/reports",
    items: [
      {
        key: "s",
        label: "Sales Report",
        description: "View sales analytics",
        route: "/admin/reports?type=sales",
      },
      {
        key: "i",
        label: "Inventory Report",
        description: "View inventory status",
        route: "/admin/reports?type=inventory",
      },
    ],
  },
  {
    key: "h",
    label: "Help",
    items: [],
  },
];

export function findShortcutRoot(key: string): ShortcutRoot | undefined {
  return shortcutRoots.find((r) => r.key === key);
}

export function getAllShortcuts(): ShortcutMenuItem[] {
  const all: ShortcutMenuItem[] = [];
  const collect = (items: ShortcutMenuItem[]) => {
    for (const item of items) {
      all.push(item);
      if (item.children) collect(item.children);
    }
  };
  for (const root of shortcutRoots) {
    collect(root.items);
  }
  return all;
}