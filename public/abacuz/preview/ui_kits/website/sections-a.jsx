/* ABACUZ website — sections. Each takes { lang } ('en'|'th'). */
const A = window.ABZ;
const tr = (node, lang) => (node && typeof node === 'object' && 'en' in node) ? node[lang] : node;

/* ---- The Clear Statement card (reused: hero + showcase) ---- */
function StatementCard({ lang }) {
  const s = A.stmt;
  return (
    <div className="stmt">
      <div className="stmt-h">
        <span className="nm">ABACUZ</span>
        <span className="mo">{s.month.en} · พ.ค.</span>
      </div>
      <div className="stmt-b">
        <div className="stmt-r"><span className="l">{s.income.en} · {s.income.th}</span><span className="v">฿ 420,000</span></div>
        <div className="stmt-r"><span className="l">{s.expense.en} · {s.expense.th}</span><span className="v">฿ 188,500</span></div>
        <div className="stmt-r"><span className="l">{s.vat.en} · {s.vat.th}</span><span className="v">฿ 14,210</span></div>
        <div className="stmt-r"><span className="l">{s.next.en} · {s.next.th}</span><span className="v ok">PND.53 · 7 Jun</span></div>
      </div>
      <div className="stmt-f">
        <img src="../../assets/abacus-tick.svg" alt="" />
        <div>
          <div className="s">{tr(s.signed, lang)} · <b>Mayura “Joy” Chimdee, CPA</b></div>
          <div className="plain">{tr(s.plain, lang)}</div>
        </div>
      </div>
    </div>
  );
}

/* ---- Header ---- */
function Header({ lang, setLang }) {
  const n = A.nav;
  React.useEffect(() => {
    const hdr = document.querySelector('.hdr');
    const onScroll = () => hdr && hdr.classList.toggle('scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll); onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <header className="hdr">
      <div className="wrap hdr-in">
        <a className="lockup" href="#top">
          <img src="../../assets/abacus-mark.svg" alt="ABACUZ" />
          <span className="wm">ABACUZ</span>
        </a>
        <nav className="nav">
          <a href="#services">{tr(n.services, lang)}</a>
          <a href="#pricing">{tr(n.pricing, lang)}</a>
          <a href="#statement">{tr(n.statement, lang)}</a>
          <a href="#founder">{tr(n.founder, lang)}</a>
        </nav>
        <div className="hdr-right">
          <div className="lang" onClick={() => setLang(lang === 'en' ? 'th' : 'en')} role="button" aria-label="Toggle language">
            <span className={lang === 'en' ? 'on' : 'off'}>EN</span>
            <span className={lang === 'th' ? 'on' : 'off'}>ไทย</span>
          </div>
          <a className="btn btn-primary" href="#pricing">{tr(n.quote, lang)}</a>
        </div>
      </div>
    </header>
  );
}

/* ---- Hero ---- */
function Hero({ lang }) {
  const h = A.hero;
  return (
    <section className="hero" id="top">
      <div className="wrap hero-grid">
        <div>
          <div className="eyebrow">{tr(h.eyebrow, lang)}</div>
          <h1>{tr(h.h1, lang).split('\n').map((line, i) => <React.Fragment key={i}>{line}{i === 0 && <br/>}</React.Fragment>)}</h1>
          <p className="sub">{tr(h.sub, lang)}</p>
          <div className="ctas">
            <a className="btn btn-primary" href="#pricing">{tr(h.cta1, lang)}</a>
            <a className="btn btn-line" href="#">{tr(h.cta2, lang)}</a>
          </div>
          <div className="trust-row">
            <span className="trust"><img src="../../assets/abacus-tick.svg" alt="" />{tr(h.trust1, lang)}</span>
            <span className="trust"><img src="../../assets/abacus-tick.svg" alt="" />{tr(h.trust2, lang)}</span>
            <span className="trust"><img src="../../assets/abacus-tick.svg" alt="" />{tr(h.trust3, lang)}</span>
          </div>
        </div>
        <div className="hero-card">
          <StatementCard lang={lang} />
        </div>
      </div>
    </section>
  );
}

/* ---- Pillars ---- */
function Pillars({ lang }) {
  const p = A.pillars;
  const icons = ['../../assets/abacus-mark.svg', '../../assets/abacus-tick.svg', '../../assets/abacus-mark.svg'];
  return (
    <section className="sec" id="services">
      <div className="wrap">
        <div className="sec-head">
          <div className="eyebrow">{tr(p.eyebrow, lang)}</div>
          <h2>{tr(p.title, lang)}</h2>
        </div>
        <div className="pillars">
          {p.items.map((it, i) => (
            <article className="pillar" key={i}>
              <img className="ic" src={icons[i]} alt="" />
              <div className="vline">{tr(it.vline, lang)}</div>
              <h3>{tr(it.h, lang)}</h3>
              <p>{tr(it.p, lang)}</p>
              <ul>{it.li.map((l, j) => <li key={j}>{tr(l, lang)}</li>)}</ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { StatementCard, Header, Hero, Pillars, tr, ABZ_A: A });
