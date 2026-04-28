import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Users, CheckSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";

const MODULES = ["Grants", "SOWs", "MSAs", "MOUs"];

export default function UserAdmin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});

  useEffect(() => {
    base44.entities.User.list().then(data => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  const toggleModule = (userId, module) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u;
      const current = u.allowed_modules || MODULES; // null/empty = all allowed
      const isAllowed = current.includes(module);
      const updated = isAllowed
        ? current.filter(m => m !== module)
        : [...current, module];
      return { ...u, allowed_modules: updated };
    }));
  };

  const selectAll = (userId) => {
    setUsers(prev => prev.map(u =>
      u.id === userId ? { ...u, allowed_modules: [...MODULES] } : u
    ));
  };

  const isModuleAllowed = (user, module) => {
    if (!user.allowed_modules || user.allowed_modules.length === 0) return true;
    return user.allowed_modules.includes(module);
  };

  const saveUser = async (user) => {
    setSaving(s => ({ ...s, [user.id]: true }));
    await base44.entities.User.update(user.id, { allowed_modules: user.allowed_modules });
    setSaving(s => ({ ...s, [user.id]: false }));
    toast.success(`Permissions saved for ${user.full_name || user.email}`);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Users className="w-8 h-8" /> User Administration
        </h1>
        <p className="text-muted-foreground mt-1">
          Control which modules each user can access. Admins always see everything.
        </p>
      </div>

      {loading ? (
        <div className="text-muted-foreground text-center py-16">Loading users...</div>
      ) : (
        <div className="space-y-4">
          {/* Header */}
          <div className="hidden md:grid md:grid-cols-[1fr_repeat(4,_80px)_120px] gap-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <div>User</div>
            {MODULES.map(m => <div key={m} className="text-center">{m}</div>)}
            <div></div>
          </div>

          {users.map(user => (
            <Card key={user.id}>
              <CardContent className="p-4">
                <div className="flex flex-col md:grid md:grid-cols-[1fr_repeat(4,_80px)_120px] gap-4 items-start md:items-center">
                  {/* User info */}
                  <div>
                    <p className="font-medium">{user.full_name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <Badge className={user.role === "admin" ? "bg-primary/10 text-primary mt-1" : "bg-muted text-muted-foreground mt-1"}>
                      {user.role}
                    </Badge>
                  </div>

                  {/* Module checkboxes */}
                  {user.role === "admin" ? (
                    <div className="col-span-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckSquare className="w-4 h-4 text-primary" />
                      Admin has full access to all modules
                    </div>
                  ) : (
                    MODULES.map(module => (
                      <div key={module} className="flex items-center gap-2 md:justify-center">
                        <Label className="md:hidden text-xs text-muted-foreground w-12">{module}</Label>
                        <Checkbox
                          checked={isModuleAllowed(user, module)}
                          onCheckedChange={() => toggleModule(user.id, module)}
                        />
                      </div>
                    ))
                  )}

                  {/* Save button */}
                  <div className="flex gap-2 items-center">
                    {user.role !== "admin" && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => selectAll(user.id)}
                        >
                          All
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => saveUser(user)}
                          disabled={saving[user.id]}
                        >
                          {saving[user.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}