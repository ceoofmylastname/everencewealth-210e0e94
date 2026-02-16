import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useHomepageImages(): Record<string, string> {
  const { data } = useQuery({
    queryKey: ['homepage-images'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('homepage_images')
        .select('section_key, image_url');
      if (error) throw error;
      const map: Record<string, string> = {};
      for (const row of data || []) {
        map[row.section_key] = row.image_url;
      }
      return map;
    },
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });

  return data ?? {};
}
