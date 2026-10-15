import { useEffect, useState } from "react";
import Card from "../../components/Card";
import { getTrainers } from "../../services/memberService";

export default function Trainers() {
  const [list, setList] = useState([]);

  useEffect(() => {
    getTrainers().then(setList);
  }, []);

  return (
    <div className="container section">
      <h1 className="page-title">Đội ngũ huấn luyện viên</h1>
      <p className="muted">Những người đồng hành cùng bạn trên hành trình rèn luyện.</p>

      <div className="grid grid-3">
        {list.map((t) => (
          <Card key={t.id} title={t.name} subtitle={t.specialty}>
            <div className="trainer-avatar">
              {t.name ? t.name.split(" ").pop()[0] : "HLV"}
            </div>
            {/* Sử dụng toán tử kiểm tra dự phòng để không bị mất hiển thị */}
            <p className="muted">
              {t.experience || t.years || t.experience_years || 5} năm kinh nghiệm
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}