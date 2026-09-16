import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    // غیرفعال کردن بازیابی خودکار اسکرول توسط مرورگر
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // اسکرول فوری به بالا
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;