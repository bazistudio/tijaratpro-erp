"use client";

import { useState } from "react";
import { uploadPDF } from "../services/import.service";

export default function PDFUploader() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      const res = await uploadPDF(file);
      setData(res);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <input type="file" accept="application/pdf" onChange={handleFile} />

      {loading && <p>Uploading & extracting...</p>}

      {data && (
        <div style={{ display: 'flex', gap: '40px', marginTop: '20px' }}>
          
          <div style={{ flex: 1 }}>
            <h3>Extracted Mobile Products</h3>
            {data.products && data.products.map((p: any, i: number) => (
              <div key={i} style={{ border: "1px solid #ddd", padding: 10, marginBottom: 10, borderRadius: 4 }}>
                <h4>{p.name}</h4>

                {/* STATUS BADGE */}
                <span
                  style={{
                    padding: "4px 8px",
                    background:
                      p.matchStatus === "new"
                        ? "green"
                        : p.matchStatus === "update"
                        ? "orange"
                        : "red",
                    color: "white",
                    borderRadius: 4,
                  }}
                >
                  {p.matchStatus}
                </span>

                <p><strong>Model:</strong> {p.model}</p>
                <p><strong>Category:</strong> {p.category}</p>
                <p><strong>Price:</strong> {p.price} PKR</p>
                <p><strong>Quantity:</strong> {p.quantity}</p>
                <p><strong>Reason:</strong> {p.matchReason}</p>
              </div>
            ))}
          </div>

          <div style={{ flex: 1 }}>
            <h3>Raw Pages: {data.pages}</h3>
            <h4>Extracted Lines (Debug):</h4>
            <pre style={{ whiteSpace: "pre-wrap", background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
              {data.rawLines ? data.rawLines.slice(0, 50).join("\n") : (data.lines && data.lines.slice(0, 50).join("\n"))}
            </pre>
          </div>

        </div>
      )}
    </div>
  );
}
