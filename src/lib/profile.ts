import { supabase } from "./supabase";

export type Profile = {
  id: string;
  username: string | null;
  avatar_path: string | null;
};

export async function fetchMyProfile() {
  return supabase
    .schema("core")
    .from("profiles")
    .select("id, username, avatar_path")
    .single();
}

export async function saveUsername(username: string) {
  const clean = username.trim().toLowerCase();
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;
  if (!user) throw new Error("Not logged in");

  return supabase
    .schema("core")
    .from("profiles")
    .update({ username: clean })
    .eq("id", user.id)
    .select("id, username, avatar_path")
    .single();
}

export async function uploadAvatar(file: File) {
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;
  if (!user) throw new Error("Not logged in");

  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const path = `${user.id}/avatar.${ext}`;

  const up = await supabase.storage.from("avatars").upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (up.error) throw up.error;

  const prof = await supabase
    .schema("core")
    .from("profiles")
    .update({ avatar_path: path })
    .eq("id", user.id)
    .select("id, username, avatar_path")
    .single();

  return prof;
}

export async function signedAvatarUrl(path: string) {
  const { data, error } = await supabase.storage
    .from("avatars")
    .createSignedUrl(path, 60 * 60);

  if (error) throw error;
  return data.signedUrl;
}
