
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Trash2,
  Plus,
  Dumbbell,
  Users,
  CalendarDays,
  Clock,
  BookOpen,
  Pencil,
  X,
  Save,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://ironpulse-backend-tvu3.onrender.com/api/";

export default function ManageClasses() {
  const [classes, setClasses] = useState([]);
  const [trainers, setTrainers] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    trainer: "",
    schedule: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ID lớp học đang chỉnh sửa
  const [editingId, setEditingId] = useState(null);

  // Tải danh sách lớp học và huấn luyện viên
  const loadData = async () => {
    setLoading(true);

    try {
      const [classRes, trainerRes] = await Promise.all([
        axios.get(`${API_URL}classes/`),
        axios.get(`${API_URL}trainers/`),
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

  // Cập nhật dữ liệu form
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Làm mới biểu mẫu
  const resetForm = () => {
    setFormData({
      name: "",
      trainer: "",
      schedule: "",
    });

    setEditingId(null);
  };

  // Mở chế độ chỉnh sửa
  const handleEdit = (classItem) => {
    setEditingId(classItem.id);

    setFormData({
      name: classItem.name || "",
      trainer: classItem.trainer || "",
      schedule: classItem.schedule || "",
    });

    // Cuộn lên biểu mẫu
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Thêm mới hoặc cập nhật lớp học
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.trainer ||
      !formData.schedule.trim()
    ) {
      alert("Vui lòng điền đầy đủ thông tin lớp học!");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: formData.name.trim(),
        trainer: formData.trainer,
        schedule: formData.schedule.trim(),
      };

      if (editingId !== null) {
        // CẬP NHẬT LỚP HỌC
        await axios.put(
          `${API_URL}classes/${editingId}/`,
          payload
        );

        alert("Cập nhật lớp học thành công!");
      } else {
        // THÊM LỚP HỌC
        await axios.post(`${API_URL}classes/`, payload);

        alert("Thêm lớp học thành công!");
      }

      resetForm();
      await loadData();
    } catch (error) {
      console.error("Lỗi khi lưu lớp học:", error);

      const message =
        error.response?.data?.detail ||
        error.response?.data?.error ||
        "Không thể lưu lớp học. Vui lòng thử lại!";

      alert(message);
    } finally {
      setSaving(false);
    }
  };

  // Xóa lớp học
  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa lớp học này không?"
      )
    ) {
      try {
        await axios.delete(`${API_URL}classes/${id}/`);

        alert("Xóa lớp học thành công!");

        if (editingId === id) {
          resetForm();
        }

        await loadData();
      } catch (error) {
        console.error("Lỗi khi xóa lớp học:", error);
        alert("Xóa thất bại!");
      }
    }
  };

  return (
    <div className="manage-classes">

      {/* HEADER */}
      <div className="manage-classes-header">
        <div>
          <div className="classes-eyebrow">
            <span className="classes-status-dot"></span>
            IRONPULSE MANAGEMENT
          </div>

          <h1 className="classes-page-title">
            QUẢN LÝ LỚP HỌC
          </h1>

          <p className="classes-page-subtitle">
            Quản lý các lớp tập luyện và huấn luyện viên phụ trách.
          </p>
        </div>

        <div className="classes-header-stats">
          <div className="classes-header-stat-icon">
            <Dumbbell size={22} />
          </div>

          <div>
            <span>TỔNG SỐ LỚP HỌC</span>
            <strong>{loading ? "..." : classes.length}</strong>
          </div>
        </div>
      </div>

      {/* FORM THÊM / CHỈNH SỬA */}
      <div
        className={`classes-panel ${
          editingId !== null ? "classes-editing-panel" : ""
        }`}
      >
        <div className="classes-panel-header">
          <div className="classes-panel-heading">
            <span className="classes-panel-icon">
              {editingId !== null ? (
                <Pencil size={19} />
              ) : (
                <Plus size={19} />
              )}
            </span>

            <div>
              <h2>
                {editingId !== null
                  ? "CHỈNH SỬA LỚP HỌC"
                  : "THÊM LỚP HỌC MỚI"}
              </h2>

              <p>
                {editingId !== null
                  ? `Đang chỉnh sửa lớp học #${editingId}`
                  : "Điền thông tin để tạo lớp tập luyện mới"}
              </p>
            </div>
          </div>

          <span className="classes-panel-tag">
            {editingId !== null ? "EDIT CLASS" : "NEW CLASS"}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="classes-form">
          <div className="classes-form-group">
            <label htmlFor="class-name">
              <BookOpen size={15} />
              TÊN LỚP HỌC
            </label>

            <input
              id="class-name"
              type="text"
              className="classes-input"
              placeholder="VD: Yoga Cơ Bản"
              value={formData.name}
              onChange={(e) =>
                handleChange("name", e.target.value)
              }
              required
            />
          </div>

          <div className="classes-form-group">
            <label htmlFor="class-trainer">
              <Users size={15} />
              HUẤN LUYỆN VIÊN
            </label>

            <select
              id="class-trainer"
              className="classes-input"
              value={formData.trainer}
              onChange={(e) =>
                handleChange("trainer", e.target.value)
              }
              required
            >
              <option value="">
                -- Chọn HLV từ hệ thống --
              </option>

              {trainers.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name} ({t.specialty})
                </option>
              ))}
            </select>
          </div>

          <div className="classes-form-group">
            <label htmlFor="class-schedule">
              <CalendarDays size={15} />
              LỊCH HỌC
            </label>

            <input
              id="class-schedule"
              type="text"
              className="classes-input"
              placeholder="VD: Thứ 2, 4, 6 - 08:00"
              value={formData.schedule}
              onChange={(e) =>
                handleChange("schedule", e.target.value)
              }
              required
            />
          </div>

          <div className="classes-form-action">
            <button
              type="submit"
              className="classes-submit-btn"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="classes-loader"></span>
                  ĐANG LƯU...
                </>
              ) : editingId !== null ? (
                <>
                  <Save size={17} />
                  LƯU THAY ĐỔI
                </>
              ) : (
                <>
                  <Plus size={17} />
                  THÊM LỚP HỌC
                </>
              )}
            </button>

            {editingId !== null && (
              <button
                type="button"
                className="classes-cancel-edit-btn"
                onClick={resetForm}
                disabled={saving}
              >
                <X size={17} />
                HỦY CHỈNH SỬA
              </button>
            )}
          </div>
        </form>
      </div>

      {/* DANH SÁCH LỚP HỌC */}
      <div className="classes-panel classes-list-panel">
        <div className="classes-panel-header">
          <div className="classes-panel-heading">
            <span className="classes-panel-icon">
              <Dumbbell size={19} />
            </span>

            <div>
              <h2>DANH SÁCH LỚP HỌC</h2>
              <p>
                Thông tin các lớp học hiện có trong hệ thống
              </p>
            </div>
          </div>

          <span className="classes-panel-tag">
            {classes.length} CLASSES
          </span>
        </div>

        <div className="classes-table-wrap">
          <table className="classes-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>TÊN LỚP HỌC</th>
                <th>HUẤN LUYỆN VIÊN</th>
                <th>LỊCH HỌC</th>
                <th className="classes-action-heading">
                  THAO TÁC
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5">
                    <div className="classes-table-state">
                      <div className="classes-loader"></div>
                      <span>Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : classes.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="classes-table-state">
                      <div className="classes-empty-icon">
                        <Dumbbell size={30} />
                      </div>

                      <strong>CHƯA CÓ LỚP HỌC</strong>

                      <span>
                        Hãy thêm lớp học mới bằng biểu mẫu phía trên.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                classes.map((c) => (
                  <tr
                    key={c.id}
                    className={
                      editingId === c.id
                        ? "classes-row-editing"
                        : ""
                    }
                  >
                    <td>
                      <span className="classes-id">
                        #{c.id}
                      </span>
                    </td>

                    <td>
                      <div className="classes-name-cell">
                        <span className="classes-name-icon">
                          <Dumbbell size={17} />
                        </span>

                        <strong>{c.name}</strong>
                      </div>
                    </td>

                    <td>
                      <div className="classes-trainer-cell">
                        <Users size={15} />
                        <span>{c.trainer}</span>
                      </div>
                    </td>

                    <td>
                      <div className="classes-schedule-cell">
                        <Clock size={15} />
                        <span>{c.schedule}</span>
                      </div>
                    </td>

                    <td className="classes-action-cell">
                      <div className="classes-actions">
                        <button
                          className="classes-edit-btn"
                          onClick={() => handleEdit(c)}
                          title="Chỉnh sửa lớp học"
                          disabled={saving}
                        >
                          <Pencil size={15} />
                          SỬA
                        </button>

                        <button
                          className="classes-delete-btn"
                          onClick={() => handleDelete(c.id)}
                          title="Xóa lớp học"
                          disabled={saving}
                        >
                          <Trash2 size={15} />
                          XÓA
                        </button>
                      </div>
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
