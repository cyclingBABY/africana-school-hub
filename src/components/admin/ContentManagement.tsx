import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  PlusCircle, Trash2, Edit, Eye, EyeOff, Image, 
  Upload, Video, X, FolderOpen, Save, Check 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, 
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// --- Interfaces ---
interface Post {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  author_id: string;
  is_published: boolean;
  created_at: string;
  author?: { full_name: string };
}

interface MediaItem {
  id: string;
  title: string;
  file_url: string;
  file_type: string;
  category: string;
}

interface ContentManagementProps {
  staffId: string;
  isSuperAdmin: boolean;
}

const ContentManagement = ({ staffId, isSuperAdmin }: ContentManagementProps) => {
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
    category: "news", // Default folder
    is_published: false,
  });

  useEffect(() => {
    fetchPosts();
    fetchMediaItems();
  }, []);

  // --- Data Fetching ---
  const fetchMediaItems = async () => {
    const { data, error } = await supabase
      .from('site_media')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error("Media Fetch Error:", error);
    if (data) setMediaItems(data as MediaItem[]);
  };

  const fetchPosts = async () => {
    try {
      let query = supabase
        .from('posts')
        .select(`*, author:staff_members(full_name)`)
        .order('created_at', { ascending: false });

      if (!isSuperAdmin) query = query.eq('author_id', staffId);

      const { data, error } = await query;
      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Posts Fetch Error:', error);
      toast({ title: "Error loading posts", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };


  // --- Logic Handlers ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast({ title: "File Too Large", variant: "destructive" });
        return;
      }
      setUploadedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadAndSync = async (file: File, title: string, category: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${category}/${fileName}`;

    // 1. Upload to Storage
    const { error: storageError } = await supabase.storage
      .from('site-media')
      .upload(filePath, file);
    if (storageError) throw storageError;

    const { data: { publicUrl } } = supabase.storage.from('site-media').getPublicUrl(filePath);

    // 2. Sync to Database (So it shows in library)
    const { error: dbError } = await supabase.from('site_media').insert({
      title: title,
      file_url: publicUrl,
      file_type: file.type.startsWith('video/') ? 'video' : 'image',
      category: category
    });
    if (dbError) console.error("DB Sync Error:", dbError);

    return publicUrl;
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) return;
    setIsUploading(true);

    try {
      let finalImageUrl = formData.image_url;
      if (uploadedFile) {
        finalImageUrl = await uploadAndSync(uploadedFile, formData.title, formData.category);
      }

      const payload = {
        title: formData.title,
        content: formData.content,
        image_url: finalImageUrl || null,
        is_published: formData.is_published,
        author_id: staffId,
      };

      const { error } = editingPost 
        ? await supabase.from('posts').update(payload).eq('id', editingPost.id)
        : await supabase.from('posts').insert(payload);

      if (error) throw error;

      toast({ title: editingPost ? "Post Updated" : "Post Created" });
      resetForm();
      fetchPosts();
      fetchMediaItems();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: "", content: "", image_url: "", category: "news", is_published: false });
    setEditingPost(null);
    setIsDialogOpen(false);
    setUploadedFile(null);
    setPreviewUrl(null);
  };

  if (isLoading) return <div className="flex justify-center p-10 animate-pulse">Loading Hub Content...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">News & School Events</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4"/> New Post</Button></DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>{editingPost ? "Edit" : "Create"} Post</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <Input placeholder="Post Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}/>
              <Textarea placeholder="Content..." rows={5} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}/>
              
              <div className="border p-4 rounded-md bg-muted/20">
                <Label className="mb-2 block">Media Folder & File</Label>
                <Tabs defaultValue="upload">
                  <TabsList className="w-full mb-2">
                    <TabsTrigger value="upload" className="flex-1">Upload New</TabsTrigger>
                    <TabsTrigger value="library" className="flex-1">From Library</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upload" className="space-y-3">
                    <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                      <SelectTrigger><SelectValue placeholder="Select Folder"/></SelectTrigger>
                      <SelectContent>
                        {['news', 'campus', 'classroom', 'events', 'gallery'].map(c => (
                          <SelectItem key={c} value={c}>{c.toUpperCase()}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input type="file" onChange={handleFileChange} />
                  </TabsContent>

                  <TabsContent value="library">
                    <Button variant="outline" className="w-full" onClick={() => setIsMediaPickerOpen(true)}>
                      <FolderOpen className="mr-2 h-4 w-4"/> Browse Library ({mediaItems.length})
                    </Button>
                  </TabsContent>
                </Tabs>
                
                {previewUrl && (
                  <div className="mt-4 relative">
                    <img src={previewUrl} className="h-32 w-full object-cover rounded-md border" />
                    <Button size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6" onClick={() => {setPreviewUrl(null); setUploadedFile(null); setFormData({...formData, image_url: ""})}}><X/></Button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Switch checked={formData.is_published} onCheckedChange={v => setFormData({...formData, is_published: v})}/>
                <Label>Publish to Website</Label>
              </div>

              <Button onClick={handleSubmit} className="w-full" disabled={isUploading}>
                {isUploading ? "Processing..." : <><Save className="mr-2 h-4 w-4"/> Save Post</>}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Posts List */}
      <div className="grid gap-4">
        {posts.map(post => (
          <Card key={post.id} className="flex overflow-hidden">
            {post.image_url && <img src={post.image_url} className="w-32 object-cover bg-muted" />}
            <CardContent className="p-4 flex-1">
              <div className="flex justify-between">
                <h3 className="font-bold">{post.title}</h3>
                <Badge variant={post.is_published ? "default" : "outline"}>{post.is_published ? "Live" : "Draft"}</Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{post.content}</p>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => {setEditingPost(post); setFormData({title: post.title, content: post.content, image_url: post.image_url || "", category: "news", is_published: post.is_published}); setPreviewUrl(post.image_url); setIsDialogOpen(true);}}><Edit className="h-4 w-4"/></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Library Picker Modal */}
      <Dialog open={isMediaPickerOpen} onOpenChange={setIsMediaPickerOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Select from site-media Bucket</DialogTitle></DialogHeader>
          <ScrollArea className="h-[400px] mt-4">
            <div className="grid grid-cols-3 gap-3">
              {mediaItems.map(item => (
                <div key={item.id} className="relative group cursor-pointer border rounded-md overflow-hidden hover:border-primary" onClick={() => {setFormData({...formData, image_url: item.file_url}); setPreviewUrl(item.file_url); setIsMediaPickerOpen(false);}}>
                  <img src={item.file_url} className="h-24 w-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center"><Check className="text-white"/></div>
                  <Badge className="absolute bottom-1 right-1 text-[10px]">{item.category}</Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentManagement;