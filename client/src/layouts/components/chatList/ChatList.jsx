import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import "./chatList.css";
import { Link } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import debounce from "lodash/debounce";
// import Fuse from "fuse.js";
import { Input, Spin } from "antd";
const ChatList = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  // 防抖搜索
  const debouncedSearch = useCallback(
    debounce((term) => setSearchTerm(term), 500),
    []
  );

  // 无限滚动查询
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["userChats", searchTerm],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/userchats?page=${pageParam}&limit=20&search=${searchTerm}`,
        { credentials: "include" }
      );
      const result = await res.json();
      
      // 处理后端返回的嵌套数据结构
      if (result.chats && result.chats.length > 0) {
        return {
          ...result,
          chats: result.chats[0].chats || []
        };
      }
      
      return {
        ...result,
        chats: []
      };
    },
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    keepPreviousData: true,
  });
  // const { isPending, error, data } = useQuery({
  //   queryKey: ["userChats"],
  //   queryFn: () =>
  //     fetch(`${import.meta.env.VITE_API_URL}/api/userchats`, {
  //       credentials: "include",
  //     }).then((res) => res.json()),
  // });
  // 初始化Fuse搜索（用于前端搜索）
  // const fuse = new Fuse(data?.pages.flatMap((page) => page.chats) || [], {
  //   keys: ["title", "history.parts.text"],
  //   threshold: 0.3,
  // });
  // 获取所有聊天数据
  // 使用 useMemo 优化 allChats 计算，避免每次渲染都创建新数组
  const allChats = useMemo(() => {
    return data?.pages.flatMap((page) => page.chats) || [];
  }, [data]); // 只有当 data 改变时才重新计算
  // 处理搜索 - 使用 useMemo 替代 useEffect
  const displayChats = useMemo(() => {
    if (searchTerm) {
      return allChats.filter((chat) =>
        chat.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return allChats;
  }, [searchTerm, allChats]); // 正确的依赖项

  // 无限滚动处理
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);
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
      <Link to="/">Explore Askly AI</Link>
      <Link to="/">Contact</Link>
      <hr />

      {/* 搜索框 */}
      <div className="search-container">
        <Input
          placeholder="搜索会话历史..."
          onChange={(e) => debouncedSearch(e.target.value)}
          allowClear
          style={{ marginBottom: "16px" }}
        />
      </div>
      <span className="title">RECENT LIST</span>
      <div className="list">
        {status === "loading" ? (
          <div className="loading">Loading...</div>
        ) : status === "error" ? (
          <div className="error">Something went wrong</div>
        ) : (
          <>
            {displayChats.map((item) => (
              <div key={item._id} className="chatItem">
                <Link to={`/dashboard/chat/${item._id}`}>
                  {searchTerm ? (
                    // 高亮搜索关键词
                    <HighlightText text={item.title} highlight={searchTerm} />
                  ) : (
                    item.title
                  )}
                </Link>
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
            ))}

            {/* 无限滚动加载指示器 */}
            {isFetchingNextPage && (
              <div className="loading-more">
                <Spin />
              </div>
            )}

            {!hasNextPage && allChats.length > 0 && (
              <div className="no-more">没有更多会话了</div>
            )}
          </>
        )}
        {/* {isPending
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
            })} */}
      </div>
      <hr />
      <div className="upgrade">
        <img src="/logo.png" alt="" />
        <div className="texts">
          <span>Upgrade to Askly AI Pro</span>
          <span>Get unlimited access to all features</span>
        </div>
      </div>
    </div>
  );
};

// 高亮关键词组件
const HighlightText = ({ text, highlight }) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }

  const regex = new RegExp(`(${highlight})`, "gi");
  const parts = text.split(regex);

  return (
    <span>
      {parts
        .filter((part) => part)
        .map((part, index) =>
          regex.test(part) ? (
            <mark key={index} style={{ backgroundColor: "#ffeaa7" }}>
              {part}
            </mark>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
    </span>
  );
};
export default ChatList;
