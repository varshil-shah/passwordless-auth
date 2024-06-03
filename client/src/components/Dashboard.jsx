import { LockClosedIcon } from "@radix-ui/react-icons";
import CenterContainer from "./custom/CenterContainer";
import { Button } from "@/components/ui/button";
import { Card, CardDescription } from "./ui/card";
import { useUser } from "../contexts/userContext";

import toast, { Toaster } from "react-hot-toast";

const Dashboard = () => {
  const { currentUser, registerChallenge } = useUser();
  console.log({ currentUser });

  function handleCreateKeys(e) {
    e.preventDefault();

    toast.promise(
      registerChallenge(),
      {
        loading: "Creating PassKeys...",
        success: (data) => {
          return data;
        },
        error: (error) => {
          return error.message;
        },
      },
      { position: "top-right" }
    );
  }

  return (
    <div>
      <CenterContainer>
        <Card className="p-4 flex justify-center">
          <div className="grid gap-2">
            <CardDescription>
              Welcome, <strong>{currentUser?.name}</strong>
            </CardDescription>
            <Button onClick={handleCreateKeys}>
              <LockClosedIcon className="w-4 h-4 mr-2" />
              Create PassKeys
            </Button>
          </div>
        </Card>
        <Toaster />
      </CenterContainer>
    </div>
  );
};

export default Dashboard;
