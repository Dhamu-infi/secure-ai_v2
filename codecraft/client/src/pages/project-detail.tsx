import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Sidebar from "@/components/layout/sidebar";
import ProjectTabs from "@/components/project/project-tabs";
import IssuesTab from "@/components/project/issues-tab";
import FunctionBlocksTab from "@/components/project/function-blocks-tab";
import LlmFixesTab from "@/components/project/llm-fixes-tab";
import GitCommitsTab from "@/components/project/git-commits-tab";
import DeploymentsTab from "@/components/project/deployments-tab";
import DiffViewerModal from "@/components/diff/diff-viewer-modal";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function ProjectDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const projectId = parseInt(params.id || "0");
  const [activeTab, setActiveTab] = useState("issues");
  const [diffModal, setDiffModal] = useState<{
    isOpen: boolean;
    originalCode?: string;
    fixedCode?: string;
    functionName?: string;
  }>({ isOpen: false });

  const { data: project } = useQuery({
    queryKey: ["/api/projects", projectId],
    queryFn: () => api.getProject(projectId),
    enabled: projectId > 0,
  });

  const { data: issues = [] } = useQuery({
    queryKey: ["/api/projects", projectId, "issues"],
    queryFn: () => api.getProjectIssues(projectId),
    enabled: projectId > 0,
  });

  const { data: functionBlocks = [] } = useQuery({
    queryKey: ["/api/projects", projectId, "function_blocks"],
    queryFn: () => api.getProjectFunctionBlocks(projectId),
    enabled: projectId > 0,
  });

  const { data: llmFixes = [] } = useQuery({
    queryKey: ["/api/projects", projectId, "llm_fixes"],
    queryFn: () => api.getProjectLlmFixes(projectId),
    enabled: projectId > 0,
  });

  const { data: gitCommits = [] } = useQuery({
    queryKey: ["/api/projects", projectId, "git_commits"],
    queryFn: () => api.getProjectGitCommits(projectId),
    enabled: projectId > 0,
  });

  const { data: deployments = [] } = useQuery({
    queryKey: ["/api/projects", projectId, "deployments"],
    queryFn: () => api.getProjectDeployments(projectId),
    enabled: projectId > 0,
  });

  const handleViewDiff = async (fixId: number) => {
    try {
      const diffData = await api.getDiff(projectId, fixId);
      setDiffModal({
        isOpen: true,
        originalCode: diffData.original_code,
        fixedCode: diffData.fixed_code,
        functionName: diffData.function_name,
      });
    } catch (error) {
      console.error("Failed to fetch diff:", error);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "issues":
        return <IssuesTab issues={issues} onViewDiff={handleViewDiff} />;
      case "blocks":
        return <FunctionBlocksTab functionBlocks={functionBlocks} />;
      case "fixes":
        return <LlmFixesTab llmFixes={llmFixes} onViewDiff={handleViewDiff} />;
      case "commits":
        return <GitCommitsTab gitCommits={gitCommits} />;
      case "deployments":
        return <DeploymentsTab deployments={deployments} />;
      default:
        return <IssuesTab issues={issues} onViewDiff={handleViewDiff} />;
    }
  };

  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{project.name}</h1>
                <p className="text-sm text-gray-600 mt-1">{project.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" data-testid="button-rescan">
                Rescan Project
              </Button>
              <Button data-testid="button-auto-fix">
                Auto Fix All
              </Button>
            </div>
          </div>
        </header>

        <ProjectTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={{
            issues: issues.length,
            blocks: functionBlocks.length,
            fixes: llmFixes.length,
            commits: gitCommits.length,
            deployments: deployments.length,
          }}
        />

        <main className="flex-1 overflow-y-auto p-6">
          {renderTabContent()}
        </main>
      </div>

      <DiffViewerModal
        isOpen={diffModal.isOpen}
        originalCode={diffModal.originalCode}
        fixedCode={diffModal.fixedCode}
        functionName={diffModal.functionName}
        onClose={() => setDiffModal({ isOpen: false })}
      />
    </div>
  );
}
