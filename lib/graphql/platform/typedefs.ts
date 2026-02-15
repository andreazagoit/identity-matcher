import { gql } from "graphql-tag";

/**
 * Platform API - GraphQL Schema
 *
 * Consumed by external apps (spaces) via API key authentication.
 * Provides matching-as-a-service capabilities.
 */
export const platformTypeDefs = gql`
  type Query {
    """
    API health check
    """
    health: String!

    """
    Find compatible matches for a user.
    Scoped to users of the same app (or global for first-party clients).
    """
    findMatches(
      userId: ID!
      limit: Int
      gender: [String!]
      minAge: Int
      maxAge: Int
    ): [Match!]!

    """
    Get a user's profile status (assessment + embeddings)
    """
    profileStatus(userId: ID!): ProfileStatus!

    """
    Get assessment questionnaire definition
    """
    assessmentQuestions: [AssessmentSection!]!
  }

  type Mutation {
    """
    Submit a completed assessment for a user.
    Generates profile and vector embeddings.
    """
    submitAssessment(userId: ID!, answers: JSON!): SubmitAssessmentResult!
  }

  """
  A matched user with similarity scores
  """
  type Match {
    user: MatchUser!
    similarity: Float!
    breakdown: MatchBreakdown!
  }

  type MatchUser {
    id: ID!
    name: String!
    givenName: String!
    familyName: String!
    image: String
    gender: String
    birthdate: String!
  }

  type MatchBreakdown {
    psychological: Float!
    values: Float!
    interests: Float!
    behavioral: Float!
  }

  type ProfileStatus {
    hasAssessment: Boolean!
    hasProfile: Boolean!
    assessmentName: String
    completedAt: String
  }

  type AssessmentSection {
    section: String!
    questions: [AssessmentQuestion!]!
  }

  type AssessmentQuestion {
    id: String!
    type: String!
    text: String!
    options: [String!]
    scaleLabels: [String!]
    template: String
    placeholder: String
  }

  type SubmitAssessmentResult {
    success: Boolean!
    profileComplete: Boolean!
  }

  """
  Arbitrary JSON scalar for assessment answers
  """
  scalar JSON
`;
