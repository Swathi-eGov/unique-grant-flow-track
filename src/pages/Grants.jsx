import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, FileText, Archive } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import GrantCard from "@/components/grants/GrantCard";
import AddGrantModal from "@/components/grants/AddGrantModal";

export default function Grants() {
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    fetchGrants();
  }, []);

  const fetchGrants = async () => {
    const data = await base44.entities.Grant.list("-created_date", 100);
    setGrants(data);
    setLoading(false);
  };

  const archiveGrant = async (grant) => {
    await base44.entities.Grant.update(grant.id, { archived: true });
    setGrants(prev => prev.filter(g => g.id !== grant.id));
  };

  const filtered = grants.filter(g => {
    if (g.archived) return false;
    const matchSearch = !search ||
      (g.title || g.grant_name)?.toLowerCase().includes(search.toLowerCase()) ||
      (g.funder || g.grantor)?.toLowerCase().includes(search.toLowerCase()) ||
      (g.grant_number || g.contract_number)?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || g.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const isAdmin = user?.role === "admin";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Grants</h1>
          <p className="text-muted-foreground mt-1">
            {grants.filter(g => !g.archived && g.status === "active").length} active · {grants.filter(g => g.archived).length} archived
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={createPageUrl("Archive")}>
            <Button variant="outline" className="gap-2">
              <Archive className="w-4 h-4" /> Archive
            </Button>
          </Link>
          {isAdmin && (
            <Button onClick={() => setShowAddModal(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Add Grant
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search grants..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-muted-foreground text-center py-16">Loading grants...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No grants found.</p>
          {isAdmin && (
            <Button className="mt-4 gap-2" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4" /> Add your first grant
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(grant => (
            <GrantCard key={grant.id} grant={grant} isAdmin={isAdmin} onArchive={archiveGrant} />
          ))}
        </div>
      )}

      {showAddModal && (
        <AddGrantModal
          onClose={() => setShowAddModal(false)}
          onSaved={() => { setShowAddModal(false); fetchGrants(); }}
        />
      )}
    </div>
  );
}