import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getMembers, getClassRegistrations } from "../../services/memberService";
import { CreditCard } from "lucide-react";

export default function PaymentHistory() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const membersList = await getMembers();
        const found = (membersList || []).find(
          (m) => m.email === user?.email || (user?.phone && m.phone === user?.phone)
        );

        let list = [];

        if (found && found.packageName && found.packageName !== "Chưa đăng ký gói") {
          const isVip = found.packageName.toUpperCase().includes("VIP");
          list.push({
            id: `INV-PKG-${found.id || '01'}`,
            title: `Đăng ký gói: ${found.packageName}`,
            amount: isVip ? 1200000 : 500000,
            date: found.startDate || "Hôm nay",
            method: "Chuyển khoản / Tiền mặt",
            status: "SUCCESS"
          });

          // Nếu là gói Basic, tổng hợp thêm học phí các lớp đặt lẻ đã được duyệt
          if (found.phone) {
            const regs = await getClassRegistrations(found.phone);
            (regs || []).forEach((r) => {
              if (r.status === "APPROVED" && !isVip) {
                list.push({
                  id: `INV-CLS-${r.id}`,
                  title: `Học phí lớp: ${r.className}`,
                  amount: 300000,
                  date: "Trong tháng",
                  method: "Trừ tài khoản / Tiền mặt",
                  status: "SUCCESS"
                });
              }
            });
          }
        }

        setPayments(list);
      } catch (error) {
        console.error("Lỗi khi tải lịch sử thanh toán:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user]);

  if (loading) {
    return <div style={{ padding: "20px" }}>Đang tải lịch sử thanh toán...</div>;
  }

  return (
    <div>
      <div className="toolbar" style={{ marginBottom: "20px" }}>
        <h1 className="page-title">Lịch sử thanh toán</h1>
      </div>

      <div className="panel">
        <h3>Danh sách hóa đơn giao dịch</h3>

        {payments.length === 0 ? (
          <p className="muted" style={{ padding: "16px 0" }}>
            Chưa phát sinh giao dịch hoặc tài khoản chưa đăng ký gói tập nào.
          </p>
        ) : (
          <div className="table-wrap" style={{ marginTop: "12px" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Mã hóa đơn</th>
                  <th>Nội dung thanh toán</th>
                  <th>Số tiền</th>
                  <th>Hình thức</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td><strong>{p.id}</strong></td>
                    <td>{p.title}</td>
                    <td style={{ fontWeight: "bold", color: "#ea580c" }}>
                      {p.amount.toLocaleString()} VNĐ
                    </td>
                    <td>{p.method}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: "#ecfdf5", color: "#047857", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 600 }}>
                        ✓ Thành công
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}