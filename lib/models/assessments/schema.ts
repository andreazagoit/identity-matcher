import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  jsonb,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { user } from "@/lib/models/users/schema";

/**
 * Assessments — stores user questionnaire answers.
 */

export const assessmentStatusEnum = pgEnum("assessment_status", [
  "in_progress",
  "completed",
]);

export const assessments = pgTable(
  "assessments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    assessmentName: text("assessment_name").notNull(),
    answers: jsonb("answers")
      .$type<Record<string, number | string>>()
      .notNull(),
    status: assessmentStatusEnum("status").notNull().default("completed"),
    completedAt: timestamp("completed_at").defaultNow().notNull(),
  },
  (table) => [
    index("assessments_user_idx").on(table.userId),
    index("assessments_assessment_name_idx").on(table.assessmentName),
  ],
);

// ── Relations ─────────────────────────────────────────────────────

export const assessmentsRelations = relations(assessments, ({ one }) => ({
  user: one(user, {
    fields: [assessments.userId],
    references: [user.id],
  }),
}));
