import { useState, useEffect } from "react";
import { Trash2, Mail, User, Clock } from "lucide-react";
import axios from "axios";

export default function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await axios.get("https://ironpulse-backend-tvu3.onrender.com/api/contacts/");
      setContacts(response.data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách liên hệ:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tin nhắn này không?")) {
      try {
        await axios.delete(`https://ironpulse-backend-tvu3.onrender.com/api/contacts/${id}/`);
        setContacts(contacts.filter((item) => item.id !== id));
      } catch (err) {
        console.error("Lỗi khi xóa tin nhắn:", err);
        alert("Xóa tin nhắn thất bại!");
      }
    }
  };

  if (loading) {
    return <div className="panel" style={{ textAlign: "center", padding: "40px" }}>Đang tải dữ liệu...</div>;
  }

  return (
    <div>
      <h1 className="page-title">Quản lý tin nhắn tư vấn</h1>

      {contacts.length === 0 ? (
        <div className="panel" style={{ textAlign: "center", color: "#888", padding: "40px" }}>
          Chưa có yêu cầu tư vấn nào được gửi tới.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {contacts.map((item) => (
            <div key={item.id} className="panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                  <span style={{ fontWeight: "bold", fontSize: "16px", display: "flex", alignItems: "center", gap: "5px" }}>
                    <User size={16} color="#f97316" /> {item.name || item.fullName}
                  </span>
                  <span style={{ fontSize: "14px", color: "#666", display: "flex", alignItems: "center", gap: "5px" }}>
                    <Mail size={14} /> {item.email}
                  </span>
                </div>
                <p style={{ margin: "5px 0", color: "#333", backgroundColor: "#f9fafb", padding: "10px", borderRadius: "6px", border: "1px solid #e5e7eb" }}>
                  {item.message}
                </p>
                <span style={{ fontSize: "12px", color: "#888", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Clock size={12} /> Gửi lúc: {new Date(item.created_at).toLocaleString()}
                </span>
              </div>

              <button 
                onClick={() => handleDelete(item.id)} 
                className="btn btn-ghost" 
                style={{ color: "#ef4444", padding: "8px" }}
                title="Xóa tin nhắn"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}