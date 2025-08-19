import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Plus, 
  Clock, 
  Settings, 
  Shield, 
  User 
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "New Scan", href: "/new-scan", icon: Plus },
  { name: "History", href: "/history", icon: Clock },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location, setLocation] = useLocation();

  return (
    <div className="w-72 bg-white/95 backdrop-blur-sm border-r border-gray-200/50 dark:bg-gray-800/95 dark:border-gray-700/50 flex flex-col shadow-lg">
      <div className="p-8 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Secure AI</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Security Scanner</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-6">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <li key={item.name}>
                <button
                  onClick={() => setLocation(item.href)}
                  data-testid={`link-${item.name.toLowerCase().replace(" ", "-")}`}
                  className={cn(
                    "w-full text-left group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 hover:scale-102"
                  )}
                >
                  <item.icon 
                    className={cn(
                      "mr-3 w-5 h-5 transition-colors",
                      isActive ? "text-white" : "text-gray-400 group-hover:text-blue-500"
                    )} 
                  />
                  {item.name}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-900">Ajith Kumar</p>
            <p className="text-gray-600">Security Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
}
