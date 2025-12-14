import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Save, ExternalLink, Plus, X, Loader2 } from 'lucide-react';

interface CityBrochure {
  id: string;
  slug: string;
  name: string;
  hero_image: string | null;
  hero_headline: string | null;
  hero_subtitle: string | null;
  description: string | null;
  gallery_images: string[];
  features: string[];
  meta_title: string | null;
  meta_description: string | null;
  is_published: boolean;
}

const BrochureManager: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<CityBrochure>>({});
  const [newFeature, setNewFeature] = useState('');
  const [newGalleryImage, setNewGalleryImage] = useState('');

  // Fetch all brochures
  const { data: brochures, isLoading } = useQuery({
    queryKey: ['city-brochures'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('city_brochures')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as CityBrochure[];
    },
  });

  // Update brochure mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<CityBrochure> & { id: string }) => {
      const { error } = await supabase
        .from('city_brochures')
        .update({
          hero_image: data.hero_image,
          hero_headline: data.hero_headline,
          hero_subtitle: data.hero_subtitle,
          description: data.description,
          gallery_images: data.gallery_images,
          features: data.features,
          meta_title: data.meta_title,
          meta_description: data.meta_description,
          is_published: data.is_published,
        })
        .eq('id', data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['city-brochures'] });
      toast({ title: 'Saved', description: 'Brochure updated successfully.' });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to save changes.',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  // Set edit data when city changes
  useEffect(() => {
    if (selectedCity && brochures) {
      const city = brochures.find((b) => b.slug === selectedCity);
      if (city) {
        setEditData(city);
      }
    }
  }, [selectedCity, brochures]);

  const handleSave = () => {
    if (!editData.id) return;
    updateMutation.mutate(editData as CityBrochure);
  };

  const addFeature = () => {
    if (!newFeature.trim()) return;
    setEditData({
      ...editData,
      features: [...(editData.features || []), newFeature.trim()],
    });
    setNewFeature('');
  };

  const removeFeature = (index: number) => {
    const features = [...(editData.features || [])];
    features.splice(index, 1);
    setEditData({ ...editData, features });
  };

  const addGalleryImage = () => {
    if (!newGalleryImage.trim()) return;
    setEditData({
      ...editData,
      gallery_images: [...(editData.gallery_images || []), newGalleryImage.trim()],
    });
    setNewGalleryImage('');
  };

  const removeGalleryImage = (index: number) => {
    const images = [...(editData.gallery_images || [])];
    images.splice(index, 1);
    setEditData({ ...editData, gallery_images: images });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Brochure Manager</h1>
            <p className="text-muted-foreground">
              Manage city brochure pages content and SEO
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* City List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Cities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {brochures?.map((city) => (
                <button
                  key={city.slug}
                  onClick={() => setSelectedCity(city.slug)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    selectedCity === city.slug
                      ? 'bg-prime-gold text-prime-950'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="font-medium">{city.name}</div>
                  <div className="text-xs opacity-70">
                    {city.is_published ? 'Published' : 'Draft'}
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Editor */}
          <div className="lg:col-span-3">
            {selectedCity && editData.id ? (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{editData.name}</CardTitle>
                  <div className="flex items-center gap-4">
                    <a
                      href={`/brochure/${editData.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      Preview <ExternalLink className="w-3 h-3" />
                    </a>
                    <Button
                      onClick={handleSave}
                      disabled={updateMutation.isPending}
                      className="bg-prime-gold hover:bg-prime-gold/90 text-prime-950"
                    >
                      {updateMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="content">
                    <TabsList className="mb-6">
                      <TabsTrigger value="content">Content</TabsTrigger>
                      <TabsTrigger value="gallery">Gallery</TabsTrigger>
                      <TabsTrigger value="features">Features</TabsTrigger>
                      <TabsTrigger value="seo">SEO</TabsTrigger>
                    </TabsList>

                    {/* Content Tab */}
                    <TabsContent value="content" className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div>
                          <Label className="font-medium">Published</Label>
                          <p className="text-sm text-muted-foreground">
                            Make this brochure visible to the public
                          </p>
                        </div>
                        <Switch
                          checked={editData.is_published}
                          onCheckedChange={(checked) =>
                            setEditData({ ...editData, is_published: checked })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Hero Image URL</Label>
                        <Input
                          value={editData.hero_image || ''}
                          onChange={(e) =>
                            setEditData({ ...editData, hero_image: e.target.value })
                          }
                          placeholder="https://..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Hero Headline</Label>
                        <Input
                          value={editData.hero_headline || ''}
                          onChange={(e) =>
                            setEditData({ ...editData, hero_headline: e.target.value })
                          }
                          placeholder="Luxury Living in..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Hero Subtitle</Label>
                        <Input
                          value={editData.hero_subtitle || ''}
                          onChange={(e) =>
                            setEditData({ ...editData, hero_subtitle: e.target.value })
                          }
                          placeholder="The jewel of the Costa del Sol"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={editData.description || ''}
                          onChange={(e) =>
                            setEditData({ ...editData, description: e.target.value })
                          }
                          rows={6}
                          placeholder="Write a compelling description..."
                        />
                      </div>
                    </TabsContent>

                    {/* Gallery Tab */}
                    <TabsContent value="gallery" className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        {editData.gallery_images?.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Gallery ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => removeGalleryImage(index)}
                              className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newGalleryImage}
                          onChange={(e) => setNewGalleryImage(e.target.value)}
                          placeholder="Image URL..."
                        />
                        <Button onClick={addGalleryImage} variant="outline">
                          <Plus className="w-4 h-4 mr-2" /> Add Image
                        </Button>
                      </div>
                    </TabsContent>

                    {/* Features Tab */}
                    <TabsContent value="features" className="space-y-6">
                      <div className="space-y-2">
                        {editData.features?.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-3 bg-muted rounded-lg"
                          >
                            <span className="flex-1">{feature}</span>
                            <button
                              onClick={() => removeFeature(index)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newFeature}
                          onChange={(e) => setNewFeature(e.target.value)}
                          placeholder="Add a feature..."
                          onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                        />
                        <Button onClick={addFeature} variant="outline">
                          <Plus className="w-4 h-4 mr-2" /> Add
                        </Button>
                      </div>
                    </TabsContent>

                    {/* SEO Tab */}
                    <TabsContent value="seo" className="space-y-6">
                      <div className="space-y-2">
                        <Label>Meta Title</Label>
                        <Input
                          value={editData.meta_title || ''}
                          onChange={(e) =>
                            setEditData({ ...editData, meta_title: e.target.value })
                          }
                          placeholder="Page title for search engines"
                        />
                        <p className="text-xs text-muted-foreground">
                          {editData.meta_title?.length || 0}/60 characters
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Meta Description</Label>
                        <Textarea
                          value={editData.meta_description || ''}
                          onChange={(e) =>
                            setEditData({ ...editData, meta_description: e.target.value })
                          }
                          rows={3}
                          placeholder="Description for search engines"
                        />
                        <p className="text-xs text-muted-foreground">
                          {editData.meta_description?.length || 0}/160 characters
                        </p>
                      </div>

                      {/* Google Preview */}
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground mb-2">
                          Google Preview
                        </p>
                        <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                          {editData.meta_title || `Luxury Properties in ${editData.name}`}
                        </div>
                        <div className="text-green-700 text-sm">
                          www.delsolprimehomes.com/brochure/{editData.slug}
                        </div>
                        <div className="text-sm text-gray-600">
                          {editData.meta_description ||
                            `Discover exceptional properties in ${editData.name} on the Costa del Sol.`}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">
                  Select a city to edit its brochure
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default BrochureManager;
