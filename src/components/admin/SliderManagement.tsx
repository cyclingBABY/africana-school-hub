import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Image, 
  Trash2, 
  Plus, 
  Eye,
  RefreshCw,
  Trophy,
  Users,
  Map,
  Camera,
  Edit2,
  Upload,
  Save,
  X,
  Music,
  MessageSquare
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MediaItem {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  category: string | null;
  created_at: string;
}

interface SliderConfig {
  id: string;
  name: string;
  category: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const sliderConfigs: SliderConfig[] = [
  {
    id: "sports",
    name: "Sports & Athletics",
    category: "sports",
    icon: <Trophy className="w-5 h-5" />,
    description: "Football, athletics, and sports achievements",
    color: "bg-orange-500",
  },
  {
    id: "events",
    name: "School Trips",
    category: "events",
    icon: <Map className="w-5 h-5" />,
    description: "Educational excursions and adventures",
    color: "bg-blue-500",
  },
  {
    id: "mdd",
    name: "Music, Dance & Drama",
    category: "mdd",
    icon: <Music className="w-5 h-5" />,
    description: "Performing arts and creative talents",
    color: "bg-pink-500",
  },
  {
    id: "debates",
    name: "Debates",
    category: "debates",
    icon: <MessageSquare className="w-5 h-5" />,
    description: "Public speaking and debate competitions",
    color: "bg-indigo-500",
  },
  {
    id: "campus",
    name: "Our Students",
    category: "campus",
    icon: <Users className="w-5 h-5" />,
    description: "Student life and campus activities",
    color: "bg-green-500",
  },
  {
    id: "gallery",
    name: "School Gallery",
    category: "gallery",
    icon: <Camera className="w-5 h-5" />,
    description: "General school photos and facilities",
    color: "bg-purple-500",
  },
];

const SliderManagement = () => {
  const { toast } = useToast();
  const [allMedia, setAllMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSlider, setActiveSlider] = useState("sports");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null);

  const [newUpload, setNewUpload] = useState({
    title: "",
    description: "",
    file: null as File | null,
  });

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('site_media')
      .select('*')
      .eq('file_type', 'image')
      .order('created_at', { ascending: false });

    if (data) {
      setAllMedia(data as MediaItem[]);
    }
    if (error) {
      console.error('Error fetching media:', error);
      toast({
        title: "Error",
        description: "Failed to load media",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const getSliderMedia = (category: string) => {
    return allMedia.filter(item => item.category === category);
  };

  const getAvailableMedia = () => {
    const currentSliderCategory = sliderConfigs.find(s => s.id === activeSlider)?.category;
    return allMedia.filter(item => item.category !== currentSliderCategory);
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
      setNewUpload({ ...newUpload, file });
    }
  };

  const handleUploadToSlider = async () => {
    if (!newUpload.file || !newUpload.title) {
      toast({
        title: "Missing Information",
        description: "Please provide a title and select a file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const sliderCategory = sliderConfigs.find(s => s.id === activeSlider)?.category;

    try {
      const fileExt = newUpload.file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${sliderCategory}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('site-media')
        .upload(filePath, newUpload.file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('site-media')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('site_media')
        .insert({
          title: newUpload.title,
          description: newUpload.description || null,
          file_url: publicUrl,
          file_type: 'image',
          category: sliderCategory,
        });

      if (dbError) throw dbError;

      toast({
        title: "Upload Successful",
        description: "Image added to slider",
      });

      setNewUpload({ title: "", description: "", file: null });
      setIsUploadDialogOpen(false);
      fetchMedia();
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddToSlider = async () => {
    if (selectedMedia.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one image to add",
        variant: "destructive",
      });
      return;
    }

    const sliderCategory = sliderConfigs.find(s => s.id === activeSlider)?.category;
    
    const { error } = await supabase
      .from('site_media')
      .update({ category: sliderCategory, updated_at: new Date().toISOString() })
      .in('id', selectedMedia);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add images to slider",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Added ${selectedMedia.length} image(s) to slider`,
      });
      setSelectedMedia([]);
      setIsAddDialogOpen(false);
      fetchMedia();
    }
  };

  const handleRemoveFromSlider = async (itemId: string) => {
    const { error } = await supabase
      .from('site_media')
      .update({ category: 'other', updated_at: new Date().toISOString() })
      .eq('id', itemId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove image from slider",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Removed",
        description: "Image removed from slider (still in Media)",
      });
      fetchMedia();
    }
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setEditFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setEditPreviewUrl(previewUrl);
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;

    setIsUpdating(true);

    try {
      let newFileUrl = editingItem.file_url;

      // If a new file was selected, upload it
      if (editFile) {
        const fileExt = editFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${editingItem.category}/${fileName}`;

        // Upload new file
        const { error: uploadError } = await supabase.storage
          .from('site-media')
          .upload(filePath, editFile);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('site-media')
          .getPublicUrl(filePath);

        newFileUrl = publicUrl;

        // Delete old file from storage
        const oldUrlParts = editingItem.file_url.split('/site-media/');
        const oldFilePath = oldUrlParts[1];
        if (oldFilePath) {
          await supabase.storage.from('site-media').remove([decodeURIComponent(oldFilePath)]);
        }
      }

      // Update database record
      const { error } = await supabase
        .from('site_media')
        .update({
          title: editingItem.title,
          description: editingItem.description,
          file_url: newFileUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingItem.id);

      if (error) throw error;

      toast({
        title: "Updated",
        description: editFile ? "Image and details updated successfully" : "Image details updated successfully",
      });
      
      // Cleanup
      if (editPreviewUrl) {
        URL.revokeObjectURL(editPreviewUrl);
      }
      setEditingItem(null);
      setEditFile(null);
      setEditPreviewUrl(null);
      fetchMedia();
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCloseEditDialog = () => {
    if (editPreviewUrl) {
      URL.revokeObjectURL(editPreviewUrl);
    }
    setEditingItem(null);
    setEditFile(null);
    setEditPreviewUrl(null);
  };

  const handleDeletePermanently = async (item: MediaItem) => {
    // Extract file path from URL
    const urlParts = item.file_url.split('/site-media/');
    const filePath = urlParts[1];

    // Delete from storage
    if (filePath) {
      await supabase.storage.from('site-media').remove([decodeURIComponent(filePath)]);
    }

    // Delete from database
    const { error } = await supabase
      .from('site_media')
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
        description: "Image permanently deleted",
      });
      fetchMedia();
    }
  };

  const toggleMediaSelection = (id: string) => {
    setSelectedMedia(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const currentSliderConfig = sliderConfigs.find(s => s.id === activeSlider);

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
          <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Slider Management</h2>
          <p className="text-muted-foreground">Manage images for each slider section on the website</p>
        </div>
        <Button variant="outline" onClick={fetchMedia}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Slider Selection Tabs */}
      <Tabs value={activeSlider} onValueChange={setActiveSlider}>
        <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-auto gap-1">
          {sliderConfigs.map((slider) => (
            <TabsTrigger 
              key={slider.id} 
              value={slider.id}
              className="flex items-center gap-2 py-3 px-2"
            >
              <div className={`p-1 rounded ${slider.color} text-white flex-shrink-0`}>
                {slider.icon}
              </div>
              <span className="hidden lg:inline text-xs">{slider.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {sliderConfigs.map((slider) => (
          <TabsContent key={slider.id} value={slider.id} className="mt-6">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 pb-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${slider.color} text-white`}>
                      {slider.icon}
                    </div>
                    {slider.name}
                  </CardTitle>
                  <CardDescription className="mt-1">{slider.description}</CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">
                    {getSliderMedia(slider.category).length} images
                  </Badge>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSelectedMedia([]);
                      setIsAddDialogOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    From Library
                  </Button>
                  <Button onClick={() => {
                    setNewUpload({ title: "", description: "", file: null });
                    setIsUploadDialogOpen(true);
                  }}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {getSliderMedia(slider.category).length === 0 ? (
                  <div className="text-center py-12 bg-muted/50 rounded-lg">
                    <Image className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No images in this slider</p>
                    <p className="text-sm text-muted-foreground">Upload new images or add from library</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {getSliderMedia(slider.category).map((item, index) => (
                      <div 
                        key={item.id} 
                        className="relative group rounded-lg overflow-hidden border border-border bg-card"
                      >
                        <div className="aspect-video bg-muted">
                          <img
                            src={item.file_url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                          <Button
                            size="icon"
                            variant="secondary"
                            onClick={() => setPreviewItem(item)}
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="secondary"
                            onClick={() => setEditingItem(item)}
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="outline" title="Remove from slider">
                                <X className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove from Slider?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove "{item.title}" from the {slider.name} slider. The image will still be available in Media Management.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleRemoveFromSlider(item.id)}>
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="destructive" title="Delete permanently">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Permanently?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete "{item.title}" from the system. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeletePermanently(item)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete Forever
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                        <div className="absolute top-2 left-2">
                          <Badge variant="secondary" className="text-xs">
                            #{index + 1}
                          </Badge>
                        </div>
                        <div className="p-2">
                          <p className="text-sm font-medium truncate">{item.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Upload New Image Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload to {currentSliderConfig?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>Title *</Label>
              <Input
                placeholder="Enter image title"
                value={newUpload.title}
                onChange={(e) => setNewUpload({ ...newUpload, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Optional description"
                value={newUpload.description}
                onChange={(e) => setNewUpload({ ...newUpload, description: e.target.value })}
              />
            </div>
            <div>
              <Label>Image File *</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Supports JPG, PNG, WebP up to 50MB
              </p>
            </div>
            {newUpload.file && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">{newUpload.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(newUpload.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={handleUploadToSlider} className="flex-1" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-pulse" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload to Slider
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add from Library Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Add Images to {currentSliderConfig?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Select images from your media library to add to this slider
              </p>
              <Badge variant="outline">
                {selectedMedia.length} selected
              </Badge>
            </div>
            
            <ScrollArea className="h-[400px] border rounded-lg p-4">
              {getAvailableMedia().length === 0 ? (
                <div className="text-center py-12">
                  <Image className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No available images</p>
                  <p className="text-sm text-muted-foreground">Upload images first using "Upload New"</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                  {getAvailableMedia().map((item) => (
                    <div
                      key={item.id}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                        selectedMedia.includes(item.id)
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-border hover:border-muted-foreground'
                      }`}
                      onClick={() => toggleMediaSelection(item.id)}
                    >
                      <div className="aspect-video bg-muted">
                        <img
                          src={item.file_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedMedia.includes(item.id)
                          ? 'bg-primary border-primary'
                          : 'bg-card/80 border-border'
                      }`}>
                        {selectedMedia.includes(item.id) && (
                          <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-medium truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">{item.category || 'uncategorized'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddToSlider}
                disabled={selectedMedia.length === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add {selectedMedia.length} Image{selectedMedia.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={handleCloseEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4 pt-4">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden group">
                <img
                  src={editPreviewUrl || editingItem.file_url}
                  alt={editingItem.title}
                  className="w-full h-full object-cover"
                />
                {editFile && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-primary">New Image</Badge>
                  </div>
                )}
              </div>
              <div>
                <Label>Change Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleEditFileChange}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Select a new image to replace the current one
                </p>
              </div>
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
              <div className="flex gap-2">
                <Button onClick={handleUpdateItem} className="flex-1" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Save className="w-4 h-4 mr-2 animate-pulse" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleCloseEditDialog}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewItem?.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <img
              src={previewItem?.file_url}
              alt={previewItem?.title}
              className="w-full max-h-[70vh] object-contain rounded-lg"
            />
            {previewItem?.description && (
              <p className="mt-4 text-muted-foreground">{previewItem.description}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SliderManagement;
