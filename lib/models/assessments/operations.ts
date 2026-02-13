/**
 * Assessments – pure DB operations.
 * Every function receives `db` so it can be called from
 * server-actions, API routes, **and** standalone scripts (seed).
 */

import { assessments } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { ASSESSMENT_NAME } from "./questions";
import type { Db } from "@/lib/db";

// ── CREATE ───────────────────────────────────────────────────────

export interface InsertAssessmentOpts {
  userId: string;
  answers: Record<string, number | string>;
  assessmentName?: string;
  status?: "in_progress" | "completed";
}

export async function insertAssessment(db: Db, opts: InsertAssessmentOpts) {
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

export async function findAssessmentByUserId(db: Db, userId: string) {
  return await db.query.assessments.findFirst({
    where: eq(assessments.userId, userId),
  });
}
