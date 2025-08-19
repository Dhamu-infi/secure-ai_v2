import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, FileText, Eye, RotateCcw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Project } from "@shared/schema";

interface ProjectsTableProps {
  projects: Project[];
  isLoading: boolean;
}

export default function ProjectsTable({ projects, isLoading }: ProjectsTableProps) {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.sonar_project_key.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCAN_COMPLETED":
        return "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200";
      case "SCANNING":
        return "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200 animate-pulse";
      case "FAILED":
        return "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200";
      default:
        return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200";
    }
  };

  const getInputTypeColor = (inputType: string) => {
    switch (inputType) {
      case "GIT":
        return "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200";
      case "UPLOAD":
        return "bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border border-purple-200";
      default:
        return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200";
    }
  };

  const getDeploymentColor = (status: string) => {
    switch (status) {
      case "DEPLOYED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-gray-100 text-gray-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading projects...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0">
      <CardHeader className="px-8 py-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Projects</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">Track security scans and AI-powered fixes</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-72 pl-12 h-12 text-base border-2 focus:border-blue-500 rounded-xl"
                data-testid="input-search-projects"
              />
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 h-12 border-2 focus:border-blue-500 rounded-xl" data-testid="select-status-filter">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="SCAN_COMPLETED">Scan Completed</SelectItem>
                <SelectItem value="SCANNING">Scanning</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-b-2 border-gray-200 dark:border-gray-600">
                <TableHead className="px-8 py-4 font-semibold text-gray-700 dark:text-gray-300">Project Name</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Input Type</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Sonar Key</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Status</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Last Scan</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Progress</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Deployment</TableHead>
                <TableHead className="px-8 py-4 font-semibold text-gray-700 dark:text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project, index) => (
                <TableRow 
                  key={project.id} 
                  className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10 cursor-pointer transition-all duration-200 border-b border-gray-100 dark:border-gray-700"
                  onClick={() => setLocation(`/project/${project.id}`)}
                  data-testid={`row-project-${project.id}`}
                >
                  <TableCell className="px-8 py-6">
                    <div className="flex items-center">
                      <div>
                        <div className="text-base font-semibold text-gray-900 dark:text-gray-100">{project.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{project.description || 'Security scan project'}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-6">
                    <Badge className={`${getInputTypeColor(project.input_type)} px-3 py-1.5 rounded-full font-medium text-xs uppercase tracking-wide`}>
                      {project.input_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-6 text-sm text-gray-600 dark:text-gray-400 font-mono">
                    {project.sonar_project_key}
                  </TableCell>
                  <TableCell className="px-6 py-6">
                    <Badge className={`${getStatusColor(project.status)} px-3 py-1.5 rounded-full font-medium text-xs uppercase tracking-wide`}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-6 text-sm text-gray-600 dark:text-gray-400">
                    {project.last_scan ? formatDistanceToNow(new Date(project.last_scan), { addSuffix: true }) : 'Never scanned'}
                  </TableCell>
                  <TableCell className="px-6 py-6">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 w-24 relative overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            project.status === "SCANNING" ? 
                            "bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 animate-pulse" :
                            project.fix_percentage && project.fix_percentage > 70 ?
                            "bg-gradient-to-r from-green-400 to-emerald-500" :
                            project.fix_percentage && project.fix_percentage > 40 ?
                            "bg-gradient-to-r from-blue-400 to-cyan-500" :
                            "bg-gradient-to-r from-red-400 to-rose-500"
                          }`}
                          style={{ width: `${project.fix_percentage || (project.status === "SCANNING" ? 45 : 0)}%` }}
                        >
                          {project.status === "SCANNING" && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[3rem]">
                        {project.status === "SCANNING" ? "45%" : `${project.fix_percentage || 0}%`}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge className={getDeploymentColor(project.deployment_status)}>
                      {project.deployment_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(`/project/${project.id}`);
                        }}
                        data-testid={`button-view-project-${project.id}`}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle rescan
                        }}
                        data-testid={`button-rescan-project-${project.id}`}
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Rescan
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredProjects.length}</span> of{" "}
            <span className="font-medium">{projects.length}</span> results
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button size="sm">1</Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
