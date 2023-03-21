import apiSlice from "../api/apiSlice";

const messagesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMessages: builder.query({
      query: (id) => ({
        url: `/messages?conversationId=${id}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_messages_per_page}`,
      }),
    }),
  }),
});

export const { useGetMessagesQuery } = messagesApi;
