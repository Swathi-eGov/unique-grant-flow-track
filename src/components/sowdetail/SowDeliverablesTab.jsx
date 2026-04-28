import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
};

function Modal({ item, sowId, onClose, onSaved }) {
  const [form, setForm] = useState({ name: "", due_date: "", status: "pending", notes: "", ...item });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    const data = { ...form, sow_id: sowId };
    if (item?.id) await base44.entities.SowDeliverable.update(item.id, data);
    else await base44.entities.SowDeliverable.create(data);
    onSaved();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{item?.id ? "Edit" : "Add"} Deliverable</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Name *</Label><Input value={form.name} onChange={e => set("name", e.target.value)} /></div>
          <div><Label>Due Date</Label><Input type="date" value={form.due_date || ""} onChange={e => set("due_date", e.target.value)} /></div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={v => set("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
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

export default function SowDeliverablesTab({ sowId, isAdmin }) {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const fetchData = async () => {
    const data = await base44.entities.SowDeliverable.filter({ sow_id: sowId }, "due_date");
    setItems(data);
  };

  useEffect(() => { fetchData(); }, [sowId]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {isAdmin && <Button size="sm" onClick={() => setShowAdd(true)} className="gap-1"><Plus className="w-4 h-4" /> Add Deliverable</Button>}
      </div>
      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">No deliverables added yet.</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Deliverable</th>
                <th className="text-left p-3 font-medium">Due Date</th>
                <th className="text-left p-3 font-medium">Status</th>
                {isAdmin && <th className="p-3"></th>}
              </tr>
            </thead>
            <tbody>
              {items.map(d => (
                <tr key={d.id} className="border-t">
                  <td className="p-3 font-medium">{d.name}</td>
                  <td className="p-3 text-muted-foreground">{d.due_date ? format(parseISO(d.due_date), "MMM d, yyyy") : "—"}</td>
                  <td className="p-3"><Badge className={statusColors[d.status]}>{d.status?.replace("_", " ")}</Badge></td>
                  {isAdmin && (
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setEditing(d)}><Pencil className="w-3 h-3" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => base44.entities.SowDeliverable.delete(d.id).then(fetchData)}><Trash2 className="w-3 h-3 text-red-500" /></Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {(showAdd || editing) && (
        <Modal item={editing} sowId={sowId} onClose={() => { setShowAdd(false); setEditing(null); }} onSaved={() => { setShowAdd(false); setEditing(null); fetchData(); }} />
      )}
    </div>
  );
}