import React from "react";
import {
  Home,
  ShoppingCart,
  Utensils,
  Car,
  Zap,
  Film,
  Activity,
  ShoppingBag,
  Briefcase,
  Laptop,
  TrendingUp,
  Coffee,
  Plane,
  BookOpen,
  Heart,
  Gift,
  DollarSign,
  Wallet,
  Tag,
  CreditCard,
  Building,
  LucideProps,
} from "lucide-react";

export const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  Home,
  ShoppingCart,
  Utensils,
  Car,
  Zap,
  Film,
  Activity,
  ShoppingBag,
  Briefcase,
  Laptop,
  TrendingUp,
  Coffee,
  Plane,
  BookOpen,
  Heart,
  Gift,
  DollarSign,
  Wallet,
  Tag,
  CreditCard,
  Building,
};

export interface CategoryIconProps extends LucideProps {
  name: string;
}

export function CategoryIcon({ name, ...props }: CategoryIconProps) {
  const IconComponent = ICON_MAP[name] || Tag;
  return <IconComponent {...props} />;
}
