import { useState } from "react";
import { StarRating } from "./StarRating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ReviewFormProps {
  buyerId: string;
  leadId: string;
  onSuccess: () => void;
}

export function ReviewForm({ buyerId, leadId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({ title: "Please select a rating", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "You must be logged in", variant: "destructive" });
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from("reviews").insert({
      buyer_id: buyerId,
      lead_id: leadId,
      reviewer_user_id: user.id,
      rating,
      review_text: reviewText.trim() || null,
      is_verified: true,
    });

    setSubmitting(false);
    if (error) {
      toast({ title: "Failed to submit review", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Review submitted!", description: "Thank you for your feedback." });
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Your Rating</Label>
        <StarRating rating={rating} onRate={setRating} size="lg" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="review-text">Your Review (optional)</Label>
        <Textarea
          id="review-text"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Tell others about your experience..."
          maxLength={1000}
        />
      </div>
      <Button type="submit" disabled={submitting || rating === 0}>
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Submit Review
      </Button>
    </form>
  );
}
