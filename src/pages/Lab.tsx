import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { ChemistryLab } from "@/components/ChemistryLab";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const Lab = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="relative w-full h-screen">
      <ChemistryLab />
      
      {/* Logout button */}
      <div className="absolute top-4 right-4 z-50">
        <Button
          onClick={signOut}
          variant="outline"
          className="glass-panel holographic-border text-foreground hover:glow-cyan"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Lab;
