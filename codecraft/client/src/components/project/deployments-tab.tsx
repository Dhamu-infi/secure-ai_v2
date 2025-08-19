import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rocket, Play } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Deployment } from "@shared/schema";

interface DeploymentsTabProps {
  deployments: Deployment[];
}

export default function DeploymentsTab({ deployments }: DeploymentsTabProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "DEPLOYED":
        return "bg-green-100 text-green-800";
      case "DEPLOYING":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEnvironmentColor = (environment: string) => {
    switch (environment) {
      case "PRODUCTION":
        return "bg-red-100 text-red-800";
      case "STAGING":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Deployments</h3>
          <div className="flex items-center space-x-2">
            <Button variant="outline" data-testid="button-deploy-staging">
              <Play className="w-4 h-4 mr-2" />
              Deploy to Staging
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-deploy-production">
              <Rocket className="w-4 h-4 mr-2" />
              Deploy to Production
            </Button>
          </div>
        </div>

        {deployments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Rocket className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No deployments yet</p>
            <p className="text-sm">Deploy your project to staging or production</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Environment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deployed At</TableHead>
                  <TableHead>Scan ID</TableHead>
                  <TableHead>Fix ID</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deployments.map((deployment) => (
                  <TableRow key={deployment.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Badge className={getEnvironmentColor(deployment.environment)}>
                        {deployment.environment}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(deployment.status)}>
                        {deployment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {deployment.deployed_at ? 
                        formatDistanceToNow(new Date(deployment.deployed_at), { addSuffix: true }) : 
                        'Not deployed'
                      }
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {deployment.scan_id ? `#${deployment.scan_id}` : '-'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {deployment.fix_id ? `#${deployment.fix_id}` : '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        data-testid={`button-redeploy-${deployment.id}`}
                      >
                        <Rocket className="w-4 h-4 mr-1" />
                        Redeploy
                      </Button>
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
