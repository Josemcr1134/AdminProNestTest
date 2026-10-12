import  { Typography } from "@mui/material";
import { useAuth } from "../auth/AuthContext";

export function DashboardPage() {
  const { user } = useAuth();
  return <Typography variant="h4">Hola, {user?.name}</Typography>;
}
