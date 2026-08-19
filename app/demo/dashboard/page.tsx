import type { ReactNode } from "react";
import { getServerSupabase } from "@/lib/supabase";
import { RESTAURANT } from "@/lib/restaurant";
import LiveRefresh from "@/components/dashboard/LiveRefresh";
import type { Database } from "@/lib/database.types";

// Unauthenticated by design — see notes returned alongside this build.
// This page is never linked from public nav; access is by direct URL only.
export const dynamic = "force-dynamic";

type LeadRow = Database["public"]["Tables"]["leads"]["Row"];
type QuestionRow = Pick<
  Database["public"]["Tables"]["cache"]["Row"],
  "question_text" | "hits" | "source"
>;

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function formatCreatedAt(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

const STATUS_LABEL: Record<LeadRow["status"], string> = {
  new: "New",
  contacted: "Contacted",
  booked: "Booked",
  closed: "Closed",
};

function StatusBadge({ status }: { status: LeadRow["status"] }) {
  const isNew = status === "new";
  return (
    <span
      className={
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium " +
        (isNew
          ? "border-accent-2/20 bg-accent-2/10 text-accent-2"
          : "border-border bg-bg text-muted")
      }
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

function SourceBadge({ source }: { source: QuestionRow["source"] }) {
  const isInstant = source === "intercept";
  return (
    <span
      className={
        "inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-medium " +
        (isInstant
          ? "border-accent-2/20 bg-accent-2/10 text-accent-2"
          : "border-accent/20 bg-accent/10 text-accent")
      }
    >
      {isInstant ? "Instant" : "AI"}
    </span>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
          {icon}
        </span>
        <p className="text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
      </div>
      <p className="mt-4 font-serif text-4xl tabular-nums text-ink">{value.toLocaleString("en-GB")}</p>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-bg px-6 py-12 text-center">
      <p className="font-serif text-lg text-ink">{title}</p>
      <p className="max-w-sm text-sm text-muted">{body}</p>
    </div>
  );
}

type ComplaintRow = {
  session_id: string;
  updated_at: string;
  lastMessage: string;
};

function extractLastUserMessage(messages: Database["public"]["Tables"]["conversations"]["Row"]["messages"]): string {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i]?.role === "user") return messages[i].content;
  }
  return "";
}

export default async function DashboardPage() {
  const supabase = getServerSupabase();

  const now = new Date();
  const startOfTodayUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  ).toISOString();

  const [
    totalConversationsRes,
    todayConversationsRes,
    totalLeadsRes,
    leadsRes,
    questionsRes,
    complaintsRes,
  ] = await Promise.all([
    supabase.from("conversations").select("*", { count: "exact", head: true }),
    supabase
      .from("conversations")
      .select("*", { count: "exact", head: true })
      .gte("started_at", startOfTodayUTC),
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(50),
    supabase
      .from("cache")
      .select("question_text, hits, source")
      .order("hits", { ascending: false })
      .limit(10),
    supabase
      .from("conversations")
      .select("session_id, updated_at, messages")
      .eq("flag", "complaint")
      .order("updated_at", { ascending: false })
      .limit(10),
  ]);

  const totalConversations = totalConversationsRes.count ?? 0;
  const todayConversations = todayConversationsRes.count ?? 0;
  const totalLeads = totalLeadsRes.count ?? 0;
  const leads: LeadRow[] = leadsRes.data ?? [];
  const questions: QuestionRow[] = questionsRes.data ?? [];
  const complaints: ComplaintRow[] = (complaintsRes.data ?? []).map((row) => ({
    session_id: row.session_id,
    updated_at: row.updated_at,
    lastMessage: extractLastUserMessage(row.messages),
  }));

  return (
    <LiveRefresh>
      <div className="min-h-screen bg-bg">
        <div className="mx-auto max-w-5xl px-6 py-12 sm:px-8 sm:py-16">
          {/* Header */}
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">
                {RESTAURANT.name} · Sales Demo
              </p>
              <h1 className="mt-2 font-serif text-3xl text-ink sm:text-4xl">Dashboard</h1>
              <p className="mt-1 text-sm text-muted">
                Every conversation, booking request and answered question the widget has handled.
              </p>
            </div>
            <div
              className="flex h-9 items-center gap-2 rounded-full border border-border bg-surface px-3.5 text-xs font-medium text-muted shadow-card"
              title="This page refreshes itself automatically"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-2 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-2" />
              </span>
              Live
            </div>
          </header>

          {/* Live-updating content */}
          <div aria-live="polite" aria-atomic="false" className="mt-10 flex flex-col gap-12">
            {/* Stats */}
            <section aria-label="Overview stats" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard
                label="Conversations"
                value={totalConversations}
                icon={
                  <svg viewBox="0 0 20 20" fill="none" className="h-4.5 w-4.5" aria-hidden="true">
                    <path
                      d="M3 5.5A2.5 2.5 0 0 1 5.5 3h9A2.5 2.5 0 0 1 17 5.5v5A2.5 2.5 0 0 1 14.5 13H9l-3.5 3v-3h-1A2.5 2.5 0 0 1 2 10.5v-5Z"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              />
              <StatCard
                label="Today"
                value={todayConversations}
                icon={
                  <svg viewBox="0 0 20 20" fill="none" className="h-4.5 w-4.5" aria-hidden="true">
                    <path
                      d="M10 5.5V10l3 2M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              />
              <StatCard
                label="Leads captured"
                value={totalLeads}
                icon={
                  <svg viewBox="0 0 20 20" fill="none" className="h-4.5 w-4.5" aria-hidden="true">
                    <path
                      d="M8 9.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2.5 16c.6-2.9 2.9-4.5 5.5-4.5s4.9 1.6 5.5 4.5M14.5 5v4.5M12.25 7.25h4.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              />
            </section>

            {/* Leads */}
            <section aria-labelledby="leads-heading">
              <div className="flex items-baseline justify-between gap-4">
                <h2 id="leads-heading" className="font-serif text-2xl text-ink">
                  Leads
                </h2>
                <p className="text-xs text-muted">Latest 50, newest first</p>
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
                {leads.length === 0 ? (
                  <EmptyState
                    title="No leads yet"
                    body="They'll show up here the moment someone books a callback."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted">
                          <th scope="col" className="px-5 py-3 font-medium">
                            Name
                          </th>
                          <th scope="col" className="px-5 py-3 font-medium">
                            Phone
                          </th>
                          <th scope="col" className="px-5 py-3 font-medium">
                            Preferred time
                          </th>
                          <th scope="col" className="px-5 py-3 font-medium">
                            Status
                          </th>
                          <th scope="col" className="px-5 py-3 text-right font-medium">
                            Received
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {leads.map((lead) => (
                          <tr key={lead.id} className="border-b border-border last:border-0">
                            <td className="px-5 py-3.5 font-medium text-ink">{lead.name}</td>
                            <td className="px-5 py-3.5 text-ink">
                              <a
                                href={`tel:${lead.phone}`}
                                className="rounded underline decoration-border underline-offset-2 hover:text-accent hover:decoration-accent"
                                aria-label={`Call ${lead.name} at ${lead.phone}`}
                              >
                                {lead.phone}
                              </a>
                            </td>
                            <td className="px-5 py-3.5 text-muted">{lead.preferred_time}</td>
                            <td className="px-5 py-3.5">
                              <StatusBadge status={lead.status} />
                            </td>
                            <td
                              className="px-5 py-3.5 text-right tabular-nums text-muted"
                              title={lead.created_at}
                            >
                              {formatCreatedAt(lead.created_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>

            {/* Top questions */}
            <section aria-labelledby="questions-heading">
              <div className="flex items-baseline justify-between gap-4">
                <h2 id="questions-heading" className="font-serif text-2xl text-ink">
                  Top questions
                </h2>
                <p className="text-xs text-muted">What guests ask most</p>
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
                {questions.length === 0 ? (
                  <EmptyState
                    title="No questions logged yet"
                    body="Once guests start chatting, the questions people ask most will rank here."
                  />
                ) : (
                  <ol className="divide-y divide-border">
                    {questions.map((q, i) => (
                      <li
                        key={`${q.question_text}-${i}`}
                        className="flex items-center gap-4 px-5 py-3.5"
                      >
                        <span className="w-5 shrink-0 text-right text-sm tabular-nums text-muted">
                          {i + 1}
                        </span>
                        <p className="min-w-0 flex-1 truncate text-sm text-ink">{q.question_text}</p>
                        <SourceBadge source={q.source} />
                        <span className="w-16 shrink-0 text-right text-sm tabular-nums text-muted">
                          {q.hits} {q.hits === 1 ? "ask" : "asks"}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </section>

            {/* Complaints needing manager follow-up */}
            {complaints.length > 0 && (
              <section aria-labelledby="complaints-heading">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 id="complaints-heading" className="font-serif text-2xl text-ink">
                    Needs a manager
                  </h2>
                  <p className="text-xs text-muted">Flagged by the handoff detector</p>
                </div>

                <ul className="mt-4 flex flex-col gap-3">
                  {complaints.map((c) => (
                    <li
                      key={c.session_id}
                      className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-medium text-red-900">Flagged conversation</span>
                        <span className="text-xs text-red-700">{formatCreatedAt(c.updated_at)}</span>
                      </div>
                      {c.lastMessage && (
                        <p className="mt-1.5 text-red-800">&ldquo;{c.lastMessage}&rdquo;</p>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    </LiveRefresh>
  );
}
