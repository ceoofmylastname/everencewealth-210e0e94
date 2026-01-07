import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Upload } from 'lucide-react';

const AdminProperties: React.FC = () => {
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        setLoading(true);
        // @ts-ignore - properties table not yet in types
        const { data, error } = await (supabase as any)
            .from('properties')
            .select('*')
            .order('display_order', { ascending: true });

        // @ts-ignore - properties table not yet in types
        if (data) setProperties(data as any[]);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">

                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Property Management</h1>
                            <p className="text-gray-600 mt-1">Manage properties across all 10 languages</p>
                        </div>
                        <Button className="bg-primary hover:bg-primary/90">
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Property
                        </Button>
                    </div>
                </div>

                {/* Properties List */}
                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600">Loading properties...</p>
                    </div>
                ) : properties.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties yet</h3>
                        <p className="text-gray-600 mb-6">Start by adding your first property</p>
                        <Button className="bg-primary">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Property
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {properties.map((property) => (
                            <div key={property.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {/* Image Preview */}
                                        {property.images && property.images.length > 0 && (
                                            <img
                                                src={property.images[0]}
                                                alt={property.internal_name}
                                                className="w-24 h-24 object-cover rounded-lg"
                                            />
                                        )}

                                        {/* Property Info */}
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{property.internal_name}</h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {property.location} · {property.category} · Ref: {property.internal_ref}
                                            </p>
                                            <p className="text-sm font-semibold text-primary mt-1">
                                                €{property.price_eur.toLocaleString()}
                                            </p>
                                            <div className="flex gap-3 mt-2 text-xs text-gray-500">
                                                <span>{property.beds_min}-{property.beds_max || property.beds_min} beds</span>
                                                <span>{property.baths} baths</span>
                                                <span>{property.size_sqm}m²</span>
                                                <span>{property.images?.length || 0} images</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminProperties;
