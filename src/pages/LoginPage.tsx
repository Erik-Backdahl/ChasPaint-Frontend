import { useNavigate } from "react-router";
import AuthForm, { AuthFormValues } from "../components/AuthForm";
import { login } from "../api/UserService";
import googleIcon from "../assets/Google__G__logo.svg.png";
import { useAuth } from "../AuthProvider";

export default function LoginPage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  async function handleLogin(values: AuthFormValues) {
    await login(values);
    await refreshUser();
    navigate("/");
  }

  return (
    <AuthForm
      title="Logga in"
      submitButtonLabel="Logga in"
      loadingLabel="Loggar in..."
      onSubmit={handleLogin}
    >
      <div className="divider">
        <span>eller</span>
      </div>

      <section className="alt-actions">
        <button
          type="button"
          className="btn-register"
          onClick={() => navigate("/login/registrera")}
        >
          Registrera
        </button>
      </section>
    </AuthForm>
  );
}
