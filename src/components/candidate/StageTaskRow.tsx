import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompleteTask } from "@/hooks/useData";
import {
  getTaskActionLabel,
  getTaskActionLink,
  getTaskActionHint,
  isTaskManuallyCompletable,
  isTaskRequirementMet,
} from "@/lib/profileCompleteness";

type Props = {
  taskId: string;
  title: string;
  description?: string | null;
  done: boolean;
  contentUrl?: string | null;
  taskType?: "task" | "course";
  continueTo?: string;
};

export default function StageTaskRow({ taskId, title, description, done, contentUrl, taskType, continueTo }: Props) {
  const { profile, candidate } = useAuth();
  const completeTask = useCompleteTask();
  const requirementMet = isTaskRequirementMet(title, profile, candidate);
  const manualOnly = isTaskManuallyCompletable(title);
  const actionLabel = getTaskActionLabel(title, done);
  const actionLink = getTaskActionLink(title);

  return (
    <div
      className={`flex items-center justify-between gap-3 p-3 rounded border ${
        done ? "bg-success/5 border-success/20" : "bg-card border-border"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {done ? (
          <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
        ) : (
          <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
        <div className="min-w-0">
          <span className={`text-sm block ${done ? "text-muted-foreground line-through" : ""}`}>{title}</span>
          {description && !continueTo && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          {!done && !requirementMet && manualOnly && !continueTo && (
            <p className="text-xs text-muted-foreground mt-1">
              {getTaskActionHint(title)}
            </p>
          )}
        </div>
      </div>
      {!done && (
        <div className="flex items-center gap-2 shrink-0">
          {continueTo ? (
            <Button size="sm" asChild>
              <Link to={continueTo}>Continue</Link>
            </Button>
          ) : (
            <>
              {contentUrl && taskType === "course" && (
                <Button size="sm" variant="default" asChild>
                  <a href={contentUrl} target="_blank" rel="noopener noreferrer">
                    Open course
                  </a>
                </Button>
              )}
              {manualOnly ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={completeTask.isPending}
                  onClick={() => completeTask.mutate(taskId)}
                >
                  Complete
                </Button>
              ) : requirementMet ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={completeTask.isPending}
                  onClick={() => completeTask.mutate(taskId)}
                >
                  Mark done
                </Button>
              ) : (
                <Button size="sm" variant="default" asChild>
                  <Link to={actionLink}>{actionLabel}</Link>
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
