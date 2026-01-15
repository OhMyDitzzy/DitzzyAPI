import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: "purple" | "green" | "red" | "blue";
}

const colorClasses = {
  purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  green: "text-green-400 bg-green-500/10 border-green-500/20",
  red: "text-red-400 bg-red-500/10 border-red-500/20",
  blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
};

export function StatsCard({ title, value, icon: Icon, color }: StatsCardProps) {
  return (
    <Card className={`p-4 backdrop-blur-sm ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-5 h-5" />
      </div>
      <div className={`text-2xl font-bold ${colorClasses[color].split(" ")[0]}`}>
        {value}
      </div>
      <div className="text-xs text-muted-foreground mt-1">{title}</div>
    </Card>
  );
}