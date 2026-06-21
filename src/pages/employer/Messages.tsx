import MessagesPanel from "@/components/MessagesPanel";
import { useLocation } from "react-router-dom";

const EmployerMessages = () => {
  const location = useLocation();
  const startWithProfileId = (location.state as { startWithProfileId?: string } | null)?.startWithProfileId;

  return (
    <MessagesPanel
      emptyHint="No conversations yet. Message candidates from the pipeline."
      allowNewConversation
      initialProfileId={startWithProfileId}
    />
  );
};

export default EmployerMessages;
