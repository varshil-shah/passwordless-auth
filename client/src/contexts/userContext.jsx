import { createContext, useContext, useEffect, useReducer } from "react";
import Cookies from "js-cookie";
import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";

const HOST = import.meta.env.VITE_SERVER_URL;

const initialState = {
  isLoading: false,
  currentUser: null,
  error: null,
};

const userContext = createContext();

function reducer(state, action) {
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
          return response.json();
        })
        .then((data) => {
          if (data.status === "fail") {
            dispatch({ type: "LOADING", payload: false });
            reject(data.message);
          }

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
      dispatch({ type: "SUCCESS_AUTH", payload: data.user });
    } catch (error) {
      console.error(error);
    }
  }

  async function registerChallenge() {
    return new Promise((resolve, reject) => {
      try {
        const token = Cookies.get("token");
        fetch(`${HOST}/api/v1/challenges/register-challenge`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
          .then((response) => response.json())
          .then((data) => {
            startRegistration(data.options)
              .then((authResult) => {
                fetch(`${HOST}/api/v1/challenges/register-verification`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ credential: authResult }),
                })
                  .then((response) => response.json())
                  .then((data) => {
                    if (data.status === "fail") reject(data.message);
                    resolve("Challenge registered successfully!");
                  });
              })
              .catch((error) => {
                console.error(error);
                reject(error.message);
              });
          });
      } catch (error) {
        console.error(error);
        reject(error.message);
      }
    });
  }

  async function loginChallenge(username) {
    return new Promise((resolve, reject) => {
      try {
        dispatch({ type: "LOADING" });
        fetch(`${HOST}/api/v1/challenges/login-challenge`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username }),
        })
          .then((response) => response.json())
          .then((data) => {
            startAuthentication(data.options)
              .then((authResult) => {
                fetch(`${HOST}/api/v1/challenges/login-verification`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ username, credential: authResult }),
                })
                  .then((response) => response.json())
                  .then((data) => {
                    console.log({ data });
                    if (data.status === "fail") {
                      dispatch({ type: "LOADING", payload: false });
                      console.log({ msg: data.message });
                      reject(data.message);
                    }
                    dispatch({ type: "SUCCESS_AUTH", payload: data.user });
                    if (data.token) Cookies.set("token", data.token);
                    resolve("User logged in!");
                  });
              })
              .catch((error) => {
                console.error({ error });
                reject(error.message);
              });
          });
      } catch (error) {
        console.log({ error });
        reject(error.message);
      }
    });
  }

  return (
    <userContext.Provider
      value={{
        isLoading,
        error,
        currentUser,
        registerUser,
        loginUser,
        getUser,
        registerChallenge,
        loginChallenge,
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
