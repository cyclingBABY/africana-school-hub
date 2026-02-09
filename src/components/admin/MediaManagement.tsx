
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Upload, 
  Trash2, 
  Edit2, 
  Image, 
  Video, 
  Plus,
  X,
  Save,
  Eye
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MediaItem {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  category: string | null;
  created_at: string;
}

const categories = [
  { value: "gallery", label: "Gallery" },
  { value: "campus", label: "Campus" },
  { value: "events", label: "Events" },
  { value: "sports", label: "Sports" },
  { value: "classroom", label: "Classroom" },
  { value: "facilities", label: "Facilities" },
  { value: "other", label: "Other" },
];

const MediaManagement = () => {
  const { toast } = useToast();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  const [newMedia, setNewMedia] = useState({
    title: "",
    description: "",
    category: "gallery",
    file: null as File | null,
  });

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    const { data, error } = await supabase
      .from('media_files')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      const mappedData = data.map((item: any) => ({
        id: item.id,
        title: item.file_name,
        description: null,
        file_url: item.file_url,
        file_type: item.file_type,
        category: null,
        created_at: item.created_at,
      }));
      setMediaItems(mappedData);
    }
    if (error) {
      console.error('Error fetching media:', error);
    }
    setIsLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Maximum file size is 50MB",
          variant: "destructive",
        });
        return;
      }
      setNewMedia({ ...newMedia, file });
    }
  };

  const getFileType = (file: File): string => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return 'other';
  };

  const handleUpload = async () => {
    if (!newMedia.file || !newMedia.title) {
      toast({
        title: "Missing Information",
        description: "Please provide a title and select a file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = newMedia.file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${newMedia.category}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('content-media')
        .upload(filePath, newMedia.file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('content-media')
        .getPublicUrl(filePath);

      // Save to database
      const { error: dbError } = await supabase
        .from('media_files')
        .insert({
          file_name: newMedia.title,
          file_url: publicUrl,
          file_type: getFileType(newMedia.file!),
        });

      if (dbError) throw dbError;

      toast({
        title: "Upload Successful",
        description: "Media has been uploaded successfully",
      });

      setNewMedia({ title: "", description: "", category: "gallery", file: null });
      setIsAddOpen(false);
      fetchMedia();
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload media",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingItem) return;

    const { error } = await supabase
      .from('media_files')
      .update({
        file_name: editingItem.title,
      })
      .eq('id', editingItem.id);

    if (error) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Updated",
        description: "Media details updated successfully",
      });
      setEditingItem(null);
      fetchMedia();
    }
  };

  const handleDelete = async (item: MediaItem) => {
    // Extract file path from URL
    const urlParts = item.file_url.split('/content-media/');
    const filePath = urlParts[1];

    // Delete from storage
    if (filePath) {
      await supabase.storage.from('content-media').remove([filePath]);
    }

    // Delete from database
    const { error } = await supabase
      .from('media_files')
      .delete()
      .eq('id', item.id);

    if (error) {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Deleted",
        description: "Media has been deleted",
      });
      fetchMedia();
    }
  };

  const filteredMedia = mediaItems.filter(item => {
    if (filterCategory !== "all" && item.category !== filterCategory) return false;
    if (filterType !== "all" && item.file_type !== filterType) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Media Management</h2>
          <p className="text-muted-foreground">Upload and manage photos and videos for the website</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Upload Media
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload New Media</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Title *</Label>
                <Input
                  placeholder="Enter media title"
                  value={newMedia.title}
                  onChange={(e) => setNewMedia({ ...newMedia, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Optional description"
                  value={newMedia.description}
                  onChange={(e) => setNewMedia({ ...newMedia, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select 
                  value={newMedia.category} 
                  onValueChange={(value) => setNewMedia({ ...newMedia, category: value })}
                >
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
                <Label>File *</Label>
                <Input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Supports images and videos up to 50MB
                </p>
              </div>
              {newMedia.file && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">{newMedia.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(newMedia.file.size / 1024 / 1024).toFixed(2)} MB • {getFileType(newMedia.file)}
                  </p>
                </div>
              )}
              <Button onClick={handleUpload} className="w-full" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-pulse" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Media
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Label className="text-sm">Category:</Label>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm">Type:</Label>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground self-center">
          Showing {filteredMedia.length} of {mediaItems.length} items
        </p>
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <Image className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No media uploaded yet</p>
          <p className="text-sm text-muted-foreground">Click "Upload Media" to add photos and videos</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map((item) => (
            <Card key={item.id} className="overflow-hidden group">
              <div className="relative aspect-square bg-muted">
                {item.file_type === 'image' ? (
                  <img
                    src={item.file_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Video className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => setPreviewItem(item)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => setEditingItem(item)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Media?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{item.title}". This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(item)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                {/* Type badge */}
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-xs">
                    {item.file_type === 'image' ? (
                      <Image className="w-3 h-3 mr-1" />
                    ) : (
                      <Video className="w-3 h-3 mr-1" />
                    )}
                    {item.file_type}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-3">
                <p className="font-medium text-sm truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewItem?.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {previewItem?.file_type === 'image' ? (
              <img
                src={previewItem.file_url}
                alt={previewItem.title}
                className="w-full max-h-[70vh] object-contain rounded-lg"
              />
            ) : previewItem?.file_type === 'video' ? (
              <video
                src={previewItem.file_url}
                controls
                className="w-full max-h-[70vh] rounded-lg"
              />
            ) : null}
            {previewItem?.description && (
              <p className="mt-4 text-muted-foreground">{previewItem.description}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Media Details</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4 pt-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editingItem.description || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select 
                  value={editingItem.category || "other"} 
                  onValueChange={(value) => setEditingItem({ ...editingItem, category: value })}
                >
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
              <div className="flex gap-2">
                <Button onClick={handleUpdate} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingItem(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediaManagement;