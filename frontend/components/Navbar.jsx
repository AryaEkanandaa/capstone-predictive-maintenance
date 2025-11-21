export default function Navbar() {
return (
    <div className="w-full bg-white border-b h-16 flex items-center justify-between px-6">
        <h2 className="text-xl font-semibold">Dashboard</h2>
    <div className="flex items-center gap-4">
        <input
            type="text"
            placeholder="Search..."
            className="px-3 py-1 border rounded-lg"
        />
        
    </div>
    </div>
    );
}
