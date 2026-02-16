/**
 * User resolvers — me, updateUser, updateLocation.
 * All OAuth only.
 */

import { GraphQLError } from "graphql";
import { db } from "@/lib/db";
import { user as userTable } from "./schema";
import { eq } from "drizzle-orm";
import { withOAuth } from "@/lib/graphql/auth";
import { updateUser, updateUserLocation } from "./operations";

export const userResolvers = {
  Query: {
    me: withOAuth(async (userId) => {
      const result = await db.query.user.findFirst({
        where: eq(userTable.id, userId),
      });

      if (!result) {
        throw new GraphQLError("User not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      return {
        ...result,
        createdAt: result.createdAt.toISOString(),
        locationUpdatedAt: result.locationUpdatedAt?.toISOString() || null,
      };
    }),
  },

  Mutation: {
    updateUser: withOAuth(async (userId, args) => {
      const updated = await updateUser(userId, args.input);

      if (!updated) {
        throw new GraphQLError("User not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      return {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        locationUpdatedAt: updated.locationUpdatedAt?.toISOString() || null,
      };
    }),

    updateLocation: withOAuth(async (userId, args) => {
      if (args.latitude < -90 || args.latitude > 90) {
        throw new GraphQLError("Invalid latitude: must be between -90 and 90", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
      if (args.longitude < -180 || args.longitude > 180) {
        throw new GraphQLError("Invalid longitude: must be between -180 and 180", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const updated = await updateUserLocation(userId, args.latitude, args.longitude);

      if (!updated) {
        throw new GraphQLError("User not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      return {
        updatedAt: updated.locationUpdatedAt!.toISOString(),
      };
    }),
  },
};
