// src/pages/TicketListPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { fetchTickets } from "../api/ticketApi";
import TicketStatusBadge from "../components/TicketStatusBadge";
import { useNavigate } from "react-router-dom";

export default function TicketListPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const token = localStorage.getItem("accessToken");
  let userId = null;

  if (token) {
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      userId = decoded.id;
    } catch {}
  }

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const data = await fetchTickets();
        const myTickets = data.filter(
          (t) =>
            String(t.created_by) === String(userId) ||
            String(t.assigned_to) === String(userId)
        );
        if (mounted) setTickets(myTickets);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => (mounted = false);
  }, [userId]);

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
      if (priorityFilter !== "ALL" && t.priority !== priorityFilter) return false;
      if (q) {
        const s = `${t.ticket_number} ${t.title} ${t.description} ${t.machine_id}`.toLowerCase();
        if (!s.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [tickets, statusFilter, priorityFilter, q]);

  return (
    <div className="p-6 bg-gray-50 rounded-xl shadow-lg">

      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Tiket Maintenance
          </h2>
          <p className="text-sm text-gray-500">
            Riwayat tiket yang kamu buat atau sedang ditangani
          </p>
        </div>

      </div>

      {/* ================= FILTER ================= */}
      <div className="bg-white p-4 rounded-xl shadow mb-8 space-y-4">

        <h3 className="text-lg font-semibold text-gray-700">
          Filter Tiket
        </h3>

        <div className="flex flex-wrap gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nomor tiket, judul, atau mesin..."
            className="px-3 py-2 border rounded-lg w-72"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="ALL">Semua Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">Sedang Dikerjakan</option>
            <option value="COMPLETED">Selesai</option>
            <option value="CANCELLED">Dibatalkan</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="ALL">Semua Prioritas</option>
            <option value="LOW">Rendah</option>
            <option value="MEDIUM">Sedang</option>
            <option value="HIGH">Tinggi</option>
            <option value="CRITICAL">Kritis</option>
          </select>
        </div>
      </div>

      {loading && (
        <p className="text-center text-indigo-600 text-lg">
          Memuat tiket...
        </p>
      )}

      {!loading && filtered.length === 0 && (
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
          Tidak ada tiket yang sesuai dengan filter.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((t) => (
          <div
            key={t.id}
            className="p-5 bg-white rounded-xl border border-gray-200 shadow hover:shadow-md transition"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-xs text-gray-400">
                  {t.ticket_number}
                </div>
                <h3 className="font-semibold text-gray-900">
                  {t.title}
                </h3>
                <div className="text-xs text-gray-500">
                  Mesin {t.machine_id} {t.machine_name && `• ${t.machine_name}`}
                </div>
              </div>

              <TicketStatusBadge
                status={t.status}
                priority={t.priority}
              />
            </div>

            <p className="text-sm text-gray-700 mt-3 line-clamp-3">
              {t.description || t.user_notes}
            </p>

            <div className="flex items-center mt-4">
              <button
                onClick={() => navigate(`/tickets/${t.id}`)}
                className="px-3 py-1 text-sm rounded-lg border hover:bg-gray-50"
              >
                Detail
              </button>

              <div className="ml-auto text-xs text-gray-400">
                {new Date(t.created_at).toLocaleString("id-ID")}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
