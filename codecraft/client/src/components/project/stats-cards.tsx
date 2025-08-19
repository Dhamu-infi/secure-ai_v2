import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Wrench, TrendingUp } from "lucide-react";
import { Project } from "@shared/schema";

interface StatsCardsProps {
  projects: Project[];
}

export default function StatsCards({ projects }: StatsCardsProps) {
  const totalProjects = projects.length;
  const criticalIssues = 47; // This would be calculated from issues data
  const fixesApplied = 156; // This would be calculated from fixes data
  const avgFixRate = totalProjects > 0 
    ? Math.round(projects.reduce((acc, p) => acc + (p.fix_percentage || 0), 0) / totalProjects)
    : 0;

  const stats = [
    {
      name: "Total Projects",
      value: totalProjects,
      icon: CheckCircle,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      name: "Critical Issues",
      value: criticalIssues,
      icon: AlertTriangle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
    {
      name: "AI Fixes Applied",
      value: fixesApplied,
      icon: Wrench,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      name: "Avg Fix Rate",
      value: `${avgFixRate}%`,
      icon: TrendingUp,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {stats.map((stat, index) => (
        <Card key={stat.name} className="shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
          <CardContent className="p-0">
            <div className={`p-6 bg-gradient-to-br ${
              index === 0 ? 'from-blue-500 to-cyan-600' :
              index === 1 ? 'from-red-500 to-pink-600' :
              index === 2 ? 'from-green-500 to-emerald-600' :
              'from-purple-500 to-violet-600'
            } text-white relative overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative">
                <p className="text-sm font-medium text-white/80 uppercase tracking-wide">{stat.name}</p>
                <p className="text-3xl font-bold text-white mt-1" data-testid={`text-${stat.name.toLowerCase().replace(" ", "-")}`}>
                  {stat.value}
                </p>
              </div>
              <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/5 rounded-full"></div>
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-white/5 rounded-full"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
