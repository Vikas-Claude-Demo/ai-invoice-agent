"use client";

import { motion } from "framer-motion";
import { 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  Mail, 
  Zap, 
  BarChart3,
  ChevronRight,
  Target,
  Rocket
} from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CaseStudyPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
              <Mail className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">InvoiceAgent</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link href="/#workflow" className="hover:text-blue-600 transition-colors">How it Works</Link>
            <Link href="/#usecases" className="hover:text-blue-600 transition-colors">Use Cases</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className={cn(buttonVariants(), "bg-blue-600 rounded-full")}>Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-24 bg-gray-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8">
              Success Story
            </div>
            <h1 className="text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-8">
              Transforming AP for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Global Logistics Corp.</span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed mb-10">
              How a multi-billion dollar logistics firm eliminated 90% of manual invoice errors and slashed processing time by 5x using AI-driven automation.
            </p>
            <div className="flex items-center gap-8 border-t border-white/10 pt-10">
              <div>
                <p className="text-4xl font-bold text-white">5,000+</p>
                <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mt-1">Invoices / Month</p>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div>
                <p className="text-4xl font-bold text-white">90%</p>
                <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mt-1">Automation Rate</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Challenge */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <Target className="h-6 w-6" />
              </div>
              <h2 className="text-4xl font-bold tracking-tight">The Challenge: Manual Chaos at Scale</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Before InvoiceAgent, Global Logistics Corp. relied on a team of 15 AP clerks who manually transcribed data from thousands of international freight bills. This process was:
              </p>
              <ul className="space-y-4">
                {[
                  "Error-prone: 40% of invoices had data entry discrepancies.",
                  "Slow: Average processing time was 5-7 business days per invoice.",
                  "Expensive: High operational costs and late payment penalties.",
                  "Blind: No real-time visibility into liabilities and spending."
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <XCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-50 rounded-[3rem] p-12 border border-gray-100">
              <img 
                src="/assets/case-study-viz.png" 
                alt="Manual vs AI Visualization" 
                className="rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-bold tracking-tight mb-6">The AI-First Solution</h2>
            <p className="text-xl text-gray-500">We deployed a custom end-to-end AI pipeline tailored to their complex logistics data.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <SolutionCard 
              icon={<Mail className="h-6 w-6 text-blue-600" />}
              title="Automated Ingestion"
              description="Agent automatically polls dedicated AP inboxes, extracting attachments and metadata without human intervention."
            />
            <SolutionCard 
              icon={<Zap className="h-6 w-6 text-indigo-600" />}
              title="Multimodal Extraction"
              description="Using Gemini 1.5 Pro, the system reads complex table structures, multi-page documents, and handwritten notes."
            />
            <SolutionCard 
              icon={<ShieldCheck className="h-6 w-6 text-emerald-600" />}
              title="Self-Healing Match"
              description="AI 'learns' from human corrections. If a clerk fixes a vendor's tax ID once, the system remembers it forever."
            />
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gray-900 rounded-[4rem] p-12 lg:p-20 overflow-hidden relative">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-bold text-white mb-8">Technical Architecture</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold shrink-0">1</div>
                    <div>
                      <h4 className="text-lg font-bold text-white">Ingestion Engine</h4>
                      <p className="text-gray-400 text-sm mt-1">Python-based Gmail poller with OAuth2 security.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold shrink-0">2</div>
                    <div>
                      <h4 className="text-lg font-bold text-white">AI Extraction Layer</h4>
                      <p className="text-gray-400 text-sm mt-1">Multi-model cascade (Gemini Pro/Flash) for high-precision OCR.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold shrink-0">3</div>
                    <div>
                      <h4 className="text-lg font-bold text-white">Matching Core</h4>
                      <p className="text-gray-400 text-sm mt-1">Fuzzy matching logic with self-healing AI feedback loop.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-4 bg-blue-500/20 blur-2xl group-hover:bg-blue-500/30 transition-all" />
                <img 
                  src="/assets/case-study-arch.png" 
                  alt="Architecture Diagram" 
                  className="rounded-3xl relative z-10 border border-white/10 shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-bold tracking-tight mb-6">Quantifiable Impact</h2>
            <p className="text-xl text-gray-500">The results after just 90 days of implementation.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard label="Cost Savings" value="75%" icon={<TrendingUp className="h-5 w-5" />} color="text-green-600" bg="bg-green-50" />
            <MetricCard label="Process Speed" value="5x" icon={<Clock className="h-5 w-5" />} color="text-blue-600" bg="bg-blue-50" />
            <MetricCard label="Data Accuracy" value="100%" icon={<ShieldCheck className="h-5 w-5" />} color="text-indigo-600" bg="bg-indigo-50" />
            <MetricCard label="Staff ROI" value="12mo" icon={<Rocket className="h-5 w-5" />} color="text-purple-600" bg="bg-purple-50" />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-8">Ready for your own success story?</h2>
          <p className="text-xl text-gray-600 mb-10">Start automating your accounts payable with the same technology used by industry leaders.</p>
          <div className="flex flex-col sm:row gap-4 justify-center">
            <Link href="/login" className={cn(buttonVariants({ size: "lg" }), "h-16 px-12 rounded-full font-bold bg-blue-600 shadow-xl shadow-blue-600/20")}>
              Deploy Your Agent Now
            </Link>
            <Link href="/login" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "h-16 px-12 rounded-full font-bold")}>
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Mail className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold uppercase tracking-tighter">InvoiceAgent</span>
          </div>
          <p className="text-sm text-gray-400">© 2026 InvoiceAgent Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function SolutionCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 hover:shadow-2xl transition-all group">
      <div className="h-16 w-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

function MetricCard({ label, value, icon, color, bg }: { label: string, value: string, icon: any, color: string, bg: string }) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center mb-4", bg, color)}>
        {icon}
      </div>
      <p className="text-4xl font-black text-gray-900 mb-1">{value}</p>
      <p className="text-xs uppercase tracking-widest font-bold text-gray-400">{label}</p>
    </div>
  );
}
