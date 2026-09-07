import { FormEvent, useState } from "react";
import { AlertCircle, ArrowUp, BookOpen, Check, FileText, RotateCcw, Scale, Search, Sparkles } from "lucide-react";
import type { RulebookResponse, RulebookResponseType } from "@shared/api";

const FASTAPI_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

const examples = [
  "What attendance is required for the final examination?",
  "I have medical exemption and 65% attendance. Can I appear for the exam?",
  "What happens if I miss my exam because of a family wedding?",
];

const labels: Record<RulebookResponseType, { label: string; icon: typeof Check; className: string }> = {
  answered: { label: "Answered", icon: Check, className: "status-answered" },
  conflict: { label: "Policy conflict", icon: Scale, className: "status-conflict" },
  not_covered: { label: "Not covered", icon: AlertCircle, className: "status-uncovered" },
};

export default function Index() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<RulebookResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask(event: FormEvent) {
    event.preventDefault();
    const value = question.trim();
    if (value.length < 8) {
      setError("Please enter a specific question of at least a few words.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      let response: Response;
      try {
        response = await fetch(`${FASTAPI_BASE}/ask`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: value }) });
      } catch {
        response = await fetch("/api/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: value }) });
      }
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "The rulebook service could not process that question.");
      setResult(payload as RulebookResponse);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The rulebook service is unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setQuestion("");
    setResult(null);
    setError("");
  }

  const status = result ? labels[result.type] : null;
  const StatusIcon = status?.icon;

  return (
    <main className="site-shell">
      <div className="paper-noise" />
      <nav className="topbar">
        <div className="brand"><span className="brand-mark"><BookOpen size={20} /></span><span>Rulebook <b>AI</b></span></div>
        <div className="mode"><span className="mode-dot" /> Grounded answers only</div>
      </nav>

      <section className="hero">
        <div className="eyebrow"><Sparkles size={14} /> University policy assistant</div>
        <h1>Ask the rulebook.<br /><em>See the evidence.</em></h1>
        <p>Clear, sourced answers from your university regulations — with no guesswork when the policy is silent.</p>
      </section>

      <section className="ask-panel" aria-label="Ask the rulebook">
        <form onSubmit={ask}>
          <label htmlFor="question">Your question</label>
          <div className="question-row">
            <Search className="search-icon" size={20} />
            <input id="question" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g. What attendance is required for exams?" maxLength={500} disabled={loading} />
            <button className="ask-button" disabled={loading} type="submit">{loading ? "Checking" : "Ask"} <ArrowUp size={16} /></button>
          </div>
        </form>
        <div className="examples"><span>Try an example</span>{examples.map((example) => <button key={example} onClick={() => { setQuestion(example); setError(""); }} type="button">{example}</button>)}</div>
      </section>

      {error && <div className="error-box"><AlertCircle size={19} /> <span>{error}</span></div>}

      {loading && <section className="result-card loading-card"><div className="loading-line wide" /><div className="loading-line" /><div className="loading-line short" /></section>}

      {result && status && StatusIcon && <section className="result-card">
        <div className="result-heading">
          <div className={`status ${status.className}`}><StatusIcon size={16} /> {status.label}</div>
          <button className="reset" onClick={reset} type="button"><RotateCcw size={14} /> Clear</button>
        </div>
        <p className="answer">{result.answer}</p>
        <div className="evidence-title"><span /> Evidence from the rulebook <small>Similarity / relevance score</small><span /></div>
        <div className="source-list">
          {result.sources.map((item) => <article className="source-card" key={`${item.document}-${item.section}`}>
            <div className="source-top"><div><span className="section">§ {item.section}</span><h2>{item.title}</h2></div><span className="score">{Math.round(item.similarity * 100)}% match</span></div>
            <p>“{item.text}”</p>
            <footer><FileText size={14} /> {item.document}</footer>
          </article>)}
        </div>
      </section>}

      {!result && !loading && <section className="guide-grid">
        <article><span className="guide-icon answered"><Check size={17} /></span><h2>Answered</h2><p>A direct policy answer with the exact provision behind it.</p></article>
        <article><span className="guide-icon conflict"><Scale size={17} /></span><h2>Conflict</h2><p>Different relevant sections prescribe different outcomes.</p></article>
        <article><span className="guide-icon uncovered"><AlertCircle size={17} /></span><h2>Not covered</h2><p>When the rulebook is silent, it says so — plainly.</p></article>
      </section>}
      <footer className="page-footer">Rulebook AI <span>•</span> Evidence-first university guidance</footer>
    </main>
  );
}
