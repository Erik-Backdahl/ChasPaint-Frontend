import { useNavigate } from "react-router";
import AuthForm from "../components/AuthForm";
import { login, register } from "../api/UserService";

export default function RegisterPage() {
  const navigate = useNavigate();

  async function handleRegister(
    email: string,
    username: string,
    password: string,
  ) {
    await register(email, username, password);
    await login(email, password);
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
