import { Link, useNavigate } from "react-router";
import "./Header.css";

export default function Header() {
  const navigate = useNavigate();
  return (
    <header className="navbar">
      <h1 className="navbar-title">
        <Link to="/">ChasPaint</Link>
      </h1>
      <div>
        <button onClick={() => navigate("/login")}>logga in</button>
      </div>
    </header>
  );
}
