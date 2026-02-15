import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  index,
  real,
} from "drizzle-orm/pg-core";
import { vector } from "drizzle-orm/pg-core/columns/vector_extension/vector";
import { user } from "@/lib/models/users/schema";

/**
 * User Profiles with vector embeddings for multi-axis matching.
 * Each user has exactly one profile (1:1 with user).
 */

const EMBEDDING_DIMENSIONS = 1536;

export const profiles = pgTable(
  "profiles",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),

    // Textual descriptions (assembled from assessment answers)
    psychologicalDesc: text("psychological_desc"),
    valuesDesc: text("values_desc"),
    interestsDesc: text("interests_desc"),
    behavioralDesc: text("behavioral_desc"),

    // Vector embeddings (OpenAI text-embedding-3-small, 1536 dims)
    psychologicalEmbedding: vector("psychological_embedding", {
      dimensions: EMBEDDING_DIMENSIONS,
    }),
    valuesEmbedding: vector("values_embedding", {
      dimensions: EMBEDDING_DIMENSIONS,
    }),
    interestsEmbedding: vector("interests_embedding", {
      dimensions: EMBEDDING_DIMENSIONS,
    }),
    behavioralEmbedding: vector("behavioral_embedding", {
      dimensions: EMBEDDING_DIMENSIONS,
    }),

    assessmentVersion: real("assessment_version").default(1),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("profiles_psychological_idx").using(
      "hnsw",
      table.psychologicalEmbedding.op("vector_cosine_ops"),
    ),
    index("profiles_values_idx").using(
      "hnsw",
      table.valuesEmbedding.op("vector_cosine_ops"),
    ),
    index("profiles_interests_idx").using(
      "hnsw",
      table.interestsEmbedding.op("vector_cosine_ops"),
    ),
    index("profiles_behavioral_idx").using(
      "hnsw",
      table.behavioralEmbedding.op("vector_cosine_ops"),
    ),
    index("profiles_user_idx").on(table.userId),
  ],
);

/** Default weights for weighted-average match ranking. */
export const DEFAULT_MATCHING_WEIGHTS = {
  psychological: 0.45,
  values: 0.25,
  interests: 0.2,
  behavioral: 0.1,
} as const;

// ── Relations ─────────────────────────────────────────────────────

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(user, {
    fields: [profiles.userId],
    references: [user.id],
  }),
}));
