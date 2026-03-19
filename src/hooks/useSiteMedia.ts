import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type MediaCategory =
  | "features"
  | "gallery"
  | "general"
  | "hero"
  | "school_trip"
  | "sports"
  | "students"
  | "debates"
  | "mdd"
  | "events"
  | "campus";

export interface SiteMedia {
  id: string;
  file_url: string;
  title: string;
  description: string;
  display_order: number;
  created_at: string;
}

const categoryMap: Record<MediaCategory, string[]> = {
  features: ["features"],
  gallery: ["gallery"],
  general: ["general"],
  hero: ["hero"],
  school_trip: ["school_trip", "events"],
  sports: ["sports"],
  students: ["students", "campus"],
  debates: ["debates"],
  mdd: ["mdd"],
  events: ["events", "school_trip"],
  campus: ["campus", "students"],
};

export function useSiteMedia(category: MediaCategory) {
  const [media, setMedia] = useState<SiteMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const categories = categoryMap[category] ?? [category];

        const { data, error: fetchError } = await (supabase as any)
          .from("site_media")
          .select("id, file_url, title, description, created_at, category, file_type")
          .eq("file_type", "image")
          .in("category", categories)
          .order("created_at", { ascending: false });

        if (fetchError) throw fetchError;

        const transformedMedia: SiteMedia[] = ((data as any[]) || []).map((item, index) => ({
          id: item.id,
          file_url: item.file_url || "",
          title: item.title || "",
          description: item.description || "",
          display_order: index,
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
