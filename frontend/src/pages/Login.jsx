import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm"; 
export default function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState(""); 
    const [showPassword, setShowPassword] = useState(false); 

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const togglePasswordVisibility = () =>
        setShowPassword(prev => !prev);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); 

        try {
            const res = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
    
            const json = await res.json();
    
            if (json.error) {
                setError(json.error || "Login gagal. Coba lagi.");
                return;
            }
    
            localStorage.setItem("accessToken", json.accessToken);
    
            navigate("/dashboard");
        } catch (err) {
            setError("Gagal terhubung ke server.");
            console.error("Login error:", err);
        }
    };

    return (
        <div className="relative h-screen flex items-center justify-center bg-[#0a0f18] text-white overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at center, #3f4770 0%, #0a0f18 70%)' }}></div>
            <div className="absolute inset-0 z-0" style={{ backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.5), rgba(0,0,0,0))' }}></div>
            
            <LoginForm
                form={form}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                error={error}
                showPassword={showPassword}
                togglePasswordVisibility={togglePasswordVisibility}
            />
        </div>
    );
}