/* ABACUZ website — root app. Holds the EN/TH language state. */
function App() {
  const [lang, setLang] = React.useState('en');
  React.useEffect(() => {
    document.body.classList.toggle('th', lang === 'th');
    document.documentElement.lang = lang;
  }, [lang]);
  return (
    <div className="site">
      <Header lang={lang} setLang={setLang} />
      <Hero lang={lang} />
      <Pillars lang={lang} />
      <Founder lang={lang} />
      <StatementShowcase lang={lang} />
      <PriceList lang={lang} />
      <Footer lang={lang} />
    </div>
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
