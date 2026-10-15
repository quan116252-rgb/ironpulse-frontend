import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Modal from "../../components/Modal";
import { getTrainers, addTrainer, deleteTrainer } from "../../services/memberService";

const EMPTY = { name: "", specialty: "", experience_years: 1, phone: "" };

export default function ManageTrainers() {
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const load = () => getTrainers().then(setList);
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    await addTrainer({ ...form, experience_years: Number(form.experience_years) });
    setOpen(false);
    setForm(EMPTY);
    load();
  };

  const remove = async (id) => {
    await deleteTrainer(id);
    load();
  };

  return (
    <div>
      <div className="toolbar">
        <h1 className="page-title">Quản lý huấn luyện viên</h1>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>
          <Plus size={16} /> Thêm HLV
        </button>
      </div>

      <div className="panel table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Mã</th>
              <th>Họ tên</th>
              <th>Chuyên môn</th>
              <th>Kinh nghiệm</th>
              <th>SĐT</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((t) => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>{t.name}</td>
                <td>{t.specialty || "Chưa cập nhật"}</td>
                <td>{t.experience_years} năm</td>
                <td>{t.phone}</td>
                <td>
                  <button 
                    className="icon-btn danger" 
                    onClick={() => remove(t.id)} 
                    aria-label="Xoá"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} title="Thêm huấn luyện viên" onClose={() => setOpen(false)}>
        <form className="form" onSubmit={save}>
          <label>
            Họ tên
            <input 
              required 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
            />
          </label>
          <label>
            Chuyên môn
            <input 
              required 
              value={form.specialty} 
              onChange={(e) => setForm({ ...form, specialty: e.target.value })} 
            />
          </label>
          <div className="row">
            <label>
              Kinh nghiệm (năm)
              <input 
                type="number" 
                min="0" 
                value={form.experience_years} 
                onChange={(e) => setForm({ ...form, experience_years: e.target.value })} 
              />
            </label>
            <label>
              SĐT
              <input 
                required 
                value={form.phone} 
                onChange={(e) => setForm({ ...form, phone: e.target.value })} 
              />
            </label>
          </div>
          <button className="btn btn-primary">Lưu</button>
        </form>
      </Modal>
    </div>
  );
}