import { supabase } from "./supabase";

export type TaskStatus = "TODAY" | "THIS_WEEK" | "DUMPING_GROUND" | "DONE";

export type Task = {
  id: string;
  user_id: string;
  title: string;
  status: TaskStatus;
  due_date: string | null; // YYYY-MM-DD
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function listTasks() {
  return supabase
    .schema("deadline")
    .from("tasks")
    .select("id,user_id,title,status,due_date,created_at,updated_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
}

export async function createTask(params: {
  title: string;
  status: TaskStatus;
  due_date?: string | null;
}) {
  const title = params.title.trim();
  if (!title) throw new Error("Title required");

  return supabase
    .schema("deadline")
    .from("tasks")
    .insert({
      title,
      status: params.status,
      due_date: params.due_date ?? null,
    })
    .select("id,user_id,title,status,due_date,created_at,updated_at")
    .single();
}

export async function updateTask(
  id: string,
  patch: Partial<Pick<Task, "title" | "status" | "due_date">>,
) {
  return supabase
    .schema("deadline")
    .from("tasks")
    .update(patch)
    .eq("id", id)
    .select("id,user_id,title,status,due_date,created_at,updated_at")
    .single();
}

export async function softDeleteTask(id: string) {
  return supabase
    .schema("deadline")
    .from("tasks")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
}

export async function restoreTask(id: string) {
  return supabase
    .schema("deadline")
    .from("tasks")
    .update({ deleted_at: null })
    .eq("id", id);
}
