import apiSlice from "../api/apiSlice";

const usersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUser: builder.query({
      query: (id) => ({
        url: `/users?conversationId=${id}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_users_per_page}`,
      }),
    }),
  }),
});

export const { useGetUserQuery } = usersApi;
