import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Users,
  Mail,
  Phone,
  CalendarDays,
  X,
  UserRound,
} from "lucide-react";

import Modal from "../../components/Modal";

import {
  getMembers,
  addMember,
  updateMember,
  deleteMember,
} from "../../services/memberService";

const EMPTY = {
  fullName: "",
  email: "",
  phone: "",
  packageName: "Gói Chuẩn",
  startDate: "",
  endDate: "",
};

export default function ManageMembers() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [toDelete, setToDelete] = useState(null);

  const load = () => getMembers().then(setList);

  useEffect(() => {
    load();
  }, []);

  const filtered = list.filter((m) =>
    `${m.fullName || ""}${m.email || ""}${m.phone || ""}${m.id || ""}`
      .toLowerCase()
      .includes(q.toLowerCase())
  );

  const set = (k) => (e) =>
    setForm({ ...form, [k]: e.target.value });

  const openAdd = () => {
    setEditingMember(null);
    setForm(EMPTY);
    setOpen(true);
  };

  const openEdit = (member) => {
    setEditingMember(member);

    setForm({
      fullName:
        member.fullName === "Chưa cập nhật"
          ? ""
          : member.fullName || "",
      email: member.email || "",
      phone:
        member.phone === "Chưa cập nhật"
          ? ""
          : member.phone || "",
      packageName: member.packageName || "Gói Chuẩn",
      startDate: member.startDate || "",
      endDate: member.endDate || "",
    });

    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEditingMember(null);
    setForm(EMPTY);
  };

  const save = async (e) => {
    e.preventDefault();

    try {
      if (editingMember) {
        await updateMember(
          editingMember.realId || editingMember.id,
          form
        );
      } else {
        await addMember(form);
      }

      closeModal();
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const remove = async () => {
    if (!toDelete) return;

    try {
      await deleteMember(toDelete.realId || toDelete.id);
      setToDelete(null);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const activeCount = list.filter(
    (m) => m.status === "Active"
  ).length;

  const expiredCount = list.length - activeCount;

  return (
    <div className="manage-members">
      {/* HEADER */}
      <div className="members-header">
        <div>
          <div className="members-eyebrow">
            <span className="members-status-dot"></span>
            IRONPULSE MANAGEMENT
          </div>

          <h1 className="members-page-title">
            QUẢN LÝ HỘI VIÊN
          </h1>

          <p className="members-page-subtitle">
            Quản lý thông tin, gói tập và thời hạn thành viên.
          </p>
        </div>

        <button
          className="members-add-btn"
          onClick={openAdd}
        >
          <Plus size={18} />
          THÊM HỘI VIÊN
        </button>
      </div>

      {/* STATISTICS */}
      <div className="members-stats-grid">
        <div className="members-stat-card">
          <div className="members-stat-icon">
            <Users size={22} />
          </div>

          <div>
            <span>TỔNG HỘI VIÊN</span>
            <strong>{list.length}</strong>
          </div>
        </div>

        <div className="members-stat-card">
          <div className="members-stat-icon">
            <UserRound size={22} />
          </div>

          <div>
            <span>ĐANG HOẠT ĐỘNG</span>
            <strong>{activeCount}</strong>
          </div>
        </div>

        <div className="members-stat-card">
          <div className="members-stat-icon">
            <CalendarDays size={22} />
          </div>

          <div>
            <span>ĐÃ HẾT HẠN</span>
            <strong>{expiredCount}</strong>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="members-toolbar">
        <div className="members-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Tìm theo tên, email, SĐT, mã hội viên..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          {q && (
            <button
              type="button"
              className="members-clear-search"
              onClick={() => setQ("")}
              title="Xóa tìm kiếm"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <span className="members-result-count">
          {filtered.length} / {list.length} HỘI VIÊN
        </span>
      </div>

      {/* TABLE */}
      <div className="members-table-panel">
        <div className="members-table-header">
          <div>
            <h2>DANH SÁCH HỘI VIÊN</h2>
            <p>Thông tin thành viên trong hệ thống IronPulse</p>
          </div>

          <span className="members-table-tag">
            MEMBERS
          </span>
        </div>

        <div className="members-table-wrap">
          <table className="members-table">
            <thead>
              <tr>
                <th>MÃ</th>
                <th>HỘI VIÊN</th>
                <th>LIÊN HỆ</th>
                <th>GÓI TẬP</th>
                <th>THỜI HẠN</th>
                <th>TRẠNG THÁI</th>
                <th className="members-action-heading">
                  THAO TÁC
                </th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((m) => (
                <tr key={m.id}>
                  <td>
                    <span className="members-id">
                      #{m.id}
                    </span>
                  </td>

                  <td>
                    <div className="members-name-cell">
                      <div className="members-avatar">
                        <UserRound size={18} />
                      </div>

                      <strong>{m.fullName}</strong>
                    </div>
                  </td>

                  <td>
                    <div className="members-contact-cell">
                      <div>
                        <Mail size={13} />
                        <span>{m.email}</span>
                      </div>

                      <div>
                        <Phone size={13} />
                        <span>{m.phone}</span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="members-package">
                      {m.packageName}
                    </span>
                  </td>

                  <td>
                    <div className="members-date-cell">
                      <span>{m.startDate || "—"}</span>
                      <span className="members-date-arrow">→</span>
                      <span>{m.endDate || "—"}</span>
                    </div>
                  </td>

                  <td>
                    <span
                      className={`members-status ${
                        m.status === "Active"
                          ? "is-active"
                          : "is-expired"
                      }`}
                    >
                      <span></span>
                      {m.status === "Active"
                        ? "CÒN HẠN"
                        : "HẾT HẠN"}
                    </span>
                  </td>

                  <td className="members-action-cell">
                    <div className="members-action-buttons">
                      <button
                        className="members-edit-btn"
                        onClick={() => openEdit(m)}
                        title="Sửa hội viên"
                        aria-label="Sửa hội viên"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        className="members-delete-btn"
                        onClick={() => setToDelete(m)}
                        title="Xóa hội viên"
                        aria-label="Xóa hội viên"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="members-empty">
                      <Users size={34} />
                      <strong>KHÔNG TÌM THẤY HỘI VIÊN</strong>
                      <span>
                        Thử thay đổi từ khóa tìm kiếm hoặc thêm hội viên mới.
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      <Modal
        open={open}
        title={
          editingMember
            ? `Chỉnh sửa hội viên (${editingMember.id})`
            : "Thêm hội viên mới"
        }
        onClose={closeModal}
      >
        <form className="form members-modal-form" onSubmit={save}>
          <label>
            <span>HỌ VÀ TÊN</span>
            <input
              required
              placeholder="Nhập họ và tên"
              value={form.fullName}
              onChange={set("fullName")}
            />
          </label>

          <label>
            <span>EMAIL</span>
            <input
              type="email"
              required
              placeholder="example@gmail.com"
              value={form.email}
              onChange={set("email")}
            />
          </label>

          <label>
            <span>SỐ ĐIỆN THOẠI</span>
            <input
              required
              placeholder="Nhập số điện thoại"
              value={form.phone}
              onChange={set("phone")}
            />
          </label>

          <label>
            <span>GÓI TẬP</span>
            <select
              value={form.packageName}
              onChange={set("packageName")}
            >
              <option value="Gói Chuẩn">Gói Chuẩn</option>
              <option value="Gói Chuẩn (Basic Gym)">
                Gói Chuẩn (Basic Gym)
              </option>
              <option value="Gói VIP">Gói VIP</option>

              {form.packageName &&
                ![
                  "Gói Chuẩn",
                  "Gói Chuẩn (Basic Gym)",
                  "Gói VIP",
                ].includes(form.packageName) && (
                  <option value={form.packageName}>
                    {form.packageName}
                  </option>
                )}
            </select>
          </label>

          <div className="row">
            <label>
              <span>NGÀY BẮT ĐẦU</span>
              <input
                type="date"
                required
                value={form.startDate}
                onChange={set("startDate")}
              />
            </label>

            <label>
              <span>NGÀY KẾT THÚC</span>
              <input
                type="date"
                required
                value={form.endDate}
                onChange={set("endDate")}
              />
            </label>
          </div>

          <button className="btn btn-primary members-modal-submit">
            {editingMember ? "CẬP NHẬT HỘI VIÊN" : "LƯU HỘI VIÊN"}
          </button>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION */}
      <Modal
        open={!!toDelete}
        title="Xác nhận xóa hội viên"
        onClose={() => setToDelete(null)}
        footer={
          <>
            <button
              className="btn btn-ghost"
              onClick={() => setToDelete(null)}
            >
              HỦY
            </button>

            <button
              className="btn btn-danger"
              onClick={remove}
            >
              <Trash2 size={15} />
              XÓA HỘI VIÊN
            </button>
          </>
        }
      >
        Bạn có chắc muốn xóa hội viên{" "}
        <strong>{toDelete?.fullName}</strong>?
      </Modal>
    </div>
  );
}