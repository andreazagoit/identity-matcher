/**
 * Complete Assessment API
 * POST /api/assessment
 *
 * Saves assessment answers and generates user profile with embeddings.
 */

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { insertAssessment } from "@/lib/models/assessments/operations";
import { assembleProfile } from "@/lib/models/assessments/assembler";
import { upsertProfile } from "@/lib/models/profiles/operations";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { answers } = body;

    if (!answers || typeof answers !== "object") {
      return Response.json({ error: "Answers are required" }, { status: 400 });
    }

    // 1. Save assessment
    const assessment = await insertAssessment({ userId, answers });

    // 2. Assemble profile data from answers
    const profileData = assembleProfile(answers);

    // 3. Generate embeddings and save profile
    const profile = await upsertProfile(userId, profileData, 1);

    return Response.json({
      success: true,
      assessmentId: assessment.id,
      profileId: profile.id,
    });
  } catch (error) {
    console.error("Complete assessment error:", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to complete assessment",
      },
      { status: 500 },
    );
  }
}
