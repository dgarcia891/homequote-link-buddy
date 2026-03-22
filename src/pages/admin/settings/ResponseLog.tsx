import { ChevronDown, ChevronUp, CheckCircle2, XCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface LogEntry {
  timestamp: string;
  status: "success" | "error";
  message: string;
}

interface ResponseLogProps {
  logs: LogEntry[];
  logsOpen: boolean;
  setLogsOpen: (open: boolean) => void;
  logEndRef: React.RefObject<HTMLDivElement>;
}

export function ResponseLog({ logs, logsOpen, setLogsOpen, logEndRef }: ResponseLogProps) {
  return (
    <div className="max-w-2xl mt-6 rounded-lg border bg-card">
      <button
        onClick={() => setLogsOpen(!logsOpen)}
        className="flex w-full items-center justify-between p-4 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
      >
        <span>Response Log ({logs.length})</span>
        {logsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {logsOpen && (
        <div className="border-t">
          {logs.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No logs yet. Save or send a test email to see results here.</p>
          ) : (
            <ScrollArea className="h-[200px]">
              <div className="p-3 space-y-2">
                {logs.map((entry, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2 rounded-md p-2 text-xs font-mono ${
                      entry.status === "error"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-primary/5 text-foreground"
                    }`}
                  >
                    {entry.status === "error" ? (
                      <XCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                    )}
                    <span className="text-muted-foreground shrink-0">{entry.timestamp}</span>
                    <span className="break-all">{entry.message}</span>
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            </ScrollArea>
          )}
        </div>
      )}
    </div>
  );
}
