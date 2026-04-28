import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MsaForm from "./MsaForm";
import MsaPdfUploader from "./MsaPdfUploader";

export default function AddMsaModal({ onClose, onSaved }) {
  const [prefill, setPrefill] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [tab, setTab] = useState("pdf");

  const handleExtracted = (data, fileUrl) => {
    setPdfUrl(fileUrl);
    setPrefill(data);
    setTab("manual");
  };

  const handleSave = async (formData) => {
    await base44.entities.MSA.create({ ...formData, pdf_url: pdfUrl || formData.pdf_url });
    onSaved();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add Master Services Agreement</DialogTitle>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="pdf">Upload PDF</TabsTrigger>
            <TabsTrigger value="manual">Enter Manually</TabsTrigger>
          </TabsList>
          <TabsContent value="pdf">
            <MsaPdfUploader onExtracted={handleExtracted} />
            {prefill && (
              <p className="text-sm text-green-600 mt-3">✓ Data extracted! Switch to "Enter Manually" to review and save.</p>
            )}
          </TabsContent>
          <TabsContent value="manual">
            <MsaForm initialData={prefill || {}} onSave={handleSave} onCancel={onClose} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}