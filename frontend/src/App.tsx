import { useState } from "react";
import "./App.css";

declare global {
  interface Window {
    desktopApi?: {
      getApiBaseUrl: () => string;
    };
  }
}

function App() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const callApi = async () => {
    try {
      setLoading(true);

      const baseUrl =
        window.desktopApi?.getApiBaseUrl() ?? import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5050";

      const res = await fetch(`${baseUrl}/api/hello`);
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({
        error: err?.message ?? "unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <h1>Electron + React + ASP.NET Core</h1>
      <button onClick={callApi} disabled={loading}>
        {loading ? "Loading..." : "Call API"}
      </button>

      <pre className="result">{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
}

export default App;