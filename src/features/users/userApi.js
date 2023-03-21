import apiSlice from "../api/apiSlice";

const usersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUser: builder.query({
      query: (email) => ({
        url: `/users?email_like=${email}`,
      }),
    }),
  }),
});

export const { useGetUserQuery } = usersApi;
