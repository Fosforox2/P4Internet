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

    /*
    SignIn: async (parent: any, args: { email: string, pwd: string }, context: { coleccionUsers: Collection }) => {
        let UserDB: Usuario = await context.coleccionUsers.findOne({ email: args.email }) as Usuario;
        if (UserDB) {
            console.log(`Error, ya existe usuario con mail ${args.email}`);
        } else {
            //Pondremos un token provisional inicial, pero este mismo se actualizará cada vez que iniciemos sesión con el usuario.
            context.coleccionUsers.insertOne({
                email: args.email,
                pwd: args.pwd,
                token: uuidv4()
            })
            console.log(args.email);
        }
        //Devolvemos los datos introducidos en la db para comprobar que se han registrado correctamente.
        UserDB = await context.coleccionUsers.findOne({ email: args.email }) as Usuario;
        return {
            id: UserDB._id,
            email: UserDB.email,
            token: UserDB.token
        }
    },
    */ 
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
    addPost: async (_, { titulo, contenido, autor, fecha}, ctx) => {
      if(!ctx.user) throw new Error("CACA");

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
    updatePost: async (_, { id, titulo, contenido, autor, fecha}, ctx) => {
      if (!ctx.user) throw new Error("No autorizado");

      const db = getDB();
      const postId = new ObjectId(id);

      const post = await db.collection(nameCollection).findOne({
        _id: postId,
      });

      if (!post) throw new Error("No puedes editar este post");

      await db.collection(nameCollection).updateOne(
        { _id: postId },
        { $set: { titulo, contenido, autor, fecha} }
      );

      return {
        _id: id,
        titulo,
        contenido,
        autor,
        fecha,
      };
    },

    deletePost: async (_, { id }, ctx) => {
      if (!ctx.user) throw new Error("No autorizado");

      const db = getDB();
      const postId = new ObjectId(id);

      const result = await db.collection(nameCollection).deleteOne({
        _id: postId,
        
      });

      if (result.deletedCount === 0)
        throw new Error("No puedes eliminar este post");

      return "Post eliminado correctamente";
    },
  },
};