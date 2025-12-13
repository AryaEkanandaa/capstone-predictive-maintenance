import { useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();


  const getPageTitle = () => {
    const path = location.pathname;

    if (path.includes("dashboard")) return "Dashboard";

    return "PrediX AI";
  };

  const currentPage = getPageTitle();

  return (
    <div className="w-full bg-white border-b h-16 flex items-center justify-between px-6">
      <h2 className="text-xl font-semibold">{currentPage}</h2>
    </div>
  );
}
