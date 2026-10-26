import React from "react";
import { FiTruck, FiShield, FiHeadphones, FiCreditCard, FiAward } from "react-icons/fi";

const FEATURES = [
  { icon: <FiAward />, title: "محصولات اصل", desc: "برندهای معتبر جهانی" },
  { icon: <FiCreditCard />, title: "پرداخت امن", desc: "با درگاه‌های معتبر" },
  { icon: <FiHeadphones />, title: "پشتیبانی ۲۴ ساعته", desc: "پاسخگویی در هر زمان" },
  { icon: <FiShield />, title: "تضمین اصالت کالا", desc: "با ضمانت کیفیت" },
  { icon: <FiTruck />, title: "ارسال سریع", desc: "ارسال به سراسر کشور" },
];

const Features = () => (
  <section className="container features">
    {FEATURES.map((f, i) => (
      <React.Fragment key={f.title}>
        <div className="feature">
          <span className="feature__icon">{f.icon}</span>
          <div className="feature__text">
            <strong>{f.title}</strong>
            <span>{f.desc}</span>
          </div>
        </div>
        {i < FEATURES.length - 1 && <span className="feature__divider" />}
      </React.Fragment>
    ))}
  </section>
);

export default Features;
