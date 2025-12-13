import { useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import ChatSidebar from "../components/chat/ChatSidebar";

export default function ChatLayout() {
  const navigate = useNavigate();

  const handleNewChat = () => {
    navigate("/chat/new");
  };

  const handleSelectChat = (sessionId) => {
    navigate(`/chat/${sessionId}`);
  };

  return (
    <div className="flex h-full">

      <ChatSidebar
        username="Arya"
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
      />

      <div className="flex-1 overflow-hidden bg-gray-50">
        <Outlet />
      </div>

    </div>
  );
}
