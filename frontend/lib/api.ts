const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function getConversations(clerkUserId: string) {
  const res = await fetch(`${API_URL}/api/conversations?clerk_user_id=${clerkUserId}`);
  if (!res.ok) throw new Error("Failed to fetch conversations");
  return res.json();
}

export async function getDocuments(clerkUserId: string) {
  const res = await fetch(`${API_URL}/api/documents?clerk_user_id=${clerkUserId}`);
  if (!res.ok) throw new Error("Failed to fetch documents");
  return res.json();
}

export async function uploadDocument(file: File, clerkUserId: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("clerk_user_id", clerkUserId);
  const res = await fetch(`${API_URL}/api/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload document");
  return res.json();
}

export async function deleteDocument(id: string, clerkUserId: string) {
  const res = await fetch(`${API_URL}/api/documents/${id}?clerk_user_id=${clerkUserId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete document");
  return res.json();
}

export async function updateConversationStatus(id: string, status: string, clerkUserId: string) {
  const res = await fetch(`${API_URL}/api/conversations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, clerk_user_id: clerkUserId }),
  });
  if (!res.ok) throw new Error("Failed to update conversation");
  return res.json();
}

export async function clearAllConversations(clerkUserId: string) {
  const res = await fetch(`${API_URL}/api/conversations?clerk_user_id=${clerkUserId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to clear conversations");
  return res.json();
}

export async function syncCompany(
  clerkUserId: string,
  businessName?: string,
  twilioWhatsappNumber?: string
) {
  const res = await fetch(`${API_URL}/api/company/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clerk_user_id: clerkUserId,
      business_name: businessName,
      twilio_whatsapp_number: twilioWhatsappNumber,
    }),
  });
  if (!res.ok) throw new Error("Failed to sync company");
  return res.json();
}

export async function getCompany(clerkUserId: string) {
  const res = await fetch(`${API_URL}/api/company/${clerkUserId}`);
  if (res.status === 404) return null; // no company row yet — that's fine, not an error
  if (!res.ok) throw new Error("Failed to fetch company settings");
  return res.json();
}