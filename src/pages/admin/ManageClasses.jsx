import { useState, useEffect } from "react";
import axios from "axios";
import { Trash2, Plus } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/";

export default function ManageClasses() {
  const [classes, setClasses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [formData, setFormData] = useState({ name: "", trainer: "", schedule: "" });
  const [loading, setLoading] = useState(false);

  // Tải danh sách lớp học và danh sách HLV từ Django Database
  const loadData = async () => {
    setLoading(true);
    try {
      const [classRes, trainerRes] = await Promise.all([
        axios.get(`${API_URL}classes/`),
        axios.get(`${API_URL}trainers/`)
      ]);
      setClasses(classRes.data || []);
      setTrainers(trainerRes.data || []);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu lớp học hoặc HLV:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Thêm lớp học mới
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.trainer || !formData.schedule) {
      alert("Vui lòng điền đầy đủ thông tin lớp học!");
      return;
    }

    try {
      await axios.post(`${API_URL}classes/`, formData);
      alert("Thêm lớp học thành công!");
      setFormData({ name: "", trainer: "", schedule: "" });
      loadData();
    } catch (error) {
      console.error("Lỗi khi thêm lớp học:", error);
      alert("Thêm lớp học thất bại!");
    }
  };

  // Xóa lớp học
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa lớp học này không?")) {
      try {
        await axios.delete(`${API_URL}classes/${id}/`);
        loadData();
      } catch (error) {
        console.error("Lỗi khi xóa lớp học:", error);
        alert("Xóa thất bại!");
      }
    }
  };

  return (
    <div>
      <div className="toolbar">
        <h1 className="page-title">Quản lý Lớp học</h1>
      </div>

      {/* Form thêm lớp học mới */}
      <div className="panel" style={{ marginBottom: "24px" }}>
        <h3 style={{ marginBottom: "16px" }}>Thêm lớp học mới</h3>
        <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", alignItems: "end" }}>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: 500 }}>Tên lớp học:</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="VD: Yoga Cơ Bản"
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              required 
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: 500 }}>Huấn luyện viên phụ trách:</label>
            <select 
              className="form-control" 
              value={formData.trainer} 
              onChange={(e) => setFormData({...formData, trainer: e.target.value})} 
              required
            >
              <option value="">-- Chọn HLV từ hệ thống --</option>
              {trainers.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name} ({t.specialty})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: 500 }}>Lịch học:</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="VD: Thứ 2, 4, 6 - 08:00" 
              value={formData.schedule} 
              onChange={(e) => setFormData({...formData, schedule: e.target.value})} 
              required 
            />
          </div>

          <div>
            <button type="submit" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "38px" }}>
              <Plus size={16} /> Thêm lớp học
            </button>
          </div>
        </form>
      </div>

      {/* Danh sách lớp học hiện tại */}
      <div className="panel">
        <h3 style={{ marginBottom: "16px" }}>Danh sách lớp học hiện có</h3>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên lớp</th>
                <th>Huấn luyện viên</th>
                <th>Lịch học</th>
                <th style={{ textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {classes.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>
                    Chưa có lớp học nào trong cơ sở dữ liệu. Hãy thêm lớp mới ở phía trên!
                  </td>
                </tr>
              ) : (
                classes.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td><strong>{c.name}</strong></td>
                    <td>{c.trainer}</td>
                    <td>{c.schedule}</td>
                    <td style={{ textAlign: "right" }}>
                      <button 
                        className="btn btn-danger btn-sm" 
                        style={{ padding: "4px 10px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                        onClick={() => handleDelete(c.id)}
                      >
                        <Trash2 size={14} /> Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}