/* ABACUZ documents — bilingual content for the Clear Statement & Price List. */
window.DOCS = {
  statement: {
    client:  { en: "Siam Riverside Co., Ltd.", th: "บริษัท สยาม ริเวอร์ไซด์ จำกัด" },
    period:  { en: "May 2026", th: "พฤษภาคม 2569" },
    issued:  { en: "Issued 18 Jun 2026", th: "ออกเมื่อ 18 มิ.ย. 2569" },
    kicker:  { en: "The Clear Statement", th: "สรุปบัญชีรายเดือน" },
    title:   { en: "Your month, in plain sight.", th: "เดือนของคุณ ในสายตาที่ชัดเจน" },
    intro:   { en: "A plain-language summary of what came in, what went out, what tax is due, and what is next. No jargon. If anything here is unclear, reply and a real person answers.",
               th: "สรุปแบบเข้าใจง่ายว่ามีเงินเข้าอะไร ออกอะไร ภาษีที่ต้องจ่าย และสิ่งที่ต้องทำต่อ ไม่มีศัพท์เทคนิค หากมีจุดใดไม่ชัดเจน ตอบกลับมาได้ มีคนจริงตอบคุณ" },
    inHead:  { en: "What came in", th: "เงินเข้า" },
    income: [
      { l:{en:"Sales income",th:"รายได้จากการขาย"}, v:"฿ 392,400" },
      { l:{en:"Service income",th:"รายได้ค่าบริการ"}, v:"฿ 27,600" }
    ],
    inTotal: { l:{en:"Total in",th:"รวมเงินเข้า"}, v:"฿ 420,000" },
    outHead: { en: "What went out", th: "เงินออก" },
    expense: [
      { l:{en:"Cost of goods",th:"ต้นทุนขาย"}, v:"฿ 121,800" },
      { l:{en:"Salaries & payroll",th:"เงินเดือนและค่าจ้าง"}, v:"฿ 48,000" },
      { l:{en:"Rent & utilities",th:"ค่าเช่าและสาธารณูปโภค"}, v:"฿ 14,200" },
      { l:{en:"Other operating",th:"ค่าใช้จ่ายดำเนินงานอื่น"}, v:"฿ 4,500" }
    ],
    outTotal:{ l:{en:"Total out",th:"รวมเงินออก"}, v:"฿ 188,500" },
    netHead: { en: "What is left", th: "คงเหลือ" },
    net:     { l:{en:"Net for the month",th:"กำไรสุทธิประจำเดือน"}, v:"฿ 231,500" },
    taxHead: { en: "What tax is due", th: "ภาษีที่ต้องจ่าย" },
    tax: [
      { l:{en:"VAT payable (PP.30)",th:"ภาษีมูลค่าเพิ่ม (ภพ.30)"}, v:"฿ 14,210", chip:{en:"Due 15 Jun",th:"ครบ 15 มิ.ย."} },
      { l:{en:"Withholding tax (PND.53)",th:"ภาษีหัก ณ ที่จ่าย (ภงด.53)"}, v:"฿ 3,180", chip:{en:"Due 7 Jun",th:"ครบ 7 มิ.ย."} }
    ],
    nextHead:{ en: "What is next", th: "สิ่งที่ต้องทำต่อ" },
    next: [
      { what:{en:"File PND.53 — we will file for you",th:"ยื่น ภงด.53 — เรายื่นให้คุณ"}, when:"7 Jun" },
      { what:{en:"File PP.30 VAT return",th:"ยื่นแบบ ภพ.30"}, when:"15 Jun" },
      { what:{en:"Send June receipts to us",th:"ส่งใบเสร็จเดือนมิถุนายนให้เรา"}, when:"by 5 Jul" }
    ],
    signedBy:{ en: "Signed off by", th: "เซ็นรับรองโดย" },
    name:    "Mayura “Joy” Chimdee, CPA",
    cred:    { en: "Licensed Certified Public Accountant", th: "ผู้สอบบัญชีรับอนุญาต" },
    plain:   { en: "Every number, in plain sight.", th: "ทุกตัวเลขอยู่ในสายตา" }
  },
  price: {
    kicker:  { en: "Published price list", th: "ตารางราคาที่เปิดเผย" },
    title:   { en: "Our prices, in the open.", th: "ราคาของเรา เปิดเผยทั้งหมด" },
    effective:{ en: "Effective Jan 2026", th: "เริ่มใช้ ม.ค. 2569" },
    currency:{ en: "All prices THB · VAT excluded", th: "ราคาเป็นบาท · ยังไม่รวม VAT" },
    intro:   { en: "Most firms hide their prices. We publish ours. Every engagement starts with a fixed quote built from this list, and you approve it before we begin. No hidden fees, no surprises.",
               th: "บริษัทส่วนใหญ่ปิดบังราคา เราเปิดเผยของเรา ทุกงานเริ่มด้วยใบเสนอราคาที่แน่นอนจากตารางนี้ และคุณอนุมัติก่อนเราจึงเริ่ม ไม่มีค่าใช้จ่ายแอบแฝง ไม่มีเซอร์ไพรส์" },
    groups: [
      { h:{en:"Monthly accounting",th:"บัญชีรายเดือน"}, sub:{en:"Bookkeeping, tax filing, and payroll, billed monthly.",th:"ทำบัญชี ยื่นภาษี และเงินเดือน คิดค่าบริการรายเดือน"}, rows:[
        { svc:{en:"Bookkeeping — up to 50 documents / month",th:"ทำบัญชี — ไม่เกิน 50 เอกสาร/เดือน"}, amt:"฿ 4,500", per:{en:"per month",th:"ต่อเดือน"} },
        { svc:{en:"Bookkeeping — 51 to 150 documents / month",th:"ทำบัญชี — 51 ถึง 150 เอกสาร/เดือน"}, amt:"฿ 8,900", per:{en:"per month",th:"ต่อเดือน"} },
        { svc:{en:"Bookkeeping — 151+ documents / month",th:"ทำบัญชี — 151 เอกสารขึ้นไป/เดือน"}, amt:"From ฿ 14,000", per:{en:"per month",th:"ต่อเดือน"} },
        { svc:{en:"Payroll processing — per employee",th:"จัดทำเงินเดือน — ต่อพนักงาน"}, amt:"฿ 250", per:{en:"per month",th:"ต่อเดือน"} }
      ]},
      { h:{en:"Company & compliance",th:"จดทะเบียนและการปฏิบัติตามกฎ"}, sub:{en:"Set up right, stay compliant.",th:"ตั้งบริษัทให้ถูกต้อง และทำตามกฎ"}, rows:[
        { svc:{en:"Thai limited company formation",th:"จดทะเบียนบริษัทจำกัด (ไทย)"}, amt:"฿ 29,000", per:{en:"one-time",th:"ครั้งเดียว"} },
        { svc:{en:"Annual audit sign-off — small company",th:"เซ็นรับรองงบประจำปี — บริษัทเล็ก"}, amt:"฿ 18,000", per:{en:"per year",th:"ต่อปี"} },
        { svc:{en:"Annual financial statements & filing",th:"จัดทำงบการเงินและยื่นประจำปี"}, amt:"฿ 12,000", per:{en:"per year",th:"ต่อปี"} }
      ]},
      { h:{en:"Foreign business services",th:"บริการสำหรับธุรกิจต่างชาติ"}, sub:{en:"Permits, visas, and the paperwork foreigners need.",th:"ใบอนุญาต วีซ่า และเอกสารที่ชาวต่างชาติต้องใช้"}, rows:[
        { svc:{en:"Work permit + Non-B visa (per person)",th:"ใบอนุญาตทำงาน + วีซ่า Non-B (ต่อคน)"}, amt:"฿ 25,000", per:{en:"one-time",th:"ครั้งเดียว"} },
        { svc:{en:"BOI application support",th:"สนับสนุนการยื่นขอ BOI"}, amt:"From ฿ 60,000", per:{en:"per project",th:"ต่อโครงการ"} },
        { svc:{en:"Trademark registration (per class)",th:"จดทะเบียนเครื่องหมายการค้า (ต่อประเภท)"}, amt:"฿ 9,500", per:{en:"one-time",th:"ครั้งเดียว"} }
      ]}
    ],
    noteHead:{ en: "How our pricing works", th: "วิธีคิดราคาของเรา" },
    note:    { en: "These are list prices. Your fixed quote may combine several lines into one monthly fee. You will always know what you are paying, and why — before any work begins.",
               th: "นี่คือราคามาตรฐาน ใบเสนอราคาของคุณอาจรวมหลายรายการเป็นค่าบริการรายเดือนเดียว คุณจะรู้เสมอว่ากำลังจ่ายอะไรและทำไม ก่อนเริ่มงานทุกครั้ง" }
  }
};
