import {
  User,
  Building2,
  Users,
  Clock,
  FileText,
  HelpCircle,
  Share2,
  Shield,
  Database,
  UtensilsCrossed,
  Package,
  Settings,
  Box,
  ChefHat,
  CircleDollarSign,
} from "lucide-react";

export const menuItems = (isDev: boolean) => {
  const items = [
    {
      id: "account",
      items: [{ icon: User, label: "My Account", path: "/admin/account" }], // Updated path
    },
    {
      id: "kitchen",
      label: "KITCHEN",
      items: [
        { icon: ChefHat, label: "Recipe Manager", path: "/admin/recipes" },
      ],
    },
    {
      id: "team",
      label: "TEAM",
      items: [
        { icon: Users, label: "Team Management", path: "/admin/team" },
        { icon: Clock, label: "Notifications", path: "/admin/notifications" },
        { icon: Shield, label: "Permissions", path: "/admin/permissions" },
      ],
    },
    {
      id: "organization",
      label: "ORGANIZATION",
      items: [
        {
          icon: Building2,
          label: "Organization",
          path: "/admin/organizations",
        },
        { icon: FileText, label: "Activity Log", path: "/admin/activity" },
      ],
    },
    {
      id: "data",
      label: "DATA MANAGEMENT",
      items: [
        {
          icon: Database,
          label: "Master Ingredient List",
          path: "/admin/excel-imports#ingredients",
        },
        {
          icon: CircleDollarSign,
          label: "Vendor Invoices",
          path: "/admin/vendor-invoices",
        },
        {
          icon: Package,
          label: "Food Inventory Review",
          path: "/admin/excel-imports#inventory",
        },
        {
          icon: Settings,
          label: "Operation Variables",
          path: "/admin/excel-imports#operations",
        },
        {
          icon: Box,
          label: "Food Relationships",
          path: "/admin/excel-imports#relationships",
        },
      ],
    },
    {
      id: "support",
      label: "SUPPORT",
      items: [
        { icon: HelpCircle, label: "Help & Support", path: "/admin/help" },
        { icon: Share2, label: "Refer a Friend", path: "/admin/refer" },
      ],
    },
  ];

  // Add Dev Management section only for dev users
  if (isDev) {
    items.push({
      id: "dev",
      label: "DEVELOPMENT",
      items: [
        {
          icon: Shield,
          label: "Dev Management",
          path: "/admin/dev-management",
        },
      ],
    });
  }

  return items;
};
