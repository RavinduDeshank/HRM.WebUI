const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5289";

export type DocumentType = "Policy" | "Contract";

export interface UploadedDocument {
  id: string;
  fileName: string;
  type: DocumentType | 0 | 1;
  employeeId: string | null;
  uploadedAtUtc?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Request failed (${res.status}): ${body || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function sendChatMessage(employeeId: string, message: string): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employeeId, message }),
  });
  const data = await handleResponse<{ reply: string }>(res);
  return data.reply;
}

export async function uploadDocument(
  file: File,
  type: DocumentType,
  employeeId?: string
): Promise<UploadedDocument> {
  const params = new URLSearchParams({ type });
  if (employeeId) {
    params.set("employeeId", employeeId);
  }

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/api/documents/upload?${params.toString()}`, {
    method: "POST",
    body: formData,
  });
  return handleResponse<UploadedDocument>(res);
}

export async function listDocuments(): Promise<UploadedDocument[]> {
  const res = await fetch(`${API_BASE_URL}/api/documents`);
  return handleResponse<UploadedDocument[]>(res);
}

export async function deleteDocument(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/documents/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Request failed (${res.status}): ${body || res.statusText}`);
  }
}
