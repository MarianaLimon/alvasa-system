import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { login } from "./auth";
import { FaUserCircle } from "react-icons/fa";
import "./styles/login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await login(email, password);
      // Si tu backend responde { user, token }, esto lo cubre.
      setUser(data?.user ?? data);

      // (Opcional) si usas token:
      // if (data?.token) {
      //   localStorage.setItem("token", data.token);
      //   // config axios header aquí si lo usas
      // }

      navigate("/"); // dashboard
    } catch (err) {
      setError(err?.response?.data?.message || "Credenciales inválidas");
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
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}
