import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, FileText } from "lucide-react";

export default function SowPdfUploader({ onExtracted }) {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setLoading(true);
    setError("");

    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Extract all structured data from this Statement of Work (SOW) PDF. Return a JSON object with these fields:
- sow_number (string, e.g. "01")
- title (string, short title of what the SOW is about)
- vendor_name (string, the service provider company name)
- vendor_email (string, invoice/finance email if present)
- description (string, full description of services)
- start_date (string, ISO date YYYY-MM-DD)
- end_date (string, ISO date YYYY-MM-DD, calculate from start_date + period of performance)
- total_monthly_value (number, sum of all personnel monthly rates)
- advance_amount (number, advance invoice amount if mentioned, else 0)
- personnel (array of objects with: name, rate_per_month, allocation_percent (default 100 unless stated as 70%, 50% etc), role)
- notes (string, any important payment terms or conditions)`,
      file_urls: [file_url],
      response_json_schema: {
        type: "object",
        properties: {
          sow_number: { type: "string" },
          title: { type: "string" },
          vendor_name: { type: "string" },
          vendor_email: { type: "string" },
          description: { type: "string" },
          start_date: { type: "string" },
          end_date: { type: "string" },
          total_monthly_value: { type: "number" },
          advance_amount: { type: "number" },
          personnel: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                rate_per_month: { type: "number" },
                allocation_percent: { type: "number" },
                role: { type: "string" }
              }
            }
          },
          notes: { type: "string" }
        }
      }
    });

    setLoading(false);
    onExtracted(result, file_url);
  };

  return (
    <div className="space-y-3">
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-8 cursor-pointer hover:border-primary/50 transition-colors bg-muted/30">
        <input type="file" accept="application/pdf" className="hidden" onChange={handleFile} />
        {loading ? (
          <>
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
            <p className="text-sm text-muted-foreground">Extracting SOW data with AI...</p>
          </>
        ) : fileName ? (
          <>
            <FileText className="w-8 h-8 text-green-600 mb-2" />
            <p className="text-sm font-medium">{fileName}</p>
            <p className="text-xs text-muted-foreground mt-1">Click to upload a different file</p>
          </>
        ) : (
          <>
            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">Upload SOW PDF</p>
            <p className="text-xs text-muted-foreground mt-1">AI will extract all details automatically</p>
          </>
        )}
      </label>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}