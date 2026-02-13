/**
 * Assembler - Transforms raw assessment answers into structured ProfileData.
 *
 * Processing Logic:
 * - Closed questions: Maps the 1-5 scalar value to the corresponding pre-defined embedding sentence.
 * - Open questions: Injects the user's response into the question's sentence template.
 *
 * Output: Four textual descriptions (one for each matching axis).
 */

import { QUESTIONS, type Section, type OpenQuestion } from "./questions";

export interface ProfileData {
  psychologicalDesc: string;
  valuesDesc: string;
  interestsDesc: string;
  behavioralDesc: string;
}

function assembleSection(
  section: Section,
  answers: Record<string, number | string>,
): string {
  const questions = QUESTIONS[section];
  const sentences: string[] = [];

  for (const question of questions) {
    const answer = answers[question.id];
    if (answer === undefined) continue;

    if (question.type === "closed") {
      if (typeof answer === "number") {
        const index = Math.max(0, Math.min(4, answer - 1));
        const sentence = question.options[index];
        if (sentence) sentences.push(sentence);
      } else if (typeof answer === "string") {
        if (question.options.includes(answer)) {
          sentences.push(answer);
        }
      }
    }

    if (question.type === "open" && typeof answer === "string") {
      const text = answer.trim();
      if (text) {
        const openQ = question as OpenQuestion;
        const sentence = openQ.template.replace("{answer}", text);
        sentences.push(sentence);
      }
    }
  }

  return sentences.join(". ") + ".";
}

/**
 * Aggregates all validated answers into a ProfileData object.
 */
export function assembleProfile(
  answers: Record<string, number | string>,
): ProfileData {
  return {
    psychologicalDesc: assembleSection("psychological", answers),
    valuesDesc: assembleSection("values", answers),
    interestsDesc: assembleSection("interests", answers),
    behavioralDesc: assembleSection("behavioral", answers),
  };
}
