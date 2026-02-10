import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PlusCircle, Trash2, Edit, Eye, EyeOff, Image, Upload, Video, X, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Post {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  author_id: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  category: string | null;
  display_order: number | null;
  author?: {
    full_name: string;
  };
}

interface MediaItem {
  id: string;
  title: string;
  file_url: string;
  file_type: string;
}

interface PostsManagementProps {
  staffId: string;
  isSuperAdmin: boolean;
  onUpdate: () => void;
}

const categories = [
  { value: "school_trip", label: "School Trip" },
  { value: "sports", label: "Sports" },
  { value: "students", label: "Students" },
  { value: "gallery", label: "Gallery" },
  { value: "general", label: "General" },
  { value: "hero", label: "Hero" },
  { value: "features", label: "Features" },
];

const PostsManagement = ({ staffId, isSuperAdmin, onUpdate }: PostsManagementProps) => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image_url: "",
    is_published: false,
    category: "general",
    display_order: 0,
  });

  useEffect(() => {
    fetchPosts();
    fetchMediaItems();
  }, []);

  const fetchMediaItems = async () => {
    const { data } = await supabase
      .from('media_files')
      .select('id, file_name, file_url, file_type')
      .order('created_at', { ascending: false });
    
    if (data) {
      setMediaItems(data.map(item => ({
        id: item.id,
        title: item.file_name,
        file_url: item.file_url,
        file_type: item.file_type
      })));
    }
  };

  const fetchPosts = async () => {
    let query = supabase
      .from('posts')
      .select(`
        *,
        author:staff_members!posts_author_id_fkey(full_name)
      `)
      .order('created_at', { ascending: false });

    if (!isSuperAdmin) {
      query = query.eq('author_id', staffId);
    }

    const { data, error } = await query;
    if (data) setPosts(data as Post[]);
    setIsLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast({ title: "File Too Large", variant: "destructive" });
        return;
      }
      setUploadedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setFormData({ ...formData, image_url: "" });
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `news/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('content-media')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('content-media')
      .getPublicUrl(filePath);

    // Automatically register this new upload in the library table
    await supabase.from('media_files').insert({
      file_name: file.name,
      file_url: publicUrl,
      file_type: file.type.startsWith('video') ? 'video' : 'image'
    });

    return publicUrl;
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      toast({ title: "Title and content required", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    let imageUrl = formData.image_url;

    try {
      if (uploadedFile) {
        imageUrl = await uploadFile(uploadedFile) || "";
      }

      const postData = {
        title: formData.title,
        content: formData.content,
        image_url: imageUrl || null,
        is_published: formData.is_published,
        category: formData.category,
        display_order: formData.display_order,
        author_id: staffId,
      };

      const { error } = editingPost 
        ? await supabase.from('posts').update(postData).eq('id', editingPost.id)
        : await supabase.from('posts').insert(postData);

      if (error) throw error;
      
      toast({ title: editingPost ? "Post Updated" : "Post Created" });
      resetForm();
      fetchPosts();
      fetchMediaItems();
      onUpdate();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: "", content: "", image_url: "", is_published: false, category: "general", display_order: 0 });
    setEditingPost(null);
    setIsDialogOpen(false);
    setUploadedFile(null);
    setPreviewUrl(null);
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      image_url: post.image_url || "",
      is_published: post.is_published,
      category: post.category || "general",
      display_order: post.display_order || 0,
    });
    setPreviewUrl(post.image_url);
    setIsDialogOpen(true);
  };

  const handleDelete = async (postId: string) => {
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (!error) {
      toast({ title: "Post Deleted" });
      fetchPosts();
      onUpdate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="w-4 h-4 mr-2" /> New Post</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPost ? "Edit Post" : "Create New Post"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Title *</Label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div>
                <Label>Content *</Label>
                <Textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={6} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={formData.category || "general"} onValueChange={(v) => setFormData({...formData, category: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Order</Label>
                  <Input type="number" value={formData.display_order} onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value) || 0})} />
                </div>
              </div>
              <div>
                <Label>Media</Label>
                <Tabs defaultValue="upload">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">Upload</TabsTrigger>
                    <TabsTrigger value="library">Library</TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload" className="space-y-2">
                    <Input type="file" accept="image/*,video/*" onChange={handleFileChange} />
                  </TabsContent>
                  <TabsContent value="library">
                    <Button variant="outline" className="w-full" onClick={() => setIsMediaPickerOpen(true)}>
                      <FolderOpen className="w-4 h-4 mr-2" /> Open Library
                    </Button>
                  </TabsContent>
                </Tabs>
                {previewUrl && (
                  <div className="mt-3 relative border rounded-lg overflow-hidden">
                    <img src={previewUrl} className="w-full h-48 object-cover" />
                    <Button size="icon" variant="destructive" className="absolute top-2 right-2" onClick={() => {setPreviewUrl(null); setFormData({...formData, image_url: ""}); setUploadedFile(null)}}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.is_published} onCheckedChange={(c) => setFormData({ ...formData, is_published: c })} />
                <Label>Published</Label>
              </div>
              <Button onClick={handleSubmit} className="w-full" disabled={isUploading}>
                {isUploading ? "Uploading..." : editingPost ? "Update Post" : "Create Post"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isMediaPickerOpen} onOpenChange={setIsMediaPickerOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Select from Media Library</DialogTitle></DialogHeader>
          <ScrollArea className="h-[400px]">
            <div className="grid grid-cols-3 gap-4 p-4">
              {mediaItems.map((item) => (
                <div key={item.id} className="cursor-pointer group relative" onClick={() => { setFormData({...formData, image_url: item.file_url}); setPreviewUrl(item.file_url); setUploadedFile(null); setIsMediaPickerOpen(false); }}>
                  <img src={item.file_url} className="aspect-square object-cover rounded-md border group-hover:border-primary" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs">Select</div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Post List Card (Abbreviated for space - Keep your existing card logic here) */}
      <Card>
        <CardHeader><CardTitle>Posts</CardTitle></CardHeader>
        <CardContent>
            <div className="space-y-4">
                {posts.map(post => (
                    <div key={post.id} className="flex gap-4 p-4 border rounded-lg items-center">
                        {post.image_url && <img src={post.image_url} className="w-16 h-16 object-cover rounded" />}
                        <div className="flex-1">
                            <h4 className="font-bold">{post.title}</h4>
                            <Badge variant={post.is_published ? "default" : "secondary"}>{post.is_published ? "Published" : "Draft"}</Badge>
                        </div>
                        <Button variant="ghost" onClick={() => handleEdit(post)}><Edit className="w-4 h-4"/></Button>
                        <Button variant="ghost" className="text-destructive" onClick={() => handleDelete(post.id)}><Trash2 className="w-4 h-4"/></Button>
                    </div>
                ))}
            </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostsManagement;