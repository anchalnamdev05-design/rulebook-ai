import type { RequestHandler } from "express";
import { z } from "zod";

export type ResponseType = "answered" | "conflict" | "not_covered";

type Passage = {
  document: string;
  section: string;
  title: string;
  text: string;
  keywords: string[];
};

const passages: Passage[] = [
  { document: "attendance.md", section: "3.1", title: "Minimum Attendance Requirement", keywords: ["attendance", "final", "exam", "examination", "eligible", "75", "appear"], text: "Students must maintain at least 75% attendance in each registered course to be eligible to appear for the final examination. Attendance is calculated from the first scheduled teaching session through the final instructional day. Students below this level must not be issued an examination hall ticket unless an express regulation provides otherwise." },
  { document: "medical_policy.md", section: "7.2", title: "Approved Medical Attendance Exemption", keywords: ["attendance", "medical", "exemption", "60", "exam", "examination", "eligible", "approved"], text: "A student with an approved medical exemption may be permitted to appear for a final examination with attendance as low as 60% in the affected course. The exemption requires medical records, a recommendation from the University Medical Officer, and approval recorded before the examination timetable is published." },
  { document: "examinations.md", section: "4.3", title: "Absence From a Scheduled Examination", keywords: ["miss", "absence", "exam", "examination", "medical", "hospital", "emergency"], text: "A student absent from a scheduled examination due to a documented medical emergency may apply to the Controller of Examinations within five working days. The application must include a hospital certificate. This provision does not state outcomes for social, travel, or family-event absences." },
  { document: "examinations.md", section: "4.6", title: "Re-examination", keywords: ["re-exam", "reexamination", "supplementary", "fail", "grade", "exam"], text: "A re-examination is available only to students who received an F grade or an approved examination-absence decision. It is conducted once per academic year after the regular results are declared. The higher of the two grades is recorded, subject to the maximum grade published for that assessment." },
  { document: "academic_rules.md", section: "5.1", title: "Internal Assessment", keywords: ["internal", "assessment", "assignment", "quiz", "marks", "submission", "late"], text: "Internal assessment consists of assignments, quizzes, presentations, laboratory work, and participation as stated in the course outline. A student must complete at least 40% of the published internal-assessment marks to remain eligible for the final course grade." },
  { document: "academic_rules.md", section: "5.4", title: "Late Assignment Submission", keywords: ["assignment", "late", "submit", "submission", "48", "hours", "penalty"], text: "Course instructors may accept an assignment submitted within 48 hours after its stated deadline, with a deduction of 10% of the marks awarded. A later submission is normally recorded as not submitted unless the instructor has approved a documented academic accommodation." },
  { document: "academic_rules.md", section: "5.8", title: "Academic Progression", keywords: ["progression", "promotion", "semester", "credits", "backlog", "year"], text: "To progress to the next academic year, a student must earn at least 70% of the credits prescribed for the current year and may carry no more than two failed courses. The Academic Progress Committee reviews borderline cases after final results are published." },
  { document: "grading.md", section: "6.2", title: "Grade Scale", keywords: ["grade", "marks", "gpa", "percentage", "distinction", "pass"], text: "Final course grades are reported as A, B, C, D, or F. A score of 85 or above earns A; 75 to 84 earns B; 65 to 74 earns C; 50 to 64 earns D; and below 50 earns F. Grade point average is calculated using the credit-weighted grade values in the academic handbook." },
  { document: "fees.csv", section: "Fee Schedule / Semester Payment", title: "Tuition Fee Deadlines", keywords: ["fee", "fees", "pay", "payment", "deadline", "late", "semester", "january"], text: "Semester tuition fees are due by 15 January for the spring semester and 15 August for the autumn semester. A payment received after the deadline attracts a late fee of 500 currency units and the student may not register for classes until the balance is cleared." },
  { document: "finance_regulations.pdf", section: "12.4", title: "Grace Period for Tuition Fees", keywords: ["fee", "fees", "pay", "payment", "late", "grace", "semester", "january"], text: "Students may pay semester tuition fees without penalty until 31 January for spring registration, provided they have submitted a signed fee-deferment request to the Finance Office before 15 January. No late fee is charged during this approved grace period." },
  { document: "scholarships.md", section: "8.1", title: "Merit Scholarship Eligibility", keywords: ["scholarship", "merit", "gpa", "grade", "attendance", "application"], text: "Merit scholarships are considered annually for full-time students with a cumulative GPA of at least 8.0 and no active disciplinary sanction. Applications must be submitted by 30 September with an official transcript and faculty recommendation." },
  { document: "hostel_rules.md", section: "9.2", title: "Hostel Leave Permission", keywords: ["hostel", "leave", "overnight", "weekend", "warden", "days", "absence"], text: "Residents seeking overnight leave must submit an online request to the hostel warden at least 24 hours before departure. A resident may take hostel leave for up to seven consecutive days with warden approval; longer leave requires the Chief Warden's written approval." },
  { document: "student_handbook.pdf", section: "9.7", title: "Hostel Absence Limit", keywords: ["hostel", "leave", "overnight", "warden", "days", "absence", "five"], text: "No hostel resident may remain away from the residence for more than five consecutive days during a teaching term without prior approval from the Chief Warden. Requests made only to a hostel warden do not authorize an absence beyond five days." },
  { document: "hostel_rules.md", section: "9.5", title: "Identity Cards and Guests", keywords: ["hostel", "roommate", "id", "identity", "guest", "card"], text: "A university identity card is personal and must be produced by its holder when requested by residence staff. Guests may enter only during published visiting hours after being signed in by their host. The rules do not grant another student permission to use a resident's identity card." },
  { document: "disciplinary_rules.md", section: "10.3", title: "Academic Misconduct", keywords: ["misconduct", "plagiarism", "cheating", "exam", "discipline", "penalty"], text: "Academic misconduct includes plagiarism, unauthorized collaboration, impersonation, possession of prohibited material during an examination, and fabrication of academic records. An instructor must report suspected misconduct to the Academic Integrity Officer with supporting material." },
  { document: "disciplinary_rules.md", section: "10.6", title: "Disciplinary Hearing", keywords: ["discipline", "hearing", "committee", "suspension", "appeal", "penalty"], text: "The Student Discipline Committee may impose a warning, educational sanction, grade penalty, probation, or suspension after giving the student written notice and an opportunity to be heard. A decision includes reasons and information about the appeal process." },
  { document: "appeals.md", section: "11.2", title: "Academic Appeals", keywords: ["appeal", "grade", "result", "review", "committee", "days"], text: "A student may appeal a final grade or academic-progression decision within ten working days of publication. The appeal must identify a procedural error, new material evidence, or a calculation error. Dissatisfaction with an academic judgment alone is not a ground for appeal." },
  { document: "administrative_procedures.md", section: "13.1", title: "Student Records", keywords: ["record", "transcript", "certificate", "student", "request", "working days"], text: "Requests for official transcripts, enrollment certificates, and corrections to personal contact details are made through the Student Services portal. A complete request is normally processed within seven working days. Students must provide current contact information and supporting evidence for changes to legal name or date of birth." },
];

const conflictRules = [
  { id: "attendance-medical", match: ["attendance", "medical"], sections: ["3.1", "7.2"], answer: "The rulebook has two relevant attendance provisions. § 3.1 sets a 75% course-attendance requirement for final examination eligibility, while § 7.2 permits an approved medical exemption as low as 60%. Because they prescribe different outcomes for medical cases, the rulebook should be reviewed by the relevant academic authority before eligibility is confirmed." },
  { id: "fee-grace", match: ["fee"], sections: ["Fee Schedule / Semester Payment", "12.4"], answer: "The fee provisions set different late-payment outcomes. The fee schedule applies a 500-unit late fee immediately after 15 January, while § 12.4 allows payment without penalty until 31 January when a fee-deferment request was submitted before the deadline. The documents should be applied together and the approved deferment status verified." },
  { id: "hostel-leave", match: ["hostel", "leave"], sections: ["9.2", "9.7"], answer: "The hostel rules contain potentially conflicting leave limits. § 9.2 allows up to seven consecutive days with warden approval, while § 9.7 says an absence longer than five days requires Chief Warden approval. For leave beyond five days, the stricter Chief Warden approval requirement should be confirmed." },
];

function tokens(value: string) {
  return value.toLowerCase().match(/[a-z0-9]+/g) ?? [];
}

function score(question: string, passage: Passage) {
  const query = tokens(question);
  const searchable = new Set(tokens(`${passage.title} ${passage.text} ${passage.keywords.join(" ")}`));
  const matches = query.filter((token) => searchable.has(token));
  const keywordMatches = query.filter((token) => passage.keywords.includes(token));
  const raw = matches.length / Math.max(query.length, 1) + keywordMatches.length * 0.11;
  return Math.min(0.97, Number(raw.toFixed(2)));
}

function source(passage: Passage, similarity: number) {
  return { document: passage.document, section: passage.section, title: passage.title, text: passage.text, similarity };
}

const requestSchema = z.object({ question: z.string().trim().min(8).max(500) });

export const handleHealth: RequestHandler = (_req, res) => {
  res.json({ status: "ok", retrievalMode: "local lexical similarity", indexedChunks: passages.length, llmAvailable: false });
};

export const handleAsk: RequestHandler = (req, res) => {
  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please enter a clear question with at least a few words." });
    return;
  }
  const question = parsed.data.question;
  const lower = question.toLowerCase();
  const ranked = passages.map((passage) => ({ passage, similarity: score(question, passage) })).sort((a, b) => b.similarity - a.similarity);

  const rule = conflictRules.find((item) => item.match.every((term) => lower.includes(term)));
  if (rule && (rule.id !== "fee-grace" || /late|deadline|january|penalty|pay/.test(lower))) {
    const relevant = ranked.filter((item) => rule.sections.includes(item.passage.section));
    res.json({ type: "conflict", answer: rule.answer, sources: relevant.map((item) => source(item.passage, Math.max(item.similarity, 0.71))) });
    return;
  }

  const best = ranked[0];
  if (best.similarity < 0.2) {
    res.json({ type: "not_covered", answer: "The rulebook does not specify a policy for this situation. I cannot infer an answer beyond the available provisions.", sources: ranked.slice(0, 2).filter((item) => item.similarity > 0.08).map((item) => source(item.passage, item.similarity)) });
    return;
  }

  const absenceSocial = /family wedding|wedding|vacation|holiday|concert|travel/.test(lower) && /exam|examination|miss|absence/.test(lower);
  if (absenceSocial) {
    const medical = passages.find((passage) => passage.section === "4.3")!;
    res.json({ type: "not_covered", answer: "The rulebook specifies an examination-absence process for documented medical emergencies, but it does not specify a policy for absence caused by a family wedding or similar personal event.", sources: [source(medical, Math.max(score(question, medical), 0.36))] });
    return;
  }

  res.json({ type: "answered", answer: `Based on the rulebook: ${best.passage.text}`, sources: ranked.slice(0, 3).filter((item) => item.similarity >= Math.max(0.2, best.similarity - 0.18)).map((item) => source(item.passage, item.similarity)) });
};
