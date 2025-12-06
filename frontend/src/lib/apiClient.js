const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  let res = await fetch(url, { ...options, headers });

  // kalau unauthorized & punya refresh token → coba refresh sekali
  if (res.status === 401 && refreshToken) {
    const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const refreshJson = await refreshRes.json();

    if (
      refreshRes.ok &&
      refreshJson.status === "success" &&
      refreshJson.data?.accessToken
    ) {
      const newAccess = refreshJson.data.accessToken;
      const newRefresh = refreshJson.data.refreshToken || refreshToken;

      localStorage.setItem("accessToken", newAccess);
      localStorage.setItem("refreshToken", newRefresh);

      // ulang request asli dengan token baru
      const retryHeaders = {
        ...headers,
        Authorization: `Bearer ${newAccess}`,
      };

      res = await fetch(url, { ...options, headers: retryHeaders });
    } else {
      // refresh gagal → force logout
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
      throw new Error("Session expired");
    }
  }

  return res;
}
