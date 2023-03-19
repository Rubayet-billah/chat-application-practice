import { useDispatch, useSelector } from "react-redux";
import { checkLoading } from "../features/auth/authSlice";

const useAuth = () => {
  const { accessToken, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  if (accessToken && user) {
    dispatch(checkLoading());
    return true;
  } else {
    dispatch(checkLoading());
    return false;
  }
};

export default useAuth;
