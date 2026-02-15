import { gql } from "graphql-tag";

/**
 * Unified GraphQL Schema
 *
 * Single endpoint supporting dual authentication:
 *   - OAuth 2.1 access token (user-scoped, from client apps)
 *   - API key (server-to-server, from backend services)
 *
 * Operations that accept `userId` are flexible:
 *   - OAuth auth → userId is optional (defaults to authenticated user)
 *   - API key auth → userId is required
 *
 * Operations marked "OAuth only" require a user access token.
 */
export const typeDefs = gql`
  scalar JSON

  type Query {
    """
    API health check. No auth required.
    """
    health: String!

    """
    Get the authenticated user's info.
    Requires OAuth access token.
    """
    me: User!

    """
    Get a user's profile status (assessment completion + embeddings).
    OAuth: userId optional (defaults to self).
    API key: userId required.
    """
    profileStatus(userId: ID): ProfileStatus!

    """
    Get the assessment questionnaire definition.
    """
    assessmentQuestions: [AssessmentSection!]!

    """
    Find compatible matches for a user.
    OAuth: userId optional (defaults to self).
    API key: userId required.
    """
    findMatches(
      userId: ID
      limit: Int
      gender: [String!]
      minAge: Int
      maxAge: Int
    ): [Match!]!
  }

  type Mutation {
    """
    Submit a completed assessment for a user.
    Generates profile descriptions and vector embeddings.
    OAuth: userId optional (defaults to self).
    API key: userId required.
    """
    submitAssessment(userId: ID, answers: JSON!): SubmitAssessmentResult!

    """
    Update the authenticated user's basic profile info.
    Only provided fields are updated.
    Requires OAuth access token.
    """
    updateUser(input: UpdateUserInput!): User!

    """
    Update the authenticated user's GPS location.
    Subject to rate limiting and velocity checks.
    Requires OAuth access token.
    """
    updateLocation(latitude: Float!, longitude: Float!): LocationResult!
  }

  # ── Types ──────────────────────────────────────────────────────────

  type User {
    id: ID!
    name: String!
    givenName: String!
    familyName: String!
    email: String!
    birthdate: String!
    gender: String
    image: String
    emailVerified: Boolean!
    latitude: Float
    longitude: Float
    locationUpdatedAt: String
    createdAt: String!
  }

  input UpdateUserInput {
    givenName: String
    familyName: String
    birthdate: String
    gender: String
    image: String
  }

  type LocationResult {
    latitude: Float!
    longitude: Float!
    updatedAt: String!
  }

  type ProfileStatus {
    hasAssessment: Boolean!
    hasProfile: Boolean!
    assessmentName: String
    completedAt: String
  }

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
`;
