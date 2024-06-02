import { createContext, useContext, useEffect, useReducer } from "react";
import Cookies from "js-cookie";

const HOST = "http://localhost:3000";

const initialState = {
  isLoading: false,
  currentUser: null,
  error: null,
};

const userContext = createContext();

function reducer(state, action) {
  console.log(action.payload);
  switch (action.type) {
    case "LOADING":
      return {
        ...state,
        isLoading: action.payload || true,
        error: null,
      };

    case "SUCCESS_AUTH":
      return {
        ...state,
        isLoading: false,
        currentUser: action.payload,
      };
  }
}

// eslint-disable-next-line react/prop-types
const UserProvider = ({ children }) => {
  const [{ isLoading, currentUser, error }, dispatch] = useReducer(
    reducer,
    initialState
  );

  useEffect(() => {
    const token = Cookies.get("token");
    console.log("Token", token);
    if (token) {
      getUser(token);
    }
  }, []);

  async function registerUser(user) {
    return new Promise((resolve, reject) => {
      fetch(`${HOST}/api/v1/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      })
        .then((response) => {
          console.log({ response });
          if (!response.ok) {
            reject("Error registering user!");
          }
          return response.json();
        })
        .then((data) => {
          dispatch({ type: "SUCCESS_AUTH", payload: data.user });
          Cookies.set("token", data.token);
          resolve("User successfully registered!");
        })
        .catch((error) => {
          console.error({ error });
          reject("Error registering user!");
        });
    });
  }

  function loginUser(user) {
    return new Promise((resolve, reject) => {
      try {
        dispatch({ type: "LOADING" });
        fetch(`${HOST}/api/v1/users/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.status === "fail") {
              dispatch({ type: "LOADING", payload: false });
              reject(data.message);
            }

            console.log("After reject!");
            dispatch({ type: "SUCCESS_AUTH", payload: data.user });
            if (data.token) Cookies.set("token", data.token);
            resolve("User logged in successfully!");
          })
          .catch((error) => {
            reject(error);
          });
      } catch (error) {
        console.error(error);
        reject(error);
      } finally {
        dispatch({ type: "LOADING", payload: false });
      }
    });
  }

  async function getUser() {
    try {
      dispatch({ type: "LOADING" });
      const token = Cookies.get("token");
      const response = await fetch(`${HOST}/api/v1/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log(data);
      dispatch({ type: "SUCCESS_AUTH", payload: data.user });
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <userContext.Provider
      value={{
        isLoading,
        error,
        currentUser,
        registerUser,
        getUser,
        loginUser,
      }}
    >
      {children}
    </userContext.Provider>
  );
};

function useUser() {
  const context = useContext(userContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

// eslint-disable-next-line react-refresh/only-export-components
export { UserProvider, useUser };
