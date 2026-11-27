import { useState, useEffect } from "react";
import { Trash2, Mail, User, Clock, MessageSquare } from "lucide-react";
import axios from "axios";

export default function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await axios.get(
        "https://ironpulse-backend-tvu3.onrender.com/api/contacts/"
      );
      setContacts(response.data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách liên hệ:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Bạn có chắc chắn muốn xóa tin nhắn này không?")
    ) {
      try {
        await axios.delete(
          `https://ironpulse-backend-tvu3.onrender.com/api/contacts/${id}/`
        );

        setContacts((prev) => prev.filter((item) => item.id !== id));
      } catch (err) {
        console.error("Lỗi khi xóa tin nhắn:", err);
        alert("Xóa tin nhắn thất bại!");
      }
    }
  };

  return (
    <div className="admin-contacts">
      {/* HEADER */}
      <div className="contacts-header">
        <div>
          <div className="contacts-eyebrow">
            <span className="contacts-status-dot"></span>
            IRONPULSE MANAGEMENT
          </div>

          <h1 className="contacts-title">
            QUẢN LÝ TIN NHẮN TƯ VẤN
          </h1>

          <p className="contacts-subtitle">
            Theo dõi và quản lý các yêu cầu tư vấn từ khách hàng.
          </p>
        </div>

        <div className="contacts-total">
          <div className="contacts-total-icon">
            <MessageSquare size={21} />
          </div>

          <div>
            <span>TỔNG TIN NHẮN</span>
            <strong>{loading ? "..." : contacts.length}</strong>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="contacts-content">
        {loading ? (
          <div className="contacts-state">
            <div className="contacts-loader"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : contacts.length === 0 ? (
          <div className="contacts-state">
            <div className="contacts-empty-icon">
              <MessageSquare size={35} />
            </div>

            <h3>CHƯA CÓ TIN NHẮN</h3>

            <p>
              Hiện tại chưa có yêu cầu tư vấn nào được gửi tới IronPulse.
            </p>
          </div>
        ) : (
          <>
            <div className="contacts-list-header">
              <div>
                <h2>DANH SÁCH YÊU CẦU</h2>
                <p>Các tin nhắn khách hàng đã gửi</p>
              </div>

              <span className="contacts-count">
                {contacts.length} TIN NHẮN
              </span>
            </div>

            <div className="contacts-list">
              {contacts.map((item) => (
                <div className="contact-card" key={item.id}>
                  <div className="contact-card-main">
                    {/* CUSTOMER INFO */}
                    <div className="contact-customer">
                      <div className="contact-avatar">
                        <User size={23} />
                      </div>

                      <div className="contact-customer-info">
                        <h3>{item.name || item.fullName || "Khách hàng"}</h3>

                        <div className="contact-email">
                          <Mail size={14} />
                          <span>{item.email || "Chưa có email"}</span>
                        </div>
                      </div>
                    </div>

                    {/* MESSAGE */}
                    <div className="contact-message">
                      <div className="contact-message-label">
                        <MessageSquare size={15} />
                        NỘI DUNG TƯ VẤN
                      </div>

                      <p>{item.message || "Không có nội dung tin nhắn."}</p>
                    </div>

                    {/* DATE */}
                    <div className="contact-date">
                      <Clock size={14} />

                      <span>
                        Gửi lúc:{" "}
                        {item.created_at
                          ? new Date(item.created_at).toLocaleString("vi-VN")
                          : "Không xác định"}
                      </span>
                    </div>
                  </div>

                  {/* DELETE */}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="contact-delete-btn"
                    title="Xóa tin nhắn"
                    aria-label="Xóa tin nhắn"
                  >
                    <Trash2 size={18} />
                    <span>XÓA</span>
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}