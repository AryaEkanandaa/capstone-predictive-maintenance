import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const json = await res.json();

    if (json.error) {
      alert("Login gagal: " + json.error);
      return;
    }

    // Simpan token di localStorage
    localStorage.setItem("accessToken", json.accessToken);

    // Pindah ke dashboard setelah login
    navigate("/dashboard");
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Login</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Email */}
        <input
            name="email"
            type="email"
            placeholder="Email"
            className="border p-2 w-full"
            onChange={handleChange}
            required
        />

        {/* Password */}
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="border p-2 w-full"
          onChange={handleChange}
          required
        />

        <button className="bg-green-600 text-white p-2 rounded w-full">
          Login
        </button>
      </form>

      <p className="mt-4 text-sm">
        Belum punya akun?{" "}
        <button
          className="text-blue-600 underline"
          onClick={() => navigate("/register")}
        >
          Register
        </button>
      </p>
    </div>
  );
}
