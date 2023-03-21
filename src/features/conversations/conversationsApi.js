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
  }),
});

export const {
  useGetConversationsQuery,
  useGetConversationQuery,
  usePostConversationMutation,
  useUpdateConversationMutation,
} = conversationsApi;
