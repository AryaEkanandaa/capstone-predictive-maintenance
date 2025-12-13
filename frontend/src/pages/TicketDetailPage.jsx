// src/pages/TicketDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchTicketById,
  fetchTicketActivity,
  updateTicketStatus
} from "../api/ticketApi";
import TicketStatusBadge from "../components/TicketStatusBadge";
import TicketActivityTimeline from "../components/TicketActivityTimeline";

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusUpdating, setStatusUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const t = await fetchTicketById(id);
        if (mounted) setTicket(t);

        try {
          const act = await fetchTicketActivity(id);
          if (mounted) setActivities(act);
        } catch {}
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => (mounted = false);
  }, [id]);

  async function handleChangeStatus(e) {
    e.preventDefault();
    if (!newStatus) return;

    setStatusUpdating(true);
    try {
      const res = await updateTicketStatus(id, newStatus, comment);
      setTicket(res.ticket || res);

      setActivities((prev) => [
        {
          id: Math.random(),
          action: "STATUS_CHANGED",
          old_value: ticket?.status,
          new_value: newStatus,
          comment,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);

      setNewStatus("");
      setComment("");
    } catch (err) {
      alert("Gagal memperbarui status tiket");
    } finally {
      setStatusUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-center text-indigo-600">
        Memuat detail tiket...
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-6 text-center text-red-500">
        Tiket tidak ditemukan.
      </div>
    );
  }

  const sensor =
    ticket.sensor_data
      ? typeof ticket.sensor_data === "string"
        ? JSON.parse(ticket.sensor_data)
        : ticket.sensor_data
      : null;

  return (
    <div className="p-6 bg-gray-50 rounded-xl shadow-lg">

      {/* ================= HEADER ================= */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="text-sm text-gray-400">
            {ticket.ticket_number}
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            {ticket.title}
          </h1>
          <p className="text-sm text-gray-500">
            Mesin {ticket.machine_id} {ticket.machine_name && `• ${ticket.machine_name}`}
          </p>
        </div>

        <div className="text-right">
          <TicketStatusBadge
            status={ticket.status}
            priority={ticket.priority}
          />
          <div className="text-xs text-gray-400 mt-2">
            Dibuat: {new Date(ticket.created_at).toLocaleString("id-ID")}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ================= KONTEN UTAMA ================= */}
        <div className="lg:col-span-2 space-y-4">

          <Card title="Deskripsi Tiket">
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {ticket.description || ticket.user_notes || "—"}
            </p>
          </Card>

          <Card title="Rekomendasi AI">
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {ticket.ai_recommendations || "Belum ada rekomendasi."}
            </p>
          </Card>

          <Card title="Aktivitas Tiket">
            <TicketActivityTimeline activities={activities} />
          </Card>
        </div>

        {/* ================= SIDEBAR ================= */}
        <aside className="space-y-4">

          <Card title="Ringkasan Teknis">
            <Info label="Tipe Kegagalan" value={ticket.failure_type || "—"} />
            <Info
              label="Probabilitas"
              value={
                ticket.failure_probability
                  ? `${(ticket.failure_probability * 100).toFixed(1)}%`
                  : "—"
              }
            />
            <Info label="Skor Anomali" value={ticket.anomaly_score ?? "—"} />
            <Info label="Dibuat Oleh" value={ticket.creation_type} />
            <Info label="Ditugaskan Ke" value={ticket.assigned_to_name || "Belum"} />
          </Card>

          <Card title="Data Sensor Terakhir">
            {sensor ? (
              <>
                <Info label="Air Temperature" value={sensor.air_temperature ?? "—"} />
                <Info label="Process Temperature" value={sensor.process_temperature ?? "—"} />
                <Info label="RPM" value={sensor.rotational_speed ?? "—"} />
                <Info label="Torque" value={sensor.torque ?? "—"} />
                <Info label="Tool Wear" value={sensor.tool_wear ?? "—"} />
                <div className="text-xs text-gray-400 mt-2">
                  Update: {sensor.created_at ? new Date(sensor.created_at).toLocaleString("id-ID") : "-"}
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500">
                Tidak ada data sensor.
              </div>
            )}
          </Card>

          <Card title="Perbarui Status Tiket">
            <form onSubmit={handleChangeStatus} className="space-y-3">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Pilih Status Baru</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">Sedang Dikerjakan</option>
                <option value="COMPLETED">Selesai</option>
                <option value="CANCELLED">Dibatalkan</option>
              </select>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Catatan / komentar (opsional)"
                className="w-full px-3 py-2 border rounded-lg h-20"
              />

              <div className="flex gap-2">
                <button
                  disabled={!newStatus || statusUpdating}
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
                >
                  {statusUpdating ? "Menyimpan..." : "Simpan Status"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Kembali
                </button>
              </div>
            </form>
          </Card>

        </aside>
      </div>
    </div>
  );
}

/* ===================== COMPONENT KECIL ===================== */

function Card({ title, children }) {
  return (
    <div className="p-4 bg-white border rounded-xl shadow-sm">
      <h3 className="font-semibold mb-2 text-gray-800">{title}</h3>
      {children}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="flex justify-between text-sm text-gray-700">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
