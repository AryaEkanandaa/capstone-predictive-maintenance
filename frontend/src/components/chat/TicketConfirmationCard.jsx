import { CheckCircle, Wrench } from "lucide-react";

export default function TicketConfirmationCard({ data }) {
  const {
    ticket_number,
    machine_name,
    status,
    priority,
  } = data;

  // Samakan konsep status dengan ML
  const statusStyle = {
    OPEN: "border-green-400 bg-green-50 text-green600",
    CLOSED: "border-gray-400 bg-gray-50 text-gray-600",
  };

  return (
    <div
      className={`max-w-md w-full border rounded-xl overflow-hidden
      ${statusStyle[status] || "border-green-400 bg-green-50"}`}
    >
      {/* HEADER */}
      <div className="px-3 py-2 flex items-center gap-2 text-sm font-semibold text-green-700">
        <Wrench className="w-4 h-4" />
        Tiket Maintenance
      </div>

      {/* BODY */}
      <div className="px-3 py-3 space-y-3 text-sm bg-white">

        {/* SUCCESS */}
        <div className="flex items-center gap-2 text-green-700 font-medium">
          <CheckCircle className="w-4 h-4" />
          Tiket maintenance berhasil dibuat!
        </div>

        {/* INFO */}
        <div className="grid grid-cols-2 gap-y-1 text-gray-800">
          <span className="text-gray-500">Nomor Tiket</span>
          <span className="font-medium">{ticket_number}</span>

          <span className="text-gray-500">Mesin</span>
          <span>{machine_name}</span>

          <span className="text-gray-500">Status</span>
          <span className="font-semibold">{status}</span>

          <span className="text-gray-500">Prioritas</span>
          <span>{priority}</span>
        </div>

        {/* FOOTER */}
        <p className="text-xs text-gray-500 pt-1">
          Silakan cek halaman <b>Maintenance Tickets</b> untuk detail lengkap.
        </p>
      </div>
    </div>
  );
}
