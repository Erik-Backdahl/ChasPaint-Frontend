import { useNavigate } from "react-router";
import AuthForm from "../components/AuthForm";
import { login } from "../api/UserService";
import googleIcon from "../assets/Google__G__logo.svg.png";

export default function LoginPage() {
  const navigate = useNavigate();

  async function handleLogin(email: string, password: string) {
    await login(email, password);
    navigate("/");
  }

  return (
    <AuthForm
      title="Logga in"
      loadingLabel="Loggar in..."
      onSubmit={handleLogin}
    >
      <div className="divider">
        <span>eller</span>
      </div>

      <section className="alt-actions">
        <button
          type="button"
          className="btn btn-register"
          onClick={() => navigate("/login/registrera")}
        >
          Registrera
        </button>
        <button type="button" className="btn btn-google">
          <img src={googleIcon} alt="" className="google-icon" />
          Logga in med Google
        </button>
      </section>
    </AuthForm>
  );
}   