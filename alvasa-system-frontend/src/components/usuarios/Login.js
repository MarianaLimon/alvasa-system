import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { login, me } from "./auth";
import { FaUserCircle } from "react-icons/fa";
import "./styles/login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      // 1) Autentica (guarda cookie/jwt en backend)
      await login(email, password);

      // 2) Trae perfil ya con { role, permissions } desde /auth/me
      const { data } = await me();

      // 3) Hidrata el contexto ANTES de navegar
      setUser(data);

      // 4) Ahora sí navega: Sidebar ya sabe qué mostrar sin refrescar
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Credenciales inválidas");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-wrapper">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-icon">
          <FaUserCircle />
        </div>
        <h3 className="login-title">Iniciar Sesión</h3>

        {error && <div className="login-error">{error}</div>}

        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={submitting}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={submitting}
        />

        <button type="submit" disabled={submitting}>
          {submitting ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
