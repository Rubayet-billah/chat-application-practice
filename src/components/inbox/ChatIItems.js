import { useSelector } from "react-redux";
import { useGetConversationsQuery } from "../../features/conversations/conversationsApi";
import Error from "../ui/Error";
import ChatItem from "./ChatItem";
import moment from "moment/moment";
import getPartnerInfo from "../../utils/getPartnerInfo";
import gravatar from "gravatar";

export default function ChatItems() {
  const { user } = useSelector((state) => state.auth);
  const userEmail = user?.email;
  const {
    data: conversations,
    isLoading,
    isError,
    error,
  } = useGetConversationsQuery(userEmail);

  let content;
  if (isLoading) {
    content = <div>Loading...</div>;
  }
  if (!isLoading && isError) {
    content = <Error message={error.data} />;
  }
  if (!isLoading && !isError && conversations?.length === 0) {
    content = <div>No messages yet</div>;
  }
  if (!isLoading && !isError && conversations?.length > 0) {
    content = conversations.map((conversation) => {
      const { users, id, message, timestamp } = conversation;
      const { name, email: partnerEmail } = getPartnerInfo(users, userEmail);
      return (
        <li key={id}>
          <ChatItem
            id={id}
            avatar={gravatar.url(partnerEmail)}
            name={name}
            lastMessage={message}
            lastTime={moment(timestamp).fromNow()}
          />
        </li>
      );
    });
  }

  return <ul>{content}</ul>;
}
