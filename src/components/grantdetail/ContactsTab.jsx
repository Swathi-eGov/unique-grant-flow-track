import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash2, User, Mail, Phone, Building2 } from "lucide-react";

function ContactModal({ contact, onClose, onSave }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "", organization: "", ...contact });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{contact ? "Edit" : "Add"} Contact</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Name *</Label><Input value={form.name} onChange={e => set("name", e.target.value)} /></div>
          <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => set("email", e.target.value)} /></div>
          <div><Label>Phone</Label><Input value={form.phone} onChange={e => set("phone", e.target.value)} /></div>
          <div><Label>Role / Title</Label><Input value={form.role} onChange={e => set("role", e.target.value)} /></div>
          <div><Label>Organization</Label><Input value={form.organization} onChange={e => set("organization", e.target.value)} /></div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={() => onSave(form)}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ContactsTab({ grant, onUpdate, isAdmin }) {
  const [editing, setEditing] = useState(null); // null=closed, -1=new, index=editing
  const contacts = grant.contacts || [];

  const save = async (updated) => {
    await base44.entities.Grant.update(grant.id, { contacts: updated });
    onUpdate();
    setEditing(null);
  };

  const handleAdd = (contact) => save([...contacts, contact]);
  const handleEdit = (idx, contact) => {
    const updated = contacts.map((c, i) => i === idx ? contact : c);
    save(updated);
  };
  const handleDelete = (idx) => save(contacts.filter((_, i) => i !== idx));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {isAdmin && (
          <Button size="sm" onClick={() => setEditing(-1)} className="gap-1">
            <Plus className="w-4 h-4" /> Add Contact
          </Button>
        )}
      </div>

      {contacts.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">No contacts added yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {contacts.map((c, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="font-semibold flex items-center gap-1"><User className="w-4 h-4" />{c.name}</p>
                    {c.role && <p className="text-xs text-muted-foreground">{c.role}</p>}
                    {c.organization && <p className="text-xs text-muted-foreground flex items-center gap-1"><Building2 className="w-3 h-3" />{c.organization}</p>}
                    {c.email && <p className="text-xs text-primary flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</p>}
                    {c.phone && <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</p>}
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditing(i)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(i)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {editing !== null && (
        <ContactModal
          contact={editing === -1 ? null : contacts[editing]}
          onClose={() => setEditing(null)}
          onSave={(c) => editing === -1 ? handleAdd(c) : handleEdit(editing, c)}
        />
      )}
    </div>
  );
}