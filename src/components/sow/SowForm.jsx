import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2 } from "lucide-react";

const empty = {
  sow_number: "", title: "", vendor_name: "", vendor_email: "",
  description: "", start_date: "", end_date: "", status: "active",
  monthly_rate: "", total_value: "", payment_day: "", advance_amount: "", notes: "", personnel: []
};

export default function SowForm({ initialData, grants = [], msas = [], onSave, onCancel }) {
  const [form, setForm] = useState({ ...empty, ...initialData });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const updatePersonnel = (idx, key, val) => {
    const updated = form.personnel.map((p, i) => i === idx ? { ...p, [key]: val } : p);
    const total = updated.reduce((s, p) => s + (parseFloat(p.rate_per_month) || 0), 0);
    setForm(f => ({ ...f, personnel: updated, monthly_rate: total }));
  };

  const addPersonnel = () => {
    setForm(f => ({ ...f, personnel: [...(f.personnel || []), { name: "", rate_per_month: "", allocation_percent: 100, role: "" }] }));
  };

  const removePersonnel = (idx) => {
    const updated = form.personnel.filter((_, i) => i !== idx);
    const total = updated.reduce((s, p) => s + (parseFloat(p.rate_per_month) || 0), 0);
    setForm(f => ({ ...f, personnel: updated, monthly_rate: total }));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      ...form,
      monthly_rate: parseFloat(form.monthly_rate) || 0,
      total_value: parseFloat(form.total_value) || 0,
      payment_day: parseInt(form.payment_day) || null,
      advance_amount: parseFloat(form.advance_amount) || 0,
    });
    setSaving(false);
  };

  return (
    <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>SOW Number</Label>
          <Input placeholder="e.g. SOW-01" value={form.sow_number} onChange={e => set("sow_number", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={v => set("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1">
        <Label>Title *</Label>
        <Input placeholder="Short title of the SOW" value={form.title} onChange={e => set("title", e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Vendor / Service Provider *</Label>
          <Input placeholder="Company name" value={form.vendor_name} onChange={e => set("vendor_name", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Finance Email</Label>
          <Input placeholder="finance@vendor.com" value={form.vendor_email} onChange={e => set("vendor_email", e.target.value)} />
        </div>
      </div>

      {grants.length > 0 && (
        <div className="space-y-1">
          <Label>Linked Grant</Label>
          <Select value={form.grant_id || ""} onValueChange={v => set("grant_id", v)}>
            <SelectTrigger><SelectValue placeholder="Select a grant (optional)" /></SelectTrigger>
            <SelectContent>
              {grants.map(g => <SelectItem key={g.id} value={g.id}>{g.title || g.grant_name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {msas.length > 0 && (
        <div className="space-y-1">
          <Label>Linked MSA</Label>
          <Select value={form.msa_id || ""} onValueChange={v => set("msa_id", v)}>
            <SelectTrigger><SelectValue placeholder="Select an MSA (optional)" /></SelectTrigger>
            <SelectContent>
              {msas.map(m => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Start Date</Label>
          <Input type="date" value={form.start_date} onChange={e => set("start_date", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>End Date</Label>
          <Input type="date" value={form.end_date} onChange={e => set("end_date", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <Label>Monthly Rate (USD)</Label>
          <Input type="number" value={form.monthly_rate} onChange={e => set("monthly_rate", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Total Value (USD)</Label>
          <Input type="number" value={form.total_value} onChange={e => set("total_value", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Payment Day of Month</Label>
          <Input type="number" min="1" max="31" placeholder="e.g. 1" value={form.payment_day} onChange={e => set("payment_day", e.target.value)} />
        </div>
      </div>

      <div className="space-y-1">
        <Label>Advance Amount (USD)</Label>
        <Input type="number" placeholder="0" value={form.advance_amount} onChange={e => set("advance_amount", e.target.value)} />
      </div>

      <div className="space-y-1">
        <Label>Description of Services</Label>
        <Textarea rows={3} value={form.description} onChange={e => set("description", e.target.value)} />
      </div>

      {/* Personnel Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Personnel & Rates</Label>
          <Button type="button" variant="outline" size="sm" onClick={addPersonnel} className="gap-1">
            <Plus className="w-3 h-3" /> Add Person
          </Button>
        </div>
        {(form.personnel || []).length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-2 font-medium">Name</th>
                  <th className="text-left p-2 font-medium">Role</th>
                  <th className="text-right p-2 font-medium">Rate/Month (USD)</th>
                  <th className="text-right p-2 font-medium">Alloc %</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {(form.personnel || []).map((p, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-1"><Input className="h-7 text-xs" value={p.name} onChange={e => updatePersonnel(i, "name", e.target.value)} /></td>
                    <td className="p-1"><Input className="h-7 text-xs" value={p.role || ""} onChange={e => updatePersonnel(i, "role", e.target.value)} /></td>
                    <td className="p-1"><Input className="h-7 text-xs text-right" type="number" value={p.rate_per_month} onChange={e => updatePersonnel(i, "rate_per_month", e.target.value)} /></td>
                    <td className="p-1"><Input className="h-7 text-xs text-right w-16" type="number" value={p.allocation_percent} onChange={e => updatePersonnel(i, "allocation_percent", e.target.value)} /></td>
                    <td className="p-1 text-center"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removePersonnel(i)}><Trash2 className="w-3 h-3 text-destructive" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <Label>Notes / Payment Terms</Label>
        <Textarea rows={2} value={form.notes} onChange={e => set("notes", e.target.value)} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Save SOW
        </Button>
      </div>
    </div>
  );
}