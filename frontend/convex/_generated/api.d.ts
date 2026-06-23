/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analytics from "../analytics.js";
import type * as comments from "../comments.js";
import type * as dailyLog from "../dailyLog.js";
import type * as documents from "../documents.js";
import type * as files from "../files.js";
import type * as invitation from "../invitation.js";
import type * as issueActivity from "../issueActivity.js";
import type * as issues from "../issues.js";
import type * as notifications from "../notifications.js";
import type * as project from "../project.js";
import type * as projectActivity from "../projectActivity.js";
import type * as projectStats from "../projectStats.js";
import type * as reactions from "../reactions.js";
import type * as scoreLog from "../scoreLog.js";
import type * as task from "../task.js";
import type * as taskActivity from "../taskActivity.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  comments: typeof comments;
  dailyLog: typeof dailyLog;
  documents: typeof documents;
  files: typeof files;
  invitation: typeof invitation;
  issueActivity: typeof issueActivity;
  issues: typeof issues;
  notifications: typeof notifications;
  project: typeof project;
  projectActivity: typeof projectActivity;
  projectStats: typeof projectStats;
  reactions: typeof reactions;
  scoreLog: typeof scoreLog;
  task: typeof task;
  taskActivity: typeof taskActivity;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
