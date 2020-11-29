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

export interface UserDoc extends Document {
    name: string;
    email: string;
    password?: string;
    posts?: PostDoc[];
    _doc: UserDoc;
}

export interface PostDoc extends Document {
    user: Types.ObjectId;
    text: string;
    _doc: PostDoc;
}
