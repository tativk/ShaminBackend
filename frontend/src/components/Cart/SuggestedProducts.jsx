import React, { useMemo, useRef } from 'react';
import { getAssetUrl } from '../../api';
import { formatPrice } from './helpers';
import { LeafIcon, ChevronIcon, StarIcon, BasketIcon } from './icons';

/* اسلایدر «شاید این محصولات را هم دوست داشته باشید» */
const SuggestedProducts = ({ products, items, onAdd }) => {
  const sliderRef = useRef(null);
  const suggestedProducts = products
    .filter((p) => !items.some((item) => item.product === p.id))
    .slice(0, 5);

  const scrollSlider = (dir) => {
    sliderRef.current?.scrollBy({ left: dir * 220, behavior: 'smooth' });
  };

  if (!suggestedProducts.length) return null;

  return (
    <section className="cart-suggest">
      <div className="cart-suggest__head">
        <h2 className="cart-suggest__title">شاید این محصولات را هم دوست داشته باشید</h2>
        <span className="cart-suggest__title-icon"><LeafIcon /></span>
      </div>
      <div className="cart-suggest__slider">
        <button type="button" className="cart-suggest__nav" onClick={() => scrollSlider(1)} aria-label="قبلی">
          <ChevronIcon direction="right" />
        </button>
        <div className="cart-suggest__track" ref={sliderRef}>
          {suggestedProducts.map((product) => (
            <article className="suggest-card" key={product.id}>
              <div className="suggest-card__media">
                <img src={getAssetUrl(product.main_image)} alt={product.name} />
              </div>
              <h3 className="suggest-card__name">{product.name}</h3>
              <p className="suggest-card__model">{product.category}</p>
              <p className="suggest-card__brand">{product.brand ?? 'بدون برند'}</p>
              <div className="suggest-card__stars">
                <StarIcon /><StarIcon /><StarIcon /><StarIcon /><StarIcon half />
              </div>
              <div className="suggest-card__foot">
                <span className="suggest-card__price">
                  {formatPrice(product.final_price)} <span>تومان</span>
                </span>
                <button type="button" className="suggest-card__cart" onClick={() => onAdd(product)} aria-label="افزودن به سبد">
                  <BasketIcon />
                </button>
              </div>
            </article>
          ))}
        </div>
        <button type="button" className="cart-suggest__nav" onClick={() => scrollSlider(-1)} aria-label="بعدی">
          <ChevronIcon direction="left" />
        </button>
      </div>
    </section>
  );
};

export default SuggestedProducts;
