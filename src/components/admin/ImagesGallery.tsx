import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, Edit2, Trash2, Eye, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WebsiteImage {
  id: string;
  url: string;
  title: string;
  source: 'post' | 'media_file';
  category?: string | null;
  usedInPosts?: string[];
  created_at: string;
  post_id?: string;
  media_id?: string;
}

interface ImagesGalleryProps {
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

const ImagesGallery = ({ staffId, isSuperAdmin, onUpdate }: ImagesGalleryProps) => {
  const { toast } = useToast();
  const [websiteImages, setWebsiteImages] = useState<WebsiteImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingImage, setEditingImage] = useState<WebsiteImage | null>(null);
  const [previewImage, setPreviewImage] = useState<WebsiteImage | null>(null);
  const [replacingImageFor, setReplacingImageFor] = useState<string | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");

  useEffect(() => {
    fetchAllWebsiteImages();
  }, []);

  const fetchAllWebsiteImages = async () => {
    setIsLoading(true);
    const images: WebsiteImage[] = [];

    // Fetch images from posts
    const { data: postsData } = await supabase
      .from('posts')
      .select('id, title, image_url, category, created_at')
      .not('image_url', 'is', null)
      .order('created_at', { ascending: false });

    if (postsData) {
      postsData.forEach(post => {
        if (post.image_url) {
          images.push({
            id: `post-${post.id}`,
            url: post.image_url,
            title: post.title,
            source: 'post',
            category: post.category,
            post_id: post.id,
            created_at: post.created_at,
          });
        }
      });
    }

    // Fetch images from media_files
    const { data: mediaData } = await supabase
      .from('media_files')
      .select('id, file_name, file_url, file_type, created_at')
      .eq('file_type', 'image')
      .order('created_at', { ascending: false });

    if (mediaData) {
      mediaData.forEach(media => {
        images.push({
          id: `media-${media.id}`,
          url: media.file_url,
          title: media.file_name,
          source: 'media_file',
          media_id: media.id,
          created_at: media.created_at,
        });
      });
    }

    // Check which posts use each image
    const { data: allPosts } = await supabase
      .from('posts')
      .select('id, title, image_url');

    images.forEach(img => {
      const usedIn = allPosts?.filter(p => p.image_url === img.url).map(p => p.title) || [];
      img.usedInPosts = usedIn;
    });

    setWebsiteImages(images);
    setIsLoading(false);
  };

  const handleImageUpdate = async () => {
    if (!editingImage) return;

    try {
      if (editingImage.source === 'post' && editingImage.post_id) {
        const { error } = await supabase
          .from('posts')
          .update({
            title: editingImage.title,
            category: editingImage.category as any,
          })
          .eq('id', editingImage.post_id);

        if (error) throw error;
      } else if (editingImage.source === 'media_file' && editingImage.media_id) {
        const { error } = await supabase
          .from('media_files')
          .update({
            file_name: editingImage.title,
          })
          .eq('id', editingImage.media_id);

        if (error) throw error;
      }

      toast({
        title: "Image Updated",
        description: "Image details have been updated successfully",
      });
      
      setEditingImage(null);
      fetchAllWebsiteImages();
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update image",
        variant: "destructive",
      });
    }
  };

  const handleImageDelete = async (image: WebsiteImage) => {
    try {
      if (image.source === 'post' && image.post_id) {
        // Remove image from post
        const { error } = await supabase
          .from('posts')
          .update({ image_url: null })
          .eq('id', image.post_id);

        if (error) throw error;
      } else if (image.source === 'media_file' && image.media_id) {
        // Delete from storage
        const urlParts = image.url.split('/content-media/');
        const filePath = urlParts[1];
        
        if (filePath) {
          await supabase.storage.from('content-media').remove([filePath]);
        }

        // Delete from database
        const { error } = await supabase
          .from('media_files')
          .delete()
          .eq('id', image.media_id);

        if (error) throw error;
      }

      toast({
        title: "Image Deleted",
        description: "The image has been deleted successfully",
      });
      
      fetchAllWebsiteImages();
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  const handleReplaceImage = async () => {
    if (!newImageFile || !replacingImageFor) return;

    try {
      // Upload new image
      const fileExt = newImageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `replacements/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('content-media')
        .upload(filePath, newImageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('content-media')
        .getPublicUrl(filePath);

      const image = websiteImages.find(img => img.id === replacingImageFor);
      if (!image) return;

      // Update all posts using this image
      const { error: updateError } = await supabase
        .from('posts')
        .update({ image_url: publicUrl })
        .eq('image_url', image.url);

      if (updateError) throw updateError;

      toast({
        title: "Image Replaced",
        description: "The image has been replaced successfully in all posts",
      });
      
      setReplacingImageFor(null);
      setNewImageFile(null);
      fetchAllWebsiteImages();
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to replace image",
        variant: "destructive",
      });
    }
  };

  const filteredImages = websiteImages.filter(img => {
    if (filterCategory !== "all" && img.category !== filterCategory) return false;
    if (filterSource !== "all" && img.source !== filterSource) return false;
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
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
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
          <Label className="text-sm">Source:</Label>
          <Select value={filterSource} onValueChange={setFilterSource}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="post">From Posts</SelectItem>
              <SelectItem value="media_file">Media Library</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAllWebsiteImages}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
        <p className="text-sm text-muted-foreground ml-auto">
          Showing {filteredImages.length} of {websiteImages.length} images
        </p>
      </div>

      {/* Images Grid */}
      {filteredImages.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No images found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your filters or add images to posts</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map((image) => (
            <Card key={image.id} className="overflow-hidden group">
              <div className="relative aspect-square bg-muted">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => setPreviewImage(image)}
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => setEditingImage(image)}
                    title="Edit Details"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => setReplacingImageFor(image.id)}
                    title="Replace Image"
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="destructive" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Image?</AlertDialogTitle>
                        <AlertDialogDescription>
                          {image.source === 'post' 
                            ? `This will remove the image from the post "${image.title}".`
                            : `This will permanently delete "${image.title}" from the media library.`
                          }
                          {image.usedInPosts && image.usedInPosts.length > 0 && (
                            <span className="block mt-2 font-semibold">
                              Warning: This image is used in {image.usedInPosts.length} post(s).
                            </span>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleImageDelete(image)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                {/* Source badge */}
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-xs">
                    {image.source === 'post' ? 'Post' : 'Library'}
                  </Badge>
                </div>
                {/* Usage badge */}
                {image.usedInPosts && image.usedInPosts.length > 0 && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="default" className="text-xs">
                      Used in {image.usedInPosts.length} post(s)
                    </Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-3">
                <p className="font-medium text-sm truncate" title={image.title}>
                  {image.title}
                </p>
                {image.category && (
                  <p className="text-xs text-muted-foreground capitalize">
                    {image.category.replace('_', ' ')}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {new Date(image.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewImage?.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <img
              src={previewImage?.url}
              alt={previewImage?.title}
              className="w-full max-h-[70vh] object-contain rounded-lg"
            />
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {previewImage?.source === 'post' ? 'From Post' : 'Media Library'}
                </Badge>
                {previewImage?.category && (
                  <Badge variant="outline" className="capitalize">
                    {previewImage.category.replace('_', ' ')}
                  </Badge>
                )}
              </div>
              {previewImage?.usedInPosts && previewImage.usedInPosts.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">Used in posts:</p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    {previewImage.usedInPosts.map((postTitle, idx) => (
                      <li key={idx}>{postTitle}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingImage} onOpenChange={() => setEditingImage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Image Details</DialogTitle>
          </DialogHeader>
          {editingImage && (
            <div className="space-y-4 pt-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={editingImage.title}
                  onChange={(e) => setEditingImage({ ...editingImage, title: e.target.value })}
                />
              </div>
              {editingImage.source === 'post' && (
                <div>
                  <Label>Category</Label>
                  <Select 
                    value={editingImage.category || "general"} 
                    onValueChange={(value) => setEditingImage({ ...editingImage, category: value })}
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
              )}
              <div className="flex gap-2">
                <Button onClick={handleImageUpdate} className="flex-1">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingImage(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Replace Image Dialog */}
      <Dialog open={!!replacingImageFor} onOpenChange={() => {
        setReplacingImageFor(null);
        setNewImageFile(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Replace Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Upload a new image to replace the current one. This will update the image in all posts where it's used.
            </p>
            <div>
              <Label>New Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setNewImageFile(e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
            </div>
            {newImageFile && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">{newImageFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(newImageFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <Button 
                onClick={handleReplaceImage} 
                className="flex-1"
                disabled={!newImageFile}
              >
                <Upload className="w-4 h-4 mr-2" />
                Replace Image
              </Button>
              <Button variant="outline" onClick={() => {
                setReplacingImageFor(null);
                setNewImageFile(null);
              }}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImagesGallery;
