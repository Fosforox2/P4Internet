import { ObjectId } from "mongodb"

export type UserPost = {
    _id: ObjectId,
    email: string
}