import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type DbContentCategory = Database["public"]["Enums"]["content_category"];

export type MediaCategory = 
  | DbContentCategory
  | "events"  // Alias for school_trip
  | "campus"; // Alias for students

export interface SiteMedia {
  id: string;
  file_url: string;
  title: string;
  description: string;
  display_order: number;
  created_at: string;
}

/**
 * Custom hook to fetch site media by category from the posts table
 * @param category - The category of media to fetch
 * @returns Object containing media array, loading state, and error
 */
export function useSiteMedia(category: MediaCategory) {
  const [media, setMedia] = useState<SiteMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Map aliases to actual database categories
        const categoryMap: Record<string, DbContentCategory> = {
          events: "school_trip",
          campus: "students",
        };

        const dbCategory: DbContentCategory = (categoryMap[category] || category) as DbContentCategory;

        // Fetch published posts with images for the specified category
        const { data, error: fetchError } = await supabase
          .from("posts")
          .select("id, title, content, image_url, display_order, created_at")
          .eq("category", dbCategory)
          .eq("is_published", true)
          .not("image_url", "is", null)
          .order("display_order", { ascending: true })
          .order("created_at", { ascending: false });

        if (fetchError) throw fetchError;

        // Transform data to match SiteMedia interface
        const transformedMedia: SiteMedia[] = (data || []).map((item) => ({
          id: item.id,
          file_url: item.image_url || "",
          title: item.title,
          description: item.content || "",
          display_order: item.display_order || 0,
          created_at: item.created_at,
        }));

        setMedia(transformedMedia);
      } catch (err) {
        console.error(`Error fetching media for category ${category}:`, err);
        setError(err instanceof Error ? err : new Error("Failed to fetch media"));
        setMedia([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedia();
  }, [category]);

  return { media, isLoading, error };
}
