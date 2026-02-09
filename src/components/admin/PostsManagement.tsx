
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
      .in('file_type', ['image', 'video'])
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

    if (error) {
      console.error('Error fetching posts:', error);
    }

    if (data) {
      setPosts(data as Post[]);
    }
    setIsLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Maximum file size is 50MB",
          variant: "destructive",
        });
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

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('content-media')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      toast({
        title: "Missing Information",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    let imageUrl = formData.image_url;

    try {
      if (uploadedFile) {
        imageUrl = await uploadFile(uploadedFile) || "";
      }

      if (editingPost) {
        const { error } = await supabase
          .from('posts')
          .update({
            title: formData.title,
            content: formData.content,
            image_url: imageUrl || null,
            is_published: formData.is_published,
            category: formData.category as any,
            display_order: formData.display_order,
          })
          .eq('id', editingPost.id);

        if (error) throw error;
        
        toast({
          title: "Post Updated",
          description: "Your post has been updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('posts')
          .insert({
            title: formData.title,
            content: formData.content,
            image_url: imageUrl || null,
            author_id: staffId,
            is_published: formData.is_published,
            category: formData.category as any,
            display_order: formData.display_order,
          });

        if (error) throw error;
        
        toast({
          title: "Post Created",
          description: "Your post has been created successfully",
        });
      }
      
      resetForm();
      fetchPosts();
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save post",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
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
    setUploadedFile(null);
    setPreviewUrl(post.image_url || null);
    setIsDialogOpen(true);
  };

  const selectMediaFromLibrary = (item: MediaItem) => {
    setFormData({ ...formData, image_url: item.file_url });
    setPreviewUrl(item.file_url);
    setUploadedFile(null);
    setIsMediaPickerOpen(false);
  };

  const clearMedia = () => {
    setFormData({ ...formData, image_url: "" });
    setPreviewUrl(null);
    setUploadedFile(null);
  };

  const handleDelete = async (postId: string) => {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Post Deleted",
        description: "The post has been deleted",
      });
      fetchPosts();
      onUpdate();
    }
  };

  const handleTogglePublish = async (post: Post) => {
    const { error } = await supabase
      .from('posts')
      .update({ is_published: !post.is_published })
      .eq('id', post.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update post status",
        variant: "destructive",
      });
    } else {
      toast({
        title: post.is_published ? "Post Unpublished" : "Post Published",
        description: `The post is now ${post.is_published ? 'hidden' : 'visible'} to the public`,
      });
      fetchPosts();
    }
  };

  const resetForm = () => {
    setFormData({ 
      title: "", 
      content: "", 
      image_url: "", 
      is_published: false,
      category: "general",
      display_order: 0,
    });
    setEditingPost(null);
    setIsDialogOpen(false);
    setUploadedFile(null);
    setPreviewUrl(null);
  };

  const canEditPost = (post: Post) => {
    return isSuperAdmin || post.author_id === staffId;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPost ? "Edit Post" : "Create New Post"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Title *</Label>
                <Input
                  placeholder="Enter post title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Content *</Label>
                <Textarea
                  placeholder="Write your post content here..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div>
                <Label>Image/Video</Label>
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">Upload New</TabsTrigger>
                    <TabsTrigger value="library">From Library</TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload" className="space-y-3">
                    <Input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      Supports images and videos up to 50MB
                    </p>
                  </TabsContent>
                  <TabsContent value="library">
                    <Dialog open={isMediaPickerOpen} onOpenChange={setIsMediaPickerOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                          <FolderOpen className="w-4 h-4 mr-2" />
                          Select from Media Library
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle>Select Media</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="h-[60vh] pr-4">
                          {mediaItems.length === 0 ? (
                            <div className="text-center py-12">
                              <Image className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                              <p className="text-muted-foreground">No media in library. Upload media first.</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-3 gap-3">
                              {mediaItems.map((item) => (
                                <div
                                  key={item.id}
                                  onClick={() => selectMediaFromLibrary(item)}
                                  className="relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-colors group"
                                >
                                  {item.file_type === 'image' ? (
                                    <img
                                      src={item.file_url}
                                      alt={item.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-muted flex items-center justify-center">
                                      <Video className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <p className="text-primary-foreground text-sm font-medium">Select</p>
                                  </div>
                                  <Badge className="absolute bottom-1 left-1 text-xs" variant="secondary">
                                    {item.file_type}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          )}
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  </TabsContent>
                </Tabs>
                
                {(previewUrl || uploadedFile) && (
                  <div className="mt-3 relative">
                    <div className="rounded-lg overflow-hidden border border-border">
                      {uploadedFile?.type.startsWith('video/') || (previewUrl && formData.image_url && !uploadedFile && previewUrl.match(/\.(mp4|webm|mov)$/i)) ? (
                        <video
                          src={previewUrl || undefined}
                          className="w-full h-40 object-cover"
                          controls
                        />
                      ) : (
                        <img
                          src={previewUrl || undefined}
                          alt="Preview"
                          className="w-full h-40 object-cover"
                        />
                      )}
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={clearMedia}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                  />
                  <Label>Publish immediately</Label>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSubmit} className="flex-1" disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Upload className="w-4 h-4 mr-2 animate-pulse" />
                      Saving...
                    </>
                  ) : (
                    editingPost ? "Update Post" : "Create Post"
                  )}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isSuperAdmin ? `All Posts (${posts.length})` : `Your Posts (${posts.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <PlusCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No posts yet. Create your first post!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="flex flex-col md:flex-row gap-4 p-4 bg-muted/50 rounded-lg border border-border"
                >
                  {post.image_url && (
                    <div className="w-full md:w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={post.image_url} 
                        alt={post.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground truncate">{post.title}</h3>
                        <Badge variant={post.is_published ? "default" : "secondary"}>
                          {post.is_published ? (
                            <>
                              <Eye className="w-3 h-3 mr-1" />
                              Published
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 mr-1" />
                              Draft
                            </>
                          )}
                        </Badge>
                        {post.category && (
                          <Badge variant="outline" className="capitalize">
                            {post.category.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {isSuperAdmin && post.author && (
                        <span>By: {post.author.full_name}</span>
                      )}
                      <span>Created: {new Date(post.created_at).toLocaleDateString()}</span>
                      {post.updated_at !== post.created_at && (
                        <span>Updated: {new Date(post.updated_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  {canEditPost(post) && (
                    <div className="flex md:flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTogglePublish(post)}
                        title={post.is_published ? "Unpublish" : "Publish"}
                      >
                        {post.is_published ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(post)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Post?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{post.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(post.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PostsManagement;
