import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Check,
  Dumbbell,
  Crown,
  Clock3,
  ShieldCheck,
  Sparkles,
  CreditCard,
  UserRound,
  Phone,
  CalendarDays,
  ArrowRight,
  LoaderCircle,
  CircleCheck,
  RefreshCw,
  AlertCircle,
  Banknote,
  FileText,
  X,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { registerPackage } from "../../services/memberService";

// =====================================================
// CẤU HÌNH GÓI TẬP
// =====================================================

const PACKAGE_TEMPLATES = [
  {
    id: "basic",
    name: "Gói Chuẩn",
    subtitle: "BASIC GYM",
    priceValue: 500000,
    durationMonths: 1,
    popular: false,
    features: [
      "Giới hạn khung giờ: 8-15h hoặc sau 20h",
      "Sử dụng phòng tắm cơ bản, máy tập và tủ đồ chung",
      "Đo chỉ số InBody miễn phí",
      "Mua thêm vé hoặc giới hạn số lớp/tuần",
    ],
  },
  {
    id: "vip",
    name: "Gói VIP",
    subtitle: "GYM + CLASS + PT",
    priceValue: 1200000,
    durationMonths: 1,
    popular: true,
    features: [
      "Tủ đồ riêng, khăn tắm và nước uống VIP",
      "Sử dụng phòng xông hơi Sauna / Steam",
      "Tham gia không giới hạn Yoga, Zumba, Boxing, Cycling",
      "Có 2 buổi tập cùng huấn luyện viên cá nhân",
      "Tự do tập luyện 24/7",
    ],
  },
];

// =====================================================
// HÀM TIỆN ÍCH
// =====================================================

const formatMoney = (value) =>
  new Intl.NumberFormat("vi-VN").format(
    Math.round(Number(value || 0))
  ) + "đ";

const normalizePackageName = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const PACKAGE_ALIASES = {
  basic: ["goi chuan", "basic", "basic gym", "goi basic"],
  vip: ["goi vip", "vip", "gym class pt"],
};

const findBackendPackage = (template, packages) => {
  const templateName = normalizePackageName(template.name);
  const aliases = PACKAGE_ALIASES[template.id] || [];

  return packages.find((item) => {
    const backendName = normalizePackageName(item.name);

    if (!backendName) return false;
    if (backendName === templateName) return true;

    return aliases.some(
      (alias) =>
        backendName === alias ||
        backendName.startsWith(alias + " ")
    );
  });
};

const getList = (response) => {
  const data = response?.data ?? response;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;

  return [];
};

const getPackageName = (member) =>
  member?.packageName ||
  member?.package_name ||
  member?.gym_package_name ||
  member?.package?.name ||
  "";

const getStartDate = (member) =>
  member?.startDate || member?.start_date || "";

const getEndDate = (member) =>
  member?.endDate || member?.end_date || "";

const getFullName = (member) =>
  member?.fullName ||
  member?.full_name ||
  member?.name ||
  "";

const getPhone = (member) => member?.phone || "";

const parseLocalDate = (value) => {
  if (!value) return null;

  const dateString = String(value).slice(0, 10);
  const parts = dateString.split("-").map(Number);

  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return null;
  }

  const [year, month, day] = parts;
  const result = new Date(year, month - 1, day);

  if (
    result.getFullYear() !== year ||
    result.getMonth() !== month - 1 ||
    result.getDate() !== day
  ) {
    return null;
  }

  result.setHours(0, 0, 0, 0);
  return result;
};

const formatDate = (value) => {
  const date = parseLocalDate(value);

  if (!date) return "Chưa xác định";

  return date.toLocaleDateString("vi-VN");
};

const getErrorMessage = (error) => {
  const status = error?.response?.status;
  const data = error?.response?.data;

  if (status === 401) {
    return "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.";
  }

  if (status === 403) {
    return "Tài khoản không có quyền thực hiện thao tác này.";
  }

  if (status === 404) {
    return (
      data?.error ||
      data?.detail ||
      "Không tìm thấy API hoặc hồ sơ cần thiết."
    );
  }

  if (typeof data === "string") return data;
  if (data?.detail) return data.detail;
  if (data?.error) return data.error;
  if (data?.message) return data.message;

  if (data && typeof data === "object") {
    const firstValue = Object.values(data)[0];

    if (Array.isArray(firstValue)) {
      return String(firstValue[0]);
    }

    if (typeof firstValue === "string") {
      return firstValue;
    }
  }

  return error?.message || "Có lỗi xảy ra. Vui lòng thử lại!";
};

// =====================================================
// COMPONENT
// =====================================================

export default function RegisterMember() {
  const { user } = useAuth();

  // Gói đang chọn
  const [selectedPackage, setSelectedPackage] = useState("vip");

  // Thông tin hội viên
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");

  // Dữ liệu Backend
  const [memberInfo, setMemberInfo] = useState(null);
  const [serverPackages, setServerPackages] = useState([]);

  // Trạng thái
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Chuyển đổi gói
  const [showChangeForm, setShowChangeForm] = useState(false);
  const [reason, setReason] = useState("");

  // Ngân hàng
  const [bankName, setBankName] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");

  // Thông báo
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const userEmail = user?.email || "";

  // =====================================================
  // GHÉP GÓI FRONTEND VỚI GÓI BACKEND
  // =====================================================

  const packagesList = useMemo(() => {
    return PACKAGE_TEMPLATES.map((template) => {
      const backendPackage = findBackendPackage(
        template,
        serverPackages
      );

      const price = backendPackage
        ? Number(backendPackage.price)
        : template.priceValue;

      const duration = backendPackage
        ? Number(
            backendPackage.duration_months ??
              backendPackage.durationMonths ??
              template.durationMonths
          )
        : template.durationMonths;

      return {
        ...template,
        backendId: backendPackage?.id || null,
        backendName: backendPackage?.name || null,
        priceValue: price,
        durationMonths: duration,
        price: formatMoney(price),
        duration: `Thời hạn ${duration} tháng`,
      };
    });
  }, [serverPackages]);

  const currentPkg = packagesList.find(
    (pkg) => pkg.id === selectedPackage
  );

  // =====================================================
  // TÌM HỘI VIÊN HIỆN TẠI
  // =====================================================

  const findCurrentMember = (members) => {
    if (!members.length) return null;

    const email = String(userEmail).trim().toLowerCase();

    if (email) {
      const matched = members.find(
        (member) =>
          String(member.email || "").trim().toLowerCase() === email
      );

      if (matched) return matched;
    }

    if (members.length === 1) {
      return members[0];
    }

    return null;
  };

  // =====================================================
  // TẢI DỮ LIỆU
  // =====================================================

  const fetchData = useCallback(async () => {
    setLoadingMembers(true);
    setErrorMessage("");

    try {
      const [membersResponse, packagesResponse] =
        await Promise.all([
          api.get("members/"),
          api.get("packages/"),
        ]);

      const members = getList(membersResponse);
      const packageData = getList(packagesResponse);

      const member = findCurrentMember(members);

      setMemberInfo(member);
      setServerPackages(packageData);

      if (member) {
        if (getFullName(member)) {
          setFullName(getFullName(member));
        }

        if (getPhone(member)) {
          setPhone(getPhone(member));
        }
      }

      if (!packageData.length) {
        setErrorMessage(
          "Backend chưa có dữ liệu gói tập. Vui lòng kiểm tra GymPackage trong Django Admin."
        );
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu đăng ký:", error);

      setMemberInfo(null);
      setServerPackages([]);

      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoadingMembers(false);
    }
  }, [userEmail]);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setPhone(user.phone || "");
      fetchData();
    } else {
      setMemberInfo(null);
      setServerPackages([]);
      setLoadingMembers(false);
      setErrorMessage("Vui lòng đăng nhập để sử dụng chức năng này.");
    }
  }, [user, fetchData]);

  // =====================================================
  // KIỂM TRA GÓI ĐANG SỬ DỤNG
  // =====================================================

  const activePackage = useMemo(() => {
    if (!memberInfo) return null;

    const packageName = getPackageName(memberInfo);

    if (
      !packageName ||
      packageName.trim() === "" ||
      packageName === "Chưa đăng ký gói"
    ) {
      return null;
    }

    const startDate = parseLocalDate(getStartDate(memberInfo));
    const endDate = parseLocalDate(getEndDate(memberInfo));

    if (!startDate || !endDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate <= today && today < endDate) {
      return {
        packageName,
        startDate: getStartDate(memberInfo),
        endDate: getEndDate(memberInfo),
      };
    }

    return null;
  }, [memberInfo]);

  const isSwitching = Boolean(activePackage);

  const isSamePackage =
    Boolean(activePackage) &&
    normalizePackageName(activePackage.packageName) ===
      normalizePackageName(currentPkg?.backendName || currentPkg?.name);

  // =====================================================
  // TÌM GIÁ GÓI HIỆN TẠI
  // =====================================================

  const oldBackendPackage = useMemo(() => {
    if (!activePackage) return null;

    const oldName = normalizePackageName(
      activePackage.packageName
    );

    return serverPackages.find(
      (pkg) =>
        normalizePackageName(pkg.name) === oldName
    ) || null;
  }, [activePackage, serverPackages]);

  // =====================================================
  // TÍNH TIỀN CHUYỂN ĐỔI
  // Công thức giống Backend Django
  // =====================================================

  const changeCalculation = useMemo(() => {
    if (!activePackage || !currentPkg || !oldBackendPackage) {
      return null;
    }

    const startDate = parseLocalDate(activePackage.startDate);
    const endDate = parseLocalDate(activePackage.endDate);

    if (!startDate || !endDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalDays = Math.round(
      (endDate - startDate) / 86400000
    );

    const remainingDays = Math.round(
      (endDate - today) / 86400000
    );

    if (totalDays <= 0 || remainingDays <= 0) {
      return null;
    }

    const oldPrice = Number(oldBackendPackage.price);
    const newPrice = Number(currentPkg.priceValue);

    if (
      !Number.isFinite(oldPrice) ||
      !Number.isFinite(newPrice)
    ) {
      return null;
    }

    // Giá trị còn lại = Giá gói cũ / Tổng ngày * Ngày còn lại
    const remainingValue =
      Math.round(
        ((oldPrice * remainingDays) / totalDays) * 100
      ) / 100;

    // Chênh lệch = Giá gói mới - Giá trị còn lại
    const amountDifference =
      Math.round((newPrice - remainingValue) * 100) / 100;

    return {
      oldPrice,
      newPrice,
      totalDays,
      remainingDays,
      usedDays: totalDays - remainingDays,
      remainingValue,
      amountDifference,
      additionalPayment:
        amountDifference > 0 ? amountDifference : 0,
      refundAmount:
        amountDifference < 0 ? Math.abs(amountDifference) : 0,
    };
  }, [
    activePackage,
    currentPkg,
    oldBackendPackage,
  ]);

  // =====================================================
  // THÔNG BÁO
  // =====================================================

  const clearMessages = () => {
    setSuccessMessage("");
    setErrorMessage("");
  };

  // =====================================================
  // MỞ / ĐÓNG FORM CHUYỂN ĐỔI
  // =====================================================

  const openChangeForm = () => {
    clearMessages();
    setShowChangeForm(true);
    setSelectedPackage("vip");
  };

  const closeChangeForm = () => {
    setShowChangeForm(false);
    setReason("");
    setBankName("");
    setBankAccountName("");
    setBankAccountNumber("");
    clearMessages();
  };

  // =====================================================
  // ĐĂNG KÝ GÓI TẬP THÔNG THƯỜNG
  // =====================================================

  const handleRegister = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!user) {
      setErrorMessage("Vui lòng đăng nhập trước khi đăng ký.");
      return;
    }

    if (!currentPkg?.backendId) {
      setErrorMessage(
        "Không tìm thấy gói tập trên Backend. Vui lòng kiểm tra GymPackage trong Django Admin."
      );
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage("Vui lòng nhập họ và tên.");
      return;
    }

    if (!/^[0-9+\s.-]{9,15}$/.test(phone.trim())) {
      setErrorMessage("Số điện thoại không hợp lệ.");
      return;
    }

    if (activePackage) {
      setErrorMessage(
        "Bạn đang có gói tập còn hiệu lực. Hãy sử dụng chức năng chuyển đổi gói."
      );
      return;
    }

    setSubmitting(true);

    try {
      const newMemberData = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        packageName: currentPkg.backendName || currentPkg.name,
        price: currentPkg.priceValue,
        durationMonths: currentPkg.durationMonths,
      };

      const response = await registerPackage(newMemberData);

      setSuccessMessage(
        response?.message ||
          `Đăng ký thành công ${currentPkg.name}!`
      );

      await fetchData();
    } catch (error) {
      console.error("Lỗi đăng ký gói:", error);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // GỬI YÊU CẦU CHUYỂN ĐỔI GÓI
  // =====================================================

  const handlePackageChange = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!user) {
      setErrorMessage("Vui lòng đăng nhập trước khi chuyển đổi gói.");
      return;
    }

    if (!activePackage) {
      setErrorMessage("Bạn không có gói tập còn hiệu lực.");
      return;
    }

    if (!memberInfo) {
      setErrorMessage("Không tìm thấy hồ sơ hội viên.");
      return;
    }

    if (!currentPkg?.backendId) {
      setErrorMessage("Không tìm thấy ID gói tập trên Backend.");
      return;
    }

    if (isSamePackage) {
      setErrorMessage("Bạn đang sử dụng gói này. Vui lòng chọn gói khác.");
      return;
    }

    if (!changeCalculation) {
      setErrorMessage(
        "Không thể tính giá trị gói hiện tại. Vui lòng kiểm tra ngày bắt đầu, ngày hết hạn và giá gói trong hệ thống."
      );
      return;
    }

    if (!reason.trim() || reason.trim().length < 5) {
      setErrorMessage(
        "Vui lòng nhập lý do chuyển đổi, tối thiểu 5 ký tự."
      );
      return;
    }

    if (!/^[0-9+\s.-]{9,15}$/.test(phone.trim())) {
      setErrorMessage("Số điện thoại không hợp lệ.");
      return;
    }

    // Chỉ bắt buộc nhập ngân hàng khi được hoàn tiền.
    if (changeCalculation.refundAmount > 0) {
      if (
        !bankName.trim() ||
        !bankAccountName.trim() ||
        !bankAccountNumber.trim()
      ) {
        setErrorMessage(
          "Bạn thuộc trường hợp được hoàn tiền. Vui lòng nhập đầy đủ thông tin ngân hàng."
        );
        return;
      }
    }

    setSubmitting(true);

    try {
      const payload = {
        new_package: currentPkg.backendId,
        reason: reason.trim(),
        bank_name: bankName.trim(),
        bank_account_name: bankAccountName.trim(),
        bank_account_number: bankAccountNumber.trim(),
      };

      const response = await api.post(
        "package-change-requests/",
        payload
      );

      setSuccessMessage(
        response.data?.message ||
          "Đã gửi yêu cầu chuyển đổi gói tập thành công. Vui lòng chờ quản trị viên phê duyệt."
      );

      setShowChangeForm(false);
      setReason("");
      setBankName("");
      setBankAccountName("");
      setBankAccountNumber("");
    } catch (error) {
      console.error("Lỗi gửi yêu cầu chuyển đổi:", error);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // GIAO DIỆN
  // =====================================================

  return (
    <div className="register-package-page">
      <style>{`
        .register-package-page {
          width: 100%;
          min-height: 100%;
          padding: 28px;
          color: #fff;
          background: #101010;
          box-sizing: border-box;
        }

        .register-package-page * {
          box-sizing: border-box;
        }

        .rp-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .rp-heading {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .rp-heading-icon {
          width: 54px;
          height: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 15px;
          color: #ff3945;
          background: rgba(227,24,36,.13);
          border: 1px solid rgba(227,24,36,.25);
          flex-shrink: 0;
        }

        .rp-heading h1 {
          margin: 0 0 7px;
          font-size: 27px;
          font-weight: 850;
          color: #fff;
        }

        .rp-heading p {
          margin: 0;
          color: #888;
          font-size: 13px;
        }

        .rp-header-tag {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 15px;
          color: #ff626a;
          background: rgba(227,24,36,.1);
          border: 1px solid rgba(227,24,36,.25);
          border-radius: 30px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .rp-section-heading {
          margin-bottom: 18px;
        }

        .rp-section-heading h2 {
          margin: 0 0 6px;
          color: #fff;
          font-size: 19px;
          font-weight: 800;
        }

        .rp-section-heading p {
          margin: 0;
          color: #858585;
          font-size: 13px;
        }

        .rp-packages {
          display: grid;
          grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 22px;
          max-width: 1000px;
          margin-bottom: 30px;
        }

        .rp-package-card {
          position: relative;
          display: flex;
          flex-direction: column;
          padding: 27px;
          min-width: 0;
          background: linear-gradient(145deg,#1c1c1c,#131313);
          border: 1px solid #303030;
          border-radius: 18px;
          cursor: pointer;
          transition: all .25s ease;
        }

        .rp-package-card:hover {
          transform: translateY(-4px);
          border-color: #8d292e;
          box-shadow: 0 12px 35px rgba(0,0,0,.3);
        }

        .rp-package-card.selected {
          border: 2px solid #e31824;
          background: linear-gradient(145deg,#251719,#151313);
          box-shadow: 0 10px 35px rgba(227,24,36,.12);
        }

        .rp-package-card.vip-card {
          background:
            radial-gradient(circle at 90% 5%,rgba(227,24,36,.12),transparent 35%),
            linear-gradient(145deg,#211719,#131313);
        }

        .rp-popular {
          position: absolute;
          top: -13px;
          right: 22px;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 13px;
          color: #fff;
          background: #e31824;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 850;
        }

        .rp-package-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 21px;
        }

        .rp-package-icon {
          width: 49px;
          height: 49px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ff4650;
          background: rgba(227,24,36,.12);
          border: 1px solid rgba(227,24,36,.2);
          border-radius: 14px;
        }

        .rp-selected-mark {
          width: 25px;
          height: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          background: #e31824;
          border-radius: 50%;
        }

        .rp-package-subtitle {
          color: #ff535d;
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 1.7px;
          margin-bottom: 8px;
        }

        .rp-package-name {
          margin: 0 0 7px;
          color: #fff;
          font-size: 23px;
          font-weight: 850;
        }

        .rp-package-duration {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #858585;
          font-size: 12px;
        }

        .rp-package-price {
          padding: 19px 0;
          margin: 18px 0;
          border-top: 1px solid #303030;
          border-bottom: 1px solid #303030;
        }

        .rp-price {
          color: #ff3945;
          font-size: 32px;
          font-weight: 900;
        }

        .rp-price-unit {
          margin-left: 7px;
          color: #858585;
          font-size: 12px;
        }

        .rp-feature-title {
          margin: 0 0 15px;
          color: #ddd;
          font-size: 12px;
          font-weight: 800;
        }

        .rp-features {
          display: flex;
          flex-direction: column;
          gap: 13px;
          padding: 0;
          margin: 0 0 25px;
          list-style: none;
          flex: 1;
        }

        .rp-feature {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          color: #bdbdbd;
          font-size: 12px;
          line-height: 1.6;
        }

        .rp-feature-check {
          width: 19px;
          height: 19px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #ff4a55;
          background: rgba(227,24,36,.13);
          border-radius: 50%;
        }

        .rp-select-button {
          width: 100%;
          padding: 13px 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          color: #fff;
          background: #292929;
          border: 1px solid #3b3b3b;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 850;
          cursor: pointer;
        }

        .rp-select-button:hover {
          background: #383838;
        }

        .rp-select-button.active {
          background: #e31824;
          border-color: #e31824;
        }

        .rp-form-panel {
          max-width: 1000px;
          padding: 25px;
          background: #171717;
          border: 1px solid #303030;
          border-radius: 18px;
          margin-bottom: 25px;
        }

        .rp-form-heading {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 23px;
        }

        .rp-form-heading-icon {
          width: 43px;
          height: 43px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ff4650;
          background: rgba(227,24,36,.13);
          border-radius: 12px;
          flex-shrink: 0;
        }

        .rp-form-heading h3 {
          margin: 0 0 5px;
          color: #fff;
          font-size: 17px;
        }

        .rp-form-heading p {
          margin: 0;
          color: #888;
          font-size: 12px;
        }

        .rp-active-card {
          max-width: 1000px;
          padding: 22px;
          margin-bottom: 22px;
          background: linear-gradient(120deg,#211719,#171717);
          border: 1px solid rgba(227,24,36,.3);
          border-radius: 14px;
        }

        .rp-active-card-top {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #ff626a;
          font-size: 12px;
          font-weight: 800;
          margin-bottom: 13px;
        }

        .rp-active-card-name {
          color: #fff;
          font-size: 21px;
          font-weight: 850;
          margin-bottom: 8px;
        }

        .rp-active-card-info {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #aaa;
          font-size: 12px;
          flex-wrap: wrap;
        }

        .rp-active-warning,
        .rp-info-box {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 15px;
          margin-bottom: 20px;
          border-radius: 11px;
          font-size: 12px;
          line-height: 1.7;
        }

        .rp-active-warning {
          color: #ffbd78;
          background: rgba(180,83,9,.12);
          border: 1px solid rgba(245,158,11,.3);
        }

        .rp-info-box {
          color: #b9c9df;
          background: rgba(59,130,246,.08);
          border: 1px solid rgba(59,130,246,.2);
        }

        .rp-active-warning svg,
        .rp-info-box svg {
          flex-shrink: 0;
          margin-top: 1px;
        }

        .rp-form-grid {
          display: grid;
          grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 17px;
          margin-bottom: 20px;
        }

        .rp-field label {
          display: block;
          margin-bottom: 9px;
          color: #c8c8c8;
          font-size: 12px;
          font-weight: 750;
        }

        .rp-input-wrap {
          position: relative;
        }

        .rp-input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #888;
          pointer-events: none;
        }

        .rp-field input,
        .rp-field textarea {
          width: 100%;
          min-height: 46px;
          padding: 12px 14px;
          color: #fff;
          background: #202020;
          border: 1px solid #393939;
          border-radius: 10px;
          outline: none;
          font-size: 13px;
          font-family: inherit;
        }

        .rp-input-wrap input {
          padding-left: 43px;
        }

        .rp-field textarea {
          min-height: 100px;
          resize: vertical;
        }

        .rp-field input:focus,
        .rp-field textarea:focus {
          border-color: #e31824;
          box-shadow: 0 0 0 3px rgba(227,24,36,.1);
        }

        .rp-field input::placeholder,
        .rp-field textarea::placeholder {
          color: #686868;
        }

        .rp-field.full-width {
          grid-column: 1/-1;
        }

        .rp-field-note {
          display: block;
          margin-top: 7px;
          color: #777;
          font-size: 11px;
          line-height: 1.5;
        }

        .rp-calculation {
          padding: 20px;
          margin: 20px 0;
          background: #202020;
          border: 1px solid #383838;
          border-radius: 13px;
        }

        .rp-calculation-title {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #fff;
          font-size: 14px;
          font-weight: 850;
          margin-bottom: 17px;
        }

        .rp-calculation-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 10px 0;
          border-bottom: 1px solid #353535;
          color: #aaa;
          font-size: 12px;
        }

        .rp-calculation-row strong {
          color: #fff;
          text-align: right;
        }

        .rp-calculation-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-top: 17px;
          padding: 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 800;
        }

        .rp-calculation-total.pay {
          color: #ffb36b;
          background: rgba(245,158,11,.1);
          border: 1px solid rgba(245,158,11,.25);
        }

        .rp-calculation-total.refund {
          color: #79dfaa;
          background: rgba(34,197,94,.1);
          border: 1px solid rgba(34,197,94,.25);
        }

        .rp-calculation-total.equal {
          color: #a9c9ff;
          background: rgba(59,130,246,.1);
          border: 1px solid rgba(59,130,246,.25);
        }

        .rp-calculation-total strong {
          font-size: 19px;
          text-align: right;
        }

        .rp-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding: 18px;
          margin-bottom: 20px;
          background: linear-gradient(110deg,#281719,#201719);
          border: 1px solid rgba(227,24,36,.25);
          border-radius: 12px;
        }

        .rp-summary-label {
          margin-bottom: 7px;
          color: #ff646c;
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 1px;
        }

        .rp-summary-name {
          color: #fff;
          font-size: 14px;
          font-weight: 800;
        }

        .rp-summary-note {
          margin-top: 6px;
          color: #999;
          font-size: 11px;
        }

        .rp-summary-price {
          color: #ff4650;
          font-size: 21px;
          font-weight: 900;
          white-space: nowrap;
        }

        .rp-submit {
          width: 100%;
          min-height: 49px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 13px 18px;
          color: #fff;
          background: #e31824;
          border: none;
          border-radius: 11px;
          font-size: 13px;
          font-weight: 850;
          cursor: pointer;
          transition: all .2s ease;
        }

        .rp-submit:hover:not(:disabled) {
          background: #c91520;
          box-shadow: 0 7px 20px rgba(227,24,36,.2);
          transform: translateY(-1px);
        }

        .rp-submit:disabled {
          cursor: not-allowed;
          opacity: .55;
        }

        .rp-open-change {
          max-width: 1000px;
          width: 100%;
          min-height: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 15px 20px;
          margin-bottom: 25px;
          color: #fff;
          background: #e31824;
          border: none;
          border-radius: 11px;
          font-size: 14px;
          font-weight: 850;
          cursor: pointer;
          transition: .2s ease;
        }

        .rp-open-change:hover {
          background: #c91520;
          transform: translateY(-1px);
        }

        .rp-cancel {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 9px 13px;
          color: #aaa;
          background: #292929;
          border: 1px solid #414141;
          border-radius: 8px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
        }

        .rp-cancel:hover {
          color: #fff;
          background: #383838;
        }

        .rp-message {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          padding: 14px 16px;
          margin-bottom: 18px;
          border-radius: 10px;
          font-size: 12px;
          line-height: 1.7;
        }

        .rp-message svg {
          flex-shrink: 0;
          margin-top: 1px;
        }

        .rp-message.success {
          color: #8be0b5;
          background: rgba(34,197,94,.1);
          border: 1px solid rgba(34,197,94,.25);
        }

        .rp-message.error {
          color: #ff9299;
          background: rgba(227,24,36,.1);
          border: 1px solid rgba(227,24,36,.25);
        }

        .rp-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          min-height: 180px;
          color: #aaa;
          font-size: 13px;
        }

        .rp-loading svg {
          color: #ff3945;
          animation: rp-spin 1s linear infinite;
        }

        .rp-security-note {
          max-width: 1000px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #777;
          font-size: 11px;
          text-align: center;
        }

        .rp-security-note svg {
          color: #45bd8c;
          flex-shrink: 0;
        }

        @keyframes rp-spin {
          to { transform: rotate(360deg); }
        }

        @media(max-width:850px) {
          .rp-packages {
            grid-template-columns: 1fr;
            max-width: 600px;
          }
        }

        @media(max-width:600px) {
          .register-package-page {
            padding: 18px 13px;
          }

          .rp-heading h1 {
            font-size: 21px;
          }

          .rp-heading-icon {
            width: 45px;
            height: 45px;
          }

          .rp-package-card {
            padding: 22px;
          }

          .rp-package-name {
            font-size: 21px;
          }

          .rp-form-panel {
            padding: 18px;
          }

          .rp-form-grid {
            grid-template-columns: 1fr;
          }

          .rp-summary {
            align-items: flex-start;
            flex-direction: column;
          }

          .rp-summary-price {
            font-size: 23px;
          }

          .rp-calculation-row,
          .rp-calculation-total {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>

      {/* HEADER */}

      <div className="rp-header">
        <div className="rp-heading">
          <div className="rp-heading-icon">
            <Dumbbell size={26} />
          </div>

          <div>
            <h1>Bảng giá gói tập</h1>
            <p>
              Lựa chọn chương trình phù hợp với mục tiêu thể hình của bạn
            </p>
          </div>
        </div>

        <div className="rp-header-tag">
          <Sparkles size={15} />
          IRONPULSE MEMBERSHIP
        </div>
      </div>

      {/* THÔNG BÁO */}

      {successMessage && (
        <div className="rp-message success">
          <CircleCheck size={19} />
          <div>{successMessage}</div>
        </div>
      )}

      {errorMessage && (
        <div className="rp-message error">
          <AlertCircle size={19} />
          <div>{errorMessage}</div>
        </div>
      )}

      {loadingMembers ? (
        <div className="rp-loading">
          <LoaderCircle size={21} />
          Đang tải dữ liệu...
        </div>
      ) : (
        <>
          {/* =================================================
              TRƯỜNG HỢP ĐANG CÓ GÓI CÒN HẠN
          ================================================= */}

          {isSwitching ? (
            <>
              <div className="rp-section-heading">
                <h2>Gói tập hiện tại</h2>
                <p>
                  Bạn có thể gửi yêu cầu đổi sang gói tập khác khi gói
                  hiện tại vẫn còn thời hạn.
                </p>
              </div>

              <div className="rp-active-card">
                <div className="rp-active-card-top">
                  <ShieldCheck size={18} />
                  GÓI TẬP ĐANG HOẠT ĐỘNG
                </div>

                <div className="rp-active-card-name">
                  {activePackage.packageName}
                </div>

                <div className="rp-active-card-info">
                  <CalendarDays size={14} />
                  Bắt đầu: {formatDate(activePackage.startDate)}
                  <span>·</span>
                  Hết hạn: {formatDate(activePackage.endDate)}
                </div>
              </div>

              {!showChangeForm ? (
                <button
                  type="button"
                  className="rp-open-change"
                  onClick={openChangeForm}
                >
                  <RefreshCw size={18} />
                  Yêu cầu đổi gói tập
                  <ArrowRight size={18} />
                </button>
              ) : (
                <>
                  <div className="rp-form-panel">
                    <div className="rp-form-heading">
                      <div className="rp-form-heading-icon">
                        <RefreshCw size={22} />
                      </div>

                      <div style={{ flex: 1 }}>
                        <h3>Yêu cầu chuyển đổi gói tập</h3>
                        <p>
                          Chọn gói mới, xem khoản chênh lệch và gửi yêu cầu
                          để quản trị viên phê duyệt.
                        </p>
                      </div>

                      <button
                        type="button"
                        className="rp-cancel"
                        onClick={closeChangeForm}
                      >
                        <X size={15} />
                        Đóng
                      </button>
                    </div>

                    <div className="rp-info-box">
                      <AlertCircle size={18} />
                      <div>
                        Hệ thống tính giá trị còn lại của gói cũ dựa trên
                        số ngày chưa sử dụng. Nếu gói mới có giá cao hơn,
                        bạn cần thanh toán phần chênh lệch. Nếu giá gói
                        mới thấp hơn, hệ thống sẽ hiển thị khoản tiền dự
                        kiến được hoàn.
                        <br />
                        Gói hiện tại chỉ thay đổi sau khi quản trị viên
                        phê duyệt yêu cầu.
                      </div>
                    </div>

                    {/* CHỌN GÓI MỚI */}

                    <div className="rp-section-heading">
                      <h2>1. Chọn gói muốn chuyển đổi</h2>
                      <p>
                        Chọn một gói khác với gói bạn đang sử dụng.
                      </p>
                    </div>

                    <div className="rp-packages">
                      {packagesList.map((pkg) => {
                        const isSelected = selectedPackage === pkg.id;

                        const isCurrent =
                          normalizePackageName(
                            activePackage.packageName
                          ) ===
                          normalizePackageName(
                            pkg.backendName || pkg.name
                          );

                        return (
                          <div
                            key={pkg.id}
                            className={`rp-package-card ${
                              isSelected ? "selected" : ""
                            } ${pkg.id === "vip" ? "vip-card" : ""}`}
                            onClick={() => {
                              clearMessages();
                              setSelectedPackage(pkg.id);
                            }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (
                                e.key === "Enter" ||
                                e.key === " "
                              ) {
                                e.preventDefault();
                                clearMessages();
                                setSelectedPackage(pkg.id);
                              }
                            }}
                            aria-pressed={isSelected}
                          >
                            {pkg.popular && (
                              <div className="rp-popular">
                                <Crown size={13} />
                                ĐƯỢC ƯA CHUỘNG
                              </div>
                            )}

                            <div className="rp-package-top">
                              <div className="rp-package-icon">
                                {pkg.id === "vip" ? (
                                  <Crown size={25} />
                                ) : (
                                  <Dumbbell size={25} />
                                )}
                              </div>

                              {isSelected && (
                                <div className="rp-selected-mark">
                                  <Check size={15} strokeWidth={3} />
                                </div>
                              )}
                            </div>

                            <div className="rp-package-subtitle">
                              {pkg.subtitle}
                            </div>

                            <h3 className="rp-package-name">
                              {pkg.name}
                            </h3>

                            <div className="rp-package-duration">
                              <Clock3 size={14} />
                              {pkg.duration}
                            </div>

                            <div className="rp-package-price">
                              <span className="rp-price">
                                {pkg.price}
                              </span>
                              <span className="rp-price-unit">
                                / tháng
                              </span>
                            </div>

                            <h4 className="rp-feature-title">
                              Đặc quyền thành viên
                            </h4>

                            <ul className="rp-features">
                              {pkg.features.map((feature, index) => (
                                <li
                                  className="rp-feature"
                                  key={index}
                                >
                                  <span className="rp-feature-check">
                                    <Check
                                      size={12}
                                      strokeWidth={3}
                                    />
                                  </span>
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>

                            <button
                              type="button"
                              className={`rp-select-button ${
                                isSelected ? "active" : ""
                              }`}
                              disabled={isCurrent}
                              onClick={(e) => {
                                e.stopPropagation();
                                clearMessages();
                                setSelectedPackage(pkg.id);
                              }}
                            >
                              {isCurrent ? (
                                <>
                                  <ShieldCheck size={16} />
                                  Gói hiện tại
                                </>
                              ) : isSelected ? (
                                <>
                                  <CircleCheck size={16} />
                                  Đã chọn gói này
                                </>
                              ) : (
                                <>
                                  Chọn gói này
                                  <ArrowRight size={16} />
                                </>
                              )}
                            </button>

                            {!pkg.backendId && (
                              <span className="rp-field-note">
                                Chưa tìm thấy gói tương ứng trên hệ thống.
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* TÍNH TOÁN TIỀN */}

                    <div className="rp-section-heading">
                      <h2>2. Khoản chênh lệch</h2>
                      <p>
                        Số tiền được tính tự động theo thời gian còn lại
                        của gói hiện tại.
                      </p>
                    </div>

                    {!currentPkg?.backendId ? (
                      <div className="rp-message error">
                        <AlertCircle size={18} />
                        Không tìm thấy gói mới trong dữ liệu Backend.
                      </div>
                    ) : isSamePackage ? (
                      <div className="rp-info-box">
                        <AlertCircle size={18} />
                        Bạn đang chọn chính gói hiện tại. Vui lòng chọn
                        một gói khác.
                      </div>
                    ) : !changeCalculation ? (
                      <div className="rp-message error">
                        <AlertCircle size={18} />
                        Không thể tính toán. Vui lòng kiểm tra giá gói
                        hiện tại và ngày bắt đầu, ngày hết hạn.
                      </div>
                    ) : (
                      <div className="rp-calculation">
                        <div className="rp-calculation-title">
                          <Banknote size={19} />
                          Chi tiết tính toán
                        </div>

                        <div className="rp-calculation-row">
                          <span>Giá gói hiện tại</span>
                          <strong>
                            {formatMoney(changeCalculation.oldPrice)}
                          </strong>
                        </div>

                        <div className="rp-calculation-row">
                          <span>Tổng số ngày của gói</span>
                          <strong>
                            {changeCalculation.totalDays} ngày
                          </strong>
                        </div>

                        <div className="rp-calculation-row">
                          <span>Số ngày đã sử dụng</span>
                          <strong>
                            {changeCalculation.usedDays} ngày
                          </strong>
                        </div>

                        <div className="rp-calculation-row">
                          <span>Số ngày còn lại</span>
                          <strong>
                            {changeCalculation.remainingDays} ngày
                          </strong>
                        </div>

                        <div className="rp-calculation-row">
                          <span>Giá trị còn lại của gói cũ</span>
                          <strong>
                            {formatMoney(
                              changeCalculation.remainingValue
                            )}
                          </strong>
                        </div>

                        <div className="rp-calculation-row">
                          <span>Giá gói mới</span>
                          <strong>
                            {formatMoney(changeCalculation.newPrice)}
                          </strong>
                        </div>

                        {changeCalculation.amountDifference > 0 ? (
                          <div className="rp-calculation-total pay">
                            <span>Số tiền cần thanh toán thêm</span>
                            <strong>
                              {formatMoney(
                                changeCalculation.additionalPayment
                              )}
                            </strong>
                          </div>
                        ) : changeCalculation.amountDifference < 0 ? (
                          <div className="rp-calculation-total refund">
                            <span>Số tiền dự kiến được hoàn</span>
                            <strong>
                              {formatMoney(
                                changeCalculation.refundAmount
                              )}
                            </strong>
                          </div>
                        ) : (
                          <div className="rp-calculation-total equal">
                            <span>Khoản chênh lệch</span>
                            <strong>0đ</strong>
                          </div>
                        )}

                        <span className="rp-field-note">
                          Số tiền chính thức sẽ được Backend tính lại
                          khi tiếp nhận yêu cầu.
                        </span>
                      </div>
                    )}

                    {/* FORM GỬI YÊU CẦU */}

                    <form onSubmit={handlePackageChange}>
                      <div className="rp-section-heading">
                        <h2>3. Thông tin yêu cầu</h2>
                        <p>
                          Kiểm tra thông tin và nhập lý do chuyển đổi.
                        </p>
                      </div>

                      <div className="rp-form-grid">
                        <div className="rp-field">
                          <label>Họ và tên</label>

                          <div className="rp-input-wrap">
                            <UserRound
                              className="rp-input-icon"
                              size={17}
                            />

                            <input
                              type="text"
                              value={fullName}
                              onChange={(e) =>
                                setFullName(e.target.value)
                              }
                              placeholder="Nhập họ và tên..."
                              required
                            />
                          </div>
                        </div>

                        <div className="rp-field">
                          <label>Số điện thoại</label>

                          <div className="rp-input-wrap">
                            <Phone
                              className="rp-input-icon"
                              size={17}
                            />

                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) =>
                                setPhone(e.target.value)
                              }
                              placeholder="Nhập số điện thoại..."
                              required
                            />
                          </div>
                        </div>

                        <div className="rp-field full-width">
                          <label>
                            <FileText
                              size={14}
                              style={{
                                display: "inline",
                                verticalAlign: "middle",
                                marginRight: 6,
                              }}
                            />
                            Lý do muốn chuyển đổi gói
                          </label>

                          <textarea
                            value={reason}
                            onChange={(e) =>
                              setReason(e.target.value)
                            }
                            placeholder="Nhập lý do bạn muốn chuyển đổi gói tập..."
                            minLength={5}
                            required
                          />

                          <span className="rp-field-note">
                            Tối thiểu 5 ký tự.
                          </span>
                        </div>
                      </div>

                      {/* CHỈ HIỆN NGÂN HÀNG KHI ĐƯỢC HOÀN TIỀN */}

                      {changeCalculation?.refundAmount > 0 && (
                        <>
                          <div className="rp-section-heading">
                            <h2>
                              <Banknote
                                size={17}
                                style={{
                                  display: "inline",
                                  verticalAlign: "middle",
                                  marginRight: 7,
                                }}
                              />
                              4. Thông tin nhận hoàn tiền
                            </h2>

                            <p>
                              Bạn được hoàn tiền dự kiến{" "}
                              <strong style={{ color: "#79dfaa" }}>
                                {formatMoney(
                                  changeCalculation.refundAmount
                                )}
                              </strong>
                              . Vui lòng nhập thông tin ngân hàng.
                            </p>
                          </div>

                          <div className="rp-form-grid">
                            <div className="rp-field">
                              <label>Tên ngân hàng</label>
                              <input
                                type="text"
                                value={bankName}
                                onChange={(e) =>
                                  setBankName(e.target.value)
                                }
                                placeholder="Ví dụ: Vietcombank"
                                required
                              />
                            </div>

                            <div className="rp-field">
                              <label>Chủ tài khoản</label>
                              <input
                                type="text"
                                value={bankAccountName}
                                onChange={(e) =>
                                  setBankAccountName(e.target.value)
                                }
                                placeholder="Tên chủ tài khoản"
                                required
                              />
                            </div>

                            <div className="rp-field full-width">
                              <label>Số tài khoản</label>
                              <input
                                type="text"
                                value={bankAccountNumber}
                                onChange={(e) =>
                                  setBankAccountNumber(e.target.value)
                                }
                                placeholder="Nhập số tài khoản ngân hàng"
                                required
                              />
                            </div>
                          </div>
                        </>
                      )}

                      <div className="rp-info-box">
                        <ShieldCheck size={18} />
                        <div>
                          {changeCalculation?.refundAmount > 0
                            ? "Thông tin ngân hàng sẽ được sử dụng để xử lý hoàn tiền thủ công sau khi yêu cầu được quản trị viên phê duyệt."
                            : "Bạn không cần nhập thông tin ngân hàng vì yêu cầu này không thuộc trường hợp hoàn tiền."}
                          <br />
                          Yêu cầu sẽ ở trạng thái chờ duyệt. Gói hiện tại
                          không bị thay đổi khi bạn gửi yêu cầu.
                        </div>
                      </div>

                      <div className="rp-summary">
                        <div>
                          <div className="rp-summary-label">
                            GÓI MUỐN CHUYỂN ĐỔI
                          </div>

                          <div className="rp-summary-name">
                            {currentPkg?.name}
                          </div>

                          <div className="rp-summary-note">
                            <CalendarDays
                              size={12}
                              style={{
                                display: "inline",
                                verticalAlign: "middle",
                                marginRight: 5,
                              }}
                            />
                            {currentPkg?.duration} · Chờ quản trị viên
                            phê duyệt
                          </div>
                        </div>

                        <div className="rp-summary-price">
                          {currentPkg?.price}
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="rp-submit"
                        disabled={
                          submitting ||
                          !currentPkg?.backendId ||
                          isSamePackage ||
                          !changeCalculation
                        }
                      >
                        {submitting ? (
                          <>
                            <LoaderCircle
                              size={18}
                              className="rp-spin"
                            />
                            Đang gửi yêu cầu...
                          </>
                        ) : (
                          <>
                            Gửi yêu cầu chuyển đổi
                            <ArrowRight size={18} />
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </>
              )}
            </>
          ) : (
            /* =================================================
               TRƯỜNG HỢP CHƯA CÓ GÓI CÒN HẠN
            ================================================= */

            <>
              <div className="rp-section-heading">
                <h2>Chọn gói tập của bạn</h2>
                <p>
                  Khám phá các đặc quyền và lựa chọn gói tập phù hợp.
                </p>
              </div>

              <div className="rp-packages">
                {packagesList.map((pkg) => {
                  const isSelected = selectedPackage === pkg.id;

                  return (
                    <div
                      key={pkg.id}
                      className={`rp-package-card ${
                        isSelected ? "selected" : ""
                      } ${pkg.id === "vip" ? "vip-card" : ""}`}
                      onClick={() => {
                        clearMessages();
                        setSelectedPackage(pkg.id);
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter" ||
                          e.key === " "
                        ) {
                          e.preventDefault();
                          setSelectedPackage(pkg.id);
                        }
                      }}
                      aria-pressed={isSelected}
                    >
                      {pkg.popular && (
                        <div className="rp-popular">
                          <Crown size={13} />
                          ĐƯỢC ƯA CHUỘNG
                        </div>
                      )}

                      <div className="rp-package-top">
                        <div className="rp-package-icon">
                          {pkg.id === "vip" ? (
                            <Crown size={25} />
                          ) : (
                            <Dumbbell size={25} />
                          )}
                        </div>

                        {isSelected && (
                          <div className="rp-selected-mark">
                            <Check size={15} strokeWidth={3} />
                          </div>
                        )}
                      </div>

                      <div className="rp-package-subtitle">
                        {pkg.subtitle}
                      </div>

                      <h3 className="rp-package-name">
                        {pkg.name}
                      </h3>

                      <div className="rp-package-duration">
                        <Clock3 size={14} />
                        {pkg.duration}
                      </div>

                      <div className="rp-package-price">
                        <span className="rp-price">
                          {pkg.price}
                        </span>
                        <span className="rp-price-unit">
                          / tháng
                        </span>
                      </div>

                      <h4 className="rp-feature-title">
                        Đặc quyền thành viên
                      </h4>

                      <ul className="rp-features">
                        {pkg.features.map((feature, index) => (
                          <li
                            className="rp-feature"
                            key={index}
                          >
                            <span className="rp-feature-check">
                              <Check
                                size={12}
                                strokeWidth={3}
                              />
                            </span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <button
                        type="button"
                        className={`rp-select-button ${
                          isSelected ? "active" : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          clearMessages();
                          setSelectedPackage(pkg.id);
                        }}
                      >
                        {isSelected ? (
                          <>
                            <CircleCheck size={16} />
                            Đã chọn gói này
                          </>
                        ) : (
                          <>
                            Chọn gói tập
                            <ArrowRight size={16} />
                          </>
                        )}
                      </button>

                      {!pkg.backendId && (
                        <span className="rp-field-note">
                          Chưa tìm thấy gói tương ứng trên Backend.
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="rp-form-panel">
                <div className="rp-form-heading">
                  <div className="rp-form-heading-icon">
                    <CreditCard size={22} />
                  </div>

                  <div>
                    <h3>Xác nhận thông tin đăng ký</h3>
                    <p>
                      Kiểm tra thông tin trước khi hoàn tất đăng ký.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleRegister}>
                  <div className="rp-form-grid">
                    <div className="rp-field">
                      <label>Họ và tên</label>

                      <div className="rp-input-wrap">
                        <UserRound
                          className="rp-input-icon"
                          size={17}
                        />

                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) =>
                            setFullName(e.target.value)
                          }
                          placeholder="Nhập họ và tên..."
                          required
                        />
                      </div>
                    </div>

                    <div className="rp-field">
                      <label>Số điện thoại</label>

                      <div className="rp-input-wrap">
                        <Phone
                          className="rp-input-icon"
                          size={17}
                        />

                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) =>
                            setPhone(e.target.value)
                          }
                          placeholder="Nhập số điện thoại..."
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rp-summary">
                    <div>
                      <div className="rp-summary-label">
                        GÓI TẬP ĐÃ LỰA CHỌN
                      </div>

                      <div className="rp-summary-name">
                        {currentPkg?.name}
                      </div>

                      <div className="rp-summary-note">
                        {currentPkg?.duration}
                      </div>
                    </div>

                    <div className="rp-summary-price">
                      {currentPkg?.price}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="rp-submit"
                    disabled={submitting || !currentPkg?.backendId}
                  >
                    {submitting ? (
                      <>
                        <LoaderCircle size={18} />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        Đăng ký gói tập
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </>
          )}
        </>
      )}

      <div className="rp-security-note">
        <ShieldCheck size={16} />
        Thông tin đăng ký được liên kết với tài khoản IronPulse của bạn
      </div>
    </div>
  );
}