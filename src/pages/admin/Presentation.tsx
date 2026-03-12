import { useNavigate } from "react-router-dom";
import PresentationViewer from "@/components/presentation/PresentationViewer";

export default function Presentation() {
  const navigate = useNavigate();

  return (
    <PresentationViewer
      onExit={() => navigate("/admin")}
    />
  );
}
