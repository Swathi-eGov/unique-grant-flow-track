import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Loader2, Sparkles } from "lucide-react";
import { format, parseISO } from "date-fns";

const SUGGESTED_QUESTIONS = [
  "What are the next 3 reporting deadlines?",
  "Total milestone payments due in the next 12 months?",
  "Which grants are ending soon?",
  "How many overdue items do I have?",
];

export default function DataQueryChat({ grants, milestones, deadlines }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const ask = async (q) => {
    const trimmed = q.trim();
    if (!trimmed) return;

    setMessages(prev => [...prev, { role: "user", text: trimmed }]);
    setQuestion("");
    setLoading(true);

    const today = new Date().toISOString().split("T")[0];

    const context = `
Today's date: ${today}

GRANTS:
${grants.map(g => `- ${g.grant_name} (${g.grantor}), Contract: ${g.contract_number}, Status: ${g.status}, Amount: $${g.total_amount?.toLocaleString()}, Start: ${g.start_date}, End: ${g.end_date}`).join("\n")}

MILESTONES:
${milestones.map(m => {
  const grant = grants.find(g => g.id === m.grant_id);
  return `- [${grant?.grant_name || "Unknown"}] ${m.title}, Amount: $${(m.amount || 0).toLocaleString()}, Due: ${m.due_date}, Status: ${m.status}`;
}).join("\n")}

REPORTING DEADLINES:
${deadlines.map(d => {
  const grant = grants.find(g => g.id === d.grant_id);
  return `- [${grant?.grant_name || "Unknown"}] ${d.report_type}, Due: ${d.due_date}, Status: ${d.status}`;
}).join("\n")}
`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a helpful grants management assistant. Answer the user's question concisely using only the data provided. Be specific with numbers, dates, and grant names. Format dates as "Month Day, Year". If calculating totals, show the breakdown.\n\nData:\n${context}\n\nUser question: ${trimmed}`,
    });

    setMessages(prev => [...prev, { role: "assistant", text: result }]);
    setLoading(false);
  };

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-primary" />
          Ask About Your Grants
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => ask(q)}
                className="text-xs px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {messages.length > 0 && (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-3 h-3 animate-spin" /> Thinking...
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            placeholder="Ask anything about your grants..."
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !loading && ask(question)}
            disabled={loading}
          />
          <Button size="icon" onClick={() => ask(question)} disabled={loading || !question.trim()}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>

        {messages.length > 0 && (
          <button
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setMessages([])}
          >
            Clear conversation
          </button>
        )}
      </CardContent>
    </Card>
  );
}