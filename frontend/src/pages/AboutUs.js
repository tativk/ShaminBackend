import React from "react";
import {
  FiArrowLeft,
  FiAward,
  FiHeart,
  FiShield,
  FiStar,
  FiMapPin,
  FiPhone,
  FiClock,
  FiInstagram,
} from "react-icons/fi";
import "./AboutUs.css";

function AboutUs() {
  const shaminValues = [
    {
      icon: FiStar,
      title: "انتخاب باکیفیت",
      text: "تلاش می‌کنیم مجموعه‌ای متنوع از رایحه‌های باکیفیت را برای سلیقه‌های مختلف فراهم کنیم.",
    },
    {
      icon: FiShield,
      title: "اعتماد و اصالت",
      text: "اعتماد شما برای ما ارزشمند است و شفافیت در معرفی و ارائه محصولات را جدی می‌گیریم.",
    },
    {
      icon: FiHeart,
      title: "تجربه‌ای متفاوت",
      text: "هدف ما فقط فروش عطر نیست؛ می‌خواهیم انتخاب و خرید رایحه برای شما لذت‌بخش باشد.",
    },
  ];

  const shaminStats = [
    { value: "100+", label: "رایحه و محصول" },
    { value: "24/7", label: "پشتیبانی آنلاین" },
    { value: "تهران", label: "محدوده فعالیت" },
  ];

  return (
    <main className="shamin-about" dir="rtl">
      <div className="shamin-about__container">
        <header className="shamin-about__header">
          <a href="/" className="shamin-about__logo" aria-label="Shamin Gallery">
            <img src="/Asets/Shamin gallery.png" alt="Shamin Gallery" />
          </a>

          <h1 className="shamin-about__title">
            داستان
            <span>شمین گالری</span>
          </h1>

          <p className="shamin-about__intro">
            جایی برای کشف رایحه‌هایی که فقط یک عطر نیستند؛
            <br />
            بلکه بخشی از خاطره و شخصیت شما می‌شوند.
          </p>
        </header>

        <section className="shamin-about__hero">
          <div className="shamin-about__hero-content">
            <span className="shamin-about__hero-kicker">SHAMIN GALLERY</span>

            <h2>
              رایحه‌ای برای
              <br />
              <span>انتخاب شما.</span>
            </h2>

            <div className="shamin-about__hero-line">
              <span />
              <span />
              <span />
            </div>

            <p className="shamin-about__hero-lead">
              انتخاب یک عطر، فقط انتخاب یک رایحه نیست؛
              <br />
              انتخاب حسی است که می‌خواهید با خودتان همراه داشته باشید.
            </p>

            <p>
              در شمین گالری تلاش کرده‌ایم مجموعه‌ای از رایحه‌ها را با معرفی
              شفاف، تجربه‌ای ساده و پشتیبانی همراه کنیم تا پیدا کردن عطر
              مناسب، راحت‌تر و لذت‌بخش‌تر باشد.
            </p>

            <a href="/products" className="shamin-about__hero-link">
              کشف رایحه‌ها
              <FiArrowLeft />
            </a>
          </div>

          <div className="shamin-about__hero-visual">
            <img
              src="/Asets/SHAMIN BANER 1.png"
              alt="Shamin Gallery"
              className="shamin-about__hero-image"
            />

            <div className="shamin-about__hero-image-overlay" />

            <div className="shamin-about__hero-image-badge">
              <span>SHAMIN</span>
              <small>GALLERY</small>
            </div>
          </div>
        </section>

        <section className="shamin-about__stats">
          {shaminStats.map((stat, index) => (
            <div
              className="shamin-about__stat"
              key={stat.label}
              style={{ "--shamin-about-stat-delay": `${index * 100}ms` }}
            >
              <div className="shamin-about__stat-top">
                <span className="shamin-about__stat-number">
                  {stat.value}
                </span>

                <span className="shamin-about__stat-icon">
                  {index === 0 && <FiStar />}
                  {index === 1 && <FiClock />}
                  {index === 2 && <FiMapPin />}
                </span>
              </div>

              <span className="shamin-about__stat-label">
                {stat.label}
              </span>

              <span className="shamin-about__stat-line" />
            </div>
          ))}
        </section>

        <section className="shamin-about__story">
          <div className="shamin-about__story-heading">
            <div className="shamin-about__story-label">
              <span className="shamin-about__story-label-dot" />
              درباره نگاه ما
            </div>

            <h2>
              عطری که انتخاب می‌کنید،
              <br />
              <span>بخشی از شماست.</span>
            </h2>

            <div className="shamin-about__story-number">
              <span>01</span>
              <i />
            </div>
          </div>

          <div className="shamin-about__story-text">
            <p className="shamin-about__story-lead">
              شمین گالری با یک نگاه ساده شکل گرفته است؛
              اینکه پیدا کردن رایحه‌ای که واقعاً با شما هماهنگ باشد،
              نباید تجربه‌ای پیچیده و خسته‌کننده باشد.
            </p>

            <p>
              ما تلاش می‌کنیم انتخاب عطر را از یک خرید ساده فراتر ببریم؛
              از معرفی شفاف محصولات و شناخت بهتر رایحه‌ها گرفته تا تجربه
              خرید و پشتیبانی، هر بخش با دقت طراحی شده تا انتخابی
              آگاهانه‌تر داشته باشید.
            </p>

            <div className="shamin-about__story-signature">
              <span />
              <strong>SHAMIN GALLERY</strong>
            </div>
          </div>
        </section>

        <section className="shamin-about__values">
          {shaminValues.map((item, index) => {
            const ValueIcon = item.icon;

            return (
              <article
                className="shamin-about__value"
                key={item.title}
                style={{
                  "--shamin-about-value-delay": `${index * 100}ms`,
                }}
              >
                <div className="shamin-about__value-top">
                  <span className="shamin-about__value-index">
                    0{index + 1}
                  </span>

                  <div className="shamin-about__value-icon">
                    <ValueIcon />
                  </div>
                </div>

                <div className="shamin-about__value-content">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>

                <span className="shamin-about__value-arrow">
                  <FiArrowLeft />
                </span>
              </article>
            );
          })}
        </section>

        <section className="shamin-about__contact">
          <div className="shamin-about__contact-heading">
            <span className="shamin-about__contact-kicker">
              SHAMIN GALLERY
            </span>

            <h2>
              همیشه در
              <br />
              <span>کنار شما هستیم.</span>
            </h2>

            <p>
              برای دریافت اطلاعات بیشتر، پیگیری سفارش یا مشاوره در انتخاب
              رایحه، از طریق راه‌های ارتباطی زیر با ما در تماس باشید.
            </p>

            <div className="shamin-about__contact-heading-line">
              <span />
              <span />
              <span />
            </div>
          </div>

          <div className="shamin-about__contact-grid">
            <div className="shamin-about__contact-card shamin-about__contact-card--address">
              <div className="shamin-about__contact-icon">
                <FiMapPin />
              </div>

              <div className="shamin-about__contact-card-content">
                <span>آدرس فروشگاه</span>

                <strong>
                  تهران، خیابان ولیعصر، بالاتر از میدان ونک، پلاک ۱۲۸۰
                </strong>

                <small>تهران · ایران</small>
              </div>

              <FiArrowLeft className="shamin-about__contact-card-arrow" />
            </div>

            <div className="shamin-about__contact-card shamin-about__contact-card--phone">
              <div className="shamin-about__contact-icon">
                <FiPhone />
              </div>

              <div className="shamin-about__contact-card-content">
                <span>شماره تماس</span>

                <strong dir="ltr">021-88765432</strong>

                <small>پاسخگویی و مشاوره</small>
              </div>

              <FiArrowLeft className="shamin-about__contact-card-arrow" />
            </div>

            <div className="shamin-about__contact-card shamin-about__contact-card--time">
              <div className="shamin-about__contact-icon">
                <FiClock />
              </div>

              <div className="shamin-about__contact-card-content">
                <span>ساعات پاسخگویی</span>

                <strong>شنبه تا پنجشنبه، ۹ تا ۲۱</strong>

                <small>پاسخگویی آنلاین</small>
              </div>

              <FiArrowLeft className="shamin-about__contact-card-arrow" />
            </div>

            <div className="shamin-about__contact-card shamin-about__contact-card--instagram">
              <div className="shamin-about__contact-icon">
                <FiInstagram />
              </div>

              <div className="shamin-about__contact-card-content">
                <span>اینستاگرام</span>

                <strong dir="ltr">@shamin.gallery</strong>

                <small>ما را دنبال کنید</small>
              </div>

              <FiArrowLeft className="shamin-about__contact-card-arrow" />
            </div>
          </div>
        </section>

        <section className="shamin-about__experience">
          <div className="shamin-about__experience-glow" />

          <div className="shamin-about__experience-icon">
            <FiAward />
          </div>

          <div className="shamin-about__experience-content">
            <span>SHAMIN GALLERY</span>

            <h2>
              رایحه‌ای که
              <strong> با شما می‌ماند.</strong>
            </h2>

            <p>
              از اولین نگاه تا آخرین نت رایحه، انتخاب خودتان را با اطمینان
              شروع کنید.
            </p>
          </div>

          <a href="/products" className="shamin-about__experience-button">
            کشف مجموعه
            <FiArrowLeft />
          </a>
        </section>

        <footer className="shamin-about__footer">
          <span>© Shamin Gallery</span>
          <span className="shamin-about__footer-dot" />
          <span>فروشگاهی برای انتخاب رایحه‌ای ماندگار</span>
        </footer>
      </div>
    </main>
  );
}

export default AboutUs;