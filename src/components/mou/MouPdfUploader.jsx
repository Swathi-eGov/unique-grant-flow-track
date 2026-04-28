import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, Loader2, FileText } from "lucide-react";

export default function MouPdfUploader({ onExtracted }) {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setLoading(true);

    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Extract all key structured data from this Memorandum of Understanding (MOU) PDF. Return a JSON object with:
- title (string, e.g. "MOU with DPI Centre Ltd")
- partner_name (string, the other party's organisation name)
- partner_type (one of: government, ngo, private, academic, multilateral, other)
- partner_address (string, full address of partner)
- partner_contact_name (string, primary contact at partner)
- partner_contact_email (string)
- partner_signatory_name (string, person who signed on behalf of partner)
- partner_signatory_designation (string, e.g. Director)
- our_signatory_name (string, person who signed on our behalf)
- our_signatory_designation (string, e.g. CEO)
- our_contact_name (string, our internal contact)
- our_contact_email (string)
- effective_date (string, ISO date YYYY-MM-DD)
- initial_term_years (number, e.g. 5)
- end_date (string, ISO date = effective_date + initial_term_years)
- governing_law (string)
- purpose (string, summary of background and purpose of the MOU)
- scope_of_collaboration (string, key areas, activities and goals agreed between the parties)
- notes (string, any other important observations)`,
      file_urls: [file_url],
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          partner_name: { type: "string" },
          partner_type: { type: "string" },
          partner_address: { type: "string" },
          partner_contact_name: { type: "string" },
          partner_contact_email: { type: "string" },
          partner_signatory_name: { type: "string" },
          partner_signatory_designation: { type: "string" },
          our_signatory_name: { type: "string" },
          our_signatory_designation: { type: "string" },
          our_contact_name: { type: "string" },
          our_contact_email: { type: "string" },
          effective_date: { type: "string" },
          initial_term_years: { type: "number" },
          end_date: { type: "string" },
          governing_law: { type: "string" },
          purpose: { type: "string" },
          scope_of_collaboration: { type: "string" },
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
          <p className="text-sm text-muted-foreground">Extracting MOU data with AI...</p>
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
          <p className="text-sm font-medium">Upload MOU PDF</p>
          <p className="text-xs text-muted-foreground mt-1">AI will extract all parties, dates, and key terms automatically</p>
        </>
      )}
    </label>
  );
}