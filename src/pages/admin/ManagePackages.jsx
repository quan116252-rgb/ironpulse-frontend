import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Modal from "../../components/Modal";
import { getPackages, addPackage, updatePackage, deletePackage } from "../../services/memberService";
import { formatVND } from "../../data/mockData";

const EMPTY = { name: "", price: 0, durationMonths: 1, features: "" };

export default function ManagePackages() {
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [toDelete, setToDelete] = useState(null);

  const load = () => getPackages().then(setList);
  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    
    // Xử lý linh hoạt cả features lẫn description từ Django để không bị lỗi crash
    let featureText = "";
    const rawF = p.features !== undefined ? p.features : p.description;
    if (Array.isArray(rawF)) {
      featureText = rawF.join("\n");
    } else if (typeof rawF === "string") {
      featureText = rawF.replace(/,\s*/g, "\n");
    }

    setForm({ 
      name: p.name || "",
      price: p.price || 0,
      durationMonths: p.durationMonths !== undefined ? p.durationMonths : (p.duration_months || 1),
      features: featureText 
    });
    setOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    const data = {
      name: form.name,
      price: Number(form.price),
      durationMonths: Number(form.durationMonths),
      features: typeof form.features === "string" 
        ? form.features.split("\n").map((s) => s.trim()).filter(Boolean) 
        : form.features,
    };
    if (editing) await updatePackage(editing.id, data);
    else await addPackage(data);
    setOpen(false);
    load();
  };

  const remove = async () => {
    await deletePackage(toDelete.id);
    setToDelete(null);
    load();
  };

  return (
    <div>
      <div className="toolbar">
        <h1 className="page-title">Quản lý gói tập</h1>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Thêm gói
        </button>
      </div>

      <div className="panel table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Tên gói</th>
              <th>Giá</th>
              <th>Thời hạn</th>
              <th>Quyền lợi</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => {
              const duration = p.durationMonths !== undefined ? p.durationMonths : (p.duration_months || 1);
              const rawFeatures = p.features !== undefined ? p.features : (p.description || "");
              const featureDisplay = Array.isArray(rawFeatures) 
                ? rawFeatures.join(" · ") 
                : (typeof rawFeatures === "string" ? rawFeatures.split(",").join(" · ") : "Không có");

              return (
                <tr key={p.id}>
                  <td>{p.name || "Chưa có tên"}</td>
                  <td>{formatVND ? formatVND(p.price || 0) : `${Number(p.price || 0).toLocaleString()} đ`}</td>
                  <td>{duration} tháng</td>
                  <td>
                    <small>{featureDisplay}</small>
                  </td>
                  <td className="actions">
                    <button className="icon-btn" onClick={() => openEdit(p)} aria-label="Sửa">
                      <Pencil size={16} />
                    </button>
                    <button className="icon-btn danger" onClick={() => setToDelete(p)} aria-label="Xoá">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal open={open} title={editing ? "Sửa gói tập" : "Thêm gói tập"} onClose={() => setOpen(false)}>
        <form className="form" onSubmit={save}>
          <label>
            Tên gói
            <input 
              required 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
            />
          </label>
          <div className="row">
            <label>
              Giá (VNĐ)
              <input 
                type="number" 
                min="0" 
                required 
                value={form.price} 
                onChange={(e) => setForm({ ...form, price: e.target.value })} 
              />
            </label>
            <label>
              Số tháng
              <input 
                type="number" 
                min="1" 
                required 
                value={form.durationMonths} 
                onChange={(e) => setForm({ ...form, durationMonths: e.target.value })} 
              />
            </label>
          </div>
          <label>
            Quyền lợi (mỗi dòng một mục)
            <textarea 
              rows={4} 
              value={form.features} 
              onChange={(e) => setForm({ ...form, features: e.target.value })} 
            />
          </label>
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
        Xoá gói <strong>{toDelete?.name}</strong>?
      </Modal>
    </div>
  );
}