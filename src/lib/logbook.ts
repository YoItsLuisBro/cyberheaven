import { supabase } from "./supabase";

export type Entry = {
  id: string;
  user_id: string;
  entry_date: string; // YYYY-MM-DD
  title: string | null;
  body: string;
  created_at: string;
  updated_at: string;
};

export async function listEntries() {
  return supabase
    .schema("logbook")
    .from("entries")
    .select("id,user_id,entry_date,title,body,created_at,updated_at")
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false });
}

export async function createEntry(params: {
  entry_date: string;
  title?: string | null;
  body: string;
}) {
  const body = params.body.trim();
  if (!body) throw new Error("Body required");

  return supabase
    .schema("logbook")
    .from("entries")
    .insert({
      entry_date: params.entry_date,
      title: params.title?.trim() || null,
      body,
    })
    .select("id,user_id,entry_date,title,body,created_at,updated_at")
    .single();
}

export async function updateEntry(
  id: string,
  patch: Partial<Pick<Entry, "entry_date" | "title" | "body">>,
) {
  const clean: typeof patch = { ...patch };
  if (typeof clean.title === "string") clean.title = clean.title.trim() || null;
  if (typeof clean.body === "string") clean.body = clean.body.trim();

  return supabase
    .schema("logbook")
    .from("entries")
    .update(clean)
    .eq("id", id)
    .select("id,user_id,entry_date,title,body,created_at,updated_at")
    .single();
}

export async function deleteEntry(id: string) {
  return supabase.schema("logbook").from("entries").delete().eq("id", id);
}
