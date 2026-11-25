'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import type { Banner, Category, Product } from '@/lib/types';

type Tab = 'products' | 'categories' | 'banners' | 'cafe';

const emptyProduct = (): Product => ({
  id: Date.now(),
  name: '',
  desc: '',
  price: 0,
  category: 'قهوه گرم',
  tag: '',
  image: '/images/hero-disco.jpg',
  active: true,
});

const emptyCategory = (): Category => ({
  id: `cat-${Date.now()}`,
  name: '',
  order: 10,
});

const emptyBanner = (): Banner => ({
  id: `banner-${Date.now()}`,
  eyebrow: 'CAFE · DISCO · NIGHT',
  title: '',
  subtitle: '',
  ctaLabel: 'مشاهده منو',
  image: '/images/hero-disco.jpg',
  badge: '',
  active: true,
});

export default function AdminApp() {
  const store = useStore();
  const [tab, setTab] = useState<Tab>('products');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [cafeDraft, setCafeDraft] = useState(store.data.cafe);
  const [savedFlash, setSavedFlash] = useState('');

  const categoryNames = useMemo(
    () => store.data.categories.filter((c) => c.name !== 'همه').map((c) => c.name),
    [store.data.categories],
  );

  function flash(msg: string) {
    setSavedFlash(msg);
    setTimeout(() => setSavedFlash(''), 1800);
  }

  if (!store.ready) {
    return <div className="admin-shell">در حال بارگذاری...</div>;
  }

  if (!store.isAdmin) {
    return (
      <div className="admin-shell">
        <form
          className="admin-login"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            if (store.login(password)) {
              setError('');
              setCafeDraft(store.data.cafe);
            } else setError('رمز عبور نادرست است');
          }}
        >
          <span className="eyebrow">ESTILA ADMIN</span>
          <h1>ورود به پنل مدیریت</h1>
          <p>محصولات، دسته‌بندی‌ها، بنر هیرو و اطلاعات کافه را از اینجا مدیریت کنید.</p>
          <label>
            رمز عبور
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="رمز ادمین"
              autoFocus
            />
          </label>
          {error ? <div className="admin-error">{error}</div> : null}
          <button type="submit" className="admin-primary">
            ورود
          </button>
          <p className="admin-hint">رمز پیش‌فرض: estila2024</p>
          <Link href="/" className="admin-link">
            ← بازگشت به منو
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <header className="admin-top">
        <div>
          <span className="eyebrow">DASHBOARD</span>
          <h1>پنل ادمین استیلا</h1>
        </div>
        <div className="admin-top-actions">
          <Link href="/" className="admin-ghost">
            مشاهده منو
          </Link>
          <button className="admin-ghost" onClick={store.logout}>
            خروج
          </button>
        </div>
      </header>

      {savedFlash ? <div className="admin-flash">{savedFlash}</div> : null}

      <nav className="admin-tabs">
        {(
          [
            ['products', 'محصولات'],
            ['categories', 'دسته‌بندی'],
            ['banners', 'بنرها'],
            ['cafe', 'اطلاعات کافه'],
          ] as const
        ).map(([id, label]) => (
          <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </nav>

      {tab === 'products' ? (
        <section className="admin-panel">
          <div className="admin-panel-head">
            <h2>مدیریت محصولات ({store.data.products.length})</h2>
            <button className="admin-primary" onClick={() => setEditingProduct(emptyProduct())}>
              + محصول جدید
            </button>
          </div>
          <div className="admin-table">
            {store.data.products.map((p) => (
              <div className="admin-row" key={p.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt="" />
                <div className="admin-row-main">
                  <b>
                    {p.name} {!p.active ? <em>(غیرفعال)</em> : null}
                  </b>
                  <span>
                    {p.category} · {p.price.toLocaleString('fa-IR')} تومان
                  </span>
                </div>
                <button className="admin-ghost" onClick={() => setEditingProduct(p)}>
                  ویرایش
                </button>
                <button
                  className="admin-danger"
                  onClick={() => {
                    if (confirm('حذف این محصول؟')) {
                      store.deleteProduct(p.id);
                      flash('محصول حذف شد');
                    }
                  }}
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {tab === 'categories' ? (
        <section className="admin-panel">
          <div className="admin-panel-head">
            <h2>دسته‌بندی‌ها</h2>
            <button className="admin-primary" onClick={() => setEditingCategory(emptyCategory())}>
              + دسته جدید
            </button>
          </div>
          <div className="admin-table">
            {[...store.data.categories]
              .sort((a, b) => a.order - b.order)
              .map((c) => (
                <div className="admin-row" key={c.id}>
                  <div className="admin-row-main">
                    <b>{c.name}</b>
                    <span>ترتیب: {c.order}</span>
                  </div>
                  <button className="admin-ghost" onClick={() => setEditingCategory(c)}>
                    ویرایش
                  </button>
                  {c.id !== 'all' ? (
                    <button
                      className="admin-danger"
                      onClick={() => {
                        if (confirm('حذف این دسته‌بندی؟')) {
                          store.deleteCategory(c.id);
                          flash('دسته حذف شد');
                        }
                      }}
                    >
                      حذف
                    </button>
                  ) : null}
                </div>
              ))}
          </div>
        </section>
      ) : null}

      {tab === 'banners' ? (
        <section className="admin-panel">
          <div className="admin-panel-head">
            <h2>بنرهای هیرو</h2>
            <button className="admin-primary" onClick={() => setEditingBanner(emptyBanner())}>
              + بنر جدید
            </button>
          </div>
          <div className="admin-table">
            {store.data.banners.map((b) => (
              <div className="admin-row" key={b.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.image} alt="" />
                <div className="admin-row-main">
                  <b>
                    {b.title} {b.active ? <em className="ok">فعال</em> : <em>(غیرفعال)</em>}
                  </b>
                  <span>{b.badge || b.eyebrow}</span>
                </div>
                <button className="admin-ghost" onClick={() => setEditingBanner(b)}>
                  ویرایش
                </button>
                <button
                  className="admin-danger"
                  onClick={() => {
                    if (confirm('حذف این بنر؟')) {
                      store.deleteBanner(b.id);
                      flash('بنر حذف شد');
                    }
                  }}
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {tab === 'cafe' ? (
        <section className="admin-panel">
          <div className="admin-panel-head">
            <h2>اطلاعات کافه</h2>
            <button
              className="admin-danger"
              onClick={() => {
                if (confirm('بازگردانی همه داده‌ها به حالت اولیه؟')) {
                  store.resetData();
                  setCafeDraft(store.data.cafe);
                  flash('داده‌ها ریست شد');
                }
              }}
            >
              ریست همه داده‌ها
            </button>
          </div>
          <form
            className="admin-form"
            onSubmit={(e) => {
              e.preventDefault();
              store.updateCafe(cafeDraft);
              flash('اطلاعات کافه ذخیره شد');
            }}
          >
            {(
              [
                ['name', 'نام'],
                ['tagline', 'شعار'],
                ['phone', 'تلفن (لاتین)'],
                ['phoneDisplay', 'نمایش تلفن'],
                ['address', 'آدرس'],
                ['hours', 'ساعات کاری'],
                ['instagram', 'لینک اینستاگرام'],
              ] as const
            ).map(([key, label]) => (
              <label key={key}>
                {label}
                <input
                  value={String(cafeDraft[key])}
                  onChange={(e) => setCafeDraft({ ...cafeDraft, [key]: e.target.value })}
                />
              </label>
            ))}
            <div className="admin-form-grid">
              <label>
                عرض جغرافیایی
                <input
                  type="number"
                  step="0.0001"
                  value={cafeDraft.lat}
                  onChange={(e) => setCafeDraft({ ...cafeDraft, lat: Number(e.target.value) })}
                />
              </label>
              <label>
                طول جغرافیایی
                <input
                  type="number"
                  step="0.0001"
                  value={cafeDraft.lng}
                  onChange={(e) => setCafeDraft({ ...cafeDraft, lng: Number(e.target.value) })}
                />
              </label>
            </div>
            <button type="submit" className="admin-primary">
              ذخیره اطلاعات کافه
            </button>
          </form>
        </section>
      ) : null}

      {editingProduct ? (
        <Modal title="محصول" onClose={() => setEditingProduct(null)}>
          <form
            className="admin-form"
            onSubmit={(e) => {
              e.preventDefault();
              store.upsertProduct(editingProduct);
              setEditingProduct(null);
              flash('محصول ذخیره شد');
            }}
          >
            <label>
              نام
              <input
                required
                value={editingProduct.name}
                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
              />
            </label>
            <label>
              توضیحات
              <input
                value={editingProduct.desc}
                onChange={(e) => setEditingProduct({ ...editingProduct, desc: e.target.value })}
              />
            </label>
            <div className="admin-form-grid">
              <label>
                قیمت (تومان)
                <input
                  type="number"
                  required
                  value={editingProduct.price}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, price: Number(e.target.value) })
                  }
                />
              </label>
              <label>
                دسته‌بندی
                <select
                  value={editingProduct.category}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, category: e.target.value })
                  }
                >
                  {categoryNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              تگ (مثل پرفروش)
              <input
                value={editingProduct.tag}
                onChange={(e) => setEditingProduct({ ...editingProduct, tag: e.target.value })}
              />
            </label>
            <label>
              آدرس تصویر
              <input
                value={editingProduct.image}
                onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
              />
            </label>
            <label className="admin-check">
              <input
                type="checkbox"
                checked={editingProduct.active}
                onChange={(e) => setEditingProduct({ ...editingProduct, active: e.target.checked })}
              />
              فعال در منو
            </label>
            <button type="submit" className="admin-primary">
              ذخیره محصول
            </button>
          </form>
        </Modal>
      ) : null}

      {editingCategory ? (
        <Modal title="دسته‌بندی" onClose={() => setEditingCategory(null)}>
          <form
            className="admin-form"
            onSubmit={(e) => {
              e.preventDefault();
              store.upsertCategory(editingCategory);
              setEditingCategory(null);
              flash('دسته‌بندی ذخیره شد');
            }}
          >
            <label>
              نام دسته
              <input
                required
                value={editingCategory.name}
                onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
              />
            </label>
            <label>
              ترتیب نمایش
              <input
                type="number"
                value={editingCategory.order}
                onChange={(e) =>
                  setEditingCategory({ ...editingCategory, order: Number(e.target.value) })
                }
              />
            </label>
            <button type="submit" className="admin-primary">
              ذخیره دسته
            </button>
          </form>
        </Modal>
      ) : null}

      {editingBanner ? (
        <Modal title="بنر هیرو" onClose={() => setEditingBanner(null)}>
          <form
            className="admin-form"
            onSubmit={(e) => {
              e.preventDefault();
              const exists = store.data.banners.some((b) => b.id === editingBanner.id);
              const list = exists
                ? store.data.banners.map((b) => (b.id === editingBanner.id ? editingBanner : b))
                : [...store.data.banners, editingBanner];
              const next = editingBanner.active
                ? list.map((b) => ({ ...b, active: b.id === editingBanner.id }))
                : list;
              store.setBanners(next);
              setEditingBanner(null);
              flash('بنر ذخیره شد');
            }}
          >
            <label>
              عنوان
              <input
                required
                value={editingBanner.title}
                onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
              />
            </label>
            <label>
              زیرعنوان
              <textarea
                rows={3}
                value={editingBanner.subtitle}
                onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
              />
            </label>
            <label>
              Eyebrow
              <input
                value={editingBanner.eyebrow}
                onChange={(e) => setEditingBanner({ ...editingBanner, eyebrow: e.target.value })}
              />
            </label>
            <label>
              بج دیسکو
              <input
                value={editingBanner.badge}
                onChange={(e) => setEditingBanner({ ...editingBanner, badge: e.target.value })}
              />
            </label>
            <label>
              متن دکمه
              <input
                value={editingBanner.ctaLabel}
                onChange={(e) => setEditingBanner({ ...editingBanner, ctaLabel: e.target.value })}
              />
            </label>
            <label>
              تصویر بنر (مسیر یا URL)
              <input
                value={editingBanner.image}
                onChange={(e) => setEditingBanner({ ...editingBanner, image: e.target.value })}
              />
            </label>
            <label className="admin-check">
              <input
                type="checkbox"
                checked={editingBanner.active}
                onChange={(e) => setEditingBanner({ ...editingBanner, active: e.target.checked })}
              />
              بنر فعال (فقط یکی در هیرو نمایش داده می‌شود)
            </label>
            <button type="submit" className="admin-primary">
              ذخیره بنر
            </button>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="admin-modal-wrap">
      <div className="admin-modal-backdrop" onClick={onClose} />
      <div className="admin-modal">
        <div className="admin-modal-head">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
