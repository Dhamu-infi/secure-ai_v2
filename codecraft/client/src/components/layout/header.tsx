import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, FileDown } from "lucide-react";

export default function Header() {
  const [, setLocation] = useLocation();

  return (
    <header className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 border-b border-gray-200/50 dark:border-gray-700/50 px-8 py-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Projects Dashboard
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
            Monitor security scans and AI-powered fixes across all projects
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            onClick={() => setLocation("/new-scan")}
            data-testid="button-new-scan" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Scan
          </Button>
          <Button variant="outline" size="sm" data-testid="button-export" className="hover:bg-gray-50 dark:hover:bg-gray-700">
            <FileDown className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
