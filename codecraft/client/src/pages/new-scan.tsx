import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  GitBranch, 
  Upload, 
  Search, 
  Play, 
  Pause, 
  FolderOpen,
  File,
  CheckSquare,
  Square,
  Shield
} from "lucide-react";

const scanFormSchema = z.object({
  project_name: z.string().min(1, "Project name is required"),
  input_type: z.enum(["GIT", "UPLOAD"]),
  repo_url: z.string().optional(),
  git_username: z.string().optional(),
  git_password: z.string().optional(),
  language: z.enum(["PHP", "Python"]),
  scan_type: z.enum(["SAST", "DAST"]),
  exclusions: z.string().optional(),
}).refine(
  (data) => {
    if (data.input_type === "GIT") {
      return data.repo_url && data.repo_url.length > 0;
    }
    return true; // File upload validation handled separately
  },
  {
    message: "Repository URL is required when using Git input",
    path: ["repo_url"],
  }
).refine(
  (data) => {
    if (data.input_type === "GIT" && data.repo_url) {
      return data.git_username && data.git_password;
    }
    return true;
  },
  {
    message: "Git credentials are required for repository access",
    path: ["git_username"],
  }
);

type ScanFormData = z.infer<typeof scanFormSchema>;

interface DirectoryNode {
  name: string;
  type: "file" | "directory";
  children?: DirectoryNode[];
  selected: boolean;
  path: string;
}

export default function NewScan() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [directories, setDirectories] = useState<DirectoryNode[]>([]);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState<string | null>(null);
  const [currentScanId, setCurrentScanId] = useState<number | null>(null);
  const [inputType, setInputType] = useState<"GIT" | "UPLOAD">("GIT");

  const form = useForm<ScanFormData>({
    resolver: zodResolver(scanFormSchema),
    defaultValues: {
      project_name: "",
      input_type: "GIT",
      repo_url: "",
      git_username: "",
      git_password: "",
      language: "PHP",
      scan_type: "SAST",
      exclusions: "",
    },
  });

  const prepareScanMutation = useMutation({
    mutationFn: async (data: { repo_url?: string; git_username?: string; git_password?: string; language: string; file?: File }) => {
      // Simulate API call to get directory structure
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock directory structure
      const mockDirectories: DirectoryNode[] = [
        {
          name: "src",
          type: "directory",
          path: "src/",
          selected: true,
          children: [
            { name: "api", type: "directory", path: "src/api/", selected: true },
            { name: "components", type: "directory", path: "src/components/", selected: true },
            { name: "utils", type: "directory", path: "src/utils/", selected: true },
          ]
        },
        {
          name: "tests",
          type: "directory",
          path: "tests/",
          selected: false,
          children: [
            { name: "unit", type: "directory", path: "tests/unit/", selected: false },
            { name: "integration", type: "directory", path: "tests/integration/", selected: false },
          ]
        },
        {
          name: "docs",
          type: "directory",
          path: "docs/",
          selected: false,
        },
        {
          name: "config",
          type: "directory",
          path: "config/",
          selected: true,
        },
        {
          name: "README.md",
          type: "file",
          path: "README.md",
          selected: true,
        }
      ];
      
      return { directories: mockDirectories };
    },
    onSuccess: (data) => {
      setDirectories(data.directories);
      toast({
        title: "Repository analyzed",
        description: "Directory structure loaded. Select directories to scan.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to analyze repository structure.",
        variant: "destructive",
      });
    },
  });

  const startScanMutation = useMutation({
    mutationFn: async (data: ScanFormData & { selected_directories: string[]; file?: File }) => {
      // Create project first
      const projectData = {
        name: data.project_name,
        input_type: data.repo_url ? "GIT" : "UPLOAD",
        sonar_project_key: data.project_name.toLowerCase().replace(/\s+/g, "_"),
        status: "SCANNING",
        deployment_status: "PENDING",
        description: `${data.language} project scanned with ${data.scan_type}`,
      };
      
      const project = await api.createProject(projectData);
      
      // Start the actual scan using the backend API
      const scanData = {
        scan_type: data.scan_type,
        selected_directories: data.selected_directories,
        exclusions: data.exclusions,
        repo_url: data.repo_url,
        git_username: data.git_username,
        git_password: data.git_password,
        language: data.language
      };
      
      // Start scan in background - don't wait for completion
      api.startScan(project.id, scanData);
      
      return {
        project_id: project.id,
      };
    },
    onSuccess: (data) => {
      toast({
        title: "✅ Project Added Successfully!",
        description: `Project "${form.getValues("project_name")}" has been added for security scanning. Scan initiated and running in background.`,
        duration: 4000,
      });
      
      // Redirect to dashboard immediately 
      setTimeout(() => {
        setLocation("/");
      }, 1500);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start security scan.",
        variant: "destructive",
      });
    },
  });

  const simulateScanProgress = (projectId: number) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        setScanStatus("FIX_GENERATION");
        clearInterval(interval);
        
        // Simulate fix generation
        setTimeout(() => {
          setScanStatus("FIX_READY");
          toast({
            title: "Scan completed successfully",
            description: "Security scan finished. Redirecting to dashboard...",
          });
          
          // Redirect to dashboard after completion
          setTimeout(() => {
            setLocation("/");
          }, 2000);
        }, 3000);
      }
      setScanProgress(progress);
    }, 1000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.zip') || file.name.endsWith('.tar')) {
        setUploadedFile(file);
        setInputType("UPLOAD");
        form.setValue("input_type", "UPLOAD");
        form.setValue("repo_url", "");
        form.setValue("git_username", "");
        form.setValue("git_password", "");
        
        // Simulate file analysis
        prepareScanMutation.mutate({ file, language: form.getValues("language") });
      } else {
        toast({
          title: "Invalid file",
          description: "Please upload a .zip or .tar file.",
          variant: "destructive",
        });
      }
    }
  };

  const handleInputTypeChange = (type: "GIT" | "UPLOAD") => {
    setInputType(type);
    form.setValue("input_type", type);
    
    if (type === "UPLOAD") {
      // Clear Git fields when switching to upload
      form.setValue("repo_url", "");
      form.setValue("git_username", "");
      form.setValue("git_password", "");
    } else {
      // Clear upload when switching to Git
      setUploadedFile(null);
    }
    
    // Clear directories when switching input types
    setDirectories([]);
  };

  const toggleDirectorySelection = (path: string) => {
    const updateSelection = (nodes: DirectoryNode[]): DirectoryNode[] => {
      return nodes.map(node => {
        if (node.path === path) {
          const newSelected = !node.selected;
          return {
            ...node,
            selected: newSelected,
            children: node.children?.map(child => ({ ...child, selected: newSelected }))
          };
        }
        if (node.children) {
          return {
            ...node,
            children: updateSelection(node.children)
          };
        }
        return node;
      });
    };
    
    setDirectories(updateSelection(directories));
  };

  const getSelectedDirectories = (): string[] => {
    const selected: string[] = [];
    const traverse = (nodes: DirectoryNode[]) => {
      nodes.forEach(node => {
        if (node.selected && node.type === "directory") {
          selected.push(node.path);
        }
        if (node.children) {
          traverse(node.children);
        }
      });
    };
    traverse(directories);
    return selected;
  };

  const renderDirectoryTree = (nodes: DirectoryNode[], level = 0) => {
    return nodes.map((node) => (
      <div key={node.path} className={`${level > 0 ? `ml-${level * 4}` : ""}`}>
        <div className="flex items-center space-x-2 py-1 hover:bg-gray-50 rounded px-2">
          <Checkbox
            checked={node.selected}
            onCheckedChange={() => toggleDirectorySelection(node.path)}
            data-testid={`checkbox-${node.path}`}
          />
          {node.type === "directory" ? (
            <FolderOpen className="w-4 h-4 text-blue-500" />
          ) : (
            <File className="w-4 h-4 text-gray-500" />
          )}
          <span className="text-sm text-gray-700">{node.name}</span>
        </div>
        {node.children && renderDirectoryTree(node.children, level + 1)}
      </div>
    ));
  };

  const onSubmit = (data: ScanFormData) => {
    // Validate input based on type
    if (data.input_type === "UPLOAD" && !uploadedFile) {
      toast({
        title: "File required",
        description: "Please upload a .zip or .tar file.",
        variant: "destructive",
      });
      return;
    }

    if (data.input_type === "GIT" && (!data.repo_url || !data.git_username || !data.git_password)) {
      toast({
        title: "Git credentials required",
        description: "Please provide repository URL and credentials.",
        variant: "destructive",
      });
      return;
    }

    const selectedDirectories = getSelectedDirectories();
    
    if (selectedDirectories.length === 0) {
      toast({
        title: "No directories selected",
        description: "Please select at least one directory to scan.",
        variant: "destructive",
      });
      return;
    }

    startScanMutation.mutate({
      ...data,
      selected_directories: selectedDirectories,
      file: uploadedFile || undefined,
    });
  };

  const getScanStatusColor = (status: string) => {
    switch (status) {
      case "SCANNING":
        return "bg-yellow-100 text-yellow-800";
      case "FIX_GENERATION":
        return "bg-blue-100 text-blue-800";
      case "FIX_READY":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 border-b border-gray-200/50 dark:border-gray-700/50 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
                data-testid="button-back"
                className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  New Security Scan
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
                  Configure and start a comprehensive security analysis for your project
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto space-y-8">

            {/* Main Configuration Form */}
            <Card className="shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0">
              <CardHeader className="pb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-t-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <Shield className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Scan Configuration</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Set up your security analysis parameters</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Project Details Section */}
                    <div className="space-y-6">
                      <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Project Details</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Provide basic information about your project</p>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="project_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium">Project Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter a descriptive project name" 
                                {...field} 
                                data-testid="input-project-name"
                                className="h-12 text-base border-2 focus:border-blue-500 transition-colors"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Source Configuration Section */}
                    <div className="space-y-6">
                      <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Source Code Configuration</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Choose how to provide your source code for analysis</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          control={form.control}
                          name="input_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium">Input Method</FormLabel>
                              <Select onValueChange={(value: "GIT" | "UPLOAD") => {
                                field.onChange(value);
                                handleInputTypeChange(value);
                              }} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-input-type" className="h-12 text-base border-2 focus:border-blue-500">
                                    <SelectValue placeholder="Choose input method" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="GIT">📂 Git Repository</SelectItem>
                                  <SelectItem value="UPLOAD">📤 File Upload</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="language"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium">Programming Language</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-language" className="h-12 text-base border-2 focus:border-blue-500">
                                    <SelectValue placeholder="Select language" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="PHP">🐘 PHP</SelectItem>
                                  <SelectItem value="Python">🐍 Python</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="scan_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium">Scan Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-scan-type" className="h-12 text-base border-2 focus:border-blue-500">
                                    <SelectValue placeholder="Select scan type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="SAST">🔍 SAST (Static Analysis)</SelectItem>
                                  <SelectItem value="DAST">⚡ DAST (Dynamic Analysis)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Git Repository Section */}
                    {inputType === "GIT" && (
                      <Card className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
                        <CardHeader className="pb-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                              <GitBranch className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Git Repository Configuration</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Connect to your Git repository for analysis</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <FormField
                            control={form.control}
                            name="repo_url"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Repository URL</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="https://github.com/user/repo.git" 
                                    {...field}
                                    data-testid="input-repo-url"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="git_username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Username</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Git username" 
                                      {...field} 
                                      data-testid="input-git-username"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="git_password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Password / Personal Access Token</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="password" 
                                      placeholder="Password or token" 
                                      {...field} 
                                      data-testid="input-git-password"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                              const formData = form.getValues();
                              prepareScanMutation.mutate({
                                repo_url: formData.repo_url,
                                git_username: formData.git_username,
                                git_password: formData.git_password,
                                language: formData.language,
                              });
                            }}
                            disabled={prepareScanMutation.isPending || !form.watch("repo_url") || !form.watch("git_username") || !form.watch("git_password")}
                            data-testid="button-analyze-repo"
                            className="w-full"
                          >
                            <Search className="w-4 h-4 mr-2" />
                            {prepareScanMutation.isPending ? "Analyzing Repository..." : "Analyze Repository Structure"}
                          </Button>
                        </CardContent>
                      </Card>
                    )}

                    {/* File Upload Section */}
                    {inputType === "UPLOAD" && (
                      <Card className="border-green-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-center space-x-2">
                            <Upload className="w-5 h-5 text-green-500" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">File Upload Configuration</h3>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                            <input
                              type="file"
                              accept=".zip,.tar"
                              onChange={handleFileUpload}
                              className="hidden"
                              id="file-upload"
                              data-testid="input-file-upload"
                            />
                            <label htmlFor="file-upload" className="cursor-pointer">
                              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Upload Source Code Archive
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                Click to upload or drag and drop your source code
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                Supported formats: ZIP, TAR
                              </p>
                            </label>
                            {uploadedFile && (
                              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                                  ✓ Uploaded: {uploadedFile.name}
                                </p>
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                  Size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Directory Selection */}
                    {directories.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Directory Selection
                        </h3>
                        <Card>
                          <CardContent className="p-4 max-h-64 overflow-y-auto">
                            {renderDirectoryTree(directories)}
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Exclusions */}
                    <FormField
                      control={form.control}
                      name="exclusions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Exclusions (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter file patterns to exclude (e.g., *.test.js, node_modules/*)"
                              {...field} 
                              data-testid="textarea-exclusions"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Submit Button */}
                    <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {directories.length > 0 && (
                            <span>✓ Ready to scan {getSelectedDirectories().length} selected directories</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setLocation("/")}
                            data-testid="button-cancel"
                            className="px-6 py-3 h-12"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={
                              startScanMutation.isPending || 
                              directories.length === 0 ||
                              (inputType === "GIT" && (!form.watch("repo_url") || !form.watch("git_username") || !form.watch("git_password"))) ||
                              (inputType === "UPLOAD" && !uploadedFile)
                            }
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                            data-testid="button-start-scan"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            {startScanMutation.isPending ? "Starting..." : "Start Scan"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}