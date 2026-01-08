import * as React from "react"
import { ChevronRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  [key: string]: any;
}

interface TreeProps {
  data: TreeNode[];
  defaultExpanded?: string[];
  renderNode?: (node: TreeNode, level: number) => React.ReactNode;
  className?: string;
}

const TreeItem = React.forwardRef<
  HTMLDivElement,
  {
    node: TreeNode;
    level: number;
    defaultExpanded?: string[];
    renderNode?: (node: TreeNode, level: number) => React.ReactNode;
  }
>(({ node, level, defaultExpanded = [], renderNode }, ref) => {
  const [isOpen, setIsOpen] = React.useState(defaultExpanded.includes(node.id));
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div ref={ref} className="select-none">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center gap-2 py-1">
          {hasChildren ? (
            <CollapsibleTrigger className="flex items-center justify-center w-4 h-4 rounded-sm hover:bg-accent">
              {isOpen ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </CollapsibleTrigger>
          ) : (
            <div className="w-4" />
          )}
          
          {renderNode ? renderNode(node, level) : (
            <span className="text-sm">{node.label}</span>
          )}
        </div>
        
        {hasChildren && (
          <CollapsibleContent>
            <div className="ml-4 border-l pl-4 space-y-0">
              {node.children!.map((child) => (
                <TreeItem
                  key={child.id}
                  node={child}
                  level={level + 1}
                  defaultExpanded={defaultExpanded}
                  renderNode={renderNode}
                />
              ))}
            </div>
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  );
});

TreeItem.displayName = "TreeItem";

export function Tree({ data, defaultExpanded = [], renderNode, className }: TreeProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {data.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          level={0}
          defaultExpanded={defaultExpanded}
          renderNode={renderNode}
        />
      ))}
    </div>
  );
}

