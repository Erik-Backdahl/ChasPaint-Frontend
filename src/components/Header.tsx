import { Link, useNavigate } from "react-router";
import { useAuth } from "../AuthProvider";
import "./Header.css";

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <h1 className="navbar-title">
        <Link to="/">ChasPaint</Link>
      </h1>
      <div>
        <div className="navbar-actions">
          {user ? (
            <button onClick={logout}>logga Ut</button>
          ) : (
            <button onClick={() => navigate("/login")}>logga In</button>
          )}
        </div>
      </div>
    </header>
  );
}
