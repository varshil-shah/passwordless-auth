import { LockClosedIcon } from "@radix-ui/react-icons";
import CenterContainer from "./custom/CenterContainer";
import { Button } from "@/components/ui/button";
import { Card, CardDescription } from "./ui/card";
import { useUser } from "../contexts/userContext";

const Dashboard = () => {
  const { currentUser } = useUser();
  console.log({ currentUser });

  return (
    <div>
      <CenterContainer>
        <Card className="p-4 flex justify-center">
          <div className="grid gap-2">
            <CardDescription>
              Welcome, <strong>{currentUser?.name}</strong>
            </CardDescription>
            <Button>
              <LockClosedIcon className="w-4 h-4 mr-2" />
              Create PassKeys
            </Button>
          </div>
        </Card>
      </CenterContainer>
    </div>
  );
};

export default Dashboard;
