export async function getPredictionHistory() {
  const token = localStorage.getItem("accessToken");

  const res = await fetch("http://localhost:5000/api/predict/history", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  return data.data || [];
}