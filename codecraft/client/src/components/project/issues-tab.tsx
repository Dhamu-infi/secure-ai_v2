import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { GitCompare, GitMerge, Download, Wrench } from "lucide-react";
import { Issue } from "@shared/schema";

interface IssuesTabProps {
  issues: Issue[];
  onViewDiff: (fixId: number) => void;
}

export default function IssuesTab({ issues, onViewDiff }: IssuesTabProps) {
  const [severityFilter, setSeverityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredIssues = issues.filter(issue => {
    const matchesSeverity = severityFilter === "all" || issue.severity === severityFilter;
    const matchesType = typeFilter === "all" || issue.vuln_type === typeFilter;
    return matchesSeverity && matchesType;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-100 text-red-800";
      case "HIGH":
        return "bg-orange-100 text-orange-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "LOW":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "FIXED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "IGNORED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-40" data-testid="select-severity-filter">
                <SelectValue placeholder="All Severities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40" data-testid="select-type-filter">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="SQL Injection">SQL Injection</SelectItem>
                <SelectItem value="XSS">XSS</SelectItem>
                <SelectItem value="CSRF">CSRF</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-bulk-fix">
              <Wrench className="w-4 h-4 mr-2" />
              Apply All Fixes
            </Button>
            <Button variant="outline" data-testid="button-download-report">
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>File</TableHead>
                <TableHead>Lines</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIssues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No issues found matching the current filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredIssues.map((issue) => (
                  <TableRow key={issue.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{issue.file_path}</div>
                        <div className="text-sm text-gray-500">Security vulnerability</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {issue.line_start}-{issue.line_end}
                    </TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(issue.severity)}>
                        {issue.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {issue.vuln_type}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <div className="text-sm text-gray-900">{issue.message}</div>
                        {issue.code_snippet && (
                          <code className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                            {issue.code_snippet}
                          </code>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(issue.status)}>
                        {issue.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewDiff(issue.id)}
                          data-testid={`button-diff-issue-${issue.id}`}
                        >
                          <GitCompare className="w-4 h-4 mr-1" />
                          Diff
                        </Button>
                        {issue.status !== "FIXED" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-800"
                            data-testid={`button-merge-issue-${issue.id}`}
                          >
                            <GitMerge className="w-4 h-4 mr-1" />
                            Merge Fix
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
