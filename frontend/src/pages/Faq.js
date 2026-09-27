import React, { useMemo, useState } from "react";
import {
  FiSearch,
  FiChevronDown,
  FiMessageCircle,
  FiArrowLeft,
  FiPackage,
  FiTruck,
  FiCreditCard,
  FiBox,
  FiHelpCircle,
} from "react-icons/fi";
import "./Faq.css";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
const shaminFaqData = [
  {
    id: 1,
    category: "سفارش",
    icon: FiPackage,
    question: "چطور می‌توانم سفارشم را ثبت کنم؟",
    answer:
      "محصول موردنظر خود را انتخاب کنید، آن را به سبد خرید اضافه کرده و پس از بررسی سبد، اطلاعات ارسال و روش پرداخت را وارد کنید تا سفارش شما ثبت شود.",
  },
  {
    id: 2,
    category: "ارسال",
    icon: FiTruck,
    question: "سفارش من چه زمانی ارسال می‌شود؟",
    answer:
      "سفارش‌ها پس از تأیید پرداخت و آماده‌سازی، در اولین زمان ممکن تحویل شرکت حمل‌ونقل می‌شوند. زمان رسیدن سفارش بسته به شهر مقصد متفاوت است.",
  },
  {
    id: 3,
    category: "پرداخت",
    icon: FiCreditCard,
    question: "چه روش‌هایی برای پرداخت وجود دارد؟",
    answer:
      "در حال حاضر می‌توانید هزینه سفارش خود را به‌صورت آنلاین و از طریق درگاه پرداخت امن فروشگاه پرداخت کنید.",
  },
  {
    id: 4,
    category: "محصولات",
    icon: FiBox,
    question: "آیا محصولات شما اصل هستند؟",
    answer:
      "بله، اصالت محصولات ارائه‌شده برای شامین اهمیت بالایی دارد و اطلاعات مربوط به هر محصول در صفحه همان محصول درج می‌شود.",
  },
  {
    id: 5,
    category: "سفارش",
    icon: FiPackage,
    question: "آیا امکان لغو سفارش وجود دارد؟",
    answer:
      "در صورتی که سفارش هنوز وارد مرحله ارسال نشده باشد، می‌توانید برای بررسی امکان لغو با پشتیبانی فروشگاه تماس بگیرید.",
  },
  {
    id: 6,
    category: "ارسال",
    icon: FiTruck,
    question: "چطور وضعیت سفارش خود را پیگیری کنم؟",
    answer:
      "پس از ارسال سفارش، اطلاعات مربوط به وضعیت و کد پیگیری در حساب کاربری شما قابل مشاهده خواهد بود.",
  },
  {
    id: 7,
    category: "محصولات",
    icon: FiBox,
    question: "چطور می‌توانم رایحه مناسب خودم را پیدا کنم؟",
    answer:
      "در صفحه هر عطر اطلاعاتی مانند جنسیت، گروه بویایی و نت‌های رایحه قرار گرفته است که می‌تواند برای انتخاب عطر مناسب به شما کمک کند.",
  },
  {
    id: 8,
    category: "پرداخت",
    icon: FiCreditCard,
    question: "اگر پرداخت ناموفق باشد چه اتفاقی می‌افتد؟",
    answer:
      "اگر پرداخت ناموفق باشد، سفارش نهایی نمی‌شود. در صورت کسر وجه، معمولاً مبلغ پس از طی فرآیند بانکی به حساب شما بازگردانده خواهد شد.",
  },
];

const shaminCategories = [
  { id: "all", title: "همه", icon: FiHelpCircle },
  { id: "سفارش", title: "سفارش", icon: FiPackage },
  { id: "ارسال", title: "ارسال", icon: FiTruck },
  { id: "پرداخت", title: "پرداخت", icon: FiCreditCard },
  { id: "محصولات", title: "محصولات", icon: FiBox },
];

function Faq() {
  const [shaminSearch, setShaminSearch] = useState("");
  const [shaminCategory, setShaminCategory] = useState("all");
  const [shaminOpenFaq, setShaminOpenFaq] = useState(null);

  const shaminFilteredFaqs = useMemo(() => {
    const search = shaminSearch.trim().toLowerCase();

    return shaminFaqData.filter((item) => {
      const matchesCategory =
        shaminCategory === "all" || item.category === shaminCategory;

      const matchesSearch =
        !search ||
        item.question.toLowerCase().includes(search) ||
        item.answer.toLowerCase().includes(search) ||
        item.category.toLowerCase().includes(search);

      return matchesCategory && matchesSearch;
    });
  }, [shaminSearch, shaminCategory]);

  const shaminToggleFaq = (id) => {
    setShaminOpenFaq((previous) => (previous === id ? null : id));
  };

  const shaminHandleCategory = (category) => {
    setShaminCategory(category);
    setShaminOpenFaq(null);
  };

  return (
    <main>
    <Header />
    <div className="shamin-faq" dir="rtl">
      
      <div className="shamin-faq__container">
        
        <header className="shamin-faq__header">
          <a href="/" className="shamin-faq__logo" aria-label="Shamin">
            <img src="/Asets/Shamin gallery.png" alt="Shamin Gallery" />
          </a>

          <h1 className="shamin-faq__title">سؤالات متداول</h1>

          <p className="shamin-faq__subtitle">
            پاسخ سؤالاتی که بیشتر درباره سفارش، ارسال و محصولات شمین گالری
            پرسیده می‌شوند.
          </p>
        </header>

        <section className="shamin-faq__search-box">
          <FiSearch className="shamin-faq__search-icon" />

          <input
            type="text"
            value={shaminSearch}
            onChange={(event) => setShaminSearch(event.target.value)}
            placeholder="دنبال چه چیزی می‌گردید؟"
            aria-label="جستجو در سوالات متداول"
          />

          {shaminSearch && (
            <button
              type="button"
              className="shamin-faq__search-clear"
              onClick={() => setShaminSearch("")}
              aria-label="پاک کردن جستجو"
            >
              ×
            </button>
          )}
        </section>

        <nav className="shamin-faq__categories" aria-label="دسته‌بندی سوالات">
          {shaminCategories.map((category) => {
            const CategoryIcon = category.icon;
            const isActive = shaminCategory === category.id;

            return (
              <button
                key={category.id}
                type="button"
                className={`shamin-faq__category ${
                  isActive ? "shamin-faq__category--active" : ""
                }`}
                onClick={() => shaminHandleCategory(category.id)}
              >
                <CategoryIcon />
                <span>{category.title}</span>
              </button>
            );
          })}
        </nav>

        <section className="shamin-faq__list">
          {shaminFilteredFaqs.length > 0 ? (
            shaminFilteredFaqs.map((item, index) => {
              const ItemIcon = item.icon;
              const isOpen = shaminOpenFaq === item.id;

              return (
                <article
                  className={`shamin-faq__item ${
                    isOpen ? "shamin-faq__item--open" : ""
                  }`}
                  key={item.id}
                  style={{ "--shamin-faq-index": index }}
                >
                  <button
                    type="button"
                    className="shamin-faq__question"
                    onClick={() => shaminToggleFaq(item.id)}
                    aria-expanded={isOpen}
                  >
                    <span className="shamin-faq__question-main">
                      <span className="shamin-faq__question-icon">
                        <ItemIcon />
                      </span>

                      <span className="shamin-faq__question-text">
                        {item.question}
                      </span>
                    </span>

                    <span className="shamin-faq__chevron">
                      <FiChevronDown />
                    </span>
                  </button>

                  <div
                    className={`shamin-faq__answer ${
                      isOpen ? "shamin-faq__answer--open" : ""
                    }`}
                  >
                    <div className="shamin-faq__answer-inner">
                      <p>{item.answer}</p>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="shamin-faq__empty">
              <div className="shamin-faq__empty-icon">
                <FiSearch />
              </div>

              <h2>نتیجه‌ای پیدا نشد</h2>

              <p>
                سؤال یا عبارت دیگری را جستجو کنید یا دسته‌بندی را تغییر دهید.
              </p>

              <button
                type="button"
                onClick={() => {
                  setShaminSearch("");
                  setShaminCategory("all");
                }}
              >
                نمایش همه سؤالات
              </button>
            </div>
          )}
        </section>

        <section className="shamin-faq__support">
          <div className="shamin-faq__support-icon">
            <FiMessageCircle />
          </div>

          <div className="shamin-faq__support-content">
            <span>پاسخ سؤالتان را پیدا نکردید؟</span>
            <strong>ما اینجا هستیم تا کمکتان کنیم.</strong>
          </div>

          <a href="/support" className="shamin-faq__support-button">
            تماس با پشتیبانی
            <FiArrowLeft />
          </a>
        </section>

        <footer className="shamin-faq__footer">
          <span>© Shamin Gallery</span>
          <span className="shamin-faq__footer-dot" />
          <span>فروشگاهی برای انتخاب رایحه‌ای ماندگار</span>
        </footer>
      </div>
    </div>
    <Footer />
    </main>
  );
}

export default Faq;