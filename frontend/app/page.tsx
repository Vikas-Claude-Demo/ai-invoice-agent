"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Mail, Shield, Zap, CheckCircle, ArrowRight, BarChart3, Clock, Globe } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
              <Mail className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">InvoiceAgent</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-blue-600 transition-colors font-bold">Features</a>
            <a href="#workflow" className="hover:text-blue-600 transition-colors font-bold">How it Works</a>
            <Link href="/case-study" className="hover:text-blue-600 transition-colors font-bold">Case Study</Link>
            <a href="#usecases" className="hover:text-blue-600 transition-colors font-bold">Use Cases</a>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className={cn(buttonVariants({ variant: "ghost" }), "hidden sm:flex text-gray-600 font-bold")}
            >
              Sign In
            </Link>
            <Link 
              href="/login" 
              className={cn(
                buttonVariants(),
                "bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-full shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 font-bold"
              )}
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              AI-Powered AP Automation
            </div>
            <h1 className="text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1] mb-8">
              Automate Invoices <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Without Lifting a Finger.</span>
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed mb-10 max-w-xl">
              Connect your Gmail, and let our AI-driven agent handle the rest. 
              Extraction, verification, and ERP synchronization — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/login" 
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-16 px-10 text-lg rounded-full bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all hover:translate-y-[-2px] flex items-center gap-2 font-bold"
                )}
              >
                Start Automating <ArrowRight className="h-5 w-5" />
              </Link>
              <Link 
                href="/dashboard?demo=true" 
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "h-16 px-10 text-lg rounded-full border-gray-200 hover:bg-gray-50 transition-all font-bold"
                )}
              >
                Try Live Demo
              </Link>
            </div>
            <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-gray-200" />
                ))}
              </div>
              <div className="text-sm">
                <span className="font-bold text-gray-900">500+ Businesses</span>
                <p className="text-gray-500">already automating with InvoiceAgent</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-3xl blur-3xl opacity-50 -z-10 animate-pulse" />
            <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden p-2">
               <img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426&ixlib=rb-4.0.3" 
                alt="Dashboard Preview" 
                className="rounded-2xl shadow-inner border border-gray-50"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur px-6 py-4 rounded-2xl shadow-2xl border border-white flex items-center gap-4">
                <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center text-white">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Match Found</p>
                  <p className="text-xs text-gray-500">Invoice matched with PO #2024-001</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it Works / Workflow */}
      <section id="workflow" className="py-24 bg-white border-y border-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 mb-6 uppercase tracking-tighter">How it Works</h2>
            <p className="text-xl text-gray-500">Our AI agent handles the grunt work while you stay in control of the strategy.</p>
          </div>

          <div className="grid lg:grid-cols-4 gap-12 relative">
            <div className="absolute top-10 left-0 w-full h-0.5 bg-gray-100 -z-10 hidden lg:block" />
            
            <WorkflowStep 
              number="01" 
              title="Ingest" 
              description="Agent auto-polls your Gmail or accepts bulk PDF uploads instantly."
              icon={<Mail className="h-6 w-6 text-blue-600" />}
            />
            <WorkflowStep 
              number="02" 
              title="Extract" 
              description="Gemini AI Vision reads every field with superhuman precision."
              icon={<Zap className="h-6 w-6 text-indigo-600" />}
            />
            <WorkflowStep 
              number="03" 
              title="Match" 
              description="3-Way Match ensures Invoice, PO, and GRN are perfectly aligned."
              icon={<CheckCircle className="h-6 w-6 text-emerald-600" />}
            />
            <WorkflowStep 
              number="04" 
              title="Post" 
              description="Approved data is synced to your ERP ledger automatically."
              icon={<BarChart3 className="h-6 w-6 text-purple-600" />}
            />
          </div>
        </div>
      </section>

      {/* Case Study Section */}
      <section id="casestudy" className="py-24 bg-gray-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -inset-10 bg-blue-500/20 rounded-full blur-[100px]" />
              <img 
                src="/assets/case-study-viz.png" 
                alt="AI Invoice Visualization" 
                className="rounded-[2.5rem] shadow-2xl relative z-10 border border-white/10"
              />
            </motion.div>

            <div className="space-y-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider">
                Real World Success
              </div>
              <h2 className="text-5xl font-extrabold leading-tight tracking-tight">Case Study: Global Logistics Corp.</h2>
              
              <div className="grid gap-8">
                <div className="flex gap-6">
                  <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20">
                    <XCircle className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2">The Problem</h4>
                    <p className="text-gray-400">Processing 5,000+ monthly invoices manually led to 40% error rates and a 5-day lag in ledger updates.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                    <CheckCircle className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2">The Solution</h4>
                    <p className="text-gray-400">Deployed InvoiceAgent with Self-Healing Match. AI learned from corrections to handle vendor-specific quirks automatically.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="h-12 w-12 rounded-2xl bg-green-500/10 flex items-center justify-center shrink-0 border border-green-500/20">
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2">The Impact</h4>
                    <ul className="text-gray-400 space-y-1 mt-2">
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> 90% Automation Rate achieved in 30 days</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Processing time cut from 5 days to 2 minutes</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> 100% Data Accuracy across ERP entries</li>
                    </ul>
                    <Link href="/case-study" className="inline-flex items-center gap-2 text-blue-400 font-bold mt-8 hover:text-blue-300 transition-colors">
                      Read Full Story <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="usecases" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 mb-4 uppercase">Industry Use Cases</h2>
            <p className="text-lg text-gray-500">Optimized for high-volume, complex accounts payable environments.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <UseCaseCard 
              title="E-Commerce & Retail" 
              usecase="Process thousands of vendor invoices with varying tax structures. Auto-onboard new suppliers in seconds."
              metric="Reduce overhead by 75%"
              icon={<ShoppingCart className="h-6 w-6" />}
            />
            <UseCaseCard 
              title="Manufacturing" 
              usecase="3-Way Match ensures you only pay for what was actually received. Flags PO discrepancies instantly."
              metric="Eliminate duplicate payments"
              icon={<Package className="h-6 w-6" />}
            />
            <UseCaseCard 
              title="Logistics & Supply Chain" 
              usecase="Handle messy freight bills and multi-currency international invoices with AI vision fallback."
              metric="5x Faster reconciliation"
              icon={<Globe className="h-6 w-6" />}
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 mb-4 uppercase">The AI Pipeline Advantage</h2>
            <p className="text-lg text-gray-500">From inbox to ledger, we've built the most resilient AI pipeline for accounts payable.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="h-6 w-6 text-blue-600" />}
              title="Instant Extraction"
              description="Our multi-model AI pipeline extracts data with 99% accuracy, including messy scans and photos."
            />
            <FeatureCard 
              icon={<Shield className="h-6 w-6 text-indigo-600" />}
              title="Self-Healing Match"
              description="The system learns from your corrections. Fix it once, and the AI will auto-correct next time."
            />
            <FeatureCard 
              icon={<Globe className="h-6 w-6 text-emerald-600" />}
              title="Global Multi-Currency"
              description="Native support for USD, EUR, INR, and 50+ other currencies with real-time conversion."
            />
            <FeatureCard 
              icon={<BarChart3 className="h-6 w-6 text-purple-600" />}
              title="ERP Sync"
              description="Seamlessly post journal entries directly to your ERP or accounting software."
            />
            <FeatureCard 
              icon={<Clock className="h-6 w-6 text-orange-600" />}
              title="Gmail Polling"
              description="Automatically fetch invoices from your inbox. No more manual downloading and uploading."
            />
            <FeatureCard 
              icon={<CheckCircle className="h-6 w-6 text-blue-600" />}
              title="Vendor Onboarding"
              description="Automatically detect and onboard new vendors from their invoice details."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6 bg-blue-600 rounded-[3rem] p-12 lg:p-20 relative overflow-hidden shadow-2xl shadow-blue-600/30">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-96 w-96 bg-white/10 rounded-full blur-3xl" />
          <div className="relative z-10 text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8">Ready to reclaim your time?</h2>
            <p className="text-xl text-blue-100 mb-10 max-w-xl mx-auto">Join hundreds of accounting teams who have automated their entire invoice workflow.</p>
            <Link 
              href="/login" 
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-16 px-12 text-lg rounded-full bg-white text-blue-600 hover:bg-blue-50 transition-all hover:scale-105 shadow-xl font-bold"
              )}
            >
              Get Started for Free
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
          <div className="flex gap-8 text-sm text-gray-500 font-bold">
            <a href="#" className="hover:text-blue-600">Privacy</a>
            <a href="#" className="hover:text-blue-600">Terms</a>
            <a href="#" className="hover:text-blue-600">Security</a>
            <a href="#" className="hover:text-blue-600">Contact</a>
          </div>
          <p className="text-sm text-gray-400">© 2026 InvoiceAgent Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function WorkflowStep({ number, title, description, icon }: { number: string, title: string, description: string, icon: React.ReactNode }) {
  return (
    <div className="relative p-8 rounded-3xl bg-white border border-gray-50 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all group">
      <div className="text-6xl font-black text-gray-100 absolute top-4 right-6 group-hover:text-blue-50 transition-colors -z-0 select-none">{number}</div>
      <div className="relative z-10">
        <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-500 leading-relaxed text-sm">{description}</p>
      </div>
    </div>
  );
}

function UseCaseCard({ title, usecase, metric, icon }: { title: string, usecase: string, metric: string, icon: React.ReactNode }) {
  return (
    <div className="p-10 rounded-[2.5rem] bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-2xl transition-all group">
      <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-500 leading-relaxed mb-8">{usecase}</p>
      <div className="pt-6 border-t border-gray-200">
        <span className="text-sm font-bold text-blue-600 uppercase tracking-wider">{metric}</span>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 hover:border-blue-200 transition-all hover:shadow-xl hover:shadow-blue-500/5 group">
      <div className="h-14 w-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-50 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

import { XCircle, ShoppingCart, Package, TrendingUp } from "lucide-react";
