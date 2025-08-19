import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { GitCommit } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { GitCommit as GitCommitType } from "@shared/schema";

interface GitCommitsTabProps {
  gitCommits: GitCommitType[];
}

export default function GitCommitsTab({ gitCommits }: GitCommitsTabProps) {
  return (
    <Card>
      <CardContent className="p-6">
        {gitCommits.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <GitCommit className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No git commits recorded yet</p>
            <p className="text-sm">Commits will appear here after fixes are applied</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Commit Hash</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gitCommits.map((commit) => (
                  <TableRow key={commit.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {commit.commit_hash}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">
                      {commit.author}
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">
                      {commit.message}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDistanceToNow(new Date(commit.committed_at), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
