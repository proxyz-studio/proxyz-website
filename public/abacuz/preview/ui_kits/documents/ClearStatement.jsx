/* ABACUZ — The Clear Statement (full monthly artifact). */
const D = window.DOCS;
const T = (node, lang) => (node && typeof node === 'object' && 'en' in node) ? node[lang] : node;

function DocHeader({ meta }) {
  return (
    <div className="doc-head">
      <div className="lock">
        <img src="../../assets/abacus-mark.svg" alt="ABACUZ" />
        <div>
          <div className="wm">ABACUZ</div>
          <div className="desc">Accounting · Corporate Services</div>
        </div>
      </div>
      <div className="meta">{meta}</div>
    </div>
  );
}

/* bilingual line label: primary language bold, the other language muted alongside */
function BiLabel({ node, lang }) {
  const other = lang === 'en' ? 'th' : 'en';
  return (<span className="l">{node[lang]}<span className="th-l">{node[other]}</span></span>);
}

function ClearStatement({ lang }) {
  const s = D.statement;
  return (
    <div className="paper">
      <DocHeader meta={
        <React.Fragment>
          <div className="grp"><span className="k">Client</span><span className="v">{T(s.client, lang)}</span></div>
          <div className="grp"><span className="k">Period</span><span className="v">{T(s.period, lang)}</span></div>
          <div className="grp"><span className="k" style={{ fontWeight: 400 }}>{T(s.issued, lang)}</span></div>
        </React.Fragment>
      } />

      <div className="doc-title">
        <div className="kicker">{T(s.kicker, lang)}</div>
        <h1>{T(s.title, lang)}</h1>
        <p className="intro">{T(s.intro, lang)}</p>
      </div>

      <div className="blocks">
        <section className="block">
          <div className="block-h"><span className="num">01</span><h3>{T(s.inHead, lang)}</h3></div>
          {s.income.map((r, i) => <div className="line" key={i}><BiLabel node={r.l} lang={lang} /><span className="v">{r.v}</span></div>)}
          <div className="line tot"><BiLabel node={s.inTotal.l} lang={lang} /><span className="v">{s.inTotal.v}</span></div>
        </section>

        <section className="block">
          <div className="block-h"><span className="num">02</span><h3>{T(s.outHead, lang)}</h3></div>
          {s.expense.map((r, i) => <div className="line" key={i}><BiLabel node={r.l} lang={lang} /><span className="v">{r.v}</span></div>)}
          <div className="line tot"><BiLabel node={s.outTotal.l} lang={lang} /><span className="v">{s.outTotal.v}</span></div>
        </section>

        <section className="block">
          <div className="block-h"><span className="num">03</span><h3>{T(s.netHead, lang)}</h3></div>
          <div className="line tot" style={{ borderTop: 0, marginTop: 0 }}><BiLabel node={s.net.l} lang={lang} /><span className="v ok">{s.net.v}</span></div>
        </section>

        <section className="block">
          <div className="block-h"><span className="num">04</span><h3>{T(s.taxHead, lang)}</h3></div>
          {s.tax.map((r, i) => (
            <div className="line" key={i}>
              <BiLabel node={r.l} lang={lang} />
              <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="chip"><span className="d"></span>{T(r.chip, lang)}</span>
                <span className="v due">{r.v}</span>
              </span>
            </div>
          ))}
        </section>

        <section className="block">
          <div className="block-h"><span className="num">05</span><h3>{T(s.nextHead, lang)}</h3></div>
          {s.next.map((r, i) => (
            <div className="next-row" key={i}><span className="what">{T(r.what, lang)}</span><span className="when">{r.when}</span></div>
          ))}
        </section>
      </div>

      <div className="signoff">
        <img src="../../assets/abacus-seal.svg" alt="ABACUZ seal" />
        <div className="who">
          {T(s.signedBy, lang)}
          <b>{s.name}</b>
          <span className="th-cred">{T(s.cred, lang)}</span>
        </div>
        <div className="plain">“{T(s.plain, lang)}”</div>
      </div>
      <div className="doc-foot">
        <span>ABACUZ · abacuz.co · LINE @abacuz</span>
        <span>Confidential · for {T(s.client, lang)}</span>
      </div>
    </div>
  );
}

Object.assign(window, { ClearStatement, DocHeader, BiLabel, DOC_T: T });
