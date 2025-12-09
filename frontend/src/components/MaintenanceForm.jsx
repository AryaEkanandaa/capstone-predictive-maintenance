export default function MaintenanceForm({ form, setForm, submitLog }) {
  const STATUS_OPTIONS = ["CRITICAL", "WARNING", "NORMAL"];
  const FIXED_STATUS_OPTIONS = ["NORMAL", "WARNING"];
  const MACHINE_OPTIONS = [1, 2, 3, 4, 5];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: name === "machine_id" ? Number(value) : value,
    }));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
        Catat Maintenance Baru
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* KOLOM 1: Mesin & Teknisi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Machine:
          </label>
          <select
            name="machine_id"
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
            value={form.machine_id}
            onChange={handleChange}
          >
            {MACHINE_OPTIONS.map((id) => (
              <option key={id} value={id}>
                Machine {id}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Technician:
          </label>
          <input
            name="technician"
            className="w-full border border-gray-300 p-2.5 rounded-lg bg-gray-100 text-gray-600"
            value={form.technician}
            readOnly
          />
        </div>

        {/* KOLOM 2: Status Sebelum & Sesudah */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Previous Status:
          </label>
          <select
            name="status_before"
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
            value={form.status_before}
            onChange={handleChange}
          >
            <option value="">-- Select status --</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fixed to Status:
          </label>
          <select
            name="status_after"
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
            value={form.status_after}
            onChange={handleChange}
          >
            <option value="">-- Pilih status --</option>
            {FIXED_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Action Taken:
        </label>
        <input
          name="action_taken"
          className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Contoh: Ganti bearing, pelumasan ulang, kalibrasi sensor..."
          value={form.action_taken}
          onChange={handleChange}
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes (optional):
        </label>
        <textarea
          name="notes"
          className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 min-h-[80px]"
          placeholder="Catatan tambahan teknisi..."
          value={form.notes}
          onChange={handleChange}
        />
      </div>

      <button
        className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg font-semibold shadow-md transition duration-150 transform hover:scale-[1.005]"
        onClick={submitLog}
      >
        💾 Save Maintenance Log
      </button>
    </div>
  );
}