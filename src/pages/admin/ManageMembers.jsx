import { useEffect, useState } from "react";
import { Plus, Trash2, Search } from "lucide-react";
import Modal from "../../components/Modal";
import { getMembers, addMember, deleteMember } from "../../services/memberService";

const EMPTY = { fullName: "", email: "", phone: "", packageName: "Gói Chuẩn", startDate: "", endDate: "" };

export default function ManageMembers() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [toDelete, setToDelete] = useState(null);

  const load = () => getMembers().then(setList);
  useEffect(() => { load(); }, []);

  const filtered = list.filter((m) =>
    (m.fullName + m.email + m.phone + m.id).toLowerCase().includes(q.toLowerCase())
  );

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    await addMember(form);
    setOpen(false);
    setForm(EMPTY);
    load();
  };

  const remove = async () => {
    if (!toDelete) return;
    await deleteMember(toDelete.id);
    setToDelete(null);
    load();
  };

  return (
    <div>
      <div className="toolbar">
        <h1 className="page-title">Quản lý hội viên</h1>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>
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
                  <button className="icon-btn danger" onClick={() => setToDelete(m)} aria-label="Xoá">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="center muted">Không tìm thấy hội viên</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} title="Thêm hội viên mới" onClose={() => setOpen(false)}>
        <form className="form" onSubmit={save}>
          <label>Họ tên<input required value={form.fullName} onChange={set("fullName")} /></label>
          <label>Email<input type="email" required value={form.email} onChange={set("email")} /></label>
          <label>SĐT<input required value={form.phone} onChange={set("phone")} /></label>
          <label>Gói tập
            <select value={form.packageName} onChange={set("packageName")}>
              <option>Gói Chuẩn</option>
              <option>Gói VIP</option>
            </select>
          </label>
          <div className="row">
            <label>Bắt đầu<input type="date" required value={form.startDate} onChange={set("startDate")} /></label>
            <label>Kết thúc<input type="date" required value={form.endDate} onChange={set("endDate")} /></label>
          </div>
          <button className="btn btn-primary">Lưu</button>
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