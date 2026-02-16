/**
 * GraphQL Schema for Assessments
 */

export const assessmentTypeDefs = `#graphql
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

  extend type Query {
    """
    Get the assessment questionnaire definition.
    Public — no authentication required.
    """
    assessmentQuestions: [AssessmentSection!]!
  }

  extend type Mutation {
    """
    Submit a completed assessment for the authenticated user.
    Requires OAuth.
    """
    submitAssessment(answers: JSON!): SubmitAssessmentResult!

    """
    Submit a completed assessment for a user (server-to-server).
    Requires API key.
    """
    submitUserAssessment(userId: ID!, answers: JSON!): SubmitAssessmentResult!
  }
`;
