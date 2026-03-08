import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface KpiCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  previousValue?: number;
  currentValue?: number;
  /** Set to true when a lower value is better (e.g. bounce rate, abandonment) */
  invertTrend?: boolean;
  suffix?: string;
  href?: string;
}

export function KpiCard({ icon: Icon, value, label, previousValue, currentValue, invertTrend, suffix, href }: KpiCardProps) {
  let changePercent: number | null = null;
  if (previousValue != null && currentValue != null && previousValue > 0) {
    changePercent = ((currentValue - previousValue) / previousValue) * 100;
  } else if (previousValue === 0 && currentValue != null && currentValue > 0) {
    changePercent = 100;
  }

  const isPositive = changePercent != null && changePercent > 0;
  const isNegative = changePercent != null && changePercent < 0;
  const isGood = invertTrend ? isNegative : isPositive;
  const isBad = invertTrend ? isPositive : isNegative;

  const cardContent = (
    <Card className={href ? "cursor-pointer transition-colors hover:border-primary/50" : ""}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="min-w-0">
            <p className="text-2xl font-bold">{value}{suffix}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
            {changePercent != null && (
              <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${isGood ? "text-emerald-600" : isBad ? "text-red-500" : "text-muted-foreground"}`}>
                {isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : isNegative ? (
                  <TrendingDown className="h-3 w-3" />
                ) : (
                  <Minus className="h-3 w-3" />
                )}
                <span>
                  {changePercent > 0 ? "+" : ""}
                  {changePercent.toFixed(1)}% vs prev
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
