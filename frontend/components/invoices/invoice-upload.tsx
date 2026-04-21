"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

export default function InvoiceUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const qc = useQueryClient();

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"], "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] },
    maxFiles: 1,
  });

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.invoices.upload(file);
      toast.success(`Invoice uploaded — ID: ${res.invoice_id}`);
      setFile(null);
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Upload Invoice</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            {isDragActive ? "Drop it here" : "Drag & drop or click to select"}
          </p>
          <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 10MB</p>
        </div>

        {file && (
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <FileText className="h-4 w-4 text-blue-500 shrink-0" />
            <span className="text-sm text-gray-700 flex-1 truncate">{file.name}</span>
            <button onClick={() => setFile(null)}>
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
        )}

        <Button onClick={handleUpload} disabled={!file || uploading} className="w-full">
          {uploading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</> : "Upload & Process"}
        </Button>
      </CardContent>
    </Card>
  );
}
