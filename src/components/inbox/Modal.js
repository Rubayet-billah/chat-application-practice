import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import apiSlice from "../../features/api/apiSlice";
import { useGetUserQuery } from "../../features/users/userApi";
import Error from "../ui/Error";

export default function Modal({ open, control }) {
  // local states
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const [fetch, setFetch] = useState(true);
  const [conversation, setConversation] = useState(null);
  // redux hooks
  const { data: existedUser } = useGetUserQuery(to, {
    skip: fetch,
  });
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // useEffect for listening respose for existedUser
  useEffect(() => {
    if (existedUser?.length > 0 && existedUser[0]?.email !== user.email) {
      // check existing conversation
      // manually dispatching actions in RTK Query
      dispatch(
        apiSlice.endpoints.getConversation.initiate({
          myEmail: user.email,
          partnerEmail: to,
        })
      )
        .unwrap()
        .then((data) => {
          setConversation(data);
        })
        .catch((err) => {
          toast.error("Error getting conversation");
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existedUser]);

  // handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    setFetch(false);
    if (to === user.email) {
      return toast.error("You can't send message yourself");
    }

    console.log({ to, message });
  };

  return (
    open && (
      <>
        <div
          onClick={control}
          className="fixed w-full h-full inset-0 z-10 bg-black/50 cursor-pointer"
        ></div>
        <div className="rounded w-[400px] lg:w-[600px] space-y-8 bg-white p-10 absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Send message
          </h2>
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="to" className="sr-only">
                  To
                </label>
                <input
                  onChange={(e) => setTo(e.target.value)}
                  id="to"
                  name="to"
                  type="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                  placeholder="Send to"
                />
              </div>
              <div>
                <label htmlFor="message" className="sr-only">
                  Message
                </label>
                <textarea
                  onChange={(e) => setMessage(e.target.value)}
                  id="message"
                  name="message"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                  placeholder="Message"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
              >
                Send Message
              </button>
            </div>

            {existedUser?.length === 0 && (
              <Error message="User does not exist" />
            )}
          </form>
        </div>
      </>
    )
  );
}
