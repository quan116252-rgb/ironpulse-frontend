import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import Modal from "../../components/Modal";
import { getMembers, addMember, updateMember, deleteMember } from "../../services/memberService";

const EMPTY = { fullName: "", email: "", phone: "", packageName: "Gói Chuẩn", startDate: "", endDate: "" };

export default function ManageMembers() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [toDelete, setToDelete] = useState(null);

  const load = () => getMembers().then(setList);
  useEffect(() => { load(); }, []);

  const filtered = list.filter((m) =>
    (m.fullName + m.email + m.phone + m.id).toLowerCase().includes(q.toLowerCase())
  );

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const openAdd = () => {
    setEditingMember(null);
    setForm(EMPTY);
    setOpen(true);
  };

  const openEdit = (member) => {
    setEditingMember(member);
    setForm({
      fullName: member.fullName === "Chưa cập nhật" ? "" : (member.fullName || ""),
      email: member.email || "",
      phone: member.phone === "Chưa cập nhật" ? "" : (member.phone || ""),
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
        await updateMember(editingMember.realId || editingMember.id, form);
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

  return (
    <div>
      <div className="toolbar">
        <h1 className="page-title">Quản lý hội viên</h1>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Thêm hội viên
        </button>
      </div>

      <div className="search">
        <Search size={16} />
        <input placeholder="Tìm theo tên, email, SĐT, mã..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="panel table-wrap">
        <table className="table">
          <thead>
            <tr><th>Mã</th><th>Họ tên</th><th>Liên hệ</th><th>Gói</th><th>Thời hạn</th><th>Trạng thái</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id}>
                <td>{m.id}</td>
                <td>{m.fullName}</td>
                <td>{m.email}<br /><small className="muted">{m.phone}</small></td>
                <td>{m.packageName}</td>
                <td>{m.startDate} → {m.endDate}</td>
                <td><span className={"badge badge-" + m.status.toLowerCase()}>{m.status === "Active" ? "Còn hạn" : "Hết hạn"}</span></td>
                <td>
                  <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                    <button className="icon-btn" onClick={() => openEdit(m)} aria-label="Sửa" title="Sửa hội viên">
                      <Pencil size={16} />
                    </button>
                    <button className="icon-btn danger" onClick={() => setToDelete(m)} aria-label="Xoá" title="Xoá hội viên">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="center muted">Không tìm thấy hội viên</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} title={editingMember ? `Chỉnh sửa hội viên (${editingMember.id})` : "Thêm hội viên mới"} onClose={closeModal}>
        <form className="form" onSubmit={save}>
          <label>Họ tên<input required value={form.fullName} onChange={set("fullName")} /></label>
          <label>Email<input type="email" required value={form.email} onChange={set("email")} /></label>
          <label>SĐT<input required value={form.phone} onChange={set("phone")} /></label>
          <label>Gói tập
            <select value={form.packageName} onChange={set("packageName")}>
              <option value="Gói Chuẩn">Gói Chuẩn</option>
              <option value="Gói Chuẩn (Basic Gym)">Gói Chuẩn (Basic Gym)</option>
              <option value="Gói VIP">Gói VIP</option>
              {form.packageName && !["Gói Chuẩn", "Gói Chuẩn (Basic Gym)", "Gói VIP"].includes(form.packageName) && (
                <option value={form.packageName}>{form.packageName}</option>
              )}
            </select>
          </label>
          <div className="row">
            <label>Bắt đầu<input type="date" required value={form.startDate} onChange={set("startDate")} /></label>
            <label>Kết thúc<input type="date" required value={form.endDate} onChange={set("endDate")} /></label>
          </div>
          <button className="btn btn-primary">{editingMember ? "Cập nhật" : "Lưu"}</button>
        </form>
      </Modal>

      <Modal
        open={!!toDelete}
        title="Xác nhận xoá"
        onClose={() => setToDelete(null)}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setToDelete(null)}>Huỷ</button>
            <button className="btn btn-danger" onClick={remove}>Xoá</button>
          </>
        }
      >
        Bạn có chắc muốn xoá hội viên <strong>{toDelete?.fullName}</strong>?
      </Modal>
    </div>
  );
}