import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const projects = pgTable("projects", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  input_type: text("input_type").notNull(), // GIT, UPLOAD
  sonar_project_key: text("sonar_project_key").notNull(),
  status: text("status").notNull(), // SCAN_COMPLETED, SCANNING, FAILED
  last_scan: timestamp("last_scan"),
  fix_percentage: integer("fix_percentage").default(0),
  deployment_status: text("deployment_status").notNull(), // DEPLOYED, PENDING, FAILED
  description: text("description"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const issues = pgTable("issues", {
  id: integer("id").primaryKey(),
  project_id: integer("project_id").notNull(),
  file_path: text("file_path").notNull(),
  line_start: integer("line_start").notNull(),
  line_end: integer("line_end").notNull(),
  severity: text("severity").notNull(), // CRITICAL, HIGH, MEDIUM, LOW
  vuln_type: text("vuln_type").notNull(),
  message: text("message").notNull(),
  code_snippet: text("code_snippet"),
  status: text("status").notNull(), // PENDING, FIXED, IGNORED
  tags: text("tags").array(),
  created_at: timestamp("created_at").defaultNow(),
});

export const function_blocks = pgTable("function_blocks", {
  id: integer("id").primaryKey(),
  project_id: integer("project_id").notNull(),
  file_path: text("file_path").notNull(),
  function_name: text("function_name").notNull(),
  line_start: integer("line_start").notNull(),
  line_end: integer("line_end").notNull(),
  block_type: text("block_type").notNull(),
  code_snippet: text("code_snippet"),
  created_at: timestamp("created_at").defaultNow(),
});

export const llm_fixes = pgTable("llm_fixes", {
  id: integer("id").primaryKey(),
  project_id: integer("project_id").notNull(),
  issue_id: integer("issue_id"),
  function_name: text("function_name").notNull(),
  llm_response: text("llm_response").notNull(),
  original_code: text("original_code"),
  fixed_code: text("fixed_code"),
  status: text("status").notNull(), // FIX_READY, APPLIED, REJECTED
  created_at: timestamp("created_at").defaultNow(),
});

export const git_commits = pgTable("git_commits", {
  id: integer("id").primaryKey(),
  project_id: integer("project_id").notNull(),
  commit_hash: text("commit_hash").notNull(),
  author: text("author").notNull(),
  message: text("message").notNull(),
  committed_at: timestamp("committed_at").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const deployments = pgTable("deployments", {
  id: integer("id").primaryKey(),
  project_id: integer("project_id").notNull(),
  environment: text("environment").notNull(), // STAGING, PRODUCTION
  status: text("status").notNull(), // DEPLOYED, DEPLOYING, FAILED
  deployed_at: timestamp("deployed_at"),
  scan_id: integer("scan_id"),
  fix_id: integer("fix_id"),
  created_at: timestamp("created_at").defaultNow(),
});

export const history = pgTable("history", {
  id: integer("id").primaryKey(),
  project_id: integer("project_id").notNull(),
  action_type: text("action_type").notNull(), // SCAN, FIX, DEPLOY, MERGE
  action_data: jsonb("action_data"),
  status: text("status").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertIssueSchema = createInsertSchema(issues).omit({
  id: true,
  created_at: true,
});

export const insertFunctionBlockSchema = createInsertSchema(function_blocks).omit({
  id: true,
  created_at: true,
});

export const insertLlmFixSchema = createInsertSchema(llm_fixes).omit({
  id: true,
  created_at: true,
});

export const insertGitCommitSchema = createInsertSchema(git_commits).omit({
  id: true,
  created_at: true,
});

export const insertDeploymentSchema = createInsertSchema(deployments).omit({
  id: true,
  created_at: true,
});

export const insertHistorySchema = createInsertSchema(history).omit({
  id: true,
  created_at: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertIssue = z.infer<typeof insertIssueSchema>;
export type Issue = typeof issues.$inferSelect;

export type InsertFunctionBlock = z.infer<typeof insertFunctionBlockSchema>;
export type FunctionBlock = typeof function_blocks.$inferSelect;

export type InsertLlmFix = z.infer<typeof insertLlmFixSchema>;
export type LlmFix = typeof llm_fixes.$inferSelect;

export type InsertGitCommit = z.infer<typeof insertGitCommitSchema>;
export type GitCommit = typeof git_commits.$inferSelect;

export type InsertDeployment = z.infer<typeof insertDeploymentSchema>;
export type Deployment = typeof deployments.$inferSelect;

export type InsertHistory = z.infer<typeof insertHistorySchema>;
export type History = typeof history.$inferSelect;
