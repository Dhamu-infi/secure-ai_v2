import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Check } from "lucide-react";

interface DiffViewerModalProps {
  isOpen: boolean;
  originalCode?: string;
  fixedCode?: string;
  functionName?: string;
  onClose: () => void;
  onApplyFix?: () => void;
}

export default function DiffViewerModal({
  isOpen,
  originalCode,
  fixedCode,
  functionName,
  onClose,
  onApplyFix,
}: DiffViewerModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <DialogTitle className="text-lg font-medium">
            Code Diff Viewer {functionName && `- ${functionName}`}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            data-testid="button-close-diff"
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[75vh]">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900">Original Code</h4>
                <Badge variant="destructive">Vulnerable</Badge>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-auto">
                  <code>{originalCode || "No original code available"}</code>
                </pre>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900">Fixed Code</h4>
                <Badge className="bg-green-100 text-green-800">Secure</Badge>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-auto">
                  <code>{fixedCode || "No fixed code available"}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-end space-x-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            data-testid="button-cancel-diff"
          >
            Cancel
          </Button>
          {onApplyFix && (
            <Button
              onClick={onApplyFix}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-apply-fix"
            >
              <Check className="w-4 h-4 mr-2" />
              Apply Fix
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
