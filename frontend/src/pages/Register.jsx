import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form), // ⛔ tanpa username!
    });

    const json = await res.json();

    if (json.error) {
      alert("Register gagal: " + json.error);
    } else {
      alert("Register berhasil! Silakan cek email untuk verifikasi ✔");
      navigate("/login");
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Register</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Full Name */}
        <input
          name="full_name"
          placeholder="Full Name"
          className="border p-2 w-full"
          onChange={handleChange}
          required
        />

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

        <button className="bg-blue-600 text-white p-2 rounded w-full">
          Register
        </button>
      </form>

      <p className="mt-4 text-sm">
        Sudah punya akun?{" "}
        <button
          className="text-blue-600 underline"
          onClick={() => navigate("/login")}
        >
          Login
        </button>
      </p>
    </div>
  );
}
