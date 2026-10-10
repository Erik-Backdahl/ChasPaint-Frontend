import { useState, type ReactNode } from "react";
import "./AuthForm.css";

type AuthFormProps = {
  title: string;
  loadingLabel: string;
  onSubmit: (email: string, password: string) => Promise<void>;
  children?: ReactNode;
};

export default function AuthForm({
  title,
  loadingLabel,
  onSubmit,
  children,
}: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSubmit(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Något gick fel");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-wrapper">
        <h1 className="auth-title">{title}</h1>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            className="input"
            type="email"
            placeholder="E-post"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Lösenord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="btn btn-submit" disabled={loading}>
            {loadingLabel}
          </button>
        </form>

        {children}
      </div>
    </main>
  );
}