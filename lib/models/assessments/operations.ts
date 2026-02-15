/**
 * Assessments – DB operations.
 */

import { db } from "@/lib/db";
import { assessments } from "./schema";
import { eq } from "drizzle-orm";
import { ASSESSMENT_NAME } from "./questions";

// ── CREATE ───────────────────────────────────────────────────────

export interface InsertAssessmentOpts {
  userId: string;
  answers: Record<string, number | string>;
  assessmentName?: string;
  status?: "in_progress" | "completed";
}

export async function insertAssessment(opts: InsertAssessmentOpts) {
  const [assessment] = await db
    .insert(assessments)
    .values({
      userId: opts.userId,
      assessmentName: opts.assessmentName ?? ASSESSMENT_NAME,
      answers: opts.answers,
      status: opts.status ?? "completed",
      completedAt: new Date(),
    })
    .returning();

  return assessment;
}

// ── READ ─────────────────────────────────────────────────────────

export async function findAssessmentByUserId(userId: string) {
  return await db.query.assessments.findFirst({
    where: eq(assessments.userId, userId),
  });
}
