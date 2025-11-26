import { gql } from "apollo-server";



export const typeDefs = gql`
  type User {
    _id: ID!
    email: String!
  }

  type Post {
    _id: ID
    titulo: String
    contenido: String
    autor: String
    fecha: String
  }

  type Query {
    me: User
    posts: [Post]!
    post(id: ID!): Post
  }

  type Mutation {
    register(email: String!, password: String!): String!
    login(email: String!, password: String!): String!
    addPost(titulo: String!, contenido: String!, autor: String!, fecha: String!): Post!
    updatePost(id:String!, titulo: String!, contenido: String!, autor: String!, fecha: String!): Post!
    deletePost(id:String!): String!
  }
`;