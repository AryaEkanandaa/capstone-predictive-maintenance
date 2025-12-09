import { Link } from 'react-router-dom';
export default function LoginForm({ 
    form, 
    handleChange, 
    handleSubmit, 
    error, 
    showPassword, 
    togglePasswordVisibility 
}) {
    const EyeIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
        </svg>
    );

    const EyeOffIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.978 10.978 0 0020 10c-.574-1.638-1.574-3.14-2.735-4.437l-1.125-1.125a1 1 0 00-1.414 0zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            <path d="M10 10a.5.5 0 000 1h.01a.5.5 0 000-1H10z" />
        </svg>
    );
    
    return (
        <div className="z-10 bg-[#1e2336] p-10 rounded-xl shadow-2xl w-full max-w-md backdrop-filter backdrop-blur-sm border border-gray-700/50 text-white">
            <h2 className="text-3xl font-bold text-center mb-2">Sign In to Your Account</h2>
            <p className="text-sm text-center text-gray-400 mb-6">
            Welcome to a Our Predictive Maintenance Copilot.<br />
            A25-CS044
        </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {error && <p className="text-red-400 text-center text-sm">{error}</p>}
                
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    className="px-4 py-3 bg-[#171b29] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={form.email}
                    onChange={handleChange}
                    required
                />

                <label htmlFor="password" className="text-sm font-medium mt-2">Password</label>
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        placeholder="Enter your password"
                        className="px-4 py-3 pr-10 w-full bg-[#171b29] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                        onClick={togglePasswordVisibility}
                    >
                        {showPassword ? EyeIcon : EyeOffIcon}
                    </button>
                </div>
                
                <div className="text-right text-sm">
                    <Link to="/register" className="text-indigo-400 hover:text-indigo-300 transition">Don't have an account? Register</Link>
                </div>

                <button
                    type="submit"
                    className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold shadow-lg transition duration-200"
                >
                    Sign In
                </button>
            </form>
        </div>
    );
}