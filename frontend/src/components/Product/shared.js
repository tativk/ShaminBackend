import { FaStar } from "react-icons/fa";

export const CATEGORY_LABEL = { perfume: "عطر و ادکلن", cosmetic: "لوازم آرایشی", accessory: "اکسسوری" };
export const GENDER_LABEL = { male: "مردانه", female: "زنانه", unisex: "یونیسکس" };
export const FALLBACK_IMAGE = "/logo.png";
export const MIN_GRAM = 5;

export const formatPrice = (value) => new Intl.NumberFormat("fa-IR").format(value) + " تومان";

export const isLoggedIn = () => Boolean(localStorage.getItem("access") || localStorage.getItem("access_token"));

export const Stars = ({ rating }) => (
  <div className="stars" aria-label={`امتیاز ${rating} از ۵`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <FaStar key={i} className={i < rating ? "star star--full" : "star star--empty"} />
    ))}
  </div>
);
