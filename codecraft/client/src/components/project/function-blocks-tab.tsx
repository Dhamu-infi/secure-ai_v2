import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code, Eye } from "lucide-react";
import { FunctionBlock } from "@shared/schema";

interface FunctionBlocksTabProps {
  functionBlocks: FunctionBlock[];
}

export default function FunctionBlocksTab({ functionBlocks }: FunctionBlocksTabProps) {
  const getBlockTypeColor = (blockType: string) => {
    switch (blockType) {
      case "function":
        return "bg-blue-100 text-blue-800";
      case "class":
        return "bg-green-100 text-green-800";
      case "method":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        {functionBlocks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Code className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No function blocks detected yet</p>
            <p className="text-sm">Run a scan to analyze code structure</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>File</TableHead>
                  <TableHead>Function Name</TableHead>
                  <TableHead>Lines</TableHead>
                  <TableHead>Block Type</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {functionBlocks.map((block) => (
                  <TableRow key={block.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="text-sm font-medium text-gray-900">{block.file_path}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-gray-900">{block.function_name}</div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {block.line_start}-{block.line_end}
                    </TableCell>
                    <TableCell>
                      <Badge className={getBlockTypeColor(block.block_type)}>
                        {block.block_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          data-testid={`button-view-block-${block.id}`}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Code
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          data-testid={`button-view-issues-${block.id}`}
                        >
                          Related Issues
                        </Button>
                      </div>
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
