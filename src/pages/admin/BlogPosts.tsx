import { useState, useCallback, useEffect, useRef } from "react";
import { PageMeta } from "@/components/PageMeta";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, ExternalLink, FileText, Sparkles, ImageIcon, Wand2, Calendar, Save, History, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { AIWriterPanel } from "@/components/admin/AIWriterPanel";
import { AIImageModal } from "@/components/admin/AIImageModal";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image_url: string | null;
  status: string;
  source: string;
  tags: string[] | null;
  category: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  external_id: string | null;
}

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
}

const DEFAULT_FORM: PostForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  featured_image_url: "",
  status: "draft",
  tags: "",
  category: "",
  scheduled_at: "",
};

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function BlogPostsPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PostForm>(DEFAULT_FORM);
  const [showAIWriter, setShowAIWriter] = useState(false);
  const [showAIImage, setShowAIImage] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");

  // Autosave drafts every 30s while editing
  useEffect(() => {
    if (!dialogOpen || !editingId) return;
    if (form.status !== "draft") return;

    const formKey = JSON.stringify(form);
    if (formKey === lastSavedRef.current) return;

    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(async () => {
      if (!form.title.trim() || !form.content.trim()) return;
      setAutosaveStatus("saving");
      try {
        const tagsArray = form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : null;
        await supabase.from("posts").update({
          title: form.title,
          slug: form.slug,
          excerpt: form.excerpt || null,
          content: form.content,
          featured_image_url: form.featured_image_url || null,
          tags: tagsArray,
          category: form.category || null,
        }).eq("id", editingId);
        lastSavedRef.current = formKey;
        setAutosaveStatus("saved");
        setTimeout(() => setAutosaveStatus("idle"), 2000);
      } catch {
        setAutosaveStatus("idle");
      }
    }, 30000);

    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); };
  }, [form, dialogOpen, editingId]);

  const { data: posts, isLoading } = useQuery({
    queryKey: ["admin_posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Post[];
    },
  });

  // Fetch versions for current post
  const { data: versions, refetch: refetchVersions } = useQuery({
    queryKey: ["post_versions", editingId],
    enabled: !!editingId && showVersions,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("post_versions")
        .select("*")
        .eq("post_id", editingId!)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  async function saveVersionSnapshot(postId: string, currentForm: PostForm) {
    const { data: session } = await supabase.auth.getSession();
    const tagsArray = currentForm.tags ? currentForm.tags.split(",").map(t => t.trim()).filter(Boolean) : null;
    await supabase.from("post_versions").insert({
      post_id: postId,
      title: currentForm.title,
      content: currentForm.content,
      excerpt: currentForm.excerpt || null,
      featured_image_url: currentForm.featured_image_url || null,
      tags: tagsArray,
      category: currentForm.category || null,
      saved_by: session?.session?.user?.id || null,
    });
  }

  const saveMutation = useMutation({
    mutationFn: async (values: PostForm & { id?: string }) => {
      const tagsArray = values.tags ? values.tags.split(",").map(t => t.trim()).filter(Boolean) : null;
      const payload = {
        title: values.title,
        slug: values.slug,
        excerpt: values.excerpt || null,
        content: values.content,
        featured_image_url: values.featured_image_url || null,
        status: values.status,
        tags: tagsArray,
        category: values.category || null,
        scheduled_at: values.status === "scheduled" && values.scheduled_at ? values.scheduled_at : null,
        published_at: values.status === "published" ? new Date().toISOString() : null,
      };

      if (values.id) {
        // Save version snapshot before updating
        await saveVersionSnapshot(values.id, values);
        const { error } = await supabase.from("posts").update(payload).eq("id", values.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("posts").insert({ ...payload, source: "native" as const }).select("id").single();
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_posts"] });
      if (editingId) refetchVersions();
      toast({ title: editingId ? "Post updated" : "Post created" });
      closeDialog();
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_posts"] });
      toast({ title: "Post deleted" });
      setDeleteId(null);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  function restoreVersion(version: any) {
    setForm(prev => ({
      ...prev,
      title: version.title,
      content: version.content,
      excerpt: version.excerpt || "",
      featured_image_url: version.featured_image_url || "",
      tags: version.tags?.join(", ") || "",
      category: version.category || "",
    }));
    setShowVersions(false);
    toast({ title: "Version restored", description: "Review the changes and save when ready." });
  }


  function openCreate() {
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setDialogOpen(true);
  }

  function openEdit(post: Post) {
    setEditingId(post.id);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content,
      featured_image_url: post.featured_image_url || "",
      status: post.status,
      tags: post.tags?.join(", ") || "",
      category: post.category || "",
      scheduled_at: post.scheduled_at || "",
    });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setShowAIWriter(false);
  }

  function handleTitleChange(title: string) {
    setForm((prev) => ({
      ...prev,
      title,
      slug: !editingId ? slugify(title) : prev.slug,
    }));
  }

  const handleContentChange = useCallback((html: string) => {
    setForm((prev) => ({ ...prev, content: html }));
  }, []);

  function handleSave() {
    if (!form.title.trim() || !form.slug.trim() || !form.content.trim()) {
      toast({ title: "Title, slug, and content are required", variant: "destructive" });
      return;
    }
    saveMutation.mutate({ ...form, id: editingId || undefined });
  }

  function handleAIInsert(html: string) {
    setForm((prev) => ({ ...prev, content: prev.content + html }));
    setShowAIWriter(false);
  }

  function handleImageGenerated(url: string) {
    setForm((prev) => ({ ...prev, featured_image_url: url }));
    setShowAIImage(false);
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <PageMeta title="Blog Posts | Admin" description="Manage blog posts." />
      <AdminLayout>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold font-sans">Blog Posts</h1>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" /> New Post
          </Button>
        </div>

        {!posts?.length ? (
          <div className="text-center py-16 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="text-lg font-medium">No blog posts yet</p>
            <p className="text-sm mt-1">Create your first post or connect ContentFlow to auto-publish.</p>
          </div>
        ) : (
          <div className="rounded-lg border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell">Source</TableHead>
                  <TableHead className="hidden md:table-cell">Tags</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="font-medium truncate max-w-[260px]">{post.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">/{post.slug}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={post.status === "published" ? "default" : post.status === "scheduled" ? "outline" : "secondary"}>
                        {post.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {post.source === "contentflow" ? "ContentFlow" : "Native"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex gap-1 flex-wrap max-w-[150px]">
                        {post.tags?.slice(0, 2).map(t => (
                          <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                        ))}
                        {(post.tags?.length || 0) > 2 && <span className="text-xs text-muted-foreground">+{post.tags!.length - 2}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {post.created_at ? format(new Date(post.created_at), "MMM d, yyyy") : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(post)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(post.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
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
                    <img
                      src={form.featured_image_url}
                      alt="Preview"
                      className="mt-2 rounded-md border border-border w-full h-32 object-cover"
                    />
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

                <div>
                  <Label className="text-xs text-muted-foreground">Tags (comma separated)</Label>
                  <Input
                    value={form.tags}
                    onChange={(e) => setForm(p => ({ ...p, tags: e.target.value }))}
                    placeholder="plumbing, diy, tips"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="flex items-center">
              {autosaveStatus !== "idle" && editingId && form.status === "draft" && (
                <span className="text-xs text-muted-foreground flex items-center gap-1 mr-auto">
                  {autosaveStatus === "saving" && <><Loader2 className="h-3 w-3 animate-spin" /> Saving…</>}
                  {autosaveStatus === "saved" && <><Save className="h-3 w-3" /> Draft saved</>}
                </span>
              )}
              <Button variant="outline" onClick={closeDialog}>Cancel</Button>
              <Button onClick={handleSave} disabled={saveMutation.isPending} className="gap-2">
                {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
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

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this post?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </>
  );
}
