export interface DemoResponse {
  message: string;
}

export type RulebookResponseType = "answered" | "conflict" | "not_covered";

export interface RulebookSource {
  document: string;
  section: string;
  title: string;
  text: string;
  similarity: number;
}

export interface RulebookResponse {
  type: RulebookResponseType;
  answer: string;
  sources: RulebookSource[];
}
