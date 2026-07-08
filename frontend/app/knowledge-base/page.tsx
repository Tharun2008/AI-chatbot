"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { DashboardShell } from "@/components/dashboard-shell";
import { PageHeader } from "@/components/page-header";
import { getDocuments, uploadDocument, deleteDocument } from "@/lib/api";

interface Document {
  id: string;
  name: string;
  type: string;
  created_at: string;
}

export default function KnowledgeBasePage() {
  const { userId } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) fetchDocuments();
  }, [userId]);

  async function fetchDocuments() {
    try {
      const data = await getDocuments(userId!);
      setDocuments(data);
    } catch (err) {
      setError("Failed to load documents");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setUploading(true);
    setError(null);
    try {
      await uploadDocument(file, userId);
      await fetchDocuments();
    } catch (err) {
      setError("Failed to upload document");
    } finally {
      setUploading(false);
      // reset input so same file can be re-uploaded
      e.target.value = "";
    }
  }

  async function handleDelete(id: string) {
    if (!userId) return;
    try {
      await deleteDocument(id, userId);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setError("Failed to delete document");
    }
  }

  return (
    <DashboardShell>
      <PageHeader
        eyebrow="Knowledge Base"
        title="Documents"
        description="Upload PDFs and documents to train your WhatsApp AI assistant."
      />

      <section className="max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-500">
            {documents.length} document{documents.length !== 1 ? "s" : ""} uploaded
          </p>
          <label className={`cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition ${uploading ? "bg-slate-400 cursor-not-allowed" : "bg-slate-950 hover:bg-slate-800"}`}>
            {uploading ? "Uploading..." : "+ Upload Document"}
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center">
            <p className="text-slate-500 font-medium">No documents yet</p>
            <p className="text-sm text-slate-400 mt-1">
              Upload a PDF or DOCX to start training your AI
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-slate-950 text-sm">{doc.name}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(doc.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="text-xs text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </DashboardShell>
  );
}