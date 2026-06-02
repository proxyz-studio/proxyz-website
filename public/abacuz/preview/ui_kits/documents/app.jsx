/* ABACUZ documents — root: doc switcher + EN/TH toggle. */
function DocApp() {
  const [doc, setDoc] = React.useState('statement');
  const [lang, setLang] = React.useState('en');
  React.useEffect(() => {
    document.body.classList.toggle('th', lang === 'th');
    document.documentElement.lang = lang;
  }, [lang]);
  return (
    <React.Fragment>
      <div className="toolbar">
        <span className="wm">ABACUZ</span>
        <div className="seg">
          <button className={doc === 'statement' ? 'on' : ''} onClick={() => setDoc('statement')}>Clear Statement</button>
          <button className={doc === 'price' ? 'on' : ''} onClick={() => setDoc('price')}>Price List</button>
        </div>
        <div className="spacer"></div>
        <div className="lang" onClick={() => setLang(lang === 'en' ? 'th' : 'en')} role="button" aria-label="Toggle language">
          <span className={lang === 'en' ? 'on' : 'off'}>EN</span>
          <span className={lang === 'th' ? 'on' : 'off'}>ไทย</span>
        </div>
      </div>
      <div className="stage">
        {doc === 'statement' ? <ClearStatement lang={lang} /> : <PriceList lang={lang} />}
      </div>
    </React.Fragment>
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(<DocApp />);
