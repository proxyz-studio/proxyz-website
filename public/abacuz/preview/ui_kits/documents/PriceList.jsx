/* ABACUZ — The Published Price List (full brand surface). */
function PriceList({ lang }) {
  const p = window.DOCS.price;
  const t = window.DOC_T;
  return (
    <div className="paper">
      <DocHeader meta={
        <React.Fragment>
          <div className="grp"><span className="k">{t(p.effective, lang)}</span></div>
          <div className="grp"><span className="k" style={{ fontWeight: 400 }}>{t(p.currency, lang)}</span></div>
        </React.Fragment>
      } />

      <div className="doc-title">
        <div className="kicker">{t(p.kicker, lang)}</div>
        <h1>{t(p.title, lang)}</h1>
        <p className="intro">{t(p.intro, lang)}</p>
      </div>

      {p.groups.map((g, gi) => (
        <section className="pl-grp" key={gi}>
          <h3>{t(g.h, lang)}</h3>
          <p className="gsub">{t(g.sub, lang)}</p>
          {g.rows.map((r, ri) => {
            const other = lang === 'en' ? 'th' : 'en';
            return (
              <div className="pl-row" key={ri}>
                <span className="svc">{r.svc[lang]}<span className="th-svc">{r.svc[other]}</span></span>
                <span className="amt">{r.amt}<small>{t(r.per, lang)}</small></span>
              </div>
            );
          })}
        </section>
      ))}

      <div className="pl-note">
        <img src="../../assets/abacus-tick.svg" alt="" />
        <div className="t"><b>{t(p.noteHead, lang)}.</b> {t(p.note, lang)}</div>
      </div>
      <div className="doc-foot">
        <span>ABACUZ · abacuz.co · LINE @abacuz</span>
        <span>Clean books. No surprises.</span>
      </div>
    </div>
  );
}

Object.assign(window, { PriceList });
