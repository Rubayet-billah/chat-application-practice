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
      query: (data) => ({
        url: "/conversations",
        method: "POST",
        body: data,
      }),
    }),
    updateConversation: builder.mutation({
      query: ({ id, data }) => ({
        url: `/conversations/${id}`,
        method: "PATCH",
        body: data,
      }),
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetConversationQuery,
  usePostConversationMutation,
  useUpdateConversationMutation,
} = conversationsApi;
