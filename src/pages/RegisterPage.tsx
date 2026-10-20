import { useNavigate } from "react-router";
import AuthForm, { AuthFormValues } from "../components/AuthForm";
import { login, register } from "../api/UserService";
import { useAuth } from "../AuthProvider";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  async function handleRegister(values: AuthFormValues) {
    await register(values);
    await login(values);

    await refreshUser();
    navigate("/");
  }

  return (
    <AuthForm
      title="Registrera"
      loadingLabel="Skapar konto..."
      submitButtonLabel="Registrera"
      onSubmit={handleRegister}
      hasUsernameField={true}
    />
  );
}
