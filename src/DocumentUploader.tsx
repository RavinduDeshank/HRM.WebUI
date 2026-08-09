import { useRef, useState, useEffect } from "react";
import type { FormEvent } from "react";
import { uploadDocument } from "./api";
import type { DocumentType } from "./api";
import { useToast } from "./Toast";
import { useAuth } from "./Auth";

export default function DocumentUploader() {
  const { showToast } = useToast();
  const [type, setType] = useState<DocumentType>("Policy");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { employeeId } = useAuth();
  const [overrideEmployeeId, setOverrideEmployeeId] = useState<string>(employeeId ?? "");

  useEffect(() => {
    setOverrideEmployeeId(employeeId ?? "");
  }, [employeeId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) {
      showToast("error", "Choose a file first.");
      return;
    }
    if (type === "Contract" && !employeeId && !overrideEmployeeId) {
      showToast("error", "You must sign in or enter an employee ID to upload a contract.");
      return;
    }
    setIsUploading(true);
    try {
      const targetEmployee = type === "Contract" ? (overrideEmployeeId.trim() || employeeId) : undefined;
      const doc = await uploadDocument(file, type, targetEmployee ?? undefined);
      showToast(
        "success",
        `Uploaded "${doc.fileName}" as ${type}${type === "Contract" ? ` for ${targetEmployee}` : ""}.`
      );
      setFile(null);
      setType("Policy");
      setOverrideEmployeeId(employeeId ?? "");
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form className="uploader" onSubmit={handleSubmit}>
      <h3>Upload HR Document</h3>

      <label>
        Document type
        <select value={type} onChange={(e) => setType(e.target.value as DocumentType)}>
          <option value="Policy">Global Policy</option>
          <option value="Contract">Employee Contract</option>
        </select>
      </label>

      {type === "Contract" && (
        <label>
          Employee ID
          <input
            type="text"
            value={overrideEmployeeId}
            onChange={(e) => setOverrideEmployeeId(e.target.value)}
            placeholder={employeeId ? `Signed in: ${employeeId}` : "e.g. EMP001"}
          />
          <small style={{ color: "var(--muted)", marginTop: 6, display: "block" }}>
            You can leave this blank to upload for the signed-in employee.
          </small>
        </label>
      )}

      <label>
        File
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>

      <button type="submit" disabled={isUploading || !file}>
        {isUploading ? "Uploading…" : "Upload"}
      </button>
    </form>
  );
}
