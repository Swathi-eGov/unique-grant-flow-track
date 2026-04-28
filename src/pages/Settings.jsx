import { useState, useEffect } from "react";
import AlertEmailsManager from "@/components/settings/AlertEmailsManager";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, CheckCircle2, Clock, Mail } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [settingsId, setSettingsId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    Promise.all([
      base44.entities.AppSettings.list(),
      base44.entities.NotificationLog.list("-created_date", 25),
    ]).then(([s, l]) => {
      if (s.length > 0) {
        setSettings({ notifications_enabled: s[0].notifications_enabled ?? false, days_before: s[0].days_before ?? 7 });
        setSettingsId(s[0].id);
      } else {
        setSettings({ notifications_enabled: false, days_before: 7 });
      }
      setLogs(l);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    if (settingsId) {
      await base44.entities.AppSettings.update(settingsId, settings);
    } else {
      const created = await base44.entities.AppSettings.create(settings);
      setSettingsId(created.id);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    // Reset daily check so the new settings take effect on next dashboard visit
    localStorage.removeItem("notif_last_check");
  };

  if (!settings) return <div className="p-6 text-muted-foreground">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your GrantTrack preferences</p>
      </div>

      <AlertEmailsManager settingsId={settingsId} />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Automatically email assigned grant contacts when a milestone payment or reporting deadline is approaching.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-muted/40 rounded-lg">
            <div>
              <p className="font-medium">Enable automated reminders</p>
              <p className="text-sm text-muted-foreground">Emails are triggered daily when you visit the Dashboard</p>
            </div>
            <Switch
              checked={settings.notifications_enabled}
              onCheckedChange={v => setSettings(s => ({ ...s, notifications_enabled: v }))}
            />
          </div>

          <div className={settings.notifications_enabled ? "" : "opacity-50 pointer-events-none"}>
            <Label>Days before due date to send reminder</Label>
            <p className="text-xs text-muted-foreground mb-2">Contacts will receive an email this many days before a milestone or deadline is due</p>
            <Input
              type="number"
              min={1}
              max={90}
              value={settings.days_before}
              onChange={e => setSettings(s => ({ ...s, days_before: parseInt(e.target.value) || 7 }))}
              className="w-28"
            />
          </div>

          <div className="flex items-center gap-3 pt-2 border-t">
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save Settings"}
            </Button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-green-600">
                <CheckCircle2 className="w-4 h-4" /> Settings saved
              </span>
            )}
          </div>

          <div className="flex items-start gap-3 text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <Mail className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <span>
              Reminders are sent to all contacts assigned to each grant. You can manage contacts per grant from the Grant detail page.
            </span>
          </div>
        </CardContent>
      </Card>

      {logs.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="w-4 h-4" />
              Recent Notifications Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {logs.map(log => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg text-sm">
                  <div>
                    <p className="font-medium">{log.item_title}</p>
                    <p className="text-xs text-muted-foreground">
                      {log.grant_name} · {log.item_type === "milestone" ? "Milestone" : "Reporting Deadline"}
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>Due {log.due_date && format(parseISO(log.due_date), "MMM d, yyyy")}</p>
                    <p>Sent {log.sent_date && format(parseISO(log.sent_date), "MMM d, yyyy")}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}