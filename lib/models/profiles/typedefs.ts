/**
 * GraphQL Schema for Profiles & Matching
 */

export const profileTypeDefs = `#graphql
  type ProfileStatus {
    hasAssessment: Boolean!
    hasProfile: Boolean!
    assessmentName: String
    completedAt: String
  }

  type Match {
    user: MatchUser!
    similarity: Float!
    "Distance in km (null if either user has no location)"
    distance: Float
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

  extend type Query {
    """
    Get the authenticated user's profile status.
    Requires OAuth.
    """
    profileStatus: ProfileStatus!

    """
    Find compatible matches for the authenticated user.
    Requires OAuth.
    """
    findMatches(
      "Max distance in km, default 50 (requires user location set via updateLocation)"
      maxDistance: Float! = 50
      limit: Int
      gender: [String!]
      minAge: Int
      maxAge: Int
    ): [Match!]!

    """
    Get a user's profile status (server-to-server).
    Requires API key.
    """
    userProfileStatus(userId: ID!): ProfileStatus!

    """
    Find compatible matches for a user (server-to-server).
    Requires API key.
    """
    userMatches(
      userId: ID!
      "Max distance in km, default 50 (requires user location set via updateLocation)"
      maxDistance: Float! = 50
      limit: Int
      gender: [String!]
      minAge: Int
      maxAge: Int
    ): [Match!]!
  }
`;
