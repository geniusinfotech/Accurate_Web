/**
 * Profile completion calculation model for Accurate Liqued storefront.
 * 4 Core Fields at 25% each:
 * 1. Full Name (25%)
 * 2. Email Address (25%)
 * 3. Phone Number (25%)
 * 4. Shipping Address (25%)
 */

export interface ProfileCompletionItem {
  id: "name" | "email" | "phone" | "address";
  label: string;
  isCompleted: boolean;
  weight: number;
  href: string;
  actionText: string;
  hint: string;
}

export interface ProfileCompletionResult {
  percentage: number;
  completedCount: number;
  totalCount: number;
  items: ProfileCompletionItem[];
  nextIncompleteItem?: ProfileCompletionItem;
  isComplete: boolean;
}

export interface UserForCompletion {
  name?: string;
  firstname?: string;
  lastname?: string;
  username?: string;
  email?: string;
  phone?: string;
  addresses?: Array<{
    line1?: string;
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    zip?: string;
  }>;
  address?: {
    street?: string;
    city?: string;
    line1?: string;
  };
}

export function calculateProfileCompletion(
  user: UserForCompletion | null | undefined
): ProfileCompletionResult {
  if (!user) {
    return {
      percentage: 0,
      completedCount: 0,
      totalCount: 4,
      items: [],
      isComplete: false,
    };
  }

  // 1. Full Name check: at least 2 characters, not an email fallback like "user@domain"
  const rawName = (user.name || `${user.firstname || ""} ${user.lastname || ""}` || user.username || "").trim();
  const hasName = Boolean(rawName.length >= 2 && !rawName.includes("@") && rawName.toLowerCase() !== "user");

  // 2. Email Address check: valid email format
  const rawEmail = (user.email || "").trim();
  const hasEmail = Boolean(rawEmail.includes("@") && rawEmail.includes("."));

  // 3. Phone Number check: at least 10 valid digits
  const cleanPhone = (user.phone || "").replace(/\D/g, "");
  const hasPhone = cleanPhone.length >= 10;

  // 4. Shipping Address check: at least 1 address with street / line1 and city
  const hasAddressArray = Array.isArray(user.addresses) && user.addresses.length > 0 && user.addresses.some(
    (a) => Boolean((a.street || a.line1) && (a.city || a.pincode || a.zip || a.state))
  );
  const hasAddressObject = Boolean(
    user.address && (user.address.street || user.address.line1) && user.address.city
  );
  const hasAddress = hasAddressArray || hasAddressObject;

  const items: ProfileCompletionItem[] = [
    {
      id: "name",
      label: "Full Name",
      isCompleted: hasName,
      weight: 25,
      href: "/profile?tab=profile",
      actionText: hasName ? "Update name" : "Add full name",
      hint: hasName ? "Name is set" : "Add your first and last name",
    },
    {
      id: "email",
      label: "Email Address",
      isCompleted: hasEmail,
      weight: 25,
      href: "/profile?tab=profile",
      actionText: hasEmail ? "Verified email" : "Add email address",
      hint: hasEmail ? "Email is registered" : "Provide an active email address",
    },
    {
      id: "phone",
      label: "Phone Number",
      isCompleted: hasPhone,
      weight: 25,
      href: "/profile?tab=profile",
      actionText: hasPhone ? "Update phone" : "Add phone number",
      hint: hasPhone ? "Phone is saved" : "Add 10-digit mobile number for delivery updates",
    },
    {
      id: "address",
      label: "Delivery Address",
      isCompleted: hasAddress,
      weight: 25,
      href: "/profile?tab=addresses",
      actionText: hasAddress ? "Manage addresses" : "Add shipping address",
      hint: hasAddress ? "Default shipping address set" : "Add your home or office address for fast checkout",
    },
  ];

  const completedCount = items.filter((item) => item.isCompleted).length;
  const percentage = completedCount * 25; // 0, 25, 50, 75, or 100
  const nextIncompleteItem = items.find((item) => !item.isCompleted);

  return {
    percentage,
    completedCount,
    totalCount: items.length,
    items,
    nextIncompleteItem,
    isComplete: percentage === 100,
  };
}
