import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, CheckCircle } from "lucide-react";

export default function PdfUploader({ onExtracted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState(null);
  const inputRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setLoading(true);
    setError(null);

    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a grant contract analyst. Extract all relevant grant information from the uploaded PDF document.
      Return a JSON object with these fields (use null if not found):
      - grant_name: string (name/title of the grant)
      - grantor: string (funding organization or agency name)
      - contract_number: string (contract or award number)
      - description: string (purpose and scope of the grant)
      - total_amount: number (total grant award amount in USD, just the number)
      - start_date: string (ISO date format YYYY-MM-DD)
      - end_date: string (ISO date format YYYY-MM-DD)
      - contacts: array of objects with fields: name, email, phone, role, organization
      Extract all this information precisely from the document.`,
      file_urls: [file_url],
      response_json_schema: {
        type: "object",
        properties: {
          grant_name: { type: "string" },
          grantor: { type: "string" },
          contract_number: { type: "string" },
          description: { type: "string" },
          total_amount: { type: "number" },
          start_date: { type: "string" },
          end_date: { type: "string" },
          contacts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                email: { type: "string" },
                phone: { type: "string" },
                role: { type: "string" },
                organization: { type: "string" }
              }
            }
          }
        }
      }
    });

    setLoading(false);
    onExtracted({ ...result, pdf_url: file_url });
  };

  return (
    <div className="space-y-4">
      <div
        className="border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => inputRef.current?.click()}
      >
        {loading ? (
          <>
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Extracting grant details from PDF...</p>
          </>
        ) : (
          <>
            <Upload className="w-10 h-10 text-muted-foreground" />
            <p className="font-medium">Click to upload grant agreement PDF</p>
            <p className="text-sm text-muted-foreground">AI will automatically extract all grant details</p>
            {fileName && <p className="text-xs text-primary">{fileName}</p>}
          </>
        )}
      </div>
      <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={handleFile} />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}