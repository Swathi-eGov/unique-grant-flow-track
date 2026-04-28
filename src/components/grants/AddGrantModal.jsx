import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FilePlus, Loader2 } from "lucide-react";
import GrantForm from "./GrantForm";
import PdfUploader from "./PdfUploader";

export default function AddGrantModal({ onClose, onSaved }) {
  const [mode, setMode] = useState("manual"); // "manual" or "pdf"
  const [prefill, setPrefill] = useState(null);

  const handleSave = async (data) => {
    await base44.entities.Grant.create(data);
    onSaved();
  };

  const handlePdfExtracted = (data) => {
    setPrefill(data);
    setMode("manual");
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Grant</DialogTitle>
        </DialogHeader>

        <Tabs value={mode} onValueChange={setMode} className="mt-2">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="manual" className="flex-1 gap-2">
              <FilePlus className="w-4 h-4" /> Enter Manually
            </TabsTrigger>
            <TabsTrigger value="pdf" className="flex-1 gap-2">
              <Upload className="w-4 h-4" /> Upload PDF
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual">
            <GrantForm initialData={prefill} onSave={handleSave} onCancel={onClose} />
          </TabsContent>
          <TabsContent value="pdf">
            <PdfUploader onExtracted={handlePdfExtracted} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}