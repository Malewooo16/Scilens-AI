"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Search, FileText, Sparkles, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="h-full bg-gradient-to-br from-teal-400/20 via-teal-300/20 to-emerald-200/20 text-gray-900 overflow-x-hidden">
      <DecorativeBackground />
      <NavBar />
      <HeroSection />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />
    </div>
  );
}

// ---------- Decorative background ----------
function DecorativeBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-24 left-1/2 h-[52rem] w-[52rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-teal-500/20 via-emerald-400/20 to-teal-300/20 blur-3xl animate-blob" />
      <div className="absolute -bottom-24 right-1/3 h-[48rem] w-[48rem] rounded-full bg-gradient-to-br from-emerald-500/20 via-teal-400/20 to-emerald-300/20 blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,128,128,0.08),rgba(15,23,42,0))]" />
    </div>
  );
}

// ---------- Navbar ----------
function NavBar() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/40 shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#" className="flex items-center gap-2 text-gray-900 font-bold text-xl">
          <BookOpen className="w-6 h-6 text-emerald-600" /> SciLens AI
        </a>
        <nav className="hidden md:flex gap-8">
          <a href="#features" className="hover:text-emerald-700">Features</a>
          <a href="#how" className="hover:text-emerald-700">How it works</a>
          <a href="#cta" className="hover:text-emerald-700">Get Started</a>
        </nav>
        <div className="flex gap-3">
          <a href="/login" className="hidden md:inline-block rounded-xl border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100">Sign in</a>
          <a href="/signup" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-emerald-500 transition">Get Started</a>
        </div>
      </div>
    </header>
  );
}

// ---------- Hero Section ----------
function HeroSection() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 pt-20 pb-32 flex flex-col md:flex-row items-center gap-12">
      <div className="flex-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-100/30 px-3 py-1 text-xs text-emerald-900 font-medium"
        >
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-600" />
          Semantic + full-text search in one
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="mt-6 text-5xl md:text-6xl font-extrabold leading-tight tracking-tight"
        >
          Turn research into <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-emerald-500">insights</span> instantly
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mt-4 text-lg text-gray-800"
        >
         Enter your research query, and SciLens AI automatically finds relevant papers, generating structured reports, summaries, and key findings instantly.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-8 flex gap-4"
        >
          <a href="/new-query" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg transition">
            Try it Free <ArrowRight className="w-4 h-4" />
          </a>
          <a href="#how" className="inline-flex items-center gap-2 px-6 py-3 border border-emerald-600 rounded-xl text-emerald-900 hover:bg-emerald-100 transition">
            How it works
          </a>
        </motion.div>

        <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
          {["Hybrid vector search", "AI-generated summaries", "Cited Q&A", "Structured reports"].map((item, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.05, duration: 0.5 }}
              className="flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {item}
            </motion.li>
          ))}
        </ul>
      </div>

  <motion.div 
  initial={{ opacity: 0, scale: 0.98, y: 12 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  transition={{ delay: 0.15, duration: 0.8 }}
  className="flex-1 relative"
>
  <div className="relative rounded-3xl border border-gray-300/40 bg-white/30 p-6 backdrop-blur-xl shadow-2xl">
    <div className="grid grid-cols-2 gap-4">
      <HeroTile 
        icon={<BookOpen className="w-5 h-5" />} 
        title="Query" 
        desc="Enter a research question to search papers" 
      />
      <HeroTile 
        icon={<Search className="w-5 h-5" />} 
        title="Search" 
        desc="Hybrid vector + full-text search" 
      />
      <HeroTile 
        icon={<FileText className="w-5 h-5" />} 
        title="Reports" 
        desc="Structured summaries & key findings" 
      />
      <HeroTile 
        icon={<Sparkles className="w-5 h-5" />} 
        title="Insights" 
        desc="Actionable next steps from results" 
      />
    </div>

    <motion.div
      className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-emerald-500/20 blur-2xl"
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 6, repeat: Infinity }}
    />
    <motion.div
      className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-teal-500/20 blur-2xl"
      animate={{ y: [0, 8, 0] }}
      transition={{ duration: 7, repeat: Infinity }}
    />
  </div>

  <div className="mt-3 text-center text-xs text-gray-700">
    No credit card required
  </div>
</motion.div>

    </section>
  );
}

// ---------- Hero Tile ----------
function HeroTile({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="flex items-start gap-3 rounded-xl border border-gray-300/40 bg-white/30 p-4">
      <div className="rounded-lg bg-emerald-500/20 p-2 text-emerald-600">{icon}</div>
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-gray-700">{desc}</div>
      </div>
    </motion.div>
  );
}

// ---------- Features ----------
function Features() {
  const items = [
    { title: "AI Summaries", desc: "Generate structured insights from research." },
    { title: "Hybrid Search", desc: "Vector + full-text for precise results." },
    { title: "Cited Q&A", desc: "Answers with sources traced from your notes." },
    { title: "Instant Reports", desc: "Methodology, findings, and way forward." },
    { title: "Personalized Insights", desc: "Highlight key areas to focus on." },
    { title: "Export Anywhere", desc: "PDF, CSV, or web-friendly formats." },
  ];

  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-2">
      <div className="mb-12 text-center">
        <h2 className="text-4xl font-bold">Next-Level Research Assistant</h2>
        <p className="mt-2 text-gray-800">All the tools you need to research smarter, faster.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((f, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05, duration: 0.4 }} className="rounded-xl border border-gray-300/30 bg-white/30 p-6 backdrop-blur-lg shadow-lg">
            <div className="font-semibold text-lg">{f.title}</div>
            <div className="mt-1 text-gray-700 text-sm">{f.desc}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ---------- How It Works ----------
function HowItWorks() {
  const steps = [
    { 
      title: "Enter Query", 
      desc: "Type a research question to search for relevant papers and sources." 
    },
    { 
      title: "Search & Analyze", 
      desc: "Hybrid vector + full-text search to find the most relevant results." 
    },
    { 
      title: "Generate Reports", 
      desc: "Structured summaries, key findings, and actionable insights." 
    },
    { 
      title: "Ask Anything", 
      desc: "Query your reports for cited answers and deeper understanding." 
    },
  ];

  return (
    <section id="how" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-12 text-center">
        <h2 className="text-4xl font-bold">How SciLens AI Works</h2>
        <p className="mt-2 text-gray-800">
          From query to structured reports and actionable insights in 4 simple steps.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-4">
        {steps.map((s, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 12 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ delay: i * 0.05, duration: 0.4 }} 
            className="rounded-xl border border-gray-300/30 bg-white/30 p-6 backdrop-blur-lg text-center shadow-lg"
          >
            <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 font-bold text-emerald-700">
              {i + 1}
            </div>
            <div className="font-semibold">{s.title}</div>
            <div className="mt-1 text-gray-700 text-sm">{s.desc}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}


// ---------- Call to Action ----------
function CTA() {
  return (
    <section id="cta" className="mx-auto max-w-7xl px-6 py-24">
      <div className="rounded-3xl border border-gray-300/30 bg-gradient-to-br from-emerald-500/20 via-teal-400/20 to-emerald-300/20 p-8 backdrop-blur-lg shadow-2xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-3xl font-bold">Start researching smarter — for free</h3>
            <p className="mt-2 text-gray-800">
              Enter a research query and get structured reports, summaries, key findings, and actionable insights in minutes.
            </p>
            <div className="mt-6 flex gap-4">
              <a 
                href="/new-query" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg transition"
              >
                Try it Free <ArrowRight className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="inline-flex items-center gap-2 px-6 py-3 border border-emerald-600 rounded-xl text-emerald-900 hover:bg-emerald-100 transition"
              >
                Book a Demo
              </a>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 12 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.6 }} 
            className="rounded-xl border border-gray-300/40 bg-white/30 p-5 backdrop-blur-lg shadow-lg"
          >
            <ul className="text-gray-700 text-sm space-y-2">
              <li className="flex justify-between items-center">
                Unlimited structured reports <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </li>
              <li className="flex justify-between items-center">
                Hybrid vector + full-text search <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </li>
              <li className="flex justify-between items-center">
                Cited Q&A insights <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </li>
              <li className="flex justify-between items-center">
                Export summaries to PDF/CSV <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}


// ---------- Footer ----------
function Footer() {
  return (
    <footer className="border-t border-gray-300/40 py-10 text-center text-sm text-gray-700">
      © {new Date().getFullYear()} SciLens AI. All rights reserved.
    </footer>
  );
}
