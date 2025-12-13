import React from "react";
import { format } from "date-fns";

export default function TicketActivityTimeline({ activities = [] }) {
  if (!activities || activities.length === 0) {
    return <div className="text-sm text-gray-500">Belum ada aktivitas.</div>;
  }

  const getInitials = (name) => {
    if (!name) return "US"; // fallback
    return name
      .split(" ")
      .map((x) => x[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="space-y-4">
      {activities.map((a) => (
        <div key={a.id} className="flex gap-3">
          
          {/* Avatar */}
          <div className="w-10 flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-700">
              {getInitials(a.full_name)}
            </div>
          </div>

          {/* Activity Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-900">
                {a.action.replace("_", " ")}
              </div>
              <div className="text-xs text-gray-400">
                {format(new Date(a.created_at), "yyyy-MM-dd HH:mm")}
              </div>
            </div>

            {a.comment && (
              <div className="text-sm text-gray-700 mt-1">{a.comment}</div>
            )}

            {(a.old_value || a.new_value) && (
              <div className="text-xs text-gray-500 mt-1">
                {a.old_value ? (
                  <span className="line-through mr-2">OLD: {a.old_value}</span>
                ) : null}
                {a.new_value ? <span>NEW: {a.new_value}</span> : null}
              </div>
            )}
          </div>

        </div>
      ))}
    </div>
  );
}
