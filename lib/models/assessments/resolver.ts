/**
 * Assessment resolvers.
 *
 * Public:  assessmentQuestions
 * OAuth:   submitAssessment       (userId from token)
 * API key: submitUserAssessment   (userId from args)
 */

import { withOAuth, withApiKey } from "@/lib/graphql/auth";
import { QUESTIONS, SECTIONS } from "./questions";
import { insertAssessment } from "./operations";
import { assembleProfile } from "./assembler";
import { upsertProfile } from "@/lib/models/profiles/operations";

async function resolveSubmitAssessment(
  userId: string,
  answers: Record<string, number | string>,
) {
  await insertAssessment({ userId, answers });
  const profileData = assembleProfile(answers);
  await upsertProfile(userId, profileData);
  return { success: true, profileComplete: true };
}

export const assessmentResolvers = {
  Query: {
    assessmentQuestions: () => {
      return SECTIONS.map((section) => ({
        section,
        questions: QUESTIONS[section].map((q) => ({
          id: q.id,
          type: q.type,
          text: q.text,
          options: q.type === "closed" ? q.options : null,
          scaleLabels: q.type === "closed" ? q.scaleLabels : null,
          template: q.type === "open" ? q.template : null,
          placeholder: q.type === "open" ? q.placeholder : null,
        })),
      }));
    },
  },

  Mutation: {
    // OAuth
    submitAssessment: withOAuth(async (userId, args) => {
      return resolveSubmitAssessment(userId, args.answers);
    }),

    // API key
    submitUserAssessment: withApiKey(async (userId, args) => {
      return resolveSubmitAssessment(userId, args.answers);
    }),
  },
};
