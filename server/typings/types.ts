import type { Document, Types } from 'mongoose';
import type { Application, NextFunction, Request, Response } from 'express';
import { BulkWriteOpResultObject } from 'mongodb';

export type App = Application;
export type Res = Response;
export type Next = NextFunction;
export type Bulk = BulkWriteOpResultObject;

export interface Req extends Request {
    user?: UserDoc;
}

export interface NewUser {
    _id: any;
    name: string;
    email: string;
    password?: string;
    posts?: PostDoc[];
}

export interface NewPost {
    _id: any;
    user: Types.ObjectId;
    text: string;
}

export interface UserDoc extends NewUser, Document {
    _doc: UserDoc;
}

export interface PostDoc extends NewPost, Document {
    _doc: PostDoc;
}
