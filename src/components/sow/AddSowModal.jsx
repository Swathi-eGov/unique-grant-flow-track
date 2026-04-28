import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SowForm from "./SowForm";
import SowPdfUploader from "./SowPdfUploader";

export default function AddSowModal({ grants, onClose, onSaved }) {
  const [prefill, setPrefill] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [tab, setTab] = useState("pdf");

  const handleExtracted = (data, fileUrl) => {
    setPdfUrl(fileUrl);
    setPrefill(data);
    setTab("manual");
  };

  const handleSave = async (formData) => {
    await base44.entities.SOW.create({ ...formData, pdf_url: pdfUrl || formData.pdf_url });
    onSaved();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add Statement of Work</DialogTitle>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="pdf">Upload PDF</TabsTrigger>
            <TabsTrigger value="manual">Enter Manually</TabsTrigger>
          </TabsList>
          <TabsContent value="pdf">
            <SowPdfUploader onExtracted={handleExtracted} />
            {prefill && (
              <p className="text-sm text-green-600 mt-3">✓ Data extracted! Switch to "Enter Manually" to review and save.</p>
            )}
          </TabsContent>
          <TabsContent value="manual">
            <SowForm
              initialData={prefill || {}}
              grants={grants}
              onSave={handleSave}
              onCancel={onClose}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}