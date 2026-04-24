import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Lightbulb, Sparkles, Copy, Download, RotateCcw, ArrowLeft, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "./ScoreRing";
import { toast } from "sonner";
import type { Analysis } from "@/lib/analyze";
import { AdvancedDashboard } from "./features/AdvancedDashboard";

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const item = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

function Section({
  title,
  icon,
  items,
  tone,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  tone: "success" | "destructive" | "info";
}) {
  const toneMap = {
    success: "border-l-[color:var(--success)] bg-[color:var(--success)]/5",
    destructive: "border-l-[color:var(--destructive)] bg-[color:var(--destructive)]/5",
    info: "border-l-[color:var(--info)] bg-[color:var(--info)]/5",
  };
  const iconBg = {
    success: "bg-[color:var(--success)]/15 text-[color:var(--success)]",
    destructive: "bg-[color:var(--destructive)]/15 text-[color:var(--destructive)]",
    info: "bg-[color:var(--info)]/15 text-[color:var(--info)]",
  };
  return (
    <Card className="overflow-hidden p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg[tone]}`}>{icon}</div>
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <Badge variant="secondary" className="ml-auto">{items.length}</Badge>
      </div>
      <motion.ul variants={stagger} initial="initial" animate="animate" className="space-y-2">
        {items.map((it, i) => (
          <motion.li
            key={i}
            variants={item}
            className={`rounded-lg border-l-4 p-3 text-sm leading-relaxed ${toneMap[tone]}`}
          >
            {it}
          </motion.li>
        ))}
      </motion.ul>
    </Card>
  );
}

function buildReport(a: Analysis) {
  const lines = [
    `AI RESUME ANALYSIS REPORT`,
    `========================`,
    ``,
    `ATS Score: ${a.atsScore}/100`,
    a.jobMatchScore !== null ? `Job Match Score: ${a.jobMatchScore}/100` : null,
    ``,
    `Summary: ${a.summary}`,
    ``,
    `STRENGTHS`,
    ...a.strengths.map((s) => `  • ${s}`),
    ``,
    `WEAKNESSES`,
    ...a.weaknesses.map((s) => `  • ${s}`),
    ``,
    `SUGGESTED IMPROVEMENTS`,
    ...a.improvements.map((s) => `  • ${s}`),
    ``,
    `MISSING SKILLS (sorted by impact)`,
    ...[...a.missingSkills]
      .sort((x, y) => y.impact - x.impact)
      .map((s) => `  • [${s.impact}/10] ${s.skill} — ${s.reason}`),
  ].filter(Boolean);
  return lines.join("\n");
}

type JDMatch = { inJD: boolean; confidence: "high" | "medium" | "low" | null };

function matchInJD(skill: string, jd: string): JDMatch {
  if (!jd) return { inJD: false, confidence: null };
  const haystack = jd.toLowerCase();
  const needle = skill.toLowerCase().trim();
  if (!needle) return { inJD: false, confidence: null };

  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // High: exact word/phrase boundary match
  const boundary = /\s/.test(needle)
    ? new RegExp(`(^|[^a-z0-9])${escape(needle)}([^a-z0-9]|$)`)
    : new RegExp(`\\b${escape(needle)}\\b`);
  if (boundary.test(haystack)) return { inJD: true, confidence: "high" };

  // Medium: substring match (e.g. "react" inside "reactjs")
  if (haystack.includes(needle)) return { inJD: true, confidence: "medium" };

  // Low: any individual token of the skill appears as a whole word
  const tokens = needle.split(/\s+/).filter((t) => t.length > 2);
  const hits = tokens.filter((t) => new RegExp(`\\b${escape(t)}\\b`).test(haystack)).length;
  if (tokens.length > 0 && hits / tokens.length >= 0.5) {
    return { inJD: true, confidence: "low" };
  }

  return { inJD: false, confidence: null };
}

export function Results({
  analysis,
  resumeText = "",
  jobDescription = "",
  onReset,
}: {
  analysis: Analysis;
  resumeText?: string;
  jobDescription?: string;
  onReset: () => void;
}) {
  const hasJD = jobDescription.trim().length > 0;
  const report = buildReport(analysis);

  const copy = async () => {
    await navigator.clipboard.writeText(report);
    toast.success("Report copied to clipboard");
  };
  const download = () => {
    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume-analysis.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <Button onClick={onReset} variant="ghost" size="sm" className="-ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Button>
      </div>

      <div className={`grid gap-6 ${analysis.jobMatchScore !== null ? "md:grid-cols-2" : ""}`}>
        <Card className="relative overflow-hidden p-8 shadow-elegant">
          <div className="absolute right-4 top-4 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
            ATS
          </div>
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
            <ScoreRing score={analysis.atsScore} label="ATS Score" />
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-display text-xl font-semibold">Resume Parseability</h3>
              <p className="mt-2 text-sm text-muted-foreground">{analysis.summary}</p>
            </div>
          </div>
        </Card>

        {analysis.jobMatchScore !== null && (
          <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-accent/40 to-primary/5 p-8 shadow-elegant">
            <div className="absolute right-4 top-4 rounded-full bg-gradient-hero px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
              Job Match
            </div>
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
              <ScoreRing score={analysis.jobMatchScore} label="Match" />
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-display text-xl font-semibold">vs. Job Description</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {analysis.jobMatchScore >= 80
                    ? "Strong fit — you align well with the role."
                    : analysis.jobMatchScore >= 60
                    ? "Decent fit — close some gaps to stand out."
                    : "Significant gaps — see missing skills below."}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
        <p className="text-sm text-muted-foreground">Save or share your full report</p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={copy} variant="outline" size="sm"><Copy className="mr-2 h-4 w-4" />Copy</Button>
          <Button onClick={download} variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Download</Button>
          <Button onClick={onReset} variant="ghost" size="sm"><RotateCcw className="mr-2 h-4 w-4" />New analysis</Button>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Section title="Strengths" icon={<CheckCircle2 className="h-5 w-5" />} items={analysis.strengths} tone="success" />
        <Section title="Weaknesses" icon={<AlertTriangle className="h-5 w-5" />} items={analysis.weaknesses} tone="destructive" />
      </div>

      <Section title="Suggested Improvements" icon={<Lightbulb className="h-5 w-5" />} items={analysis.improvements} tone="info" />

      <Card className="p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold">Skill-Gap Projects</h3>
            <p className="text-xs text-muted-foreground">Portfolio ideas to bridge your identified gaps</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {analysis.suggestedProjects.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col rounded-xl border border-yellow-100 bg-yellow-50/30 p-4 transition-all hover:shadow-md hover:bg-yellow-50/50"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="rounded-lg bg-yellow-100 p-2 text-yellow-700">
                  <Code2 className="h-4 w-4" />
                </div>
                <Badge variant="outline" className="border-yellow-200 bg-yellow-100/50 text-[10px] font-bold text-yellow-800">
                  {p.difficulty}
                </Badge>
              </div>
              <h4 className="font-display text-sm font-bold text-yellow-900">{p.title}</h4>
              <p className="mt-2 flex-1 text-[11px] leading-relaxed text-yellow-800/80">
                {p.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-1">
                {p.skillsAddressed.map((s, j) => (
                  <span key={j} className="rounded-full bg-yellow-100 px-2 py-0.5 text-[9px] font-medium text-yellow-700">
                    +{s}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {(() => {
        const sorted = [...analysis.missingSkills].sort((a, b) => b.impact - a.impact);
        const top = sorted.slice(0, 3);
        const rest = sorted.slice(3);
        const impactTone = (n: number) =>
          n >= 8
            ? "border-[color:var(--destructive)]/40 bg-[color:var(--destructive)]/10 text-[color:var(--destructive)]"
            : n >= 5
            ? "border-[color:var(--warning)]/40 bg-[color:var(--warning)]/10 text-[color:var(--warning-foreground)] dark:text-[color:var(--warning)]"
            : "border-primary/30 bg-primary/10 text-primary";

        return (
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero text-primary-foreground">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold">Missing Skills & Keywords</h3>
              {analysis.jobMatchScore !== null && (
                <span className="ml-auto text-xs text-muted-foreground">Sorted by job-match impact</span>
              )}
            </div>

            {hasJD && (
              <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg bg-muted/40 px-3 py-2 text-xs">
                <span className="font-semibold text-foreground">Legend:</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[color:var(--destructive)]" />
                  In job description (gap)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Recommended addition
                </span>
              </div>
            )}

            {top.length > 0 && (
              <div className="mb-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Most important
                </p>
                <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-2">
                  {top.map((s, i) => {
                    const m = matchInJD(s.skill, jobDescription);
                    return (
                    <motion.div
                      key={i}
                      variants={item}
                      className={`flex items-start gap-3 rounded-xl border p-3 ${impactTone(s.impact)}`}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background/60 font-display text-sm font-bold tabular-nums">
                        {s.impact}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold leading-tight text-foreground">{s.skill}</p>
                          {hasJD && (
                            m.inJD ? (
                              <span
                                title={`Confidence: ${m.confidence} — based on how this term appears in the JD`}
                                className="inline-flex items-center gap-1 rounded-full bg-[color:var(--destructive)]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--destructive)]"
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--destructive)]" />
                                In JD · {m.confidence}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                Recommended
                              </span>
                            )
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{s.reason}</p>
                      </div>
                    </motion.div>
                    );
                  })}
                </motion.div>
                <p className="mt-3 rounded-lg bg-muted/60 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">How impact is scored:</span>{" "}
                  {analysis.jobMatchScore !== null
                    ? "Each skill is rated 1–10 based on how often it appears in the job description, whether it's listed as required vs. nice-to-have, and how much adding it would lift your Job Match score. 8–10 = critical gap, 5–7 = strong boost, 1–4 = minor polish."
                    : "Each skill is rated 1–10 by general role-readiness — how essential it is for similar roles in your field. 8–10 = critical gap, 5–7 = strong boost, 1–4 = minor polish. Add a job description to get tailored impact scores."}
                </p>
              </div>
            )}

            {rest.length > 0 && (
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Also worth adding
                </p>
                <motion.div variants={stagger} initial="initial" animate="animate" className="flex flex-wrap gap-2">
                  {rest.map((s, i) => {
                    const m = matchInJD(s.skill, jobDescription);
                    const cls = m.inJD
                      ? "border-[color:var(--destructive)]/40 bg-[color:var(--destructive)]/10 text-[color:var(--destructive)]"
                      : "border-primary/30 bg-primary/10 text-primary";
                    return (
                      <motion.span
                        key={i}
                        variants={item}
                        title={`${s.reason}${m.inJD ? ` · In JD (${m.confidence} confidence)` : ""}`}
                        className={`inline-flex cursor-help items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium ${cls}`}
                      >
                        {hasJD && (
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              m.inJD ? "bg-[color:var(--destructive)]" : "bg-primary"
                            }`}
                          />
                        )}
                        {s.skill}
                        {m.inJD && (
                          <span className="rounded-sm bg-background/70 px-1 text-[9px] font-bold uppercase tracking-wider">
                            {m.confidence}
                          </span>
                        )}
                        <span className="text-xs opacity-70 tabular-nums">{s.impact}</span>
                      </motion.span>
                    );
                  })}
                </motion.div>
              </div>
            )}
          </Card>
        );
      })()}

      <AdvancedDashboard 
        analysis={analysis} 
        resumeText={resumeText} 
        jobDescription={jobDescription} 
      />
    </motion.div>
  );
}
