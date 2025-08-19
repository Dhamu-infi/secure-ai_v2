import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema, insertIssueSchema, insertLlmFixSchema, insertDeploymentSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Projects routes
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ message: "Invalid project data" });
    }
  });

  // Issues routes
  app.get("/api/projects/:id/issues", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const issues = await storage.getProjectIssues(projectId);
      res.json(issues);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch issues" });
    }
  });

  app.post("/api/projects/:id/issues", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const issueData = insertIssueSchema.parse({ ...req.body, project_id: projectId });
      const issue = await storage.createIssue(issueData);
      res.status(201).json(issue);
    } catch (error) {
      res.status(400).json({ message: "Invalid issue data" });
    }
  });

  // Function Blocks routes
  app.get("/api/projects/:id/function_blocks", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const blocks = await storage.getProjectFunctionBlocks(projectId);
      res.json(blocks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch function blocks" });
    }
  });

  // LLM Fixes routes
  app.get("/api/projects/:id/llm_fixes", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const fixes = await storage.getProjectLlmFixes(projectId);
      res.json(fixes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch LLM fixes" });
    }
  });

  app.post("/api/projects/:id/llm_fixes", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const fixData = insertLlmFixSchema.parse({ ...req.body, project_id: projectId });
      const fix = await storage.createLlmFix(fixData);
      res.status(201).json(fix);
    } catch (error) {
      res.status(400).json({ message: "Invalid LLM fix data" });
    }
  });

  // Git Commits routes
  app.get("/api/projects/:id/git_commits", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const commits = await storage.getProjectGitCommits(projectId);
      res.json(commits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch git commits" });
    }
  });

  // Deployments routes
  app.get("/api/projects/:id/deployments", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const deployments = await storage.getProjectDeployments(projectId);
      res.json(deployments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deployments" });
    }
  });

  app.post("/api/projects/:id/deployments", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const deploymentData = insertDeploymentSchema.parse({ ...req.body, project_id: projectId });
      const deployment = await storage.createDeployment(deploymentData);
      res.status(201).json(deployment);
    } catch (error) {
      res.status(400).json({ message: "Invalid deployment data" });
    }
  });

  // History routes
  app.get("/api/projects/:id/history", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const history = await storage.getProjectHistory(projectId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project history" });
    }
  });

  app.get("/api/history", async (req, res) => {
    try {
      const history = await storage.getAllHistory();
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch history" });
    }
  });

  // Scan preparation route
  app.post("/api/projects/:id/scan/prepare", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const { repo_url, git_username, git_password, language } = req.body;
      
      // Simulate repository analysis
      const mockDirectories = [
        "src/",
        "tests/", 
        "docs/",
        "config/",
        "public/",
        "assets/"
      ];
      
      res.json({ directories: mockDirectories });
    } catch (error) {
      res.status(500).json({ message: "Failed to prepare scan" });
    }
  });

  // Action routes
  app.post("/api/projects/:id/scan", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const { scan_type, selected_directories, exclusions, repo_url, git_username, git_password, language } = req.body;
      
      // Simulate scan action
      await storage.updateProject(projectId, { 
        status: "SCANNING",
        last_scan: new Date()
      });
      
      // Create history record
      await storage.createHistory({
        project_id: projectId,
        action_type: "SCAN",
        action_data: { 
          scan_type,
          selected_directories,
          exclusions,
          language
        },
        status: "COMPLETED"
      });
      
      // Return scan details
      const scanId = Math.floor(Math.random() * 1000);
      res.json({ 
        scan_id: scanId,
        status: "SCANNING",
        start_datetime: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to initiate scan" });
    }
  });

  // Cancel scan route
  app.post("/api/projects/:id/scans/:scan_id/cancel", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const scanId = parseInt(req.params.scan_id);
      
      // Create history record
      await storage.createHistory({
        project_id: projectId,
        action_type: "SCAN",
        action_data: { scan_id: scanId, action: "cancelled" },
        status: "CANCELLED"
      });
      
      res.json({ 
        scan_id: scanId,
        status: "CANCELLED"
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to cancel scan" });
    }
  });

  app.post("/api/projects/:id/fix", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      
      // Create history record
      await storage.createHistory({
        project_id: projectId,
        action_type: "FIX",
        action_data: { fix_type: "auto" },
        status: "COMPLETED"
      });
      
      res.json({ message: "Auto fix initiated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to initiate auto fix" });
    }
  });

  app.post("/api/projects/:id/merge_fix", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const { fix_id } = req.body;
      
      if (fix_id) {
        await storage.updateLlmFix(fix_id, { status: "APPLIED" });
      }
      
      // Create history record
      await storage.createHistory({
        project_id: projectId,
        action_type: "MERGE",
        action_data: { fix_id },
        status: "COMPLETED"
      });
      
      res.json({ message: "Fix merged successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to merge fix" });
    }
  });

  app.get("/api/projects/:id/diff", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const { fix_id } = req.query;
      
      if (fix_id) {
        const fixes = await storage.getProjectLlmFixes(projectId);
        const fix = fixes.find(f => f.id === parseInt(fix_id as string));
        
        if (fix) {
          res.json({
            original_code: fix.original_code,
            fixed_code: fix.fixed_code,
            function_name: fix.function_name
          });
        } else {
          res.status(404).json({ message: "Fix not found" });
        }
      } else {
        res.status(400).json({ message: "Fix ID required" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch diff" });
    }
  });

  app.post("/api/projects/:id/rescan", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      
      await storage.updateProject(projectId, { 
        status: "SCANNING",
        last_scan: new Date()
      });
      
      // Create history record
      await storage.createHistory({
        project_id: projectId,
        action_type: "SCAN",
        action_data: { scan_type: "rescan" },
        status: "COMPLETED"
      });
      
      res.json({ message: "Rescan initiated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to initiate rescan" });
    }
  });

  app.post("/api/projects/:id/deploy", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const { environment } = req.body;
      
      const deployment = await storage.createDeployment({
        project_id: projectId,
        environment: environment || "STAGING",
        status: "DEPLOYING",
        deployed_at: new Date(),
        scan_id: null,
        fix_id: null
      });
      
      // Create history record
      await storage.createHistory({
        project_id: projectId,
        action_type: "DEPLOY",
        action_data: { environment, deployment_id: deployment.id },
        status: "COMPLETED"
      });
      
      res.json(deployment);
    } catch (error) {
      res.status(500).json({ message: "Failed to initiate deployment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
