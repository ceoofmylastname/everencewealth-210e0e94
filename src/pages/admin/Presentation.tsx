import { useNavigate, useLocation } from "react-router-dom";
import PresentationViewer from "@/components/presentation/PresentationViewer";

export default function Presentation() {
  const navigate = useNavigate();
  const location = useLocation();

  const exitPath = location.pathname.includes("/portal/advisor")
    ? "/portal/advisor/dashboard"
    : location.pathname.includes("/portal/admin")
      ? "/portal/admin/agents"
      : "/admin";

  return (
    <PresentationViewer
      onExit={() => navigate(exitPath)}
    />
  );
}
