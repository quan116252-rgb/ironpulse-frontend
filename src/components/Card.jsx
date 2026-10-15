import { Check } from "lucide-react";

// Thẻ hiển thị gói tập / lớp học
export default function Card({ title, subtitle, price, features = [], highlight, action, children }) {
  return (
    <div className={"card" + (highlight ? " card-highlight" : "")}>
      {highlight && <span className="card-badge">{highlight}</span>}
      <h3>{title}</h3>
      {subtitle && <p className="muted">{subtitle}</p>}
      {price && <div className="card-price">{price}</div>}
      {features.length > 0 && (
        <ul className="card-features">
          {features.map((f) => (
            <li key={f}>
              <Check size={16} /> {f}
            </li>
          ))}
        </ul>
      )}
      {children}
      {action && <div className="card-action">{action}</div>}
    </div>
  );
}
