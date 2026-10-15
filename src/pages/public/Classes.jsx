import { useEffect, useState } from "react";
import { Clock, User, CalendarDays } from "lucide-react";
import Card from "../../components/Card";
import { getClasses } from "../../services/memberService";

export default function Classes() {
  const [list, setList] = useState([]);

  useEffect(() => {
    getClasses().then(setList);
  }, []);

  return (
    <div className="container section">
      <h1 className="page-title">Lớp học & lịch tập</h1>
      <p className="muted">Các lớp nhóm có sẵn trong tuần.</p>

      <div className="grid grid-3">
        {list.map((c) => (
          <Card 
            key={c.id} 
            title={c.name} 
            subtitle={`Tối đa ${c.slots || c.capacity || c.max_participants || 20} người`}
          >
            <ul className="info-list">
              <li>
                <User size={16} /> {c.trainer || "Chưa cập nhật HLV"}
              </li>
              <li>
                <CalendarDays size={16} /> {c.day || c.schedule || "Thứ 2, 4, 6"}
              </li>
              {/* Nếu có trường time riêng thì hiển thị, nếu không thì ẩn hoặc hiển thị gộp */}
              {c.time && (
                <li>
                  <Clock size={16} /> {c.time}
                </li>
              )}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}