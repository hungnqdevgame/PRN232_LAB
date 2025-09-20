import { useEffect } from "react";
import { useState } from "react";
import { getDates } from "../services/apiService";

export default function DateSelector({ onDateChange, currentDate }) {
  const [date, setDate] = useState(currentDate);
  const [loading, setLoading] = useState(true);
  const [availableDates, setAvailableDate] = useState(undefined);
  useEffect(() => {
    setLoading(true);
    async function loadAvailableDate() {
      try {
        let temp = await getDates();
        console.debug(temp);
        let result = temp.value.map((date) => {
          return date.RecordedDate;
        });
        setAvailableDate(result);
      } finally {
        setLoading(false);
      }
    }
    loadAvailableDate();
  }, []);

  const handleChange = (e) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);
    onDateChange(selectedDate);
  };

  return (
    <div
      className="metric-summary"
      style={{
        display: "flex",
        justifyContent: "center",
        marginBottom: "20px",
      }}
    >
      <div
        className="metric-card"
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "20px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
          minWidth: "200px",
        }}
      >
        <label
          style={{
            fontSize: "14px",
            fontWeight: "500",
            color: "#444",
            whiteSpace: "nowrap",
          }}
        >
          Select Date:
        </label>
        <input
          type="date"
          value={date}
          onChange={handleChange}
          min={availableDates?.[0]}
          max={availableDates?.[availableDates.length - 1]}
          style={{
            padding: "6px 10px",
            fontSize: "14px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            backgroundColor: "#f9f9f9",
            color: "#333",
            outline: "none",
            transition: "border-color 0.2s, box-shadow 0.2s",
            cursor: "pointer",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#007bff")}
          onBlur={(e) => (e.target.style.borderColor = "#ccc")}
        />
      </div>
    </div>
  );
}
