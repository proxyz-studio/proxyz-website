import type { ReactNode } from 'react';
import type { Lang, Bilingual } from '../../types';
import {
  NAVY, IVORY, STONE, INK, GOLD, RULE,
  FONT_HEAD, FONT_HEAD_TH, FONT_BODY, FONT_LABEL,
} from '../../theme';
import {
  PALETTE, TAGLINE_ALTS, VOICE_LINES, TYPE_SPECIMENS,
  LOGO_LOCKUPS, PILLARS, HANDLES, LOCKED_ITEMS, OPEN_ITEMS,
} from '../../../content/abacuz/brand-identity';

function BrandSubSection({
  number,
  eyebrow,
  title,
  lang,
  children,
}: {
  number: string;
  eyebrow: Bilingual;
  title?: Bilingual;
  lang: Lang;
  children: ReactNode;
}) {
  const headFont = lang === 'th' ? FONT_HEAD_TH : FONT_HEAD;
  return (
    <section style={{ marginBottom: '56px' }}>
      <p
        style={{
          fontFamily: FONT_LABEL,
          fontSize: '10px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: GOLD,
          margin: '0 0 10px 0',
        }}
      >
        {number} · {eyebrow[lang]}
      </p>
      {title && title[lang] && (
        <h3
          style={{
            fontFamily: headFont,
            fontSize: 'clamp(24px, 2.6vw, 32px)',
            fontWeight: 500,
            lineHeight: 1.2,
            color: NAVY,
            margin: '0 0 22px 0',
            textWrap: 'balance',
            maxWidth: '32ch',
          }}
        >
          {title[lang]}
        </h3>
      )}
      {children}
    </section>
  );
}

export function BrandIdentity({ lang }: { lang: Lang }) {
  const headFont = lang === 'th' ? FONT_HEAD_TH : FONT_HEAD;

  return (
    <div
      style={{
        marginTop: '64px',
        paddingTop: '56px',
        borderTop: `1px solid ${RULE}`,
      }}
    >
      <p
        style={{
          fontFamily: FONT_LABEL,
          fontSize: '11px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: GOLD,
          margin: '0 0 8px 0',
        }}
      >
        {lang === 'th' ? 'อัตลักษณ์แบรนด์ฉบับเต็ม · v1' : 'Full brand identity · v1'}
      </p>
      <h3
        style={{
          fontFamily: headFont,
          fontSize: 'clamp(32px, 4vw, 44px)',
          fontWeight: 500,
          lineHeight: 1.15,
          color: NAVY,
          margin: '0 0 56px 0',
          fontStyle: 'italic',
          textWrap: 'balance',
          maxWidth: '32ch',
        }}
      >
        {lang === 'th'
          ? 'หน้าตา ความรู้สึก น้ำเสียง — ทุกอย่างที่ทำให้ ABACUZ เป็น ABACUZ'
          : 'The look, the feel, the voice — every choice that makes ABACUZ feel like ABACUZ.'}
      </h3>

      {/* 02 · BRAND IDEA */}
      <BrandSubSection
        number="02"
        eyebrow={{ th: 'แก่นความคิดของแบรนด์', en: 'The brand idea' }}
        title={{ th: 'ลูกคิด = บัญชีแยกประเภทดั้งเดิมที่โปร่งใส', en: 'Abacus = the original transparent ledger' }}
        lang={lang}
      >
        <p
          style={{
            fontFamily: FONT_BODY,
            fontSize: '16.5px',
            lineHeight: 1.75,
            color: INK,
            margin: 0,
            maxWidth: '62ch',
          }}
        >
          {lang === 'th'
            ? 'การตีความที่ "ผิด" ของลูกคิดคือ เก่า โบราณ ทำมือ — ตรงข้ามกับบริษัทยุคใหม่ที่ขับเคลื่อนด้วย AI การตีความที่ "ถูก" และเป็นสิ่งที่เราเป็นเจ้าของ: ลูกคิดคือบัญชีแยกประเภทที่โปร่งใสตั้งแต่ต้นกำเนิด เม็ดทุกเม็ดมองเห็นได้ ใครก็ตรวจนับได้ ไม่มีอะไรซ่อนในกล่องดำ ตรงกับคำมั่นของเราในตลาดที่ปิดบังตัวเลข — ราคาที่เปิดเผย บัญชีที่สะอาด ไม่มีอะไรซ่อนเร้น'
            : 'The wrong reading of "abacus" is old, manual, dusty — the opposite of a modern, AI-first firm. The right reading we own: the abacus is the original transparent ledger. Every bead is in plain sight; anyone can see the count and check it. Nothing is hidden inside a black box. That is exactly the promise in a market that hides its numbers — published prices, clean books, nothing buried.'}
        </p>
      </BrandSubSection>

      {/* 03 · POSITIONING LINE — highlighted */}
      <BrandSubSection
        number="03"
        eyebrow={{ th: 'จุดยืน · เข็มทิศภายใน', en: 'Positioning · internal north star' }}
        lang={lang}
      >
        <blockquote
          style={{
            fontFamily: headFont,
            fontSize: 'clamp(20px, 2.4vw, 26px)',
            fontStyle: 'italic',
            fontWeight: 500,
            lineHeight: 1.4,
            color: NAVY,
            background: STONE,
            padding: '32px 36px',
            margin: 0,
            borderLeft: `3px solid ${GOLD}`,
            textWrap: 'balance',
            maxWidth: '52ch',
          }}
        >
          {lang === 'th'
            ? 'ABACUZ คือบริษัท "บัญชีที่ชัดเจน" ของประเทศไทย: บริการบัญชี ภาษี และงานนิติบุคคล สำหรับธุรกิจของชาวต่างชาติและธุรกิจไทย ด้วยราคาที่เปิดเผย คำตอบตรงไปตรงมาทั้งภาษาอังกฤษและภาษาไทย และมีผู้สอบบัญชีรับอนุญาต (CPA) อยู่เบื้องหลังทุกตัวเลข'
            : "ABACUZ is Thailand's clear-books firm: accounting, tax, and corporate services for foreign-owned and Thai businesses, with published prices, plain answers in English and Thai, and a licensed CPA behind every number."}
        </blockquote>
      </BrandSubSection>

      {/* 04 · TAGLINES */}
      <BrandSubSection
        number="04"
        eyebrow={{ th: 'สโลแกน', en: 'Taglines' }}
        title={{ th: 'ประโยคหลัก + ทางเลือก + คำบรรยายบริการ', en: 'Trust line + alternatives + descriptor' }}
        lang={lang}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '62ch' }}>
          <div>
            <p
              style={{
                fontFamily: FONT_LABEL,
                fontSize: '10px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: INK,
                opacity: 0.55,
                margin: '0 0 8px 0',
              }}
            >
              {lang === 'th' ? 'ประโยคหลัก (แนะนำ)' : 'Trust line (recommended)'}
            </p>
            <p
              style={{
                fontFamily: headFont,
                fontSize: 'clamp(28px, 3.4vw, 40px)',
                fontWeight: 500,
                fontStyle: 'italic',
                lineHeight: 1.2,
                color: NAVY,
                margin: 0,
              }}
            >
              {lang === 'th' ? 'บัญชีสะอาด ไม่มีเซอร์ไพรส์' : 'Clean books. No surprises.'}
            </p>
          </div>

          <div>
            <p
              style={{
                fontFamily: FONT_LABEL,
                fontSize: '10px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: INK,
                opacity: 0.55,
                margin: '0 0 10px 0',
              }}
            >
              {lang === 'th' ? 'ทางเลือกในโทนเดียวกัน' : 'Alternatives in the same register'}
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {TAGLINE_ALTS.map((t, i) => (
                <li
                  key={i}
                  style={{
                    fontFamily: headFont,
                    fontSize: '18px',
                    fontStyle: 'italic',
                    lineHeight: 1.4,
                    color: INK,
                    opacity: 0.85,
                  }}
                >
                  · {t[lang]}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p
              style={{
                fontFamily: FONT_LABEL,
                fontSize: '10px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: INK,
                opacity: 0.55,
                margin: '0 0 8px 0',
              }}
            >
              {lang === 'th' ? 'คำบรรยายบริการ (ใช้คู่กับโลโก้)' : 'Descriptor (logo lockup, formal use, SEO)'}
            </p>
            <p
              style={{
                fontFamily: FONT_LABEL,
                fontSize: '13px',
                letterSpacing: '0.18em',
                color: GOLD,
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              {lang === 'th' ? 'บัญชี · บริการนิติบุคคล' : 'ACCOUNTING · CORPORATE SERVICES'} — {lang === 'th' ? 'ทั้งภาษาอังกฤษและภาษาไทย' : 'in English and Thai'}
            </p>
          </div>
        </div>
      </BrandSubSection>

      {/* 05 · VOICE */}
      <BrandSubSection
        number="05"
        eyebrow={{ th: 'น้ำเสียง', en: 'Voice' }}
        title={{ th: 'อบอุ่น · เรียบง่าย · แม่นยำ · ทำให้อุ่นใจ', en: 'Warm · plain · exact · reassuring' }}
        lang={lang}
      >
        <p
          style={{
            fontFamily: FONT_BODY,
            fontSize: '15px',
            lineHeight: 1.65,
            color: INK,
            opacity: 0.85,
            margin: '0 0 20px 0',
            maxWidth: '60ch',
          }}
        >
          {lang === 'th'
            ? 'เราคือผู้เชี่ยวชาญที่ใจเย็นและให้คำตอบตรงไปตรงมา ไม่ใช้ศัพท์เทคนิคโดยไม่อธิบาย สองภาษาโดยพื้นฐาน ทุกประโยคที่สื่อกับลูกค้าควรใช้ได้ดีทั้งภาษาอังกฤษและภาษาไทย'
            : 'We are the calm expert who gives a straight answer. No jargon unless we explain it. Bilingual by default: every client-facing line should work cleanly in both English and Thai.'}
        </p>
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            maxWidth: '60ch',
          }}
        >
          {VOICE_LINES.map((v, i) => (
            <li
              key={i}
              style={{
                fontFamily: headFont,
                fontSize: '17px',
                fontStyle: 'italic',
                lineHeight: 1.5,
                color: NAVY,
                paddingLeft: '18px',
                borderLeft: `2px solid ${GOLD}`,
              }}
            >
              {v[lang]}
            </li>
          ))}
        </ul>
      </BrandSubSection>

      {/* 06 · PALETTE — visual swatches */}
      <BrandSubSection
        number="06"
        eyebrow={{ th: 'สี', en: 'Palette' }}
        title={{ th: 'อบอุ่น · น่าเชื่อถือ · พรีเมียม — กรมท่า + ทอง + งาช้าง', en: 'Warm trust-premium — navy + gold + ivory' }}
        lang={lang}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '14px',
          }}
        >
          {PALETTE.map((p) => {
            const isLight = p.hex === IVORY || p.hex === STONE;
            return (
              <div
                key={p.hex}
                style={{
                  background: p.hex,
                  border: `1px solid ${RULE}`,
                  padding: '20px 18px',
                  minHeight: '180px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  color: isLight ? INK : IVORY,
                }}
              >
                <div>
                  <p
                    style={{
                      fontFamily: FONT_LABEL,
                      fontSize: '10px',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      margin: '0 0 4px 0',
                      opacity: 0.7,
                    }}
                  >
                    {p.role[lang]}
                  </p>
                  <p
                    style={{
                      fontFamily: headFont,
                      fontSize: '20px',
                      fontWeight: 500,
                      margin: 0,
                    }}
                  >
                    {p.name}
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      fontFamily: FONT_LABEL,
                      fontSize: '12px',
                      letterSpacing: '0.08em',
                      fontVariantNumeric: 'tabular-nums',
                      margin: '0 0 6px 0',
                      opacity: 0.85,
                    }}
                  >
                    {p.hex}
                  </p>
                  <p
                    style={{
                      fontFamily: FONT_BODY,
                      fontSize: '11.5px',
                      lineHeight: 1.4,
                      margin: 0,
                      opacity: 0.75,
                    }}
                  >
                    {p.use[lang]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <p
          style={{
            fontFamily: FONT_BODY,
            fontSize: '13px',
            fontStyle: 'italic',
            color: INK,
            opacity: 0.65,
            margin: '18px 0 0 0',
            maxWidth: '60ch',
          }}
        >
          {lang === 'th'
            ? 'กฎสำคัญ: สีทองเป็นสีเน้น ไม่ใช้กับเนื้อความ (ทองบนงาช้างคอนทราสต์ต่ำเกินไป)'
            : 'Rule: gold is an accent, never body text (gold on ivory is too low-contrast to read).'}
        </p>
      </BrandSubSection>

      {/* 07 · TYPOGRAPHY — real specimens */}
      <BrandSubSection
        number="07"
        eyebrow={{ th: 'ตัวอักษร', en: 'Typography' }}
        title={{ th: 'คลาสสิก · สง่างาม · เหนือกาลเวลา', en: 'Classical, elegant, timeless' }}
        lang={lang}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {TYPE_SPECIMENS.map((t, i) => (
            <div
              key={i}
              style={{
                padding: '24px 26px',
                background: IVORY,
                border: `1px solid ${RULE}`,
              }}
            >
              <p
                style={{
                  fontFamily: FONT_LABEL,
                  fontSize: '10px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: GOLD,
                  margin: '0 0 14px 0',
                }}
              >
                {t.role[lang]} · {t.family.split(',')[0].replace(/'/g, '')}
              </p>
              <p
                style={{
                  fontFamily: t.family,
                  fontSize: t.size,
                  fontWeight: t.weight,
                  fontStyle: t.italic ? 'italic' : 'normal',
                  color: NAVY,
                  lineHeight: 1.2,
                  letterSpacing: t.role.en === 'Wordmark / display' ? '0.08em' : '-0.005em',
                  margin: 0,
                  textWrap: 'balance',
                }}
              >
                {lang === 'th' && t.sampleTh ? t.sampleTh : t.sample}
              </p>
            </div>
          ))}
        </div>
        <p
          style={{
            fontFamily: FONT_BODY,
            fontSize: '13px',
            fontStyle: 'italic',
            color: INK,
            opacity: 0.65,
            margin: '18px 0 0 0',
            maxWidth: '60ch',
          }}
        >
          {lang === 'th'
            ? 'ภาษาไทย · Noto Serif Thai สำหรับหัวเรื่อง, IBM Plex Sans Thai สำหรับเนื้อความ ไม่ใช้ IBM Plex Mono (นั่นคือหน้าตา PROXYZ Studio)'
            : "Thai pairing: Noto Serif Thai for headlines, IBM Plex Sans Thai for body and UI. Not IBM Plex Mono — that is PROXYZ Studio's corporate face."}
        </p>
      </BrandSubSection>

      {/* 08 · LOGO SYSTEM */}
      <BrandSubSection
        number="08"
        eyebrow={{ th: 'โลโก้และสัญลักษณ์', en: 'Logo system' }}
        title={{ th: 'ลูกคิดสีทองที่เรียบหรู + เวิร์ดมาร์ก serif คลาสสิก', en: 'Refined gold abacus + classical serif wordmark' }}
        lang={lang}
      >
        <p
          style={{
            fontFamily: FONT_BODY,
            fontSize: '15px',
            lineHeight: 1.7,
            color: INK,
            opacity: 0.85,
            margin: '0 0 22px 0',
            maxWidth: '62ch',
          }}
        >
          {lang === 'th'
            ? 'สัญลักษณ์: ลูกคิดเชิงเรขาคณิตที่สง่างาม เส้นทองบาง แม่นยำ เรียบน้อย ไม่ใช่ภาพคลิปอาร์ต ไม่หนา ไม่ 3 มิติ ไม่มีลายไม้ เป็น "บัญชีแยกประเภทที่โปร่งใส" ที่ถูกแปลงเป็นสัญลักษณ์ เวิร์ดมาร์ก: ABACUZ ในตัวพิมพ์ใหญ่โรมันแบบ Cinzel เว้นระยะกว้าง สีทองบนกรมท่า หรือกรมท่าบนงาช้าง'
            : 'The mark: an elegant, geometric abacus — thin gold strokes, precise, minimal. Not clip-art, not heavy, no 3D, no wood texture. The transparent ledger turned into a symbol. The wordmark: ABACUZ in Cinzel-style Roman caps with generous tracking, gold on navy or navy on ivory.'}
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px',
            marginBottom: '22px',
          }}
        >
          {LOGO_LOCKUPS.map((l, i) => (
            <div
              key={i}
              style={{
                background: STONE,
                padding: '20px 22px',
                borderLeft: `2px solid ${GOLD}`,
              }}
            >
              <p
                style={{
                  fontFamily: FONT_LABEL,
                  fontSize: '10px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: GOLD,
                  margin: '0 0 8px 0',
                }}
              >
                {String(i + 1).padStart(2, '0')} · {l.name[lang]}
              </p>
              <p
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: '13px',
                  lineHeight: 1.55,
                  color: INK,
                  margin: 0,
                }}
              >
                {l.body[lang]}
              </p>
            </div>
          ))}
        </div>
        <p
          style={{
            fontFamily: FONT_BODY,
            fontSize: '13px',
            fontStyle: 'italic',
            color: INK,
            opacity: 0.65,
            margin: 0,
            maxWidth: '62ch',
          }}
        >
          {lang === 'th'
            ? 'แนวกันพลาด: เส้นบางสม่ำเสมอ แม่นยำเชิงเรขาคณิต สีทองเป็นโทนเรียบ (ไม่ใช่ไล่เฉดวาวหรือนูน) ทดสอบขนาดเล็กให้แถวเม็ดลูกคิดยังอ่านออก'
            : 'Guardrails: thin even strokes, geometric precision, gold as a flat metallic tone (not a shiny gradient or bevel). Test it tiny — the bead rows must still read at favicon size.'}
        </p>
      </BrandSubSection>

      {/* 09 · THREE PILLARS */}
      <BrandSubSection
        number="09"
        eyebrow={{ th: 'สามเสาหลักของบริการ', en: 'The three pillars' }}
        title={{ th: 'สิ่งที่ ABACUZ ให้บริการ — แบ่งเป็นสามเสา', en: 'What ABACUZ delivers — three pillars' }}
        lang={lang}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px',
          }}
        >
          {PILLARS.map((p, i) => (
            <div
              key={i}
              style={{
                background: NAVY,
                color: IVORY,
                padding: '24px 22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              <p
                style={{
                  fontFamily: headFont,
                  fontSize: '20px',
                  fontWeight: 500,
                  margin: 0,
                  color: IVORY,
                }}
              >
                {p.name[lang]}
              </p>
              <p
                style={{
                  fontFamily: FONT_LABEL,
                  fontSize: '11px',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: GOLD,
                  margin: 0,
                }}
              >
                {p.tagline[lang]}
              </p>
              <p
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: '13px',
                  lineHeight: 1.55,
                  color: IVORY,
                  opacity: 0.85,
                  margin: 0,
                }}
              >
                {p.body[lang]}
              </p>
            </div>
          ))}
        </div>
        <p
          style={{
            fontFamily: FONT_BODY,
            fontSize: '13px',
            fontStyle: 'italic',
            color: INK,
            opacity: 0.7,
            margin: '18px 0 0 0',
            maxWidth: '62ch',
          }}
        >
          {lang === 'th'
            ? 'ล็อกแล้ว 1 มิ.ย. 2026 · คำบรรยายบริการคือ "บัญชี · บริการนิติบุคคล" ตัด "LEGAL" ออก เพราะคุณจอยเป็นผู้สอบบัญชี ไม่ใช่ทนายความ และเวิร์ดมาร์กที่นำด้วย "LEGAL" จะดึงการตรวจสอบจากหน่วยงานกำกับ (DNFBP) โดยไม่จำเป็น งานด้านนิติบุคคลอยู่ในเสาบริการนิติบุคคลโดยมี CPA รับรอง คดีความส่งต่อทนายที่มีใบอนุญาตเสมอ'
            : 'Settled 1 Jun 2026 · the descriptor is "Accounting · Corporate Services." "LEGAL" was dropped — Khun Joy is a CPA, not a bar-licensed lawyer, and a DNFBP wordmark that leads with "LEGAL" invites needless regulator scrutiny. Legal-adjacent work sits inside Corporate Services with CPA sign-off; litigation is always referred to a licensed lawyer.'}
        </p>
      </BrandSubSection>

      {/* 10 · FOUNDER FACE + IMAGERY */}
      <BrandSubSection
        number="10"
        eyebrow={{ th: 'ใบหน้าผู้ก่อตั้ง และภาพประกอบ', en: 'Founder face + imagery' }}
        title={{ th: 'คุณจอย คือใบหน้าของเว็บไซต์', en: 'Khun Joy is the website face' }}
        lang={lang}
      >
        <p
          style={{
            fontFamily: FONT_BODY,
            fontSize: '15.5px',
            lineHeight: 1.7,
            color: INK,
            margin: '0 0 18px 0',
            maxWidth: '62ch',
          }}
        >
          {lang === 'th'
            ? 'ภาพถ่ายมืออาชีพที่อบอุ่นและมั่นใจสร้างโทน "ที่ปรึกษาที่เป็นมนุษย์" — คนจริงที่คุณไว้ใจให้ดูแลตัวเลข บรรทัดคุณวุฒิที่เห็นได้: Mayura "Joy" Chimdee, CPA (ผู้สอบบัญชีรับอนุญาต)'
            : 'A warm, confident professional portrait sets the human-advisor tone — a real person you would trust with your numbers. Credential line in view: Mayura "Joy" Chimdee, CPA (ผู้สอบบัญชีรับอนุญาต).'}
        </p>
        <div
          style={{
            background: STONE,
            padding: '20px 24px',
            borderLeft: `3px solid ${GOLD}`,
            maxWidth: '62ch',
          }}
        >
          <p
            style={{
              fontFamily: FONT_LABEL,
              fontSize: '10px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: GOLD,
              margin: '0 0 8px 0',
            }}
          >
            {lang === 'th' ? 'ข้อควรระวัง' : 'Flag'}
          </p>
          <p style={{ fontFamily: FONT_BODY, fontSize: '14px', lineHeight: 1.6, color: INK, margin: 0 }}>
            {lang === 'th'
              ? 'ภาพที่เผยแพร่ต้องเป็นภาพคุณจอยจริง ความจริงแท้นี้คือสัญญาณความน่าเชื่อถือ ภาพที่สร้างด้วย AI หรือสังเคราะห์หนักจะบั่นทอนจุดยืนทั้งหมดอย่างเงียบ ๆ'
              : 'The published photo must authentically represent Khun Joy (a real, recent photo). That authenticity IS the trust signal — an AI-generated or heavily-synthetic face would quietly undercut the entire positioning.'}
          </p>
        </div>
        <p
          style={{
            fontFamily: FONT_BODY,
            fontSize: '14px',
            lineHeight: 1.6,
            color: INK,
            opacity: 0.75,
            margin: '20px 0 0 0',
            maxWidth: '62ch',
          }}
        >
          {lang === 'th'
            ? 'ภาพประกอบที่เหลือ · เอกสารสะอาด ตารางราคาที่เปิดเผย โต๊ะทำงานเป็นระเบียบ UI สองภาษาที่อบอุ่น จริงและเฉพาะเจาะจง ไม่ใช่ภาพสต็อก "จับมือ/ตึกระฟ้า"'
            : 'Supporting imagery: clean documents, the published price list, a tidy workspace, warm bilingual UI. Honest and specific, never generic "handshake / skyscraper" stock.'}
        </p>
      </BrandSubSection>

      {/* 11 · SIGNATURE ARTIFACT */}
      <BrandSubSection
        number="11"
        eyebrow={{ th: 'ชิ้นงานเอกลักษณ์', en: 'The signature artifact' }}
        title={{ th: 'Clear Statement + ตารางราคาที่เปิดเผย', en: 'The Clear Statement + the Published Price List' }}
        lang={lang}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
          }}
        >
          <div
            style={{
              background: IVORY,
              border: `1px solid ${RULE}`,
              padding: '24px 24px',
            }}
          >
            <p
              style={{
                fontFamily: FONT_LABEL,
                fontSize: '10px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: GOLD,
                margin: '0 0 10px 0',
              }}
            >
              {lang === 'th' ? '01 · Clear Statement' : '01 · The Clear Statement'}
            </p>
            <p
              style={{
                fontFamily: headFont,
                fontSize: '18px',
                fontWeight: 500,
                fontStyle: 'italic',
                lineHeight: 1.4,
                color: NAVY,
                margin: '0 0 14px 0',
              }}
            >
              {lang === 'th' ? 'ทุกตัวเลข อยู่ในสายตา' : 'Every number, in plain sight.'}
            </p>
            <p
              style={{
                fontFamily: FONT_BODY,
                fontSize: '14px',
                lineHeight: 1.65,
                color: INK,
                opacity: 0.82,
                margin: 0,
              }}
            >
              {lang === 'th'
                ? 'สรุปประจำเดือนแบบสองภาษา เข้าใจง่าย — เงินเข้าเท่าไร ออกเท่าไร ภาษีที่ต้องจ่าย สิ่งที่ต้องทำต่อ พร้อมการเซ็นรับรองของ CPA ตราลูกคิดประทับ'
                : "A monthly, bilingual, plain-language summary — what came in, what went out, what tax is due, what is next — with the CPA's sign-off and the abacus seal."}
            </p>
          </div>
          <div
            style={{
              background: IVORY,
              border: `1px solid ${RULE}`,
              padding: '24px 24px',
            }}
          >
            <p
              style={{
                fontFamily: FONT_LABEL,
                fontSize: '10px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: GOLD,
                margin: '0 0 10px 0',
              }}
            >
              {lang === 'th' ? '02 · ตารางราคาที่เปิดเผย' : '02 · The Published Price List'}
            </p>
            <p
              style={{
                fontFamily: headFont,
                fontSize: '18px',
                fontWeight: 500,
                fontStyle: 'italic',
                lineHeight: 1.4,
                color: NAVY,
                margin: '0 0 14px 0',
              }}
            >
              {lang === 'th' ? 'ราคาที่ไม่ปิดบัง' : 'Prices, in the open.'}
            </p>
            <p
              style={{
                fontFamily: FONT_BODY,
                fontSize: '14px',
                lineHeight: 1.65,
                color: INK,
                opacity: 0.82,
                margin: 0,
              }}
            >
              {lang === 'th'
                ? 'การแสดงความโปร่งใสที่กล้าที่สุดในตลาดที่ปิดบัง — ราคาของเราเปิดเผยชัดเจน ทั้งภาษาอังกฤษและภาษาไทย เป็นพื้นผิวของแบรนด์ ไม่ใช่แค่หน้าเว็บ'
                : 'The boldest trust gesture in an opaque market — our prices, in the open, in English and Thai. A brand surface, not just a page.'}
            </p>
          </div>
        </div>
      </BrandSubSection>

      {/* 13 · DIGITAL HANDLES TO SECURE */}
      <BrandSubSection
        number="13"
        eyebrow={{ th: 'ช่องทางดิจิทัลที่ต้องจอง', en: 'Digital handles to secure' }}
        title={{ th: 'สิ่งที่คุณต้องทำเพื่อปิดช่องทาง', en: 'What you need to lock down' }}
        lang={lang}
      >
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '10px',
          }}
        >
          {HANDLES.map((h, i) => (
            <li
              key={i}
              style={{
                fontFamily: FONT_BODY,
                fontSize: '14px',
                lineHeight: 1.55,
                color: INK,
                padding: '12px 16px',
                background: STONE,
                borderLeft: `2px solid ${GOLD}`,
              }}
            >
              {h[lang]}
            </li>
          ))}
        </ul>
      </BrandSubSection>

      {/* 14 · LOCKED VS OPEN */}
      <BrandSubSection
        number="14"
        eyebrow={{ th: 'อะไรล็อกแล้ว · อะไรต้องเก็บงานต่อ', en: "What's locked · what needs a finishing pass" }}
        lang={lang}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
          }}
        >
          <div
            style={{
              background: NAVY,
              color: IVORY,
              padding: '24px 24px',
            }}
          >
            <p
              style={{
                fontFamily: FONT_LABEL,
                fontSize: '11px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: GOLD,
                margin: '0 0 16px 0',
              }}
            >
              {lang === 'th' ? 'ล็อกแล้ว · 5 รายการ' : 'Locked · 5 items'}
            </p>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {LOCKED_ITEMS.map((l, i) => (
                <li
                  key={i}
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: '14px',
                    lineHeight: 1.5,
                    color: IVORY,
                    paddingLeft: '14px',
                    borderLeft: `2px solid ${GOLD}`,
                  }}
                >
                  {l[lang]}
                </li>
              ))}
            </ul>
          </div>
          <div
            style={{
              background: STONE,
              color: INK,
              padding: '24px 24px',
            }}
          >
            <p
              style={{
                fontFamily: FONT_LABEL,
                fontSize: '11px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: NAVY,
                margin: '0 0 16px 0',
              }}
            >
              {lang === 'th' ? 'ต้องเก็บงานต่อ · 6 รายการ' : 'Finishing pass · 6 items'}
            </p>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {OPEN_ITEMS.map((o, i) => (
                <li
                  key={i}
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: '14px',
                    lineHeight: 1.5,
                    color: INK,
                    paddingLeft: '14px',
                    borderLeft: `2px solid ${NAVY}`,
                  }}
                >
                  {o[lang]}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </BrandSubSection>
    </div>
  );
}
