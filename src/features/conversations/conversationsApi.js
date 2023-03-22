import apiSlice from "../api/apiSlice";

const conversationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query({
      query: (email) => ({
        url: `/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_conversation_per_page}`,
      }),
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
            console.log("hello", draft);
            draftConversation.message = data.message;
            draftConversation.timestamp = data.timestamp;
          })
        );
        console.log(patchResult1);
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
