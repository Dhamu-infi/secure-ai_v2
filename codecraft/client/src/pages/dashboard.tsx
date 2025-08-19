import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import StatsCards from "@/components/project/stats-cards";
import ProjectsTable from "@/components/project/projects-table";

export default function Dashboard() {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: api.getProjects,
  });

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <StatsCards projects={projects} />
            <ProjectsTable projects={projects} isLoading={isLoading} />
          </div>
        </main>
      </div>
    </div>
  );
}
