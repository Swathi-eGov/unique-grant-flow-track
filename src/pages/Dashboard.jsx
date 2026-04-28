import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { addMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, differenceInDays, parseISO } from "date-fns";
import { FileText, ScrollText, ClipboardList, Handshake, DollarSign, AlertCircle, TrendingUp, ArrowRight } from "lucide-react";
import ActionRequiredFeed from "@/components/dashboard/ActionRequiredFeed";
import DataQueryChat from "@/components/dashboard/DataQueryChat";
import NotificationChecker from "@/components/dashboard/NotificationChecker";

const statusColors = {
  active: "bg-green-100 text-green-700",
  draft: "bg-yellow-100 text-yellow-700",
  expired: "bg-gray-100 text-gray-600",
  terminated: "bg-red-100 text-red-700",
  pending: "bg-yellow-100 text-yellow-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-gray-100 text-gray-600",
};

export default function Dashboard() {
  const [grants, setGrants] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [sows, setSows] = useState([]);
  const [msas, setMsas] = useState([]);
  const [mous, setMous] = useState([]);
  const [tranches, setTranches] = useState([]);
  const [grantDeliverables, setGrantDeliverables] = useState([]);
  const [sowDeliverables, setSowDeliverables] = useState([]);
  const [mouCommitments, setMouCommitments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periodOffset, setPeriodOffset] = useState(0); // 0 = current, -1 = last month, etc.

  useEffect(() => {
    Promise.all([
      base44.entities.Grant.list("-created_date", 200),
      base44.entities.Milestone.list("due_date", 200),
      base44.entities.ReportingDeadline.list("due_date", 200),
      base44.entities.SOW.list("-created_date", 200),
      base44.entities.MSA.list("-created_date", 200),
      base44.entities.MOU.list("-created_date", 200),
      base44.entities.GrantTranche.list("due_date", 500),
      base44.entities.GrantDeliverable.list("due_date", 500),
      base44.entities.SowDeliverable.list("due_date", 500),
      base44.entities.MouCommitment.list("due_date", 500),
    ]).then(([g, m, d, s, ms, mo, tr, gd, sd, mc]) => {
      setGrants(g); setMilestones(m); setDeadlines(d);
      setSows(s); setMsas(ms); setMous(mo);
      setTranches(tr); setGrantDeliverables(gd);
      setSowDeliverables(sd); setMouCommitments(mc);
      setLoading(false);
    });
  }, []);

  const today = new Date();
  const selectedPeriod = addMonths(today, periodOffset);
  const periodStart = startOfMonth(selectedPeriod);
  const periodEnd = endOfMonth(selectedPeriod);
  const isCurrentPeriod = periodOffset === 0;

  // Active counts (exclude archived)
  const activeGrants = grants.filter(g => g.status === "active" && !g.archived);
  const activeSows = sows.filter(s => s.status === "active" && !s.archived);
  const activeMsas = msas.filter(m => m.status === "active" && !m.archived);
  const activeMous = mous.filter(m => m.status === "active" && !m.archived);

  // KPI sums
  const totalFunding = activeGrants.reduce((s, g) => s + (g.total_amount || 0), 0);
  const totalFundingReceived = tranches.filter(t => t.status === "received").reduce((s, t) => s + (t.amount || 0), 0)
    + milestones.filter(m => m.status === "paid").reduce((s, m) => s + (m.amount || 0), 0);
  const totalMonthlySpend = activeSows.reduce((sum, s) => sum + (s.monthly_rate || s.total_monthly_value || 0), 0);

  // Action count (overdue + urgent)
  const actionCount = (() => {
    let n = 0;
    tranches.forEach(t => {
      if (t.invoice_trigger_date && !t.invoice_date && t.status !== "invoiced" && t.status !== "received") {
        const d = differenceInDays(parseISO(t.invoice_trigger_date), today);
        if (d <= 7) n++;
      }
      if (t.due_date && t.status !== "invoiced" && t.status !== "received") {
        if (differenceInDays(parseISO(t.due_date), today) < 0) n++;
      }
    });
    [...grantDeliverables, ...sowDeliverables].forEach(d => {
      if (d.due_date && d.status !== "completed" && differenceInDays(parseISO(d.due_date), today) < 0) n++;
    });
    milestones.forEach(m => {
      if (m.due_date && m.status !== "paid" && differenceInDays(parseISO(m.due_date), today) < 0) n++;
    });
    mouCommitments.forEach(c => {
      if (c.due_date && c.status !== "completed" && differenceInDays(parseISO(c.due_date), today) <= 14) n++;
    });
    return n;
  })();

  // Milestones & deadlines filtered by selected period
  const upcomingMilestones = milestones
    .filter(m => m.due_date && isWithinInterval(parseISO(m.due_date), { start: periodStart, end: periodEnd }))
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 5);

  const upcomingDeadlines = deadlines
    .filter(d => d.due_date && isWithinInterval(parseISO(d.due_date), { start: periodStart, end: periodEnd }))
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 5);

  const getGrantName = (grantId) => {
    const g = grants.find(g => g.id === grantId);
    return g ? (g.title || g.grant_name || "—") : "—";
  };

  const getDaysLabel = (dateStr) => {
    const diff = differenceInDays(parseISO(dateStr), today);
    if (diff < 0) return <span className="text-red-500 font-medium">Overdue</span>;
    if (diff === 0) return <span className="text-orange-500 font-medium">Today</span>;
    return <span className="text-muted-foreground">in {diff}d</span>;
  };

  const kpis = [
    { label: "Active Grants", value: activeGrants.length, icon: FileText, color: "text-blue-600", sub: `$${(totalFunding / 1000).toFixed(0)}k total` },
    { label: "Funding Received", value: `$${(totalFundingReceived / 1000).toFixed(0)}k`, icon: TrendingUp, color: "text-green-600", sub: "from tranches" },
    { label: "Active SOWs", value: activeSows.length, icon: ClipboardList, color: "text-purple-600", sub: `$${(totalMonthlySpend / 1000).toFixed(0)}k/mo` },
    { label: "Active MSAs", value: activeMsas.length, icon: ScrollText, color: "text-indigo-600", sub: "agreements" },
    { label: "Active MOUs", value: activeMous.length, icon: Handshake, color: "text-teal-600", sub: "partnerships" },
    { label: "Actions Required", value: actionCount, icon: AlertCircle, color: actionCount > 0 ? "text-red-600" : "text-green-600", sub: actionCount > 0 ? "need attention" : "all clear" },
    { label: "Monthly Spend", value: `$${(totalMonthlySpend / 1000).toFixed(0)}k`, icon: DollarSign, color: "text-orange-600", sub: "across active SOWs" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of grants, contracts, and live action items</p>
        </div>
        <div className="shrink-0">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Period</p>
          <select
            value={periodOffset}
            onChange={e => setPeriodOffset(Number(e.target.value))}
            className="text-sm font-semibold border border-input rounded-md px-2 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {Array.from({ length: 13 }, (_, i) => {
              const offset = -i;
              const label = format(addMonths(today, offset), "MMM yyyy") + (offset === 0 ? " (Current)" : "");
              return <option key={offset} value={offset}>{label}</option>;
            })}
          </select>
        </div>
      </div>

      {/* 7 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {kpis.map((k, i) => (
          <Card key={i} className={k.label === "Actions Required" && actionCount > 0 ? "border-red-200 bg-red-50/40" : ""}>
            <CardContent className="p-4 text-center">
              <k.icon className={`w-5 h-5 mx-auto mb-1 ${k.color}`} />
              <p className="text-2xl font-bold">{k.value}</p>
              <p className="text-xs text-muted-foreground leading-tight mt-0.5">{k.label}</p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">{k.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main 2-col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ACTION REQUIRED FEED */}
        <Card className="lg:row-span-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className={`w-4 h-4 ${actionCount > 0 ? "text-red-500" : "text-green-500"}`} />
              Action Required
            </CardTitle>
            {actionCount > 0 && (
              <Badge className="bg-red-100 text-red-700">{actionCount} item{actionCount > 1 ? "s" : ""}</Badge>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-6">Loading...</p>
            ) : (
              <ActionRequiredFeed
                grants={grants}
                milestones={milestones}
                tranches={tranches}
                grantDeliverables={grantDeliverables}
                sowDeliverables={sowDeliverables}
                sows={sows}
                msas={msas}
                mous={mous}
                mouCommitments={mouCommitments}
              />
            )}
          </CardContent>
        </Card>

        {/* Active Grants */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="w-4 h-4 text-primary" /> Grants
            </CardTitle>
            <Link to={createPageUrl("Grants")}>
              <Button variant="ghost" size="sm" className="gap-1 text-xs">All <ArrowRight className="w-3 h-3" /></Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-1">
            {activeGrants.slice(0, 4).length === 0
              ? <p className="text-sm text-muted-foreground">No active grants.</p>
              : activeGrants.slice(0, 4).map(g => {
                  const gTranches = tranches.filter(t => t.grant_id === g.id);
                  const gMilestones = milestones.filter(m => m.grant_id === g.id);
                  const received = gTranches.filter(t => t.status === "received").reduce((s, t) => s + (t.amount || 0), 0)
                    + gMilestones.filter(m => m.status === "paid").reduce((s, m) => s + (m.amount || 0), 0);
                  const total = g.total_amount || 0;
                  const pct = total > 0 ? Math.min(100, Math.round(received / total * 100)) : 0;
                  return (
                    <Link key={g.id} to={createPageUrl(`GrantDetail?id=${g.id}`)}>
                      <div className="p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium truncate">{g.title || g.grant_name}</p>
                          <span className="text-xs text-green-600 font-semibold shrink-0 ml-2">{pct}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">${received.toLocaleString()} / ${total.toLocaleString()}</p>
                      </div>
                    </Link>
                  );
                })
            }
          </CardContent>
        </Card>

        {/* Upcoming Milestones */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="w-4 h-4 text-primary" /> Upcoming Milestones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingMilestones.length === 0
              ? <p className="text-sm text-muted-foreground">No upcoming milestone payments.</p>
              : upcomingMilestones.map(m => (
                  <div key={m.id} className="flex items-center justify-between p-2.5 bg-muted/40 rounded-lg">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{m.title}</p>
                      <p className="text-xs text-muted-foreground">{getGrantName(m.grant_id)} · Due {format(parseISO(m.due_date), "d MMM yyyy")}</p>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="font-semibold text-sm">${(m.amount || 0).toLocaleString()}</p>
                      <p className="text-xs">{getDaysLabel(m.due_date)}</p>
                    </div>
                  </div>
                ))
            }
          </CardContent>
        </Card>

      </div>

      {/* Bottom row: SOWs | MSAs | MOUs | Reporting Deadlines */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* SOWs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <ClipboardList className="w-4 h-4 text-primary" /> SOWs
            </CardTitle>
            <Link to={createPageUrl("SOWs")}><Button variant="ghost" size="sm" className="text-xs gap-1">All <ArrowRight className="w-3 h-3" /></Button></Link>
          </CardHeader>
          <CardContent className="space-y-1">
            {activeSows.slice(0, 4).map(s => {
              const dLeft = s.end_date ? differenceInDays(parseISO(s.end_date), today) : null;
              return (
                <Link key={s.id} to={createPageUrl(`SOWDetail?id=${s.id}`)}>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{s.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{s.vendor_name}</p>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      {dLeft !== null && <p className={`text-xs font-medium ${dLeft <= 30 ? "text-orange-500" : "text-muted-foreground"}`}>{dLeft}d</p>}
                    </div>
                  </div>
                </Link>
              );
            })}
            {activeSows.length === 0 && <p className="text-sm text-muted-foreground">No active SOWs.</p>}
          </CardContent>
        </Card>

        {/* MSAs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <ScrollText className="w-4 h-4 text-primary" /> MSAs
            </CardTitle>
            <Link to={createPageUrl("MSAs")}><Button variant="ghost" size="sm" className="text-xs gap-1">All <ArrowRight className="w-3 h-3" /></Button></Link>
          </CardHeader>
          <CardContent className="space-y-1">
            {activeMsas.slice(0, 4).map(m => {
              const dLeft = m.end_date ? differenceInDays(parseISO(m.end_date), today) : null;
              return (
                <Link key={m.id} to={createPageUrl(`MSADetail?id=${m.id}`)}>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{m.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{m.vendor_name}</p>
                    </div>
                    {dLeft !== null && <p className={`text-xs font-medium shrink-0 ml-2 ${dLeft <= 60 ? "text-orange-500" : "text-muted-foreground"}`}>{dLeft}d</p>}
                  </div>
                </Link>
              );
            })}
            {activeMsas.length === 0 && <p className="text-sm text-muted-foreground">No active MSAs.</p>}
          </CardContent>
        </Card>

        {/* MOUs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Handshake className="w-4 h-4 text-primary" /> MOUs
            </CardTitle>
            <Link to={createPageUrl("MOUs")}><Button variant="ghost" size="sm" className="text-xs gap-1">All <ArrowRight className="w-3 h-3" /></Button></Link>
          </CardHeader>
          <CardContent className="space-y-1">
            {activeMous.slice(0, 4).map(m => {
              const dLeft = m.end_date ? differenceInDays(parseISO(m.end_date), today) : null;
              return (
                <Link key={m.id} to={createPageUrl(`MOUDetail?id=${m.id}`)}>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{m.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{m.partner_name}</p>
                    </div>
                    {dLeft !== null && <p className={`text-xs font-medium shrink-0 ml-2 ${dLeft <= 60 ? "text-orange-500" : "text-muted-foreground"}`}>{dLeft}d</p>}
                  </div>
                </Link>
              );
            })}
            {activeMous.length === 0 && <p className="text-sm text-muted-foreground">No active MOUs.</p>}
          </CardContent>
        </Card>

        {/* Reporting Deadlines */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-primary" /> Reporting Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingDeadlines.length === 0
              ? <p className="text-sm text-muted-foreground">No upcoming deadlines.</p>
              : upcomingDeadlines.map(d => (
                  <div key={d.id} className="flex items-center justify-between p-2 bg-muted/40 rounded-lg">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{d.report_type}</p>
                      <p className="text-xs text-muted-foreground">{getGrantName(d.grant_id)}</p>
                    </div>
                    <p className="text-xs shrink-0 ml-2">{getDaysLabel(d.due_date)}</p>
                  </div>
                ))
            }
          </CardContent>
        </Card>
      </div>

      <DataQueryChat grants={grants} milestones={milestones} deadlines={deadlines} />
      <NotificationChecker grants={grants} milestones={milestones} deadlines={deadlines} sows={sows} msas={msas} mous={mous} />
    </div>
  );
}