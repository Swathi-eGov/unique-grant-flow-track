import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Plus, Trash2, CheckCircle2 } from "lucide-react";

export default function AlertEmailsManager({ settingsId }) {
  const [emails, setEmails] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [localSettingsId, setLocalSettingsId] = useState(settingsId);

  useEffect(() => {
    base44.entities.AppSettings.list().then(s => {
      if (s.length > 0) {
        setEmails(s[0].alert_emails || []);
        setLocalSettingsId(s[0].id);
      }
    });
  }, []);

  const addEmail = () => {
    const trimmed = newEmail.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@") || emails.includes(trimmed)) return;
    setEmails(prev => [...prev, trimmed]);
    setNewEmail("");
  };

  const removeEmail = (email) => setEmails(prev => prev.filter(e => e !== email));

  const save = async () => {
    setSaving(true);
    if (localSettingsId) {
      await base44.entities.AppSettings.update(localSettingsId, { alert_emails: emails });
    } else {
      const created = await base44.entities.AppSettings.create({ alert_emails: emails, notifications_enabled: false, days_before: 14 });
      setLocalSettingsId(created.id);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary" />
          Alert Email Recipients
        </CardTitle>
        <CardDescription>
          These email addresses will receive automated alerts 14 days before any grant, SOW, MSA, or MOU due date.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="name@example.com"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addEmail()}
            className="flex-1"
          />
          <Button onClick={addEmail} variant="outline" size="icon">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {emails.length === 0 ? (
          <p className="text-sm text-muted-foreground">No alert emails configured.</p>
        ) : (
          <ul className="space-y-2">
            {emails.map(email => (
              <li key={email} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg text-sm">
                <span>{email}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeEmail(email)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center gap-3 pt-2 border-t">
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving..." : "Save Email List"}
          </Button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-green-600">
              <CheckCircle2 className="w-4 h-4" /> Saved
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}