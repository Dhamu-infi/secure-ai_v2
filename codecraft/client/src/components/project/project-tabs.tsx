import { cn } from "@/lib/utils";

interface ProjectTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts: {
    issues: number;
    blocks: number;
    fixes: number;
    commits: number;
    deployments: number;
  };
}

const tabs = [
  { id: "issues", label: "Issues", key: "issues" },
  { id: "blocks", label: "Function Blocks", key: "blocks" },
  { id: "fixes", label: "LLM Fixes", key: "fixes" },
  { id: "commits", label: "Git Commits", key: "commits" },
  { id: "deployments", label: "Deployments", key: "deployments" },
];

export default function ProjectTabs({ activeTab, onTabChange, counts }: ProjectTabsProps) {
  return (
    <div className="border-b border-gray-200 bg-white">
      <nav className="flex space-x-8 px-6" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = counts[tab.key as keyof typeof counts];
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              data-testid={`tab-${tab.id}`}
              className={cn(
                "border-b-2 whitespace-nowrap py-4 px-1 font-medium text-sm",
                isActive
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              {tab.label}
              <span 
                className={cn(
                  "ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium",
                  isActive 
                    ? "bg-blue-100 text-blue-600" 
                    : "bg-gray-100 text-gray-600"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
