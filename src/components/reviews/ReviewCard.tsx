import { StarRating } from "./StarRating";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CheckCircle, MessageSquare } from "lucide-react";

interface ReviewCardProps {
  rating: number;
  reviewText: string | null;
  reviewerName: string | null;
  createdAt: string;
  isVerified: boolean;
  buyerResponse: string | null;
  buyerRespondedAt: string | null;
  buyerName?: string;
}

export function ReviewCard({
  rating,
  reviewText,
  reviewerName,
  createdAt,
  isVerified,
  buyerResponse,
  buyerRespondedAt,
  buyerName,
}: ReviewCardProps) {
  return (
    <Card className="border-border/50">
      <CardContent className="pt-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StarRating rating={rating} readonly size="sm" />
            {isVerified && (
              <Badge variant="secondary" className="text-xs gap-1">
                <CheckCircle className="h-3 w-3" /> Verified
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {format(new Date(createdAt), "MMM d, yyyy")}
          </span>
        </div>
        {reviewText && <p className="text-sm text-foreground">{reviewText}</p>}
        <p className="text-xs text-muted-foreground">— {reviewerName || "Anonymous"}</p>

        {buyerResponse && (
          <div className="ml-4 mt-3 rounded-lg border border-border/50 bg-muted/50 p-3 space-y-1">
            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              Response from {buyerName || "Provider"}
            </div>
            <p className="text-sm text-foreground">{buyerResponse}</p>
            {buyerRespondedAt && (
              <p className="text-xs text-muted-foreground">
                {format(new Date(buyerRespondedAt), "MMM d, yyyy")}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
