import type { Document, Types } from 'mongoose';
import type { Application, NextFunction, Request, Response } from 'express';
import { BulkWriteOpResultObject } from 'mongodb';

export interface App extends Application {}
export interface Req extends Request {
    user?: UserDoc;
}
export interface Res extends Response {}
export interface Next extends NextFunction {}
export interface Bulk extends BulkWriteOpResultObject {}

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
