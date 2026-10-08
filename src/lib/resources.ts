import { supabase } from "@/integrations/supabase/client";

export const BUCKET = "resources";

export type Resource = {
  id: string;
  title: string;
  description: string;
  category: string;
  file_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  published: boolean;
  created_at: string;
};

export function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function fileLabel(name: string) {
  return (name.split(".").pop() || "file").toUpperCase();
}

export async function openResource(path: string) {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
  if (error || !data) throw error ?? new Error("Could not open file");
  window.open(data.signedUrl, "_blank", "noopener");
}
