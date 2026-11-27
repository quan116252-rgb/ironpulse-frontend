
import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Users,
  Dumbbell,
  BriefcaseBusiness,
  Phone,
  Pencil,
} from "lucide-react";

import Modal from "../../components/Modal";

import {
  getTrainers,
  addTrainer,
  updateTrainer,
  deleteTrainer,
} from "../../services/memberService";

const EMPTY = {
  name: "",
  specialty: "",
  experience_years: 1,
  phone: "",
};

export default function ManageTrainers() {
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Tải danh sách huấn luyện viên
  const load = async () => {
    try {
      setLoading(true);
      const data = await getTrainers();
      setList(data);
    } catch (error) {
      console.error("Lỗi tải danh sách huấn luyện viên:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Mở modal thêm mới
  const openAddModal = () => {
    setEditingId(null);
    setForm({ ...EMPTY });
    setOpen(true);
  };

  // Mở modal chỉnh sửa
  const openEditModal = (trainer) => {
    setEditingId(trainer.id);

    setForm({
      name: trainer.name || "",
      specialty: trainer.specialty || "",
      experience_years: trainer.experience_years ?? 1,
      phone: trainer.phone || "",
    });

    setOpen(true);
  };

  // Đóng modal
  const closeModal = () => {
    setOpen(false);
    setEditingId(null);
    setForm({ ...EMPTY });
  };

  // Thêm hoặc cập nhật huấn luyện viên
  const save = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        specialty: form.specialty.trim(),
        experience_years: Number(form.experience_years),
        phone: form.phone.trim(),
      };

      if (editingId !== null) {
        await updateTrainer(editingId, payload);
        alert("Cập nhật thông tin huấn luyện viên thành công!");
      } else {
        await addTrainer(payload);
        alert("Thêm huấn luyện viên thành công!");
      }

      closeModal();
      await load();
    } catch (error) {
      console.error("Lỗi lưu huấn luyện viên:", error);
      alert(
        editingId !== null
          ? "Không thể cập nhật huấn luyện viên. Vui lòng thử lại!"
          : "Không thể thêm huấn luyện viên. Vui lòng thử lại!"
      );
    } finally {
      setSaving(false);
    }
  };

  // Xóa huấn luyện viên
  const remove = async (id) => {
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa huấn luyện viên này?"
    );

    if (!confirmed) return;

    try {
      await deleteTrainer(id);
      await load();
    } catch (error) {
      console.error("Lỗi xóa huấn luyện viên:", error);
      alert("Không thể xóa huấn luyện viên. Vui lòng thử lại!");
    }
  };

  // Cập nhật dữ liệu form
  const updateForm = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="manage-trainers">
      {/* HEADER */}
      <div className="trainers-header">
        <div>
          <h1 className="trainers-title">
            Quản lý huấn luyện viên
          </h1>

          <p className="trainers-subtitle">
            Quản lý thông tin và đội ngũ huấn luyện viên của IronPulse
          </p>
        </div>

        <button
          className="trainers-add-btn"
          onClick={openAddModal}
        >
          <Plus size={18} />
          Thêm huấn luyện viên
        </button>
      </div>

      {/* THỐNG KÊ */}
      <div className="trainers-stats">
        <div className="trainers-stat-card">
          <div className="trainers-stat-icon">
            <Users size={21} />
          </div>

          <div>
            <span>Tổng huấn luyện viên</span>
            <strong>{list.length}</strong>
          </div>
        </div>

        <div className="trainers-stat-card">
          <div className="trainers-stat-icon">
            <Dumbbell size={21} />
          </div>

          <div>
            <span>Chuyên môn</span>
            <strong>
              {new Set(
                list.map((t) => t.specialty).filter(Boolean)
              ).size}
            </strong>
          </div>
        </div>

        <div className="trainers-stat-card">
          <div className="trainers-stat-icon">
            <BriefcaseBusiness size={21} />
          </div>

          <div>
            <span>Tổng năm kinh nghiệm</span>
            <strong>
              {list.reduce(
                (total, t) =>
                  total + Number(t.experience_years || 0),
                0
              )}
            </strong>
          </div>
        </div>
      </div>

      {/* DANH SÁCH */}
      <div className="trainers-panel">
        <div className="trainers-panel-header">
          <div>
            <h2>Danh sách huấn luyện viên</h2>
            <p>Thông tin chi tiết đội ngũ huấn luyện viên</p>
          </div>

          <span className="trainers-count">
            {list.length} huấn luyện viên
          </span>
        </div>

        <div className="trainers-table-wrap">
          <table className="trainers-table">
            <thead>
              <tr>
                <th>MÃ HLV</th>
                <th>HỌ VÀ TÊN</th>
                <th>CHUYÊN MÔN</th>
                <th>KINH NGHIỆM</th>
                <th>SỐ ĐIỆN THOẠI</th>
                <th>THAO TÁC</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="trainers-message">
                    Đang tải danh sách huấn luyện viên...
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan="6" className="trainers-message">
                    Chưa có huấn luyện viên nào
                  </td>
                </tr>
              ) : (
                list.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <span className="trainers-id">
                        #{t.id}
                      </span>
                    </td>

                    <td>
                      <div className="trainers-name-cell">
                        <div className="trainers-avatar">
                          {t.name?.charAt(0)?.toUpperCase() || "H"}
                        </div>

                        <strong>{t.name}</strong>
                      </div>
                    </td>

                    <td>
                      <span className="trainers-specialty">
                        {t.specialty || "Chưa cập nhật"}
                      </span>
                    </td>

                    <td>
                      <span className="trainers-experience">
                        {t.experience_years} năm
                      </span>
                    </td>

                    <td>
                      <div className="trainers-phone">
                        <Phone size={14} />
                        {t.phone || "Chưa cập nhật"}
                      </div>
                    </td>

                    <td>
                      <div className="trainers-actions">
                        <button
                          className="trainers-edit-btn"
                          onClick={() => openEditModal(t)}
                          aria-label="Chỉnh sửa huấn luyện viên"
                          title="Chỉnh sửa huấn luyện viên"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          className="trainers-delete-btn"
                          onClick={() => remove(t.id)}
                          aria-label="Xóa huấn luyện viên"
                          title="Xóa huấn luyện viên"
                        >
                          <Trash2 size={17} />
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

      {/* MODAL THÊM / CHỈNH SỬA */}
      <Modal
        open={open}
        title={
          editingId !== null
            ? "Chỉnh sửa huấn luyện viên"
            : "Thêm huấn luyện viên"
        }
        onClose={closeModal}
      >
        <form
          className="form trainers-modal-form"
          onSubmit={save}
        >
          <label>
            Họ và tên
            <input
              required
              placeholder="Nhập họ và tên"
              value={form.name}
              onChange={(e) =>
                updateForm("name", e.target.value)
              }
            />
          </label>

          <label>
            Chuyên môn
            <input
              required
              placeholder="Ví dụ: Gym, Yoga, Boxing..."
              value={form.specialty}
              onChange={(e) =>
                updateForm("specialty", e.target.value)
              }
            />
          </label>

          <div className="row">
            <label>
              Kinh nghiệm (năm)
              <input
                type="number"
                min="0"
                required
                value={form.experience_years}
                onChange={(e) =>
                  updateForm("experience_years", e.target.value)
                }
              />
            </label>

            <label>
              Số điện thoại
              <input
                required
                type="tel"
                placeholder="Nhập số điện thoại"
                value={form.phone}
                onChange={(e) =>
                  updateForm("phone", e.target.value)
                }
              />
            </label>
          </div>

          <div className="trainers-modal-actions">
            <button
              type="button"
              className="trainers-cancel-btn"
              onClick={closeModal}
              disabled={saving}
            >
              Hủy
            </button>

            <button
              type="submit"
              className="trainers-submit-btn"
              disabled={saving}
            >
              {saving
                ? "Đang lưu..."
                : editingId !== null
                  ? "Lưu thay đổi"
                  : "Lưu huấn luyện viên"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
