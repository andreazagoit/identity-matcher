/**
 * GraphQL Schema for Users
 */

export const userTypeDefs = `#graphql
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
    updatedAt: String!
  }

  extend type Query {
    """
    Get the authenticated user's info.
    Requires OAuth access token.
    """
    me: User!
  }

  extend type Mutation {
    """
    Update the authenticated user's basic profile info.
    Only provided fields are updated.
    Requires OAuth access token.
    """
    updateUser(input: UpdateUserInput!): User!

    """
    Update the authenticated user's GPS location.
    Requires OAuth access token.
    """
    updateLocation(latitude: Float!, longitude: Float!): LocationResult!
  }
`;
