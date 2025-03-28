import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Edit, Trash2, Plus, Eye, Image, Upload } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { Category } from '@shared/schema';
import { getImageUrl } from '@/lib/supabase';

interface CategoryFormData {
  name: string;
  description: string;
  thumbnailUrl: string;
}

export default function Categories() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showThumbnailDialog, setShowThumbnailDialog] = useState(false);
  const [activeThumbnailUrl, setActiveThumbnailUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    thumbnailUrl: '',
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch all categories
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await apiRequest('GET', '/api/categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch categories.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [toast]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle file selection for thumbnail
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      
      // Create a preview URL for the selected file
      const previewUrl = URL.createObjectURL(e.target.files[0]);
      setFormData(prev => ({ ...prev, thumbnailUrl: previewUrl }));
    }
  };

  // Handle thumbnail upload
  const handleThumbnailUpload = async () => {
    if (!file) {
      toast({
        title: 'No File Selected',
        description: 'Please select an image file to upload.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulated upload progress (in a real app, this would come from an upload API)
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 300);

    try {
      // In a production app, this would use the Supabase or another file upload API
      // For simplicity, we'll just simulate a successful upload here
      // and use a placeholder URL
      
      // Simulating API request delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulated successful upload with a generated URL
      // In a real app, this URL would come from your storage service
      const uploadedUrl = `https://images.unsplash.com/photo-${Date.now()}?w=500&auto=format`;
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      toast({
        title: 'Upload Successful',
        description: 'Thumbnail has been uploaded successfully.',
      });

      // Update form data with the uploaded URL
      setFormData(prev => ({ ...prev, thumbnailUrl: uploadedUrl }));
      setFile(null);
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload thumbnail image.',
        variant: 'destructive',
      });
    } finally {
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle category creation
  const handleCreateCategory = async () => {
    if (!formData.name) {
      toast({
        title: 'Missing Fields',
        description: 'Category name is required.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await apiRequest('POST', '/api/admin/categories', formData);
      
      if (response.ok) {
        const newCategory = await response.json();
        setCategories(prev => [...prev, newCategory]);
        
        toast({
          title: 'Category Created',
          description: `Category "${formData.name}" has been created.`,
        });
        
        // Reset form and close dialog
        setFormData({
          name: '',
          description: '',
          thumbnailUrl: '',
        });
        setShowAddDialog(false);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create category');
      }
    } catch (error) {
      console.error('Create failed:', error);
      toast({
        title: 'Create Failed',
        description: error instanceof Error ? error.message : 'Failed to create category.',
        variant: 'destructive',
      });
    }
  };

  // Handle category update
  const handleUpdateCategory = async () => {
    if (!formData.name || !selectedCategoryId) {
      toast({
        title: 'Missing Fields',
        description: 'Category name is required.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await apiRequest('PUT', `/api/admin/categories/${selectedCategoryId}`, formData);
      
      if (response.ok) {
        const updatedCategory = await response.json();
        setCategories(prev => 
          prev.map(cat => cat.id === selectedCategoryId ? updatedCategory : cat)
        );
        
        toast({
          title: 'Category Updated',
          description: `Category "${formData.name}" has been updated.`,
        });
        
        // Reset form and close dialog
        setFormData({
          name: '',
          description: '',
          thumbnailUrl: '',
        });
        setSelectedCategoryId(null);
        setShowEditDialog(false);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update category');
      }
    } catch (error) {
      console.error('Update failed:', error);
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update category.',
        variant: 'destructive',
      });
    }
  };

  // Handle category deletion
  const handleDeleteCategory = async () => {
    if (!selectedCategoryId) return;

    try {
      const response = await apiRequest('DELETE', `/api/admin/categories/${selectedCategoryId}`);
      
      if (response.ok) {
        setCategories(prev => prev.filter(cat => cat.id !== selectedCategoryId));
        
        toast({
          title: 'Category Deleted',
          description: 'Category has been deleted successfully.',
        });
        
        setSelectedCategoryId(null);
        setShowDeleteDialog(false);
      } else {
        const error = await response.text();
        throw new Error(error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        title: 'Delete Failed',
        description: error instanceof Error ? error.message : 'Failed to delete category.',
        variant: 'destructive',
      });
    }
  };

  // Set up for editing a category
  const handleEditSetup = (category: Category) => {
    setSelectedCategoryId(category.id);
    setFormData({
      name: category.name,
      description: category.description || '',
      thumbnailUrl: category.thumbnailUrl || '',
    });
    setShowEditDialog(true);
  };

  // Set up for deleting a category
  const handleDeleteSetup = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setShowDeleteDialog(true);
  };

  // Handle thumbnail preview
  const handleThumbnailPreview = (url: string) => {
    setActiveThumbnailUrl(url);
    setShowThumbnailDialog(true);
  };

  // If not authenticated or not an admin, show error
  if (!isLoading && (!user || !user.isAdmin)) {
    return (
      <Card className="w-full max-w-3xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You need administrator privileges to access this page.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Category Management</h1>
      
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Categories</CardTitle>
            <CardDescription>
              Manage content categories for the platform
            </CardDescription>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <span className="animate-spin mr-2">
                <RefreshCw size={20} />
              </span>
              Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <Image className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No categories found</h3>
              <p className="text-sm text-muted-foreground">
                Get started by adding your first content category.
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thumbnail</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        {category.thumbnailUrl ? (
                          <button
                            className="relative h-14 w-24 overflow-hidden rounded-md border"
                            onClick={() => handleThumbnailPreview(category.thumbnailUrl || '')}
                          >
                            <img
                              src={category.thumbnailUrl}
                              alt={`Thumbnail for ${category.name}`}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 flex items-center justify-center">
                              <Eye className="text-white opacity-0 hover:opacity-100" size={20} />
                            </div>
                          </button>
                        ) : (
                          <div className="h-14 w-24 bg-muted rounded-md flex items-center justify-center">
                            <Image size={20} className="text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{category.name}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground truncate max-w-xs">
                          {category.description || 'No description'}
                        </p>
                      </TableCell>
                      <TableCell className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditSetup(category)}
                        >
                          <Edit size={16} className="mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteSetup(category.id)}
                        >
                          <Trash2 size={16} className="mr-1" />
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Category Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a new content category for your videos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Category name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Category description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
              <div className="flex space-x-2">
                <Input
                  id="thumbnailUrl"
                  name="thumbnailUrl"
                  placeholder="URL to thumbnail image"
                  value={formData.thumbnailUrl}
                  onChange={handleInputChange}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => document.getElementById('thumbnail-upload')?.click()}
                >
                  <Upload size={16} className="mr-1" />
                  Browse
                </Button>
                <input
                  id="thumbnail-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              
              {formData.thumbnailUrl && (
                <div className="mt-2">
                  <img
                    src={formData.thumbnailUrl}
                    alt="Thumbnail preview"
                    className="h-32 object-cover rounded-md"
                  />
                </div>
              )}
              
              {file && (
                <div className="mt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleThumbnailUpload}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw size={16} className="mr-2 animate-spin" />
                        Uploading... ({uploadProgress}%)
                      </>
                    ) : (
                      <>
                        <Upload size={16} className="mr-2" />
                        Upload Selected File
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCategory}>
              Create Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the details of this content category.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                name="name"
                placeholder="Category name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                placeholder="Category description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-thumbnailUrl">Thumbnail URL</Label>
              <div className="flex space-x-2">
                <Input
                  id="edit-thumbnailUrl"
                  name="thumbnailUrl"
                  placeholder="URL to thumbnail image"
                  value={formData.thumbnailUrl}
                  onChange={handleInputChange}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => document.getElementById('edit-thumbnail-upload')?.click()}
                >
                  <Upload size={16} className="mr-1" />
                  Browse
                </Button>
                <input
                  id="edit-thumbnail-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              
              {formData.thumbnailUrl && (
                <div className="mt-2">
                  <img
                    src={formData.thumbnailUrl}
                    alt="Thumbnail preview"
                    className="h-32 object-cover rounded-md"
                  />
                </div>
              )}
              
              {file && (
                <div className="mt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleThumbnailUpload}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw size={16} className="mr-2 animate-spin" />
                        Uploading... ({uploadProgress}%)
                      </>
                    ) : (
                      <>
                        <Upload size={16} className="mr-2" />
                        Upload Selected File
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCategory}>
              Update Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? This action cannot be undone,
              and all content associated with this category will need to be reassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Thumbnail Preview Dialog */}
      <Dialog open={showThumbnailDialog} onOpenChange={setShowThumbnailDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thumbnail Preview</DialogTitle>
          </DialogHeader>
          {activeThumbnailUrl && (
            <div className="flex justify-center">
              <img 
                src={activeThumbnailUrl} 
                alt="Category thumbnail" 
                className="max-w-full max-h-[70vh] object-contain rounded-md"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}