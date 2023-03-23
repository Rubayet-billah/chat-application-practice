import io from "socket.io-client";
import apiSlice from "../api/apiSlice";

const conversationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query({
      query: (email) => ({
        url: `/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_conversation_per_page}`,
      }),
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        // create socket
        const socket = io("http://localhost:9000", {
          reconnectionDelay: 1000,
          reconnection: true,
          reconnectionAttemps: 10,
          transports: ["websocket"],
          agent: false,
          upgrade: false,
          rejectUnauthorized: false,
        });

        try {
          await cacheDataLoaded;
          socket.on("conversation", (data) => {
            updateCachedData((draft) => {
              const newDraft = JSON.parse(JSON.stringify(draft));
              const conversation = newDraft?.find((c) => {
                console.log(c.id == data?.data?.id);
                return c.id == data?.data?.id;
              });
              console.log("Inside updateCacheData", conversation?.id);
              if (conversation?.id) {
                conversation.message = data?.data?.message;
                conversation.timestamp = data?.data?.timestamp;
              } else {
                // do nothing
              }
            });
          });
        } catch (error) {}
        await cacheEntryRemoved;
        socket.close();
      },
    }),
    getConversation: builder.query({
      query: ({ myEmail, partnerEmail }) => ({
        url: `/conversations?participants_like=${myEmail}-${partnerEmail}&&participants_like=${partnerEmail}-${myEmail}`,
      }),
    }),
    postConversation: builder.mutation({
      query: ({ sender, data }) => ({
        url: "/conversations",
        method: "POST",
        body: data,
      }),
      async onQueryStarted({ sender, data }, { queryFulfilled, dispatch }) {
        const conversation = await queryFulfilled;

        const senderUser = data?.users.find((user) => user.email === sender);
        const receiverUser = data?.users.find((user) => user.email !== sender);
        if (conversation?.data) {
          // silent message entry
          dispatch(
            apiSlice.endpoints.postMessages.initiate({
              conversationId: conversation?.data.id,
              sender: senderUser,
              receiver: receiverUser,
              message: data?.message,
              timestamp: data?.timestamp,
            })
          );
        }
      },
    }),
    updateConversation: builder.mutation({
      query: ({ sender, id, data }) => ({
        url: `/conversations/${id}`,
        method: "PATCH",
        body: data,
      }),
      async onQueryStarted({ id, sender, data }, { queryFulfilled, dispatch }) {
        // optimistic cache update start
        const patchResult1 = dispatch(
          apiSlice.util.updateQueryData("getConversations", sender, (draft) => {
            const draftConversation = draft.find((c) => c.id == id);
            draftConversation.message = data.message;
            draftConversation.timestamp = data.timestamp;
          })
        );
        // optimistic cache update end

        try {
          const conversation = await queryFulfilled;

          const senderUser = data?.users.find((user) => user.email === sender);
          const receiverUser = data?.users.find(
            (user) => user.email !== sender
          );
          if (conversation?.data) {
            // silent message entry
            const res = await dispatch(
              apiSlice.endpoints.postMessages.initiate({
                conversationId: conversation?.data.id,
                sender: senderUser,
                receiver: receiverUser,
                message: data?.message,
                timestamp: data?.timestamp,
              })
            ).unwrap();

            // update messages cache pessimistically
            dispatch(
              apiSlice.util.updateQueryData(
                "getMessages",
                res.conversationId.toString(),
                (draft) => {
                  draft.push(res);
                }
              )
            );
          }
        } catch (error) {
          patchResult1.undo();
        }
      },
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetConversationQuery,
  usePostConversationMutation,
  useUpdateConversationMutation,
} = conversationsApi;
