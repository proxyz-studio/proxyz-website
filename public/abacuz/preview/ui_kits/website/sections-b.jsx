/* ABACUZ website — sections part B: Founder, Statement showcase, Price list, Footer. */

/* ---- Founder (Khun Joy) — photo is a labelled placeholder, pending the real portrait ---- */
function Founder({ lang }) {
  const f = window.ABZ.founder;
  return (
    <section className="sec sec-stone" id="founder">
      <div className="wrap founder-grid">
        <div className="photo-slot" aria-label="Founder portrait placeholder">
          <img src="../../assets/abacus-mark.svg" alt="" />
          <div className="ph"><b>Photo pending</b>Real, recent portrait of Khun Joy. No stock, no AI — authenticity is the trust signal.</div>
        </div>
        <div className="founder">
          <div className="eyebrow">{tr(f.eyebrow, lang)}</div>
          <blockquote>“{tr(f.quote, lang)}”</blockquote>
          <p className="cred">{tr(f.name, lang)} &nbsp;·&nbsp; <span className="th-cred">{tr(f.cred, lang)}</span></p>
          <p style={{ marginTop: '14px', color: 'var(--ink-60)', maxWidth: '34em' }}>{tr(f.body, lang)}</p>
        </div>
      </div>
    </section>
  );
}

/* ---- Statement showcase (navy) ---- */
function StatementShowcase({ lang }) {
  const s = window.ABZ.stmt;
  return (
    <section className="sec sec-navy" id="statement">
      <div className="wrap" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '54px', alignItems: 'center' }}>
        <div className="sec-head">
          <div className="eyebrow">The Clear Statement</div>
          <h2>Every number, in plain sight.</h2>
          <p>A monthly, bilingual, plain-language summary — what came in, what went out, what tax is due, what is next. Delivered by day 20, signed off by your CPA.</p>
          <p style={{ marginTop: '10px', fontStyle: 'italic', fontFamily: 'var(--font-head)', fontSize: '1.3rem', color: 'var(--gold)' }}>“{tr(s.plain, lang)}”</p>
        </div>
        <div style={{ maxWidth: '420px', width: '100%', justifySelf: 'center' }}>
          <StatementCard lang={lang} />
        </div>
      </div>
    </section>
  );
}

/* ---- Published Price List ---- */
function PriceList({ lang }) {
  const p = window.ABZ.price;
  return (
    <section className="sec" id="pricing">
      <div className="wrap">
        <div className="sec-head">
          <div className="eyebrow">{tr(p.eyebrow, lang)}</div>
          <h2>{tr(p.title, lang)}</h2>
          <p>{tr(p.sub, lang)}</p>
        </div>
        <div className="price-paper">
          <div className="price-top">
            <span className="ti">{tr(p.paperTitle, lang)}</span>
            <span className="note">{tr(p.paperNote, lang)}</span>
          </div>
          {p.groups.map((g, gi) => (
            <div className="price-grp" key={gi}>
              <h4>{tr(g.h, lang)}</h4>
              {g.rows.map((r, ri) => (
                <div className="price-r" key={ri}>
                  <span className="svc">{tr(r.svc, lang).split(' — ')[0]}{tr(r.svc, lang).includes(' — ') ? <span style={{color:'var(--ink-60)'}}> — {tr(r.svc, lang).split(' — ')[1]}</span> : null}</span>
                  <span className="amt">{r.amt} <small>{tr(r.per, lang)}</small></span>
                </div>
              ))}
            </div>
          ))}
          <div className="price-foot">
            <img src="../../assets/abacus-tick.svg" alt="" />
            <span>{tr(p.foot, lang)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---- Footer ---- */
function Footer({ lang }) {
  const f = window.ABZ.footer, n = window.ABZ.nav;
  return (
    <footer className="ftr">
      <div className="wrap">
        <div className="ftr-grid">
          <div>
            <div className="wm">ABACUZ</div>
            <p className="tagline">{tr(f.tagline, lang)}</p>
          </div>
          <div>
            <h5>{tr(f.col1h, lang)}</h5>
            <ul>
              <li><a href="#services">{tr(n.services, lang)}</a></li>
              <li><a href="#pricing">{tr(n.pricing, lang)}</a></li>
              <li><a href="#statement">{tr(n.statement, lang)}</a></li>
            </ul>
          </div>
          <div>
            <h5>{tr(f.col2h, lang)}</h5>
            <ul>
              <li><a href="#founder">{tr(n.founder, lang)}</a></li>
              <li><a href="#">abacuz.co</a></li>
              <li><a href="#">PROXYZ Studio</a></li>
            </ul>
          </div>
          <div>
            <h5>{tr(f.col3h, lang)}</h5>
            <ul>
              <li><a href="#">LINE · @abacuz</a></li>
              <li><a href="#">hello@abacuz.co</a></li>
              <li><a href="#">Bangkok, TH</a></li>
            </ul>
          </div>
        </div>
        <div className="ftr-bot">
          <span>{tr(f.legal, lang)}</span>
          <span>{tr(f.cpa, lang)}</span>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { Founder, StatementShowcase, PriceList, Footer });
