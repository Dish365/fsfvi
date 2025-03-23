import { DashboardLayout } from "@/components/commodity-layout";

export default function CommodityLevelDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
} 