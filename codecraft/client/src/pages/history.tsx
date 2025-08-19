import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Sidebar from "@/components/layout/sidebar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Clock, GitCommit, Wrench, Scan, Rocket } from "lucide-react";

export default function History() {
  const { data: history = [], isLoading } = useQuery({
    queryKey: ["/api/history"],
    queryFn: api.getAllHistory,
  });

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "SCAN":
        return <Scan className="w-4 h-4" />;
      case "FIX":
        return <Wrench className="w-4 h-4" />;
      case "MERGE":
        return <GitCommit className="w-4 h-4" />;
      case "DEPLOY":
        return <Rocket className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case "SCAN":
        return "bg-blue-100 text-blue-800";
      case "FIX":
        return "bg-green-100 text-green-800";
      case "MERGE":
        return "bg-purple-100 text-purple-800";
      case "DEPLOY":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div>Loading history...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">History</h1>
            <p className="text-sm text-gray-600 mt-1">Project activity timeline and audit trail</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No activity recorded yet
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${getActionColor(record.action_type)}`}>
                          {getActionIcon(record.action_type)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Project {record.project_id} - {record.action_type}
                          </p>
                          <p className="text-sm text-gray-600">
                            {record.created_at && formatDistanceToNow(new Date(record.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <Badge variant={record.status === "COMPLETED" ? "default" : "secondary"}>
                        {record.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
