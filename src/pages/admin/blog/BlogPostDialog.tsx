import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, Wand2, Calendar, Save, History, RotateCcw, Crop } from "lucide-react";
import { format } from "date-fns";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { AIWriterPanel } from "@/components/admin/AIWriterPanel";
import { AIImageModal } from "@/components/admin/AIImageModal";
import { ImageCropper } from "@/components/admin/ImageCropper";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PostForm {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_url: string;
  status: string;
  tags: string;
  category: string;
  scheduled_at: string;
  meta_title: string;
  meta_description: string;
  canonical_url: string;
  og_image_width: string;
  og_image_height: string;
  twitter_card_type: string;
}

interface BlogPostVersion {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  featured_image_url: string | null;
  tags: string[] | null;
  category: string | null;
  created_at: string;
}

interface BlogPostDialogProps {
  open: boolean;
  onClose: () => void;
  editingId: string | null;
  form: PostForm;
  setForm: (val: PostForm | ((prev: PostForm) => PostForm)) => void;
  onSave: () => void;
  isSaving: boolean;
  autosaveStatus: "idle" | "saving" | "saved";
  versions: BlogPostVersion[] | undefined;
  onRestoreVersion: (version: BlogPostVersion) => void;
  showVersions: boolean;
  setShowVersions: (show: boolean) => void;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function BlogPostDialog({
  open,
  onClose,
  editingId,
  form,
  setForm,
  onSave,
  isSaving,
  autosaveStatus,
  versions,
  onRestoreVersion,
  showVersions,
  setShowVersions
}: BlogPostDialogProps) {
  const [showAIWriter, setShowAIWriter] = useState(false);
  const [showAIImage, setShowAIImage] = useState(false);
  const [showCropper, setShowCropper] = useState(false);

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: !editingId ? slugify(title) : prev.slug,
    }));
  };

  const handleContentChange = useCallback((html: string) => {
    setForm((prev) => ({ ...prev, content: html }));
  }, [setForm]);

  const handleAIInsert = (html: string) => {
    setForm((prev) => ({ ...prev, content: prev.content + html }));
    setShowAIWriter(false);
  };

  const handleImageGenerated = (url: string) => {
    setForm((prev) => ({ ...prev, featured_image_url: url }));
    setShowAIImage(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Post" : "New Post"}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-2">
            {/* Main content area */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Title *</Label>
                <Input value={form.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Post title" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Slug *</Label>
                <Input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} placeholder="post-slug" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-xs text-muted-foreground">Content *</Label>
                  <Button variant="ghost" size="sm" onClick={() => setShowAIWriter(!showAIWriter)} className="gap-1 h-7 text-xs">
                    <Sparkles className="h-3.5 w-3.5" />
                    AI Writer
                  </Button>
                </div>
                <RichTextEditor content={form.content} onChange={handleContentChange} placeholder="Write your post content…" />
              </div>

              {showAIWriter && (
                <AIWriterPanel
                  title={form.title}
                  content={form.content}
                  onInsert={handleAIInsert}
                  onClose={() => setShowAIWriter(false)}
                />
              )}

              <div>
                <Label className="text-xs text-muted-foreground">Excerpt</Label>
                <RichTextEditor
                  content={form.excerpt}
                  onChange={(html) => setForm(p => ({ ...p, excerpt: html }))}
                  placeholder="Short summary…"
                  minimal
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.status === "scheduled" && (
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Schedule Date
                  </Label>
                  <Input
                    type="datetime-local"
                    value={form.scheduled_at}
                    onChange={(e) => setForm(p => ({ ...p, scheduled_at: e.target.value }))}
                  />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-xs text-muted-foreground">Featured Image</Label>
                  <Button variant="ghost" size="sm" onClick={() => setShowAIImage(true)} className="gap-1 h-7 text-xs">
                    <Wand2 className="h-3.5 w-3.5" /> Generate
                  </Button>
                </div>
                <Input
                  value={form.featured_image_url}
                  onChange={(e) => setForm((p) => ({ ...p, featured_image_url: e.target.value }))}
                  placeholder="https://…"
                />
                {form.featured_image_url && (
                  <div className="mt-2 space-y-1.5">
                    <img
                      src={form.featured_image_url}
                      alt="Preview"
                      className="rounded-md border border-border w-full h-32 object-cover"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5 text-xs h-7"
                      onClick={() => setShowCropper(true)}
                    >
                      <Crop className="h-3.5 w-3.5" /> Crop Image
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Category</Label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))}
                  placeholder="e.g. Plumbing Tips"
                />
              </div>

              {/* SEO Metadata */}
              <div className="border-t border-border pt-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">SEO</p>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Meta Title</Label>
                    <Input
                      value={form.meta_title}
                      onChange={(e) => setForm(p => ({ ...p, meta_title: e.target.value }))}
                      placeholder={form.title || "Custom page title"}
                      maxLength={60}
                    />
                    <p className="text-[10px] text-muted-foreground mt-0.5">{form.meta_title.length}/60</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Meta Description</Label>
                    <textarea
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[60px] resize-none"
                      value={form.meta_description}
                      onChange={(e) => setForm(p => ({ ...p, meta_description: e.target.value }))}
                      placeholder="Brief description for search engines…"
                      maxLength={160}
                    />
                    <p className="text-[10px] text-muted-foreground mt-0.5">{form.meta_description.length}/160</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Canonical URL</Label>
                    <Input
                      value={form.canonical_url}
                      onChange={(e) => setForm(p => ({ ...p, canonical_url: e.target.value }))}
                      placeholder="https://… (leave blank for default)"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">OG Image Dimensions</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={form.og_image_width}
                        onChange={(e) => setForm(p => ({ ...p, og_image_width: e.target.value }))}
                        placeholder="Width"
                        className="w-1/2"
                      />
                      <Input
                        type="number"
                        value={form.og_image_height}
                        onChange={(e) => setForm(p => ({ ...p, og_image_height: e.target.value }))}
                        placeholder="Height"
                        className="w-1/2"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Recommended: 1200×630</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Twitter Card Type</Label>
                    <Select value={form.twitter_card_type} onValueChange={(v) => setForm(p => ({ ...p, twitter_card_type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
                        <SelectItem value="summary">Summary</SelectItem>
                        <SelectItem value="player">Player</SelectItem>
                        <SelectItem value="app">App</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* SERP Preview */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Google Preview</Label>
                    <div className="rounded-lg border border-border bg-card p-3 space-y-1">
                      <p className="text-sm text-primary truncate leading-snug" style={{ fontFamily: 'arial, sans-serif' }}>
                        {(form.meta_title || form.title || "Page Title").slice(0, 60)}
                        {(form.meta_title || form.title || "").length > 60 && "…"}
                      </p>
                      <p className="text-xs text-muted-foreground" style={{ fontFamily: 'arial, sans-serif' }}>
                        {form.canonical_url
                          ? form.canonical_url.replace(/^https?:\/\//, "").slice(0, 50)
                          : `homequotelink.com › blog › ${form.slug || "post-slug"}`}
                      </p>
                      <p className="text-xs leading-relaxed" style={{ fontFamily: 'arial, sans-serif' }}>
                        {(form.meta_description || form.excerpt?.replace(/<[^>]*>/g, "") || "Add a meta description to control how this post appears in search results.").slice(0, 160)}
                        {(form.meta_description || form.excerpt || "").length > 160 && "…"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Tags (comma separated)</Label>
                <Input
                  value={form.tags}
                  onChange={(e) => setForm(p => ({ ...p, tags: e.target.value }))}
                  placeholder="plumbing, diy, tips"
                />
              </div>

              {/* Version History */}
              {editingId && (
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 text-xs"
                    onClick={() => setShowVersions(!showVersions)}
                  >
                    <History className="h-3.5 w-3.5" />
                    Version History
                  </Button>

                  {showVersions && (
                    <div className="mt-2 border border-border rounded-lg bg-muted/30">
                      <ScrollArea className="max-h-48">
                        {!versions?.length ? (
                          <p className="text-xs text-muted-foreground p-3 text-center">No versions saved yet.</p>
                        ) : (
                          <div className="divide-y divide-border">
                            {versions.map((v: BlogPostVersion) => (
                              <div key={v.id} className="p-2.5 flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-foreground truncate">{v.title}</p>
                                  <p className="text-[10px] text-muted-foreground">
                                    {format(new Date(v.created_at), "MMM d, h:mm a")}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs gap-1 flex-shrink-0"
                                  onClick={() => onRestoreVersion(v)}
                                >
                                  <RotateCcw className="h-3 w-3" /> Restore
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex items-center">
            {autosaveStatus !== "idle" && editingId && form.status === "draft" && (
              <span className="text-xs text-muted-foreground flex items-center gap-1 mr-auto">
                {autosaveStatus === "saving" && <><Loader2 className="h-3 w-3 animate-spin" /> Saving…</>}
                {autosaveStatus === "saved" && <><Save className="h-3 w-3" /> Draft saved</>}
              </span>
            )}
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={onSave} disabled={isSaving} className="gap-2">
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Image Modal */}
      <AIImageModal
        open={showAIImage}
        onOpenChange={setShowAIImage}
        title={form.title}
        slug={form.slug}
        onImageGenerated={handleImageGenerated}
      />

      {/* Image Cropper */}
      {form.featured_image_url && (
        <ImageCropper
          open={showCropper}
          onOpenChange={setShowCropper}
          imageUrl={form.featured_image_url}
          onCropComplete={(dataUrl) => setForm(p => ({ ...p, featured_image_url: dataUrl }))}
        />
      )}
    </>
  );
}
