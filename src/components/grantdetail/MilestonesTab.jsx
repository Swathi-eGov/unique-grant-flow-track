import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash2, DollarSign } from "lucide-react";
import { format, parseISO } from "date-fns";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  invoiced: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
};

function MilestoneModal({ milestone, grantId, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: "", amount: "", due_date: "", paid_date: "", status: "pending", notes: "",
    ...milestone
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    const data = { ...form, grant_id: grantId, amount: parseFloat(form.amount) || 0 };
    if (milestone?.id) {
      await base44.entities.Milestone.update(milestone.id, data);
    } else {
      await base44.entities.Milestone.create(data);
    }
    onSaved();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{milestone?.id ? "Edit" : "Add"} Milestone</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Title *</Label><Input value={form.title} onChange={e => set("title", e.target.value)} /></div>
          <div><Label>Amount ($)</Label><Input type="number" value={form.amount} onChange={e => set("amount", e.target.value)} /></div>
          <div><Label>Due Date *</Label><Input type="date" value={form.due_date} onChange={e => set("due_date", e.target.value)} /></div>
          <div><Label>Paid Date</Label><Input type="date" value={form.paid_date || ""} onChange={e => set("paid_date", e.target.value)} /></div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={v => set("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="invoiced">Invoiced / RFP Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={e => set("notes", e.target.value)} /></div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function MilestonesTab({ grantId, isAdmin }) {
  const [milestones, setMilestones] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const fetch = async () => {
    const data = await base44.entities.Milestone.filter({ grant_id: grantId }, "due_date");
    setMilestones(data);
  };

  useEffect(() => { fetch(); }, [grantId]);

  const handleDelete = async (id) => {
    await base44.entities.Milestone.delete(id);
    fetch();
  };

  const total = milestones.reduce((s, m) => s + (m.amount || 0), 0);
  const paid = milestones.filter(m => m.status === "paid").reduce((s, m) => s + (m.amount || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <div className="text-sm"><span className="text-muted-foreground">Total: </span><span className="font-semibold">${total.toLocaleString()}</span></div>
          <div className="text-sm"><span className="text-muted-foreground">Paid: </span><span className="font-semibold text-green-600">${paid.toLocaleString()}</span></div>
        </div>
        {isAdmin && (
          <Button size="sm" onClick={() => setShowAdd(true)} className="gap-1">
            <Plus className="w-4 h-4" /> Add Milestone
          </Button>
        )}
      </div>

      {milestones.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">No milestones added yet.</p>
      ) : (
        <div className="space-y-2">
          {milestones.map(m => (
            <Card key={m.id}>
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="font-medium">{m.title}</p>
                    <p className="text-xs text-muted-foreground">Due: {m.due_date ? format(parseISO(m.due_date), "MMM d, yyyy") : "—"}</p>
                    {m.paid_date && <p className="text-xs text-green-600">Paid: {format(parseISO(m.paid_date), "MMM d, yyyy")}</p>}
                    {m.notes && <p className="text-xs text-muted-foreground mt-1">{m.notes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-semibold">${(m.amount || 0).toLocaleString()}</p>
                    <Badge className={statusColors[m.status]}>{m.status}</Badge>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditing(m)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {(showAdd || editing) && (
        <MilestoneModal
          milestone={editing}
          grantId={grantId}
          onClose={() => { setShowAdd(false); setEditing(null); }}
          onSaved={() => { setShowAdd(false); setEditing(null); fetch(); }}
        />
      )}
    </div>
  );
}