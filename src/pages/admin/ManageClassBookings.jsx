import { useEffect, useState } from "react";
import { getClassRegistrations, updateRegistrationStatus } from "../../services/memberService";
import { Check, X, RotateCcw } from "lucide-react";

export default function ManageClassBookings() {
  const [list, setList] = useState([]);

  const load = () => getClassRegistrations().then(setList);
  useEffect(() => { load(); }, []);

  const handleAction = async (id, status) => {
    try {
      await updateRegistrationStatus(id, status);
      load(); // Tải lại danh sách sau khi cập nhật
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <div className="toolbar">
        <h1 className="page-title">Quản lý duyệt đăng ký lớp học</h1>
      </div>

      <div className="panel table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Hội viên</th>
              <th>Số điện thoại</th>
              <th>Tên lớp</th>
              <th>Lịch học</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: "right" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>
                  Chưa có yêu cầu đăng ký lớp nào từ hội viên.
                </td>
              </tr>
            ) : (
              list.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.memberName}</strong></td>
                  <td>{item.phone}</td>
                  <td>{item.className}</td>
                  <td>{item.schedule}</td>
                  <td>
                    {item.status === 'APPROVED' && <span style={{ color: "#10b981", fontWeight: 600 }}>Đã duyệt</span>}
                    {item.status === 'REJECTED' && <span style={{ color: "#ef4444", fontWeight: 600 }}>Từ chối</span>}
                    {item.status === 'PENDING' && <span style={{ color: "#f59e0b", fontWeight: 600 }}>Chờ duyệt</span>}
                  </td>
                  <td className="actions" style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                      {item.status === 'PENDING' ? (
                        <>
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: "4px 10px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                            onClick={() => handleAction(item.id, 'APPROVED')}
                          >
                            <Check size={14} /> Duyệt
                          </button>
                          <button 
                            className="btn btn-danger" 
                            style={{ padding: "4px 10px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                            onClick={() => handleAction(item.id, 'REJECTED')}
                          >
                            <X size={14} /> Từ chối
                          </button>
                        </>
                      ) : (
                        // Nếu đã duyệt hoặc từ chối, hiển thị nút hoàn tác về trạng thái Chờ duyệt
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: "4px 10px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px", backgroundColor: "#e5e7eb", color: "#374151", border: "none", cursor: "pointer", borderRadius: "4px" }}
                          onClick={() => handleAction(item.id, 'PENDING')}
                          title="Đưa về trạng thái chờ duyệt"
                        >
                          <RotateCcw size={14} /> Hoàn tác
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}