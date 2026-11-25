'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';

const fa = (n: number) => new Intl.NumberFormat('fa-IR').format(n);
const money = (n: number) => `${fa(n)} تومان`;

export default function MenuApp() {
  const { data, ready } = useStore();
  const [cart, setCart] = useState<Map<number, number>>(new Map());
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [activeCategory, setActiveCategory] = useState('همه');
  const [search, setSearch] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [waiterOpen, setWaiterOpen] = useState(false);
  const [toast, setToast] = useState('');

  const banner = useMemo(
    () => data.banners.find((b) => b.active) ?? data.banners[0],
    [data.banners],
  );
  const categories = useMemo(
    () => [...data.categories].sort((a, b) => a.order - b.order),
    [data.categories],
  );
  const products = useMemo(() => data.products.filter((p) => p.active), [data.products]);
  const cafe = data.cafe;
  const telHref = `tel:${cafe.phone}`;
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${cafe.lat},${cafe.lng}`;

  const count = [...cart.values()].reduce((s, q) => s + q, 0);
  const total = [...cart].reduce((s, [id, q]) => {
    const p = products.find((x) => x.id === id);
    return s + (p ? p.price * q : 0);
  }, 0);

  const filtered = products.filter(
    (p) =>
      (activeCategory === 'همه' || p.category === activeCategory) &&
      `${p.name} ${p.desc}`.includes(search),
  );

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    document.body.classList.toggle('locked', cartOpen || infoOpen || waiterOpen);
  }, [cartOpen, infoOpen, waiterOpen]);

  function add(id: number, delta = 1) {
    setCart((prev) => {
      const next = new Map(prev);
      const value = (next.get(id) || 0) + delta;
      if (value <= 0) next.delete(id);
      else next.set(id, value);
      return next;
    });
  }

  function toggleFav(id: number) {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openCart() {
    if (!count) {
      setToast('سبد انتخاب شما خالی است');
      return;
    }
    setInfoOpen(false);
    setCartOpen(true);
  }

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(`${cafe.name}\n${cafe.address}\n${cafe.phoneDisplay}`);
      setToast('آدرس و شماره تماس کپی شد');
    } catch {
      setToast('امکان کپی در این مرورگر وجود ندارد');
    }
  }

  async function copyOrder() {
    const text =
      [...cart]
        .map(([id, q]) => {
          const p = products.find((x) => x.id === id);
          return p ? `${p.name} × ${q} — ${money(p.price * q)}` : '';
        })
        .filter(Boolean)
        .join('\n') + `\nجمع کل: ${money(total)}`;
    try {
      await navigator.clipboard.writeText(text);
      setToast('خلاصه انتخاب‌ها کپی شد');
    } catch {
      setToast('امکان کپی در این مرورگر وجود ندارد');
    }
  }

  if (!ready || !banner) {
    return (
      <div className="app-shell" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <p style={{ color: '#b0a0c4' }}>در حال بارگذاری منو...</p>
      </div>
    );
  }

  const overlayOn = cartOpen || infoOpen || waiterOpen;

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="icon-btn menu-btn" aria-label="منو" onClick={() => setInfoOpen(true)}>
          <svg viewBox="0 0 24 24">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <a className="brand" href="#top" aria-label={cafe.name}>
          <span className="brand-mark" aria-hidden="true">
            ✦
          </span>
          <span>
            <b>{cafe.name}</b>
            <small>{cafe.tagline}</small>
          </span>
        </a>
        <button className="cart-top" aria-label="سبد خرید" onClick={openCart}>
          <svg viewBox="0 0 24 24">
            <path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 1.9-1.4L22 8H6" />
            <circle cx="10" cy="21" r="1" />
            <circle cx="18" cy="21" r="1" />
          </svg>
          <span>{fa(count)}</span>
        </button>
      </header>

      <main id="top">
        <section className="hero" aria-label={`معرفی ${cafe.name}`}>
          <div className="hero-photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={banner.image} alt={banner.title} width={1400} height={1050} fetchPriority="high" />
          </div>
          <div className="disco-rays" aria-hidden="true" />
          <div className="disco-orb" aria-hidden="true" />
          <div className="hero-glow" aria-hidden="true" />
          <div className="hero-copy">
            {banner.badge ? (
              <div className="disco-badge">
                <span className="dot" aria-hidden="true" />
                {banner.badge}
              </div>
            ) : null}
            <span className="eyebrow">{banner.eyebrow}</span>
            <h1>{banner.title}</h1>
            <p>{banner.subtitle}</p>
            <a href="#menu" className="hero-cta">
              {banner.ctaLabel} <span>←</span>
            </a>
          </div>
        </section>

        <section className="menu-section" id="menu">
          <div className="section-heading">
            <div>
              <span className="eyebrow">MADE WITH LOVE</span>
              <h2>منوی {cafe.name}</h2>
            </div>
            <span className="open-note">
              <i /> آماده پذیرایی
            </span>
          </div>

          <div className="search-wrap">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m16 16 4 4" />
            </svg>
            <input
              type="search"
              placeholder="چی میل دارید؟ جستجو کنید..."
              autoComplete="off"
              value={search}
              onChange={(e) => setSearch(e.target.value.trimStart())}
            />
          </div>

          <nav className="categories" aria-label="دسته‌بندی منو">
            {categories.map((c) => (
              <button
                key={c.id}
                className={`category${activeCategory === c.name ? ' active' : ''}`}
                onClick={() => setActiveCategory(c.name)}
              >
                {c.name}
              </button>
            ))}
          </nav>

          <div className="products-head">
            <h3>{activeCategory === 'همه' ? `پیشنهادهای ${cafe.name}` : activeCategory}</h3>
            <span>{fa(filtered.length)} انتخاب</span>
          </div>

          <div className="product-grid">
            {filtered.map((p) => {
              const q = cart.get(p.id) || 0;
              return (
                <article className="product-card" key={p.id}>
                  <div className="product-image">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt={p.name} loading="lazy" />
                    {p.tag ? <span className="product-tag">{p.tag}</span> : null}
                    <button
                      className={`favorite${favorites.has(p.id) ? ' active' : ''}`}
                      aria-label="علاقه‌مندی"
                      onClick={() => toggleFav(p.id)}
                    >
                      {favorites.has(p.id) ? '♥' : '♡'}
                    </button>
                  </div>
                  <div className="product-info">
                    <h4>{p.name}</h4>
                    <p>{p.desc}</p>
                    <strong className="price">{money(p.price)}</strong>
                    <div className="product-actions">
                      {q ? (
                        <div className="quantity-control">
                          <button aria-label="کم کردن" onClick={() => add(p.id, -1)}>
                            −
                          </button>
                          <span>{fa(q)}</span>
                          <button aria-label="زیاد کردن" onClick={() => add(p.id)}>
                            +
                          </button>
                        </div>
                      ) : (
                        <button className="add-btn" onClick={() => add(p.id)}>
                          ＋ افزودن به سبد
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          {filtered.length === 0 ? <div className="empty-state">موردی با این مشخصات پیدا نشد.</div> : null}
        </section>

        <section className="visit-section" id="visit" aria-label="آدرس و تماس">
          <div className="section-heading">
            <div>
              <span className="eyebrow">FIND US</span>
              <h2>آدرس و تماس</h2>
            </div>
          </div>

          <article className="visit-card">
            <div className="visit-map" role="img" aria-label="موقعیت تقریبی کافه">
              <div className="visit-map-pin" aria-hidden="true">
                <span />
              </div>
              <div className="visit-map-label">
                {cafe.name} · {cafe.tagline}
              </div>
            </div>
            <div className="visit-body">
              <div className="visit-row">
                <span className="visit-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                </span>
                <div>
                  <small>آدرس</small>
                  <p>{cafe.address}</p>
                </div>
              </div>
              <div className="visit-row">
                <span className="visit-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 6v6l4 2" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                </span>
                <div>
                  <small>ساعات کاری</small>
                  <p>{cafe.hours}</p>
                </div>
              </div>
              <div className="visit-row">
                <span className="visit-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2a1.4 1.4 0 0 1 1.4-.3c1.5.5 3.1.8 4.8.8a1.5 1.5 0 0 1 1.5 1.5V20a1.5 1.5 0 0 1-1.5 1.5A17.5 17.5 0 0 1 2.5 4.5 1.5 1.5 0 0 1 4 3h3.7A1.5 1.5 0 0 1 9.2 4.5c0 1.7.3 3.3.8 4.8a1.4 1.4 0 0 1-.3 1.4L7.5 12.9" />
                  </svg>
                </span>
                <div>
                  <small>تلفن</small>
                  <p>
                    <a className="visit-phone" href={telHref}>
                      {cafe.phoneDisplay}
                    </a>
                  </p>
                </div>
              </div>
              <div className="visit-actions">
                <a className="visit-btn visit-btn-primary" href={telHref}>
                  تماس با کافه
                </a>
                <a className="visit-btn" href={mapsHref} target="_blank" rel="noopener noreferrer">
                  مسیریابی
                </a>
                <button type="button" className="visit-btn" onClick={copyAddress}>
                  کپی آدرس
                </button>
              </div>
            </div>
          </article>

          <footer className="site-footer">
            <p>
              {cafe.name} · {cafe.tagline}
            </p>
            <div className="footer-links">
              <a href={cafe.instagram} target="_blank" rel="noopener noreferrer">
                اینستاگرام
              </a>
              <a href={telHref}>تماس</a>
              <a href="#visit">لوکیشن</a>
              <Link href="/admin">پنل ادمین</Link>
            </div>
          </footer>
        </section>
      </main>

      <button className={`floating-cart${count ? ' has-items' : ''}`} onClick={openCart}>
        <span className="floating-count">{fa(count)}</span>
        <span className="floating-label">سبد انتخاب شما</span>
        <strong>{money(total)}</strong>
        <span className="floating-arrow">↑</span>
      </button>

      <div
        className={`overlay${overlayOn ? ' show' : ''}`}
        onClick={() => {
          setCartOpen(false);
          setInfoOpen(false);
          setWaiterOpen(false);
        }}
      />

      <aside className={`info-drawer${infoOpen ? ' open' : ''}`} aria-hidden={!infoOpen}>
        <div className="info-drawer-head">
          <div>
            <span className="eyebrow">ESTILA</span>
            <h2>{cafe.tagline}</h2>
          </div>
          <button className="close-btn" aria-label="بستن" onClick={() => setInfoOpen(false)}>
            ×
          </button>
        </div>
        <nav className="info-nav">
          <a
            href="#menu"
            onClick={() => setInfoOpen(false)}
          >
            منوی کافه
          </a>
          <a href="#visit" onClick={() => setInfoOpen(false)}>
            آدرس و لوکیشن
          </a>
          <Link href="/admin" onClick={() => setInfoOpen(false)}>
            ورود ادمین
          </Link>
        </nav>
        <div className="info-block">
          <small>آدرس</small>
          <p>{cafe.address}</p>
        </div>
        <div className="info-block">
          <small>ساعات کاری</small>
          <p>{cafe.hours}</p>
        </div>
        <div className="info-block">
          <small>تلفن</small>
          <p>
            <a className="visit-phone" href={telHref}>
              {cafe.phoneDisplay}
            </a>
          </p>
        </div>
        <div className="visit-actions info-actions">
          <a className="visit-btn visit-btn-primary" href={telHref}>
            تماس مستقیم
          </a>
          <a className="visit-btn" href={mapsHref} target="_blank" rel="noopener noreferrer">
            باز کردن نقشه
          </a>
          <a className="visit-btn" href={cafe.instagram} target="_blank" rel="noopener noreferrer">
            اینستاگرام
          </a>
        </div>
      </aside>

      <section className={`cart-sheet${cartOpen ? ' open' : ''}`} aria-hidden={!cartOpen}>
        <div className="sheet-handle" />
        <div className="sheet-head">
          <div>
            <span className="eyebrow">YOUR SELECTION</span>
            <h2>سبد انتخاب شما</h2>
          </div>
          <button className="close-btn" aria-label="بستن" onClick={() => setCartOpen(false)}>
            ×
          </button>
        </div>
        <div className="cart-items">
          {count === 0 ? (
            <div className="empty-state">
              سبد شما هنوز خالی است.
              <br />
              از منو چیزی خوشمزه انتخاب کنید.
            </div>
          ) : (
            [...cart].map(([id, q]) => {
              const p = products.find((x) => x.id === id);
              if (!p) return null;
              return (
                <div className="cart-row" key={id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt="" />
                  <div className="cart-row-main">
                    <b>{p.name}</b>
                    <small>{money(p.price * q)}</small>
                    <div className="quantity-control">
                      <button onClick={() => add(id, -1)}>−</button>
                      <span>{fa(q)}</span>
                      <button onClick={() => add(id)}>+</button>
                    </div>
                  </div>
                  <button
                    className="remove-item"
                    aria-label="حذف"
                    onClick={() =>
                      setCart((prev) => {
                        const next = new Map(prev);
                        next.delete(id);
                        return next;
                      })
                    }
                  >
                    ×
                  </button>
                </div>
              );
            })
          )}
        </div>
        <div className="cart-footer">
          <div className="total-row">
            <span>جمع کل</span>
            <strong>{money(total)}</strong>
          </div>
          <button
            className="waiter-btn"
            onClick={() => {
              if (!count) {
                setToast('ابتدا محصولی انتخاب کنید');
                return;
              }
              setWaiterOpen(true);
            }}
          >
            نمایش به گارسون <span>♨</span>
          </button>
          <p className="payment-note">پرداخت و ثبت سفارش نزد گارسون انجام می‌شود.</p>
        </div>
      </section>

      <section className={`waiter-modal${waiterOpen ? ' open' : ''}`} aria-hidden={!waiterOpen}>
        <button className="close-btn modal-close" onClick={() => setWaiterOpen(false)}>
          ×
        </button>
        <div className="waiter-icon">✓</div>
        <span className="eyebrow">READY TO SHOW</span>
        <h2>انتخاب شما آماده است</h2>
        <p>این فهرست را به گارسون نشان دهید.</p>
        <div className="waiter-items">
          {[...cart].map(([id, q]) => {
            const p = products.find((x) => x.id === id);
            if (!p) return null;
            return (
              <div className="waiter-line" key={id}>
                <span>
                  {p.name} × {fa(q)}
                </span>
                <span>{money(p.price * q)}</span>
              </div>
            );
          })}
        </div>
        <div className="total-row">
          <span>مبلغ کل</span>
          <strong>{money(total)}</strong>
        </div>
        <button className="waiter-btn" onClick={copyOrder}>
          کپی خلاصه انتخاب‌ها
        </button>
        <small>ثبت نهایی و پرداخت نزد گارسون انجام می‌شود.</small>
      </section>

      <div className={`toast${toast ? ' show' : ''}`} role="status">
        {toast}
      </div>
    </div>
  );
}
