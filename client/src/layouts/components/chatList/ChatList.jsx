import { useQuery, useQueryClient } from "@tanstack/react-query";
import "./chatList.css";
import { Link } from "react-router-dom";
const ChatList = () => {
  const queryClient = useQueryClient();
  const { isPending, error, data } = useQuery({
    queryKey: ["userChats"],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_API_URL}/api/userchats`, {
        credentials: "include",
      }).then((res) => res.json()),
  });

  const deleteChat = async (chatId) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/chat/${chatId}`, {
        method: "DELETE",
        credentials: "include",
      });
      // 重新获取聊天列表数据
      queryClient.invalidateQueries(["userChats"]);
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };
  return (
    <div className="chatList">
      <span className="title">DASHBOARD</span>
      <Link to="/dashboard">Create a new Chat</Link>
      <Link to="/">Explore Lama AI</Link>
      <Link to="/">Contact</Link>
      <hr />
      <span className="title">RECENT LIST</span>
      <div className="list">
        {isPending
          ? "loading..."
          : error
          ? "Something went wrong"
          : data?.map((item) => {
              return (
                <div key={item._id} className="chatItem">
                  <Link to={`/dashboard/chat/${item._id}`}>{item.title}</Link>
                  <button
                    className="deleteButton"
                    onClick={(e) => {
                      e.preventDefault();
                      deleteChat(item._id);
                    }}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
      </div>
      <hr />
      <div className="upgrade">
        <img src="/logo.png" alt="" />
        <div className="texts">
          <span>Upgrade to lama AI Pro</span>
          <span>Get unlimited access to all features</span>
        </div>
      </div>
    </div>
  );
};
export default ChatList;
