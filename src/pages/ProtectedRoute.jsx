import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  return isAuthenticated ? children : null;
}
