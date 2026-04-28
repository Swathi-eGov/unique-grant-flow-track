import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, Loader2, FileText } from "lucide-react";

export default function MsaPdfUploader({ onExtracted }) {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setLoading(true);

    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Extract all key structured data from this Master Services Agreement (MSA) PDF. Return a JSON object with:
- title (string, e.g. "MSA with BAO Systems")
- vendor_name (string, the service provider / second party company name)
- vendor_address (string)
- vendor_contact_name (string, signatory or contact person at vendor)
- vendor_contact_email (string)
- our_contact_name (string, signatory from first party)
- our_contact_email (string)
- effective_date (string, ISO date YYYY-MM-DD)
- initial_term_years (number, e.g. 3)
- end_date (string, ISO date = effective_date + initial_term_years)
- governing_law (string, e.g. "English law")
- description (string, summary of what services the vendor provides)
- key_terms (string, summary of key commercial/legal terms: payment terms, liability cap, notice period, termination conditions, IP ownership, confidentiality duration)
- notes (string, any other important observations)`,
      file_urls: [file_url],
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          vendor_name: { type: "string" },
          vendor_address: { type: "string" },
          vendor_contact_name: { type: "string" },
          vendor_contact_email: { type: "string" },
          our_contact_name: { type: "string" },
          our_contact_email: { type: "string" },
          effective_date: { type: "string" },
          initial_term_years: { type: "number" },
          end_date: { type: "string" },
          governing_law: { type: "string" },
          description: { type: "string" },
          key_terms: { type: "string" },
          notes: { type: "string" }
        }
      }
    });

    setLoading(false);
    onExtracted(result, file_url);
  };

  return (
    <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-8 cursor-pointer hover:border-primary/50 transition-colors bg-muted/30">
      <input type="file" accept="application/pdf" className="hidden" onChange={handleFile} />
      {loading ? (
        <>
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
          <p className="text-sm text-muted-foreground">Extracting MSA data with AI...</p>
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
          <p className="text-sm font-medium">Upload MSA PDF</p>
          <p className="text-xs text-muted-foreground mt-1">AI will extract all key terms automatically</p>
        </>
      )}
    </label>
  );
}