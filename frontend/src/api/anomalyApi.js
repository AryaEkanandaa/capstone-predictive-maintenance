const API_BASE = import.meta.env.VITE_API_BASE;

function authHeader() {
  const token = localStorage.getItem("accessToken");
  return {
    Authorization: token ? `Bearer ${token}` : "",
  };
}

export async function getAnomalyHistoryByMachine(
  machineId,
  { range = "ALL", status = "ALL" } = {}
) {
  const params = new URLSearchParams();

  if (range !== "ALL") params.append("range", range);
  if (status !== "ALL") params.append("status", status);

  const res = await fetch(
    `${API_BASE}/anomaly/history-by-machine/${machineId}?${params.toString()}`,
    { headers: authHeader() }
  );

  const json = await res.json();
  return json.data || [];
}

export async function getLatestAnomalyPerMachine() {
  const res = await fetch(`${API_BASE}/anomaly/latest`, {
    headers: authHeader(),
  });

  const json = await res.json();
  return json.data || [];
}
