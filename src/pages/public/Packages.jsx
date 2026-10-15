import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import { getPackages } from "../../services/packageService";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { formatVND } from "../../data/mockData";

export default function Packages() {
  const [list, setList] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [done, setDone] = useState(false);
  const { items, addItem, removeItem, clear, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getPackages().then(setList);
  }, []);

  const choose = (pkg) => {
    addItem(pkg);
    setShowCart(true);
  };

  const confirm = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    clear();
    setDone(true);
  };

  return (
    <div className="container section">
      <h1 className="page-title">Bảng giá gói tập</h1>

      <div className="grid grid-2">
        {list.map((p, i) => (
          <Card
            key={p.id}
            title={p.name}
            subtitle={`Thời hạn ${p.durationMonths} tháng`}
            price={formatVND(p.price)}
            features={p.features}
            highlight={i === 1 ? "Phổ biến" : null}
          />
        ))}
      </div>
    </div>
  );
}
