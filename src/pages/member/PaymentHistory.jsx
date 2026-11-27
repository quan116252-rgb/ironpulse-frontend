import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getMembers,
  getClassRegistrations
} from "../../services/memberService";

import {
  CreditCard,
  ReceiptText,
  CircleCheck,
  Wallet,
  CalendarDays,
  ArrowUpRight,
  Dumbbell,
  Clock3,
  FileText
} from "lucide-react";

export default function PaymentHistory() {
  const { user } = useAuth();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const membersList = await getMembers();

        const found = (membersList || []).find(
          (m) =>
            m.email === user?.email ||
            (user?.phone && m.phone === user?.phone)
        );

        let list = [];

        if (
          found &&
          found.packageName &&
          found.packageName !== "Chưa đăng ký gói"
        ) {
          const isVip = found.packageName.toUpperCase().includes("VIP");

          list.push({
            id: `INV-PKG-${found.id || "01"}`,
            title: `Đăng ký gói: ${found.packageName}`,
            amount: isVip ? 1200000 : 500000,
            date: found.startDate || "Hôm nay",
            method: "Chuyển khoản / Tiền mặt",
            status: "SUCCESS",
            type: "package"
          });

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
                  status: "SUCCESS",
                  type: "class"
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

  const totalAmount = payments.reduce(
    (total, payment) => total + payment.amount,
    0
  );

  const formatMoney = (amount) =>
    amount.toLocaleString("vi-VN") + " ₫";

  if (loading) {
    return (
      <div className="ph-loading">
        <div className="ph-spinner"></div>
        <p>Đang tải lịch sử thanh toán...</p>

        <style>{`
          .ph-loading {
            min-height: 350px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            color: #aaa;
            background: #101010;
            border-radius: 16px;
          }
          .ph-spinner {
            width: 38px;
            height: 38px;
            border: 3px solid #333;
            border-top-color: #e31824;
            border-radius: 50%;
            animation: ph-spin 0.8s linear infinite;
          }
          @keyframes ph-spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="payment-history">
      <style>{`
        .payment-history {
          color: #fff;
          width: 100%;
          min-height: 100%;
          font-family: inherit;
        }

        .ph-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }

        .ph-heading {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .ph-heading-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(227, 24, 36, 0.14);
          color: #ff303c;
          border: 1px solid rgba(227, 24, 36, 0.25);
        }

        .ph-heading h1 {
          font-size: 27px;
          font-weight: 800;
          margin: 0 0 6px;
          color: #ef1a1a;
          letter-spacing: -0.5px;
        }

        .ph-heading p {
          margin: 0;
          color: #858585;
          font-size: 13px;
        }

        .ph-total-label {
          color: #999;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 700;
          margin-bottom: 7px;
        }

        .ph-total-value {
          color: #ff3945;
          font-size: 24px;
          font-weight: 800;
        }

        .ph-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 25px;
        }

        .ph-stat-card {
          background: linear-gradient(145deg, #1b1b1b, #111);
          border: 1px solid #292929;
          border-radius: 15px;
          padding: 21px;
          display: flex;
          align-items: center;
          gap: 15px;
          min-width: 0;
          transition: 0.25s ease;
        }

        .ph-stat-card:hover {
          border-color: #a51a22;
          transform: translateY(-3px);
        }

        .ph-stat-icon {
          width: 45px;
          height: 45px;
          flex-shrink: 0;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(227, 24, 36, 0.13);
          color: #ff3945;
        }

        .ph-stat-card span {
          display: block;
          color: #858585;
          font-size: 12px;
          margin-bottom: 7px;
        }

        .ph-stat-card strong {
          font-size: 21px;
          color: #fff;
          font-weight: 800;
        }

        .ph-panel {
          background: #141414;
          border: 1px solid #292929;
          border-radius: 16px;
          overflow: hidden;
        }

        .ph-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 22px 24px;
          border-bottom: 1px solid #292929;
        }

        .ph-panel-title {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .ph-panel-title h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 750;
          color: #fff;
        }

        .ph-panel-title svg {
          color: #ff3945;
        }

        .ph-count {
          background: #272727;
          border: 1px solid #383838;
          color: #ccc;
          padding: 6px 11px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
        }

        .ph-table-wrap {
          width: 100%;
          overflow-x: auto;
        }

        .ph-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 750px;
        }

        .ph-table thead {
          background: #1b1b1b;
        }

        .ph-table th {
          text-align: left;
          padding: 16px 20px;
          color: #888;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.7px;
          font-weight: 750;
          white-space: nowrap;
        }

        .ph-table td {
          padding: 18px 20px;
          border-top: 1px solid #262626;
          color: #d0d0d0;
          font-size: 13px;
          vertical-align: middle;
        }

        .ph-table tbody tr {
          transition: background 0.2s ease;
        }

        .ph-table tbody tr:hover {
          background: #1e1e1e;
        }

        .ph-invoice-id {
          color: #ff4650;
          font-weight: 750;
          font-size: 12px;
          white-space: nowrap;
        }

        .ph-content {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 220px;
        }

        .ph-content-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #292020;
          color: #ff3945;
          flex-shrink: 0;
        }

        .ph-content strong {
          color: #f0f0f0;
          font-weight: 650;
          line-height: 1.5;
        }

        .ph-amount {
          color: #ff3945 !important;
          font-weight: 800 !important;
          white-space: nowrap;
          font-size: 14px !important;
        }

        .ph-method {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #aaa;
          white-space: nowrap;
        }

        .ph-date {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #aaa;
          white-space: nowrap;
        }

        .ph-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #48d597;
          background: rgba(30, 190, 120, 0.10);
          border: 1px solid rgba(30, 190, 120, 0.22);
          border-radius: 30px;
          padding: 7px 10px;
          font-size: 11px;
          font-weight: 750;
          white-space: nowrap;
        }

        .ph-empty {
          padding: 65px 20px;
          text-align: center;
        }

        .ph-empty-icon {
          width: 65px;
          height: 65px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 18px;
          border-radius: 18px;
          background: #252020;
          color: #e31824;
        }

        .ph-empty h3 {
          margin: 0 0 9px;
          color: #fff;
          font-size: 17px;
        }

        .ph-empty p {
          color: #858585;
          font-size: 13px;
          margin: 0;
          line-height: 1.6;
        }

        .ph-footer {
          padding: 16px 22px;
          border-top: 1px solid #292929;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          color: #777;
          font-size: 12px;
        }

        .ph-footer strong {
          color: #ddd;
        }

        @media (max-width: 768px) {
          .ph-stats {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .ph-heading h1 {
            font-size: 22px;
          }

          .ph-total {
            width: 100%;
          }

          .ph-panel-header {
            padding: 17px;
          }

          .ph-footer {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>

      {/* HEADER */}
      <div className="ph-header">
        <div className="ph-heading">
          <div className="ph-heading-icon">
            <ReceiptText size={25} />
          </div>

          <div>
            <h1>Lịch sử thanh toán</h1>
            <p>Quản lý và theo dõi các giao dịch của bạn</p>
          </div>
        </div>

        {payments.length > 0 && (
          <div className="ph-total">
            <div className="ph-total-label">
              Tổng chi tiêu
            </div>
            <div className="ph-total-value">
              {formatMoney(totalAmount)}
            </div>
          </div>
        )}
      </div>

      {/* STATISTICS */}
      <div className="ph-stats">
        <div className="ph-stat-card">
          <div className="ph-stat-icon">
            <ReceiptText size={22} />
          </div>
          <div>
            <span>Tổng hóa đơn</span>
            <strong>{payments.length}</strong>
          </div>
        </div>

        <div className="ph-stat-card">
          <div className="ph-stat-icon">
            <CircleCheck size={22} />
          </div>
          <div>
            <span>Giao dịch thành công</span>
            <strong>{payments.filter(p => p.status === "SUCCESS").length}</strong>
          </div>
        </div>

        <div className="ph-stat-card">
          <div className="ph-stat-icon">
            <Wallet size={22} />
          </div>
          <div>
            <span>Tổng chi tiêu</span>
            <strong style={{ color: "#ff3945" }}>
              {formatMoney(totalAmount)}
            </strong>
          </div>
        </div>
      </div>

      {/* PAYMENT TABLE */}
      <div className="ph-panel">
        <div className="ph-panel-header">
          <div className="ph-panel-title">
            <CreditCard size={21} />
            <h3>Danh sách hóa đơn giao dịch</h3>
          </div>

          <span className="ph-count">
            {payments.length} GIAO DỊCH
          </span>
        </div>

        {payments.length === 0 ? (
          <div className="ph-empty">
            <div className="ph-empty-icon">
              <FileText size={30} />
            </div>

            <h3>Chưa có giao dịch nào</h3>

            <p>
              Bạn chưa phát sinh giao dịch hoặc chưa đăng ký
              gói tập nào. Các hóa đơn sẽ xuất hiện tại đây
              khi có giao dịch.
            </p>
          </div>
        ) : (
          <>
            <div className="ph-table-wrap">
              <table className="ph-table">
                <thead>
                  <tr>
                    <th>Mã hóa đơn</th>
                    <th>Nội dung thanh toán</th>
                    <th>Ngày giao dịch</th>
                    <th>Số tiền</th>
                    <th>Hình thức</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>

                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <span className="ph-invoice-id">
                          {p.id}
                        </span>
                      </td>

                      <td>
                        <div className="ph-content">
                          <div className="ph-content-icon">
                            {p.type === "class" ? (
                              <Dumbbell size={18} />
                            ) : (
                              <CreditCard size={18} />
                            )}
                          </div>

                          <strong>{p.title}</strong>
                        </div>
                      </td>

                      <td>
                        <div className="ph-date">
                          <CalendarDays size={15} />
                          {p.date}
                        </div>
                      </td>

                      <td className="ph-amount">
                        {formatMoney(p.amount)}
                      </td>

                      <td>
                        <div className="ph-method">
                          <Wallet size={15} />
                          {p.method}
                        </div>
                      </td>

                      <td>
                        <span className="ph-status">
                          <CircleCheck size={14} />
                          Thành công
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ph-footer">
              <span>
                Hiển thị <strong>{payments.length}</strong> giao dịch
              </span>

              <span>
                Tổng thanh toán:
                {" "}
                <strong style={{ color: "#ff3945" }}>
                  {formatMoney(totalAmount)}
                </strong>
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}