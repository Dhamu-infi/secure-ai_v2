import { apiRequest } from "@/lib/queryClient";
import { Project, Issue, FunctionBlock, LlmFix, GitCommit, Deployment, History } from "@shared/schema";

export const api = {
  // Projects
  getProjects: (): Promise<Project[]> =>
    fetch("/api/projects").then(res => res.json()),
    
  getProject: (id: number): Promise<Project> =>
    fetch(`/api/projects/${id}`).then(res => res.json()),
    
  createProject: (project: any): Promise<Project> =>
    apiRequest("POST", "/api/projects", project).then(res => res.json()),

  // Issues
  getProjectIssues: (projectId: number): Promise<Issue[]> =>
    fetch(`/api/projects/${projectId}/issues`).then(res => res.json()),

  // Function Blocks
  getProjectFunctionBlocks: (projectId: number): Promise<FunctionBlock[]> =>
    fetch(`/api/projects/${projectId}/function_blocks`).then(res => res.json()),

  // LLM Fixes
  getProjectLlmFixes: (projectId: number): Promise<LlmFix[]> =>
    fetch(`/api/projects/${projectId}/llm_fixes`).then(res => res.json()),

  // Git Commits
  getProjectGitCommits: (projectId: number): Promise<GitCommit[]> =>
    fetch(`/api/projects/${projectId}/git_commits`).then(res => res.json()),

  // Deployments
  getProjectDeployments: (projectId: number): Promise<Deployment[]> =>
    fetch(`/api/projects/${projectId}/deployments`).then(res => res.json()),

  // History
  getProjectHistory: (projectId: number): Promise<History[]> =>
    fetch(`/api/projects/${projectId}/history`).then(res => res.json()),
    
  getAllHistory: (): Promise<History[]> =>
    fetch("/api/history").then(res => res.json()),

  // Scan API endpoints
  prepareScan: (projectId: number, data: any): Promise<any> =>
    apiRequest("POST", `/api/projects/${projectId}/scan/prepare`, data).then(res => res.json()),
    
  startScan: (projectId: number, data: any): Promise<any> =>
    apiRequest("POST", `/api/projects/${projectId}/scan`, data).then(res => res.json()),
    
  cancelScan: (projectId: number, scanId: number): Promise<any> =>
    apiRequest("POST", `/api/projects/${projectId}/scans/${scanId}/cancel`, {}).then(res => res.json()),
    
  fixProject: (projectId: number): Promise<any> =>
    apiRequest("POST", `/api/projects/${projectId}/fix`, {}).then(res => res.json()),
    
  mergeFix: (projectId: number, fixId: number): Promise<any> =>
    apiRequest("POST", `/api/projects/${projectId}/merge_fix`, { fix_id: fixId }).then(res => res.json()),
    
  getDiff: (projectId: number, fixId: number): Promise<any> =>
    fetch(`/api/projects/${projectId}/diff?fix_id=${fixId}`).then(res => res.json()),
    
  rescanProject: (projectId: number): Promise<any> =>
    apiRequest("POST", `/api/projects/${projectId}/rescan`, {}).then(res => res.json()),
    
  deployProject: (projectId: number, environment: string): Promise<any> =>
    apiRequest("POST", `/api/projects/${projectId}/deploy`, { environment }).then(res => res.json()),
};
