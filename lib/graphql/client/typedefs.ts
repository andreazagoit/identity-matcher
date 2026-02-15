import { gql } from "graphql-tag";

/**
 * Client API - GraphQL Schema
 *
 * Consumed by client apps (e.g. @matcher) after OAuth authentication.
 * Authenticated via OAuth 2.1 access token (Bearer token).
 *
 * All queries are scoped to the authenticated user unless stated otherwise.
 */
export const clientTypeDefs = gql`
  type Query {
    """
    Get the authenticated user's basic info
    """
    me: User!

    """
    Get the authenticated user's profile status (assessment + embeddings)
    """
    profileStatus: ProfileStatus!

    """
    Get the assessment questionnaire definition
    """
    assessmentQuestions: [AssessmentSection!]!

    """
    Find compatible matches for the authenticated user.
    Results are scoped to users of the same client app.
    """
    findMatches(
      limit: Int
      gender: [String!]
      minAge: Int
      maxAge: Int
    ): [Match!]!
  }

  type Mutation {
    """
    Submit a completed assessment for the authenticated user.
    Generates profile and vector embeddings.
    """
    submitAssessment(answers: JSON!): SubmitAssessmentResult!

    """
    Update the authenticated user's basic profile info.
    Only provided fields are updated.
    """
    updateUser(input: UpdateUserInput!): User!

    """
    Update the authenticated user's GPS location.
    Subject to rate limiting and velocity checks.
    """
    updateLocation(latitude: Float!, longitude: Float!): LocationResult!
  }

  # ============================================
  # TYPES
  # ============================================

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

  """
  Arbitrary JSON scalar for assessment answers
  """
  scalar JSON
`;
