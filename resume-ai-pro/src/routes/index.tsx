import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, Zap, ShieldCheck, Target } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Analyzer } from "@/components/Analyzer";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "AI Resume Analyzer — Instant ATS Score & Feedback" },
      { name: "description", content: "Upload your resume to get an instant AI-powered ATS score, strengths, weaknesses, and tailored improvement suggestions." },
    ],
  }),
});

const features = [
  { icon: Target, title: "ATS Score", desc: "Know exactly how parseable your resume is." },
  { icon: Zap, title: "Instant Feedback", desc: "Detailed analysis in seconds, not days." },
  { icon: ShieldCheck, title: "Private & Secure", desc: "Your resume is processed in-memory. Never stored." },
];

function Index() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-gradient-mesh opacity-70" />
      <Toaster richColors position="top-center" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-hero shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold">ResumeAI</span>
        </div>
        
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        <section className="pt-12 pb-16 text-center md:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto inline-flex items-center gap-2 rounded-full border bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur"
          >
            <span className="flex h-2 w-2 rounded-full bg-[color:var(--success)]" />
            Free · No signup required
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto mt-6 max-w-3xl font-display text-5xl font-bold leading-[1.05] md:text-7xl"
          >
            <span className="text-gradient">AI Resume</span> Analyzer
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground"
          >
            Get an instant ATS score, expert feedback, and personalized improvements — powered by AI.
          </motion.p>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-auto max-w-3xl"
        >
          <Analyzer />
        </motion.section>

        <section className="mx-auto mt-20 grid max-w-5xl gap-6 md:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="rounded-2xl border bg-card/60 p-6 backdrop-blur transition-all hover:shadow-soft"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </section>
      </main>
    </div>
  );
}
