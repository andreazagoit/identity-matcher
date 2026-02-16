import { GraphQLScalarType, Kind } from "graphql";
import { userResolvers } from "../models/users/resolver";
import { profileResolvers } from "../models/profiles/resolver";
import { assessmentResolvers } from "../models/assessments/resolver";

const JSONScalar = new GraphQLScalarType({
  name: "JSON",
  description: "Arbitrary JSON scalar",
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral: (ast) => {
    if (ast.kind === Kind.STRING) return JSON.parse(ast.value);
    if (ast.kind === Kind.INT) return parseInt(ast.value, 10);
    if (ast.kind === Kind.FLOAT) return parseFloat(ast.value);
    if (ast.kind === Kind.BOOLEAN) return ast.value;
    return null;
  },
});

export const resolvers = {
  JSON: JSONScalar,

  Query: {
    ...userResolvers.Query,
    ...profileResolvers.Query,
    ...assessmentResolvers.Query,
  },

  Mutation: {
    ...userResolvers.Mutation,
    ...assessmentResolvers.Mutation,
  },
};
