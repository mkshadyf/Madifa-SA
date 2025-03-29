import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Film, Trash2, Pencil, Plus, Search, Filter } from 'lucide-react';

// ContentItem type from shared/types.ts
interface ContentItem {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  trailerUrl: string;
  releaseYear: number;
  duration?: number;
  isPremium: boolean;
  contentType?: 'movie' | 'series' | 'music_video' | 'trailer' | 'short_film';
  displayPriority?: number;
  vimeoId?: string;
  rating?: string;
  categoryId: number;
  category?: string;
  progress?: number;
}

// Content table Row component
const ContentTableRow = ({ 
  content, 
  onEdit, 
  onDelete 
}: { 
  content: ContentItem; 
  onEdit: (id: number) => void; 
  onDelete: (id: number) => void;
}) => {
  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-16 rounded bg-muted overflow-hidden">
            {content.thumbnailUrl ? (
              <img 
                src={content.thumbnailUrl} 
                alt={content.title} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <Film className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{content.title}</div>
            <div className="text-xs text-muted-foreground">ID: {content.id}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={content.isPremium ? "default" : "outline"}>
          {content.isPremium ? "Premium" : "Free"}
        </Badge>
      </TableCell>
      <TableCell>
        {content.contentType ? (
          <Badge variant="secondary">
            {content.contentType.replace('_', ' ')}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs">Not set</span>
        )}
      </TableCell>
      <TableCell>{content.category || 'Uncategorized'}</TableCell>
      <TableCell>{content.releaseYear}</TableCell>
      <TableCell>
        {content.duration ? `${Math.floor(content.duration / 60)}:${(content.duration % 60).toString().padStart(2, '0')}` : 'N/A'}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(content.id)}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(content.id)}>
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default function Content() {
  const { toast } = useToast();
  const [contentFilter, setContentFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editContentId, setEditContentId] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<number | null>(null);

  // Fetch content
  const { data: contents, isLoading, isError } = useQuery<ContentItem[]>({
    queryKey: ['/api/admin/contents'],
    retry: 1,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (contentId: number) => {
      const response = await fetch(`/api/admin/contents/${contentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete content');
      }
      
      return contentId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/contents'] });
      toast({
        title: 'Content deleted',
        description: 'The content has been successfully deleted.',
      });
      setDeleteConfirmOpen(false);
    },
    onError: (error) => {
      console.error('Error deleting content:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete content. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleEdit = (id: number) => {
    setEditContentId(id);
  };

  const handleDelete = (id: number) => {
    setContentToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (contentToDelete !== null) {
      deleteMutation.mutate(contentToDelete);
    }
  };

  // Filter content based on contentType and search term
  const filteredContent = contents?.filter(content => {
    const matchesType = contentFilter === 'all' || content.contentType === contentFilter;
    const matchesSearch = !searchTerm || 
      content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (content.description && content.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch;
  });

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Content Management</CardTitle>
          <CardDescription>An error occurred while loading content.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/contents'] })}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Content Management</h1>
        <p className="text-muted-foreground">
          Manage your videos, movies, and other content in one place.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="py-4 px-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>All Content</CardTitle>
                <CardDescription>
                  {filteredContent?.length || 0} items total
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild>
                  <a href="/admin/vimeo">
                    Manage in Vimeo
                  </a>
                </Button>
                <Button asChild>
                  <a href="/admin/upload">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New
                  </a>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search content..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Type:</span>
                <Select value={contentFilter} onValueChange={setContentFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="movie">Movies</SelectItem>
                    <SelectItem value="series">Series</SelectItem>
                    <SelectItem value="music_video">Music Videos</SelectItem>
                    <SelectItem value="trailer">Trailers</SelectItem>
                    <SelectItem value="short_film">Short Films</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Spinner size="lg" />
              </div>
            ) : (
              <>
                {filteredContent && filteredContent.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Access</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Year</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredContent.map((content) => (
                          <ContentTableRow
                            key={content.id}
                            content={content}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                      <Film className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">No content found</h3>
                    <p className="text-muted-foreground mt-2 mb-4">
                      {searchTerm || contentFilter !== 'all'
                        ? "Try adjusting your filters"
                        : "You haven't added any content yet"}
                    </p>
                    <Button asChild>
                      <a href="/admin/vimeo">Import from Vimeo</a>
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Content</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this content? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <Spinner className="mr-2" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}