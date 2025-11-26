import { ObjectId } from "mongodb";
import { getDB } from "../db/mongo"
import { IResolvers } from "@graphql-tools/utils";
import { UserPost } from "../types/Users";
import { createUser, validateUser } from "../collections/usersPosts";
import { signToken } from "../auth";

const nameCollection = "P4Posts";

export const resolvers: IResolvers = {
  Query: {
    posts: async () => {
      const db = getDB();
      return db.collection(nameCollection).find().toArray();
    },

    post: async (_, { id }) => {
      const db = getDB();
      return db.collection(nameCollection).findOne({ _id: new ObjectId(id) });
    },
    me: async (_, __, { user }) => {
      if (!user) return null;
      return {
        _id: user._id.toString(),
        email: user.email,
      };
    },
  },

  Mutation: {
    addPost: async (_, { titulo, contenido, autor, fecha}) => {
      const db = getDB();
      const result = await db.collection(nameCollection).insertOne({
        titulo,
        contenido,
        autor,
        fecha
      });
      return {
        _id: result.insertedId,
        titulo,
        contenido,
        autor,
        fecha,
      };
    },
    register: async (
      _,
      { email, password }: { email: string; password: string }
    ) => {
      const userId = await createUser(email, password);
      return signToken(userId);
    },
    login: async (
      _,
      { email, password }: { email: string; password: string }
    ) => {
      const user = await validateUser(email, password);
      if (!user) throw new Error("Invalid credentials");
      return signToken(user._id.toString());
    },
  },
};