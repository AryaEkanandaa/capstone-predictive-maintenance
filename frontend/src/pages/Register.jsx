import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RegisterForm from "../components/RegisterForm"; 

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        full_name: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState("");

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const dataToSend = form; 

        try {
            const res = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataToSend), 
            });
    
            const json = await res.json();
    
            if (json.error) {
                setError(json.error || "Register gagal. Coba lagi.");
            } else {
                alert("Register berhasil! Silakan cek email untuk verifikasi ✔");
                navigate("/login");
            }
        } catch (err) {
            setError("Gagal terhubung ke server.");
            console.error("Register error:", err);
        }
    };

    return (
        <div className="relative h-screen flex items-center justify-center bg-[#0a0f18] text-white overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at center, #3f4770 0%, #0a0f18 70%)' }}></div>
            <div className="absolute inset-0 z-0" style={{ backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.5), rgba(0,0,0,0))' }}></div>

            <RegisterForm
                form={form}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                error={error}
            />
        </div>
    );
}