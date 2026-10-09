import "./LoginPage.css";
import googleIcon from "../assets/Google__G__logo.svg.png";

export default function LoginPage() {
  return (
    <main className="login-page">
      <div className="login-wrapper">
        <h1 className="login-title">Logga in</h1>

        <form className="login-form">
          <input
            className="input"
            type="email"
            placeholder="E-post"
          />
          <input
            className="input"
            type="password"
            placeholder="Lösenord"
          />
          <button type="submit" className="btn btn-submit">
            Logga in
          </button>
        </form>

        <div className="divider">
          <span>eller</span>
        </div>

        <section className="alt-actions">
          <button type="button" className="btn btn-register">
            Registrera
          </button>
          <button type="button" className="btn btn-google">
            <img src={googleIcon} alt="" className="google-icon" />
            Logga in med Google
          </button>
        </section>
      </div>
    </main>
  );
}