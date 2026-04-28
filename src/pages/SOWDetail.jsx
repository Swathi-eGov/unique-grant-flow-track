import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Pencil, DollarSign, Calendar, Users, FileText, ExternalLink, AlertTriangle, Archive, Package, Receipt } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SowDeliverablesTab from "@/components/sowdetail/SowDeliverablesTab";
import SowInvoicesTab from "@/components/sowdetail/SowInvoicesTab";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, parseISO, differenceInDays } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SowForm from "@/components/sow/SowForm";

const statusColors = {
  active: "bg-green-100 text-green-700",
  draft: "bg-yellow-100 text-yellow-700",
  expired: "bg-gray-100 text-gray-600",
  terminated: "bg-red-100 text-red-700",
};

export default function SOWDetail() {
  const params = new URLSearchParams(window.location.search);
  const sowId = params.get("id");

  const [sow, setSow] = useState(null);
  const [grant, setGrant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    if (sowId) fetchSow();
  }, [sowId]);

  const fetchSow = async () => {
    const data = await base44.entities.SOW.filter({ id: sowId });
    const s = data[0];
    setSow(s || null);
    if (s?.grant_id) {
      const grants = await base44.entities.Grant.filter({ id: s.grant_id });
      setGrant(grants[0] || null);
    }
    setLoading(false);
  };

  const handleSave = async (formData) => {
    await base44.entities.SOW.update(sow.id, formData);
    setShowEdit(false);
    fetchSow();
  };

  const handleArchive = async () => {
    await base44.entities.SOW.update(sow.id, { archived: true });
    window.location.href = createPageUrl("SOWs");
  };

  const isAdmin = user?.role === "admin";

  if (loading) return <div className="p-6 text-muted-foreground">Loading...</div>;
  if (!sow) return <div className="p-6 text-muted-foreground">SOW not found.</div>;

  const daysLeft = sow.end_date ? differenceInDays(parseISO(sow.end_date), new Date()) : null;
  const expiringSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 30;
  const expired = daysLeft !== null && daysLeft < 0;
  const totalMonths = sow.start_date && sow.end_date
    ? Math.round(differenceInDays(parseISO(sow.end_date), parseISO(sow.start_date)) / 30)
    : null;
  const monthlyRate = sow.monthly_rate || sow.total_monthly_value || 0;
  const totalContractValue = sow.total_value || (totalMonths && monthlyRate ? totalMonths * monthlyRate : null);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to={createPageUrl("SOWs")}>
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            {sow.sow_number && <span className="text-xs font-mono text-muted-foreground">{sow.sow_number}</span>}
            <h1 className="text-2xl font-bold">{sow.title}</h1>
            <Badge className={statusColors[sow.status]}>{sow.status}</Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">{sow.vendor_name}</p>
          {grant && (
            <Link to={createPageUrl(`GrantDetail?id=${grant.id}`)} className="text-xs text-primary hover:underline">
              Grant: {grant.grant_name} →
            </Link>
          )}
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowEdit(true)} className="gap-2">
              <Pencil className="w-4 h-4" /> Edit
            </Button>
            <Button variant="outline" size="sm" onClick={handleArchive} className="gap-2 text-muted-foreground">
              <Archive className="w-4 h-4" /> Archive
            </Button>
          </div>
        )}
      </div>

      {/* Expiry alert */}
      {(expiringSoon || expired) && (
        <div className={`flex items-center gap-3 p-4 rounded-lg mb-6 ${expired ? "bg-red-50 border border-red-200" : "bg-orange-50 border border-orange-200"}`}>
          <AlertTriangle className={`w-5 h-5 ${expired ? "text-red-600" : "text-orange-500"}`} />
          <p className={`text-sm font-medium ${expired ? "text-red-700" : "text-orange-700"}`}>
            {expired
              ? `This SOW expired on ${format(parseISO(sow.end_date), "MMMM d, yyyy")}. Please review and renew.`
              : `This SOW expires in ${daysLeft} days (${format(parseISO(sow.end_date), "MMMM d, yyyy")}). Consider renewing soon.`
            }
          </p>
        </div>
      )}

      {/* Key metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Monthly Rate</p>
            <p className="text-xl font-bold">${monthlyRate.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Personnel</p>
            <p className="text-xl font-bold">{sow.personnel?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Duration</p>
            <p className="text-xl font-bold">{totalMonths ? `${totalMonths} mo` : "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Contract Value</p>
            <p className="text-xl font-bold">{totalContractValue ? `$${totalContractValue.toLocaleString()}` : "—"}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview"><FileText className="w-4 h-4 mr-1" />Overview</TabsTrigger>
          <TabsTrigger value="deliverables"><Package className="w-4 h-4 mr-1" />Deliverables</TabsTrigger>
          <TabsTrigger value="invoices"><Receipt className="w-4 h-4 mr-1" />Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Description */}
          {sow.description && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Description of Services</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{sow.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Personnel table */}
          {sow.personnel?.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="w-4 h-4" /> Personnel & Rates
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">#</th>
                      <th className="text-left p-3 font-medium">Name</th>
                      <th className="text-left p-3 font-medium">Role</th>
                      <th className="text-right p-3 font-medium">Allocation</th>
                      <th className="text-right p-3 font-medium">Rate/Month (USD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sow.personnel.map((p, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-3 text-muted-foreground">{i + 1}</td>
                        <td className="p-3 font-medium">{p.name}</td>
                        <td className="p-3 text-muted-foreground">{p.role || "—"}</td>
                        <td className="p-3 text-right text-muted-foreground">
                          {p.allocation_percent && p.allocation_percent !== 100 ? `${p.allocation_percent}%` : "Full"}
                        </td>
                        <td className="p-3 text-right font-semibold">${(p.rate_per_month || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="border-t bg-muted/30 font-semibold">
                      <td colSpan={4} className="p-3 text-right">Total Monthly</td>
                      <td className="p-3 text-right text-green-700">${(sow.total_monthly_value || 0).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {sow.notes && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Payment Terms & Notes</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{sow.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">SOW Details</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {sow.start_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Start Date</span>
                  <span className="font-medium">{format(parseISO(sow.start_date), "MMM d, yyyy")}</span>
                </div>
              )}
              {sow.end_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">End Date</span>
                  <span className={`font-medium ${expired ? "text-red-600" : expiringSoon ? "text-orange-600" : ""}`}>
                    {format(parseISO(sow.end_date), "MMM d, yyyy")}
                  </span>
                </div>
              )}
              {daysLeft !== null && !expired && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Days Remaining</span>
                  <span className={`font-bold ${expiringSoon ? "text-orange-600" : "text-green-600"}`}>{daysLeft}</span>
                </div>
              )}
              {sow.advance_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Advance Invoice</span>
                  <span className="font-medium">${sow.advance_amount.toLocaleString()}</span>
                </div>
              )}
              {sow.vendor_email && (
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground shrink-0">Finance Email</span>
                  <a href={`mailto:${sow.vendor_email}`} className="text-primary hover:underline text-right truncate">{sow.vendor_email}</a>
                </div>
              )}
              {sow.payment_day && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Day</span>
                  <span className="font-medium">Day {sow.payment_day}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {sow.pdf_url && (
            <Card>
              <CardContent className="p-4">
                <a href={sow.pdf_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full gap-2">
                    <ExternalLink className="w-4 h-4" /> View SOW PDF
                  </Button>
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
        </TabsContent>

        <TabsContent value="deliverables">
          <SowDeliverablesTab sowId={sow.id} isAdmin={isAdmin} />
        </TabsContent>

        <TabsContent value="invoices">
          <SowInvoicesTab sowId={sow.id} isAdmin={isAdmin} />
        </TabsContent>
      </Tabs>

      {showEdit && (
        <Dialog open onOpenChange={() => setShowEdit(false)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader><DialogTitle>Edit SOW</DialogTitle></DialogHeader>
            <SowForm initialData={sow} grants={[]} onSave={handleSave} onCancel={() => setShowEdit(false)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}