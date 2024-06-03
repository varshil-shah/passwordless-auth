import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LockClosedIcon } from "@radix-ui/react-icons";

import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

import CenterContainer from "./custom/CenterContainer";
import DashLine from "./custom/DashLine";

import { Loader2 } from "lucide-react";

import { useUser } from "../contexts/userContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const { isLoading, loginUser, loginChallenge } = useUser();
  const navigate = useNavigate();

  function handlePasskeyAuth(e) {
    e.preventDefault();

    if (!username) return;

    loginChallenge(username);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsButtonDisabled(true);

    if (!username || !password) return;

    const user = {
      username,
      password,
    };

    await toast.promise(
      loginUser(user),
      {
        loading: "Logging in...",
        success: (data) => {
          setIsButtonDisabled(false);
          return data;
        },
        error: (error) => {
          setIsButtonDisabled(false);
          return error;
        },
      },
      { position: "top-right" }
    );

    setUsername("");
    setPassword("");

    navigate("/dashboard");
  }

  return (
    <CenterContainer>
      <Toaster />
      <Card className="w-[350px]">
        <CardHeader className="items-center">
          <CardTitle>Login</CardTitle>
          <CardDescription>Login to access account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <Button
              disabled={isButtonDisabled}
              className="w-full mt-5"
              type="submit"
            >
              {!isLoading && "Login"}
              {isLoading && (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <DashLine />
          <Button className="w-full" onClick={handlePasskeyAuth}>
            <LockClosedIcon className="w-4 h-4 mr-2" />
            Login with passkeys
          </Button>

          <Label className="mt-4">
            Don&apos;t have an account?
            <Link to="/register" className="text-blue-500">
              {" "}
              Register
            </Link>
          </Label>
        </CardFooter>
      </Card>
    </CenterContainer>
  );
};

export default Login;
