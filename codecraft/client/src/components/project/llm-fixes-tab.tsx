import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GitCompare, GitMerge, Bot } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { LlmFix } from "@shared/schema";

interface LlmFixesTabProps {
  llmFixes: LlmFix[];
  onViewDiff: (fixId: number) => void;
}

export default function LlmFixesTab({ llmFixes, onViewDiff }: LlmFixesTabProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "FIX_READY":
        return "bg-green-100 text-green-800";
      case "APPLIED":
        return "bg-blue-100 text-blue-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        {llmFixes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No AI fixes generated yet</p>
            <p className="text-sm">Run auto-fix to generate AI-powered security fixes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {llmFixes.map((fix) => (
              <Card key={fix.id} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{fix.function_name}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {fix.created_at && formatDistanceToNow(new Date(fix.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(fix.status)}>
                        {fix.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDiff(fix.id)}
                        data-testid={`button-diff-fix-${fix.id}`}
                      >
                        <GitCompare className="w-4 h-4 mr-1" />
                        Diff
                      </Button>
                      {fix.status === "FIX_READY" && (
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                          data-testid={`button-merge-fix-${fix.id}`}
                        >
                          <GitMerge className="w-4 h-4 mr-1" />
                          Merge Fix
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700">{fix.llm_response}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
