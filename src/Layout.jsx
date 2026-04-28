import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { LayoutDashboard, FileText, Menu, X, Settings, Archive, ClipboardList, ScrollText, Handshake, UserCog, BarChart2 } from "lucide-react";
import { useState, useEffect } from "react";

import { cn } from "@/lib/utils";

const allNavItems = [
  { label: "Dashboard", page: "Dashboard", icon: LayoutDashboard, module: null },
  { label: "Grants", page: "Grants", icon: FileText, module: "Grants" },
  { label: "SOWs", page: "SOWs", icon: ClipboardList, module: "SOWs" },
  { label: "MSAs", page: "MSAs", icon: ScrollText, module: "MSAs" },
  { label: "MOUs", page: "MOUs", icon: Handshake, module: "MOUs" },
  { label: "Reports", page: "Reports", icon: BarChart2, module: null },
  { label: "Archive", page: "Archive", icon: Archive, module: null },
  { label: "Settings", page: "Settings", icon: Settings, module: null, adminOnly: true },
  { label: "Users", page: "UserAdmin", icon: UserCog, module: null, adminOnly: true },
];

export default function Layout({ children, currentPageName }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const isAdmin = user?.role === "admin";
  const allowedModules = user?.allowed_modules;

  const navItems = allNavItems.filter(item => {
    if (item.adminOnly && !isAdmin) return false;
    if (!isAdmin && item.module && allowedModules && allowedModules.length > 0) {
      return allowedModules.includes(item.module);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top nav */}
      <header className="border-b bg-card sticky top-0 z-30">
        <div className="flex items-center h-14 px-4 gap-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 font-bold text-primary text-lg mr-4">
            <FileText className="w-5 h-5" />
            GrantTrack
          </div>
          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1 flex-1">
            {navItems.map(({ label, page, icon: Icon }) => (
              <Link
                key={page}
                to={createPageUrl(page)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  currentPageName === page
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>
          {/* Mobile menu button */}
          <button
            className="sm:hidden ml-auto"
            onClick={() => setMobileOpen(o => !o)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {/* Mobile nav */}
        {mobileOpen && (
          <div className="sm:hidden border-t bg-card px-4 py-2 space-y-1">
            {navItems.map(({ label, page, icon: Icon }) => (
              <Link
                key={page}
                to={createPageUrl(page)}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium",
                  currentPageName === page
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}