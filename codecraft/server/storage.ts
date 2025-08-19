import { 
  type User, 
  type InsertUser, 
  type Project, 
  type InsertProject,
  type Issue,
  type InsertIssue,
  type FunctionBlock,
  type InsertFunctionBlock,
  type LlmFix,
  type InsertLlmFix,
  type GitCommit,
  type InsertGitCommit,
  type Deployment,
  type InsertDeployment,
  type History,
  type InsertHistory
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Issues
  getProjectIssues(projectId: number): Promise<Issue[]>;
  getIssue(id: number): Promise<Issue | undefined>;
  createIssue(issue: InsertIssue): Promise<Issue>;
  updateIssue(id: number, issue: Partial<InsertIssue>): Promise<Issue | undefined>;
  
  // Function Blocks
  getProjectFunctionBlocks(projectId: number): Promise<FunctionBlock[]>;
  createFunctionBlock(block: InsertFunctionBlock): Promise<FunctionBlock>;
  
  // LLM Fixes
  getProjectLlmFixes(projectId: number): Promise<LlmFix[]>;
  createLlmFix(fix: InsertLlmFix): Promise<LlmFix>;
  updateLlmFix(id: number, fix: Partial<InsertLlmFix>): Promise<LlmFix | undefined>;
  
  // Git Commits
  getProjectGitCommits(projectId: number): Promise<GitCommit[]>;
  createGitCommit(commit: InsertGitCommit): Promise<GitCommit>;
  
  // Deployments
  getProjectDeployments(projectId: number): Promise<Deployment[]>;
  createDeployment(deployment: InsertDeployment): Promise<Deployment>;
  updateDeployment(id: number, deployment: Partial<InsertDeployment>): Promise<Deployment | undefined>;
  
  // History
  getProjectHistory(projectId: number): Promise<History[]>;
  getAllHistory(): Promise<History[]>;
  createHistory(history: InsertHistory): Promise<History>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private projects: Map<number, Project>;
  private issues: Map<number, Issue>;
  private functionBlocks: Map<number, FunctionBlock>;
  private llmFixes: Map<number, LlmFix>;
  private gitCommits: Map<number, GitCommit>;
  private deployments: Map<number, Deployment>;
  private historyRecords: Map<number, History>;
  private nextId: number;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.issues = new Map();
    this.functionBlocks = new Map();
    this.llmFixes = new Map();
    this.gitCommits = new Map();
    this.deployments = new Map();
    this.historyRecords = new Map();
    this.nextId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample projects
    const sampleProjects = [
      {
        id: 1,
        name: "Wallet API",
        input_type: "GIT",
        sonar_project_key: "wallet_api",
        status: "SCAN_COMPLETED",
        last_scan: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        fix_percentage: 75,
        deployment_status: "DEPLOYED",
        description: "Payment processing service",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        name: "User Management API",
        input_type: "GIT",
        sonar_project_key: "user_mgmt_api",
        status: "SCANNING",
        last_scan: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        fix_percentage: 45,
        deployment_status: "PENDING",
        description: "Authentication service",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        name: "Analytics Dashboard",
        input_type: "UPLOAD",
        sonar_project_key: "analytics_dashboard",
        status: "SCAN_COMPLETED",
        last_scan: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        fix_percentage: 92,
        deployment_status: "DEPLOYED",
        description: "Reporting and metrics",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    sampleProjects.forEach(project => {
      this.projects.set(project.id, project);
    });

    // Sample issues for Wallet API
    const sampleIssues = [
      {
        id: 101,
        project_id: 1,
        file_path: "src/api/user.py",
        line_start: 23,
        line_end: 30,
        severity: "HIGH",
        vuln_type: "SQL Injection",
        message: "Unsanitized input used in SQL query",
        code_snippet: 'db.execute(f"SELECT * FROM users WHERE id={user_id}")',
        status: "PENDING",
        tags: ["security", "database"],
        created_at: new Date(),
      },
      {
        id: 102,
        project_id: 1,
        file_path: "src/api/auth.py",
        line_start: 45,
        line_end: 52,
        severity: "CRITICAL",
        vuln_type: "XSS",
        message: "Unescaped user input in HTML response",
        code_snippet: 'return f"<p>Welcome {username}</p>"',
        status: "FIXED",
        tags: ["security", "xss"],
        created_at: new Date(),
      },
    ];

    sampleIssues.forEach(issue => {
      this.issues.set(issue.id, issue);
    });

    // Sample LLM fixes
    const sampleFixes = [
      {
        id: 1,
        project_id: 1,
        issue_id: 101,
        function_name: "get_user",
        llm_response: "Sanitized user_id to prevent SQL Injection by using parameterized queries and input validation.",
        original_code: 'def get_user(user_id):\n    query = f"SELECT * FROM users WHERE id={user_id}"\n    return db.execute(query)',
        fixed_code: 'def get_user(user_id):\n    if not isinstance(user_id, int):\n        raise ValueError("Invalid user ID")\n    query = "SELECT * FROM users WHERE id=?"\n    return db.execute(query, (user_id,))',
        status: "FIX_READY",
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    ];

    sampleFixes.forEach(fix => {
      this.llmFixes.set(fix.id, fix);
    });

    this.nextId = 200; // Start next IDs from 200
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.nextId++;
    const project: Project = {
      ...insertProject,
      id,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: number, updateData: Partial<InsertProject>): Promise<Project | undefined> {
    const existing = this.projects.get(id);
    if (!existing) return undefined;
    
    const updated = {
      ...existing,
      ...updateData,
      updated_at: new Date(),
    };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }

  // Issues
  async getProjectIssues(projectId: number): Promise<Issue[]> {
    return Array.from(this.issues.values()).filter(
      issue => issue.project_id === projectId
    );
  }

  async getIssue(id: number): Promise<Issue | undefined> {
    return this.issues.get(id);
  }

  async createIssue(insertIssue: InsertIssue): Promise<Issue> {
    const id = this.nextId++;
    const issue: Issue = {
      ...insertIssue,
      id,
      created_at: new Date(),
    };
    this.issues.set(id, issue);
    return issue;
  }

  async updateIssue(id: number, updateData: Partial<InsertIssue>): Promise<Issue | undefined> {
    const existing = this.issues.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateData };
    this.issues.set(id, updated);
    return updated;
  }

  // Function Blocks
  async getProjectFunctionBlocks(projectId: number): Promise<FunctionBlock[]> {
    return Array.from(this.functionBlocks.values()).filter(
      block => block.project_id === projectId
    );
  }

  async createFunctionBlock(insertBlock: InsertFunctionBlock): Promise<FunctionBlock> {
    const id = this.nextId++;
    const block: FunctionBlock = {
      ...insertBlock,
      id,
      created_at: new Date(),
    };
    this.functionBlocks.set(id, block);
    return block;
  }

  // LLM Fixes
  async getProjectLlmFixes(projectId: number): Promise<LlmFix[]> {
    return Array.from(this.llmFixes.values()).filter(
      fix => fix.project_id === projectId
    );
  }

  async createLlmFix(insertFix: InsertLlmFix): Promise<LlmFix> {
    const id = this.nextId++;
    const fix: LlmFix = {
      ...insertFix,
      id,
      created_at: new Date(),
    };
    this.llmFixes.set(id, fix);
    return fix;
  }

  async updateLlmFix(id: number, updateData: Partial<InsertLlmFix>): Promise<LlmFix | undefined> {
    const existing = this.llmFixes.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateData };
    this.llmFixes.set(id, updated);
    return updated;
  }

  // Git Commits
  async getProjectGitCommits(projectId: number): Promise<GitCommit[]> {
    return Array.from(this.gitCommits.values()).filter(
      commit => commit.project_id === projectId
    );
  }

  async createGitCommit(insertCommit: InsertGitCommit): Promise<GitCommit> {
    const id = this.nextId++;
    const commit: GitCommit = {
      ...insertCommit,
      id,
      created_at: new Date(),
    };
    this.gitCommits.set(id, commit);
    return commit;
  }

  // Deployments
  async getProjectDeployments(projectId: number): Promise<Deployment[]> {
    return Array.from(this.deployments.values()).filter(
      deployment => deployment.project_id === projectId
    );
  }

  async createDeployment(insertDeployment: InsertDeployment): Promise<Deployment> {
    const id = this.nextId++;
    const deployment: Deployment = {
      ...insertDeployment,
      id,
      created_at: new Date(),
    };
    this.deployments.set(id, deployment);
    return deployment;
  }

  async updateDeployment(id: number, updateData: Partial<InsertDeployment>): Promise<Deployment | undefined> {
    const existing = this.deployments.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateData };
    this.deployments.set(id, updated);
    return updated;
  }

  // History
  async getProjectHistory(projectId: number): Promise<History[]> {
    return Array.from(this.historyRecords.values()).filter(
      record => record.project_id === projectId
    );
  }

  async getAllHistory(): Promise<History[]> {
    return Array.from(this.historyRecords.values());
  }

  async createHistory(insertHistory: InsertHistory): Promise<History> {
    const id = this.nextId++;
    const history: History = {
      ...insertHistory,
      id,
      created_at: new Date(),
    };
    this.historyRecords.set(id, history);
    return history;
  }
}

export const storage = new MemStorage();
