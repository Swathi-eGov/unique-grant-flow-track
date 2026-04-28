import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash2, DollarSign } from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  invoiced: "bg-blue-100 text-blue-700",
  received: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
};

function TrancheModal({ tranche, grantId, onClose, onSaved }) {
  const [form, setForm] = useState({
    tranche_name: "", amount: "", due_date: "", invoice_date: "", received_date: "", status: "pending", notes: "",
    ...tranche
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    const data = { ...form, grant_id: grantId, amount: parseFloat(form.amount) || 0 };
    if (tranche?.id) await base44.entities.GrantTranche.update(tranche.id, data);
    else await base44.entities.GrantTranche.create(data);
    onSaved();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{tranche?.id ? "Edit" : "Add"} Tranche</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Tranche Name *</Label><Input value={form.tranche_name} onChange={e => set("tranche_name", e.target.value)} /></div>
          <div><Label>Amount ($)</Label><Input type="number" value={form.amount} onChange={e => set("amount", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Invoice Trigger Date ⚡</Label><Input type="date" value={form.invoice_trigger_date || ""} onChange={e => set("invoice_trigger_date", e.target.value)} /></div>
            <div><Label>Due Date (Milestone)</Label><Input type="date" value={form.due_date || ""} onChange={e => set("due_date", e.target.value)} /></div>
            <div><Label>Invoice Sent Date</Label><Input type="date" value={form.invoice_date || ""} onChange={e => set("invoice_date", e.target.value)} /></div>
            <div><Label>Received Date</Label><Input type="date" value={form.received_date || ""} onChange={e => set("received_date", e.target.value)} /></div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="invoiced">Invoiced</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Notes</Label><Input value={form.notes || ""} onChange={e => set("notes", e.target.value)} /></div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function TranchesTab({ grantId, isAdmin }) {
  const [tranches, setTranches] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const fetchData = async () => {
    const data = await base44.entities.GrantTranche.filter({ grant_id: grantId }, "due_date");
    setTranches(data);
  };

  useEffect(() => { fetchData(); }, [grantId]);

  const handleDelete = async (id) => {
    await base44.entities.GrantTranche.delete(id);
    fetchData();
  };

  const total = tranches.reduce((s, t) => s + (t.amount || 0), 0);
  const received = tranches.filter(t => t.status === "received").reduce((s, t) => s + (t.amount || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <div className="text-sm"><span className="text-muted-foreground">Total: </span><span className="font-semibold">${total.toLocaleString()}</span></div>
          <div className="text-sm"><span className="text-muted-foreground">Received: </span><span className="font-semibold text-green-600">${received.toLocaleString()}</span></div>
        </div>
        {isAdmin && (
          <Button size="sm" onClick={() => setShowAdd(true)} className="gap-1">
            <Plus className="w-4 h-4" /> Add Tranche
          </Button>
        )}
      </div>

      {tranches.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">No tranches added yet.</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Tranche</th>
                    <th className="text-right p-3 font-medium">Amount</th>
                    <th className="text-left p-3 font-medium">Trigger ⚡</th>
                    <th className="text-left p-3 font-medium">Due</th>
                    <th className="text-left p-3 font-medium">Invoiced</th>
                    <th className="text-left p-3 font-medium">Received</th>
                <th className="text-left p-3 font-medium">Status</th>
                {isAdmin && <th className="p-3"></th>}
              </tr>
            </thead>
            <tbody>
              {tranches.map(t => (
                <tr key={t.id} className="border-t">
                  <td className="p-3 font-medium">{t.tranche_name}</td>
                  <td className="p-3 text-right font-semibold">${(t.amount || 0).toLocaleString()}</td>
                  <td className="p-3">{t.invoice_trigger_date ? (() => { const d = differenceInDays(parseISO(t.invoice_trigger_date), new Date()); return <span className={d <= 7 && !t.invoice_date ? (d < 0 ? 'text-red-600 font-semibold' : 'text-amber-600 font-semibold') : 'text-muted-foreground'}>{format(parseISO(t.invoice_trigger_date), 'MMM d')}{d <= 7 && !t.invoice_date ? ` (${d < 0 ? 'late' : d+'d'})` : ''}</span>; })() : '—'}</td>
                  <td className="p-3 text-muted-foreground">{t.due_date ? format(parseISO(t.due_date), "MMM d, yyyy") : "—"}</td>
                  <td className="p-3 text-muted-foreground">{t.invoice_date ? format(parseISO(t.invoice_date), "MMM d, yyyy") : "—"}</td>
                  <td className="p-3 text-muted-foreground">{t.received_date ? format(parseISO(t.received_date), "MMM d, yyyy") : "—"}</td>
                  <td className="p-3"><Badge className={statusColors[t.status]}>{t.status}</Badge></td>
                  {isAdmin && (
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setEditing(t)}><Pencil className="w-3 h-3" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}><Trash2 className="w-3 h-3 text-red-500" /></Button>
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
        <TrancheModal
          tranche={editing}
          grantId={grantId}
          onClose={() => { setShowAdd(false); setEditing(null); }}
          onSaved={() => { setShowAdd(false); setEditing(null); fetchData(); }}
        />
      )}
    </div>
  );
}