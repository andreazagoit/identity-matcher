import { userTypeDefs } from "../models/users/typedefs";
import { profileTypeDefs } from "../models/profiles/typedefs";
import { assessmentTypeDefs } from "../models/assessments/typedefs";

// Base types — empty definitions extended by model-specific typedefs
const baseTypeDefs = `#graphql
  scalar JSON

  type Query
  type Mutation
`;

export const typeDefs = [
  baseTypeDefs,
  userTypeDefs,
  profileTypeDefs,
  assessmentTypeDefs,
];
