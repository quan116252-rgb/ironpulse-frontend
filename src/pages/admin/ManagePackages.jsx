
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Package, Wallet, CalendarDays } from "lucide-react";
import Modal from "../../components/Modal";
import {
  getPackages,
  addPackage,
  updatePackage,
  deletePackage,
} from "../../services/memberService";
import { formatVND } from "../../data/mockData";

const EMPTY = {
  name: "",
  price: 0,
  durationMonths: 1,
  features: "",
};

export default function ManagePackages() {
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [toDelete, setToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getPackages();
      setList(data);
    } catch (error) {
      console.error("Lỗi tải danh sách gói tập:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);

    const rawF =
      p.features !== undefined ? p.features : p.description;

    let featureText = "";

    if (Array.isArray(rawF)) {
      featureText = rawF.join("\n");
    } else if (typeof rawF === "string") {
      featureText = rawF.replace(/,\s*/g, "\n");
    }

    setForm({
      name: p.name || "",
      price: p.price || 0,
      durationMonths:
        p.durationMonths !== undefined
          ? p.durationMonths
          : p.duration_months || 1,
      features: featureText,
    });

    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEditing(null);
    setForm(EMPTY);
  };

  const save = async (e) => {
    e.preventDefault();

    const data = {
      name: form.name,
      price: Number(form.price),
      durationMonths: Number(form.durationMonths),
      features:
        typeof form.features === "string"
          ? form.features
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean)
          : form.features,
    };

    try {
      setSaving(true);

      if (editing) {
        await updatePackage(editing.id, data);
      } else {
        await addPackage(data);
      }

      closeModal();
      await load();
    } catch (error) {
      console.error("Lỗi lưu gói tập:", error);
      alert("Không thể lưu gói tập. Vui lòng thử lại!");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!toDelete) return;

    try {
      await deletePackage(toDelete.id);
      setToDelete(null);
      await load();
    } catch (error) {
      console.error("Lỗi xóa gói tập:", error);
      alert("Không thể xóa gói tập. Vui lòng thử lại!");
    }
  };

  const getDuration = (p) =>
    p.durationMonths !== undefined
      ? p.durationMonths
      : p.duration_months || 1;

  const getFeatures = (p) => {
    const raw =
      p.features !== undefined ? p.features : p.description || "";

    if (Array.isArray(raw)) {
      return raw.length ? raw : [];
    }

    if (typeof raw === "string") {
      return raw
        .split(/[,;\n]/)
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  };

  const displayPrice = (price) =>
    formatVND
      ? formatVND(price || 0)
      : `${Number(price || 0).toLocaleString("vi-VN")} đ`;

  const totalRevenueValue = list.reduce(
    (total, p) => total + Number(p.price || 0),
    0
  );

  return (
    <div className="manage-packages">
      <div className="packages-header">
        <div>
          <h1 className="packages-title">Quản lý gói tập</h1>
          <p className="packages-subtitle">
            Quản lý các gói hội viên và quyền lợi tại IronPulse
          </p>
        </div>

        <button className="packages-add-btn" onClick={openAdd}>
          <Plus size={18} />
          Thêm gói tập
        </button>
      </div>

      {/* STATISTICS */}
      <div className="packages-stats">
        <div className="packages-stat-card">
          <div className="packages-stat-icon">
            <Package size={21} />
          </div>
          <div>
            <span>Tổng số gói tập</span>
            <strong>{list.length}</strong>
          </div>
        </div>

        <div className="packages-stat-card">
          <div className="packages-stat-icon">
            <Wallet size={21} />
          </div>
          <div>
            <span>Tổng giá trị các gói</span>
            <strong>{displayPrice(totalRevenueValue)}</strong>
          </div>
        </div>

        <div className="packages-stat-card">
          <div className="packages-stat-icon">
            <CalendarDays size={21} />
          </div>
          <div>
            <span>Thời hạn trung bình</span>
            <strong>
              {list.length
                ? (
                    list.reduce(
                      (total, p) => total + Number(getDuration(p)),
                      0
                    ) / list.length
                  ).toFixed(1)
                : 0}{" "}
              tháng
            </strong>
          </div>
        </div>
      </div>

      {/* PACKAGE TABLE */}
      <div className="packages-panel">
        <div className="packages-panel-header">
          <div>
            <h2>Danh sách gói tập</h2>
            <p>Thông tin chi tiết các gói dịch vụ</p>
          </div>

          <span className="packages-count">
            {list.length} gói tập
          </span>
        </div>

        <div className="packages-table-wrap">
          <table className="packages-table">
            <thead>
              <tr>
                <th>TÊN GÓI</th>
                <th>GIÁ GÓI</th>
                <th>THỜI HẠN</th>
                <th>QUYỀN LỢI</th>
                <th>THAO TÁC</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="packages-message">
                    Đang tải danh sách gói tập...
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan="5" className="packages-message">
                    Chưa có gói tập nào
                  </td>
                </tr>
              ) : (
                list.map((p) => {
                  const features = getFeatures(p);

                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="packages-name-cell">
                          <div className="packages-avatar">
                            <Package size={18} />
                          </div>
                          <div>
                            <strong>{p.name || "Chưa có tên"}</strong>
                            <span>Mã gói #{p.id}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="packages-price">
                          {displayPrice(p.price)}
                        </span>
                      </td>

                      <td>
                        <span className="packages-duration">
                          {getDuration(p)} tháng
                        </span>
                      </td>

                      <td>
                        <div className="packages-features">
                          {features.length ? (
                            features.slice(0, 3).map((feature, index) => (
                              <span key={index} className="packages-feature">
                                {feature}
                              </span>
                            ))
                          ) : (
                            <span className="packages-no-feature">
                              Chưa cập nhật
                            </span>
                          )}

                          {features.length > 3 && (
                            <span className="packages-more">
                              +{features.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <div className="packages-actions">
                          <button
                            className="packages-edit-btn"
                            onClick={() => openEdit(p)}
                            aria-label="Sửa gói tập"
                            title="Sửa gói tập"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            className="packages-delete-btn"
                            onClick={() => setToDelete(p)}
                            aria-label="Xóa gói tập"
                            title="Xóa gói tập"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      <Modal
        open={open}
        title={editing ? "Chỉnh sửa gói tập" : "Thêm gói tập mới"}
        onClose={closeModal}
      >
        <form
          className="form packages-modal-form"
          onSubmit={save}
        >
          <label>
            Tên gói tập
            <input
              required
              placeholder="Nhập tên gói tập"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />
          </label>

          <div className="row">
            <label>
              Giá gói (VNĐ)
              <input
                type="number"
                min="0"
                required
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: e.target.value })
                }
              />
            </label>

            <label>
              Thời hạn (tháng)
              <input
                type="number"
                min="1"
                required
                value={form.durationMonths}
                onChange={(e) =>
                  setForm({ ...form, durationMonths: e.target.value })
                }
              />
            </label>
          </div>

          <label>
            Quyền lợi
            <textarea
              rows={5}
              placeholder={"Mỗi dòng là một quyền lợi\nVí dụ: Tập gym không giới hạn"}
              value={form.features}
              onChange={(e) =>
                setForm({ ...form, features: e.target.value })
              }
            />
          </label>

          <div className="packages-modal-actions">
            <button
              type="button"
              className="packages-cancel-btn"
              onClick={closeModal}
            >
              Hủy
            </button>

            <button
              type="submit"
              className="packages-submit-btn"
              disabled={saving}
            >
              {saving
                ? "Đang lưu..."
                : editing
                  ? "Cập nhật gói tập"
                  : "Thêm gói tập"}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION */}
      <Modal
        open={!!toDelete}
        title="Xác nhận xóa gói tập"
        onClose={() => setToDelete(null)}
        footer={
          <>
            <button
              className="packages-cancel-btn"
              onClick={() => setToDelete(null)}
            >
              Hủy
            </button>

            <button
              className="packages-confirm-delete-btn"
              onClick={remove}
            >
              <Trash2 size={15} />
              Xóa gói tập
            </button>
          </>
        }
      >
        <div className="packages-delete-content">
          Bạn có chắc chắn muốn xóa gói tập{" "}
          <strong>{toDelete?.name}</strong> không?
          <p>Thao tác này không thể hoàn tác.</p>
        </div>
      </Modal>
    </div>
  );
}
