import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { login } from "./auth";

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
      setUser(data); // {id, nombre, email, role, permissions: []}
      navigate("/"); // redirigir al dashboard raíz
    } catch (err) {
      setError(err?.response?.data?.message || "Credenciales inválidas");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <form
        onSubmit={handleSubmit}
        style={{
          width: 320,
          display: "grid",
          gap: 12,
          padding: 24,
          border: "1px solid #ccc",
          borderRadius: 8,
          background: "#fff",
        }}
      >
        <h3 style={{ margin: 0 }}>Iniciar sesión</h3>
        {error && <div style={{ color: "red" }}>{error}</div>}

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
