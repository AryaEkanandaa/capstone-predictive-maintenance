import React from "react";

export default function TicketStatusBadge({ status, priority }) {
  const statusMap = {
    OPEN: "bg-blue-50 text-blue-700 border-blue-200",
    IN_PROGRESS: "bg-indigo-50 text-indigo-700 border-indigo-200",
    COMPLETED: "bg-green-50 text-green-700 border-green-200",
    CANCELLED: "bg-gray-50 text-gray-700 border-gray-200",
  };

  const priorityMap = {
    LOW: "bg-green-100 text-green-800",
    MEDIUM: "bg-yellow-100 text-yellow-800",
    HIGH: "bg-orange-100 text-orange-800",
    CRITICAL: "bg-red-100 text-red-800",
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`px-2 py-0.5 text-xs font-semibold rounded ${statusMap[status] || "bg-gray-50 text-gray-700"}`}>
        {status?.replace("_", " ") || "UNKNOWN"}
      </span>
      <span className={`px-2 py-0.5 text-xs font-semibold rounded ${priorityMap[priority] || "bg-gray-100 text-gray-700"}`}>
        {priority || "MEDIUM"}
      </span>
    </div>
  );
}
