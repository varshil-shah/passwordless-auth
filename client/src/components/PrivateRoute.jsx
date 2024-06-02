import { Navigate } from "react-router-dom";

import { isAuthenticated } from "../utils/isAuth";

// eslint-disable-next-line react/prop-types
const PrivateRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
