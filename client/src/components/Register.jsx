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
import { Loader2 } from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

import { useUser } from "../contexts/userContext";
import CenterContainer from "./custom/CenterContainer";
import { useState } from "react";

const Register = () => {
  const { isLoading, registerUser } = useUser();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setIsButtonDisabled(true);

    if (!name || !username || !password) return;

    const user = {
      name,
      username,
      password,
    };

    await toast.promise(
      registerUser(user),
      {
        loading: "Registering user...",
        success: (data) => {
          setIsButtonDisabled(false);
          return data;
        },
        error: (error) => {
          setIsButtonDisabled(false);
          console.log({ error });
          return error;
        },
      },
      {
        position: "top-right",
      }
    );

    setName("");
    setUsername("");
    setPassword("");

    navigate("/dashboard");
  }

  return (
    <CenterContainer>
      <Toaster />
      <Card className="w-[350px]">
        <CardHeader className="items-center">
          <CardTitle>Registration</CardTitle>
          <CardDescription>Create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Create username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create password"
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
              {!isLoading && "Register"}
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
          <Label className="mt-2">
            Already have an account?
            <Link to="/login" className="text-blue-500">
              {" "}
              Login
            </Link>
          </Label>
        </CardFooter>
      </Card>
    </CenterContainer>
  );
};

export default Register;
