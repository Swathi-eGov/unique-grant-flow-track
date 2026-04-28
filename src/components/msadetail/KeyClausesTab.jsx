import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash2 } from "lucide-react";

function ClauseModal({ clause, msaId, onClose, onSaved }) {
  const [form, setForm] = useState({
    clause_name: "", clause_reference: "", summary: "", notes: "",
    ...clause
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    const data = { ...form, msa_id: msaId };
    if (clause?.id) await base44.entities.MsaKeyClause.update(clause.id, data);
    else await base44.entities.MsaKeyClause.create(data);
    onSaved();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{clause?.id ? "Edit" : "Add"} Key Clause</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Clause Name *</Label><Input value={form.clause_name} onChange={e => set("clause_name", e.target.value)} /></div>
          <div><Label>Clause Reference</Label><Input placeholder="e.g. Section 5.2" value={form.clause_reference || ""} onChange={e => set("clause_reference", e.target.value)} /></div>
          <div><Label>Summary</Label><Textarea rows={3} value={form.summary || ""} onChange={e => set("summary", e.target.value)} /></div>
          <div><Label>Notes</Label><Textarea rows={2} value={form.notes || ""} onChange={e => set("notes", e.target.value)} /></div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function KeyClausesTab({ msaId, isAdmin }) {
  const [clauses, setClauses] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const fetchData = async () => {
    const data = await base44.entities.MsaKeyClause.filter({ msa_id: msaId });
    setClauses(data);
  };

  useEffect(() => { fetchData(); }, [msaId]);

  const handleDelete = async (id) => {
    await base44.entities.MsaKeyClause.delete(id);
    fetchData();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {isAdmin && (
          <Button size="sm" onClick={() => setShowAdd(true)} className="gap-1">
            <Plus className="w-4 h-4" /> Add Key Clause
          </Button>
        )}
      </div>

      {clauses.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">No key clauses added yet.</p>
      ) : (
        <div className="space-y-3">
          {clauses.map(c => (
            <Card key={c.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm">{c.clause_name}</p>
                      {c.clause_reference && <span className="text-xs text-muted-foreground font-mono">({c.clause_reference})</span>}
                    </div>
                    {c.summary && <p className="text-sm text-muted-foreground whitespace-pre-line">{c.summary}</p>}
                    {c.notes && <p className="text-xs text-muted-foreground mt-1 italic">{c.notes}</p>}
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => setEditing(c)}><Pencil className="w-3 h-3" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><Trash2 className="w-3 h-3 text-red-500" /></Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {(showAdd || editing) && (
        <ClauseModal
          clause={editing}
          msaId={msaId}
          onClose={() => { setShowAdd(false); setEditing(null); }}
          onSaved={() => { setShowAdd(false); setEditing(null); fetchData(); }}
        />
      )}
    </div>
  );
}