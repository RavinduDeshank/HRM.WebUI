import { useEffect, useState } from "react";
import { deleteDocument, listDocuments } from "./api";
import type { UploadedDocument } from "./api";
import { useToast } from "./Toast";
import { useAuth } from "./Auth";

function normalizeType(type: UploadedDocument["type"]): "Policy" | "Contract" {
  if (type === 0 || type === "Policy") return "Policy";
  return "Contract";
}

function TrashIcon() {
  return (
    <svg
      className="trash-icon"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9.5 7V5.5a1.5 1.5 0 0 1 1.5-1.5h2a1.5 1.5 0 0 1 1.5 1.5V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 7l.8 12.1a2 2 0 0 0 2 1.9h5.4a2 2 0 0 0 2-1.9L17.5 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function DocumentTable() {
  const { showToast } = useToast();
  const { employeeId } = useAuth();
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function refresh() {
    setIsLoading(true);
    try {
      const docs = await listDocuments();
      setDocuments(docs);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to load documents.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleDocuments = documents.filter((doc) => {
    const type = normalizeType(doc.type);
    if (type === "Policy") return true;
    // Contract documents are only visible to the employee they belong to.
    return !!employeeId && !!doc.employeeId && doc.employeeId.toUpperCase() === employeeId.toUpperCase();
  });

  async function handleDelete(doc: UploadedDocument) {
    if (!window.confirm(`Delete "${doc.fileName}"? This cannot be undone.`)) {
      return;
    }
    setDeletingId(doc.id);
    try {
      await deleteDocument(doc.id);
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      showToast("success", `Deleted "${doc.fileName}".`);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="document-table-wrap">
      <div className="document-table-header">
        <h3>Documents</h3>
        <button type="button" className="btn-ghost" onClick={refresh} disabled={isLoading}>
          {isLoading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {isLoading ? (
        <p className="muted">Loading documents…</p>
      ) : visibleDocuments.length === 0 ? (
        <p className="muted">No documents available.</p>
      ) : (
        <table className="document-table">
          <thead>
            <tr>
              <th>File name</th>
              <th>Type</th>
              <th>Employee</th>
              <th>Uploaded</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {visibleDocuments.map((doc) => {
              const type = normalizeType(doc.type);
              return (
                <tr key={doc.id}>
                  <td>{doc.fileName}</td>
                  <td>{type === "Policy" ? "Global Policy" : "Contract"}</td>
                  <td>{type === "Contract" ? doc.employeeId ?? "—" : "All employees"}</td>
                  <td>{doc.uploadedAtUtc ? new Date(doc.uploadedAtUtc).toLocaleString() : "—"}</td>
                  <td>
                    <button
                      type="button"
                      className="btn-icon btn-delete"
                      title="Delete document"
                      aria-label={`Delete ${doc.fileName}`}
                      onClick={() => handleDelete(doc)}
                      disabled={deletingId === doc.id}
                    >
                      <TrashIcon />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
