import 'server-only';

import { ObjectId } from 'mongodb';
import { ApplicationStatus } from '@/lib/applications';

export type DbUser = {
  _id: ObjectId;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type DbSession = {
  _id: ObjectId;
  token: string;
  userId: ObjectId;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type DbAccount = {
  _id: ObjectId;
  userId: ObjectId;
  accountId: string;
  providerId: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type DbVerification = {
  _id: ObjectId;
  identifier: string;
  value: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type DbApplication = {
  _id: ObjectId;
  userId: ObjectId;
  company: string;
  role: string;
  appliedAt: Date;
  status: ApplicationStatus;
  statusChangedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};
