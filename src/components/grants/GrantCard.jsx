import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Calendar, ArrowRight, Archive } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, parseISO } from "date-fns";

const statusColors = {
  active: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-gray-100 text-gray-600",
};

export default function GrantCard({ grant, onArchive, isAdmin }) {
  return (
    <Card className="hover:shadow-md transition-shadow h-full relative group">
      <Link to={createPageUrl(`GrantDetail?id=${grant.id}`)} className="block">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-snug">{grant.title || grant.grant_name}</CardTitle>
            <Badge className={`${statusColors[grant.status]} shrink-0`}>{grant.status}</Badge>
          </div>
          {(grant.funder || grant.grantor) && <p className="text-sm text-muted-foreground">{grant.funder || grant.grantor}</p>}
          {(grant.grant_number || grant.contract_number) && (
            <p className="text-xs text-muted-foreground">#{grant.grant_number || grant.contract_number}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {grant.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{grant.description}</p>
          )}
          <div className="flex flex-wrap gap-3 pt-1">
            {grant.total_amount > 0 && (
              <div className="flex items-center gap-1 text-sm">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="font-semibold">${grant.total_amount.toLocaleString()}</span>
              </div>
            )}
            {grant.end_date && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Ends {format(parseISO(grant.end_date), "MMM d, yyyy")}</span>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Link>
      {isAdmin && onArchive && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
          title="Archive grant"
          onClick={e => { e.preventDefault(); onArchive(grant); }}
        >
          <Archive className="w-4 h-4 text-muted-foreground" />
        </Button>
      )}
    </Card>
  );
}