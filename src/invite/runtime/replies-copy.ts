import type { Lang } from "../types";

// Wording for the guest replies (RSVP and wishes), in the languages guests read most.
// Others fall back to English.

export type RepliesCopy = {
  rsvpEyebrow: string;
  rsvpTitle: string;
  name: string;
  namePh: string;
  yes: string;
  no: string;
  which: string;
  howMany: string;
  phone: string;
  phonePh: string;
  note: string;
  send: string;
  sending: string;
  thanksTitle: string;
  thanks: string;
  again: string;
  needName: string;
  needAnswer: string;
  needEvents: string;
  notYet: string;
  wishesEyebrow: string;
  wishesTitle: (names: string) => string;
  write: string;
  wish: string;
  wishPh: string;
  post: string;
  needWords: string;
  first: string;
  justNow: string;
  fewer: string;
  more: string;
};

const en: RepliesCopy = {
  rsvpEyebrow: "Kindly reply",
  rsvpTitle: "Will you join us?",
  name: "Your name",
  namePh: "Full name",
  yes: "Joyfully accepts",
  no: "Regretfully declines",
  which: "Which functions?",
  howMany: "How many people, with you?",
  phone: "Phone (optional)",
  phonePh: "So the family can reach you",
  note: "A note (optional)",
  send: "Send reply",
  sending: "Sending…",
  thanksTitle: "Shukriya",
  thanks: "Your reply has reached the family. We can't wait to celebrate with you.",
  again: "Send another reply",
  needName: "Please write your name.",
  needAnswer: "Please say whether you can come.",
  needEvents: "Please choose the functions you'll attend.",
  notYet: "Replies open once this invitation is shared.",
  wishesEyebrow: "Duas & wishes",
  wishesTitle: (n) => `For ${n}`,
  write: "Write a wish",
  wish: "Your wish",
  wishPh: "Mubarak ho! May Allah bless you both…",
  post: "Post my wish",
  needWords: "Please write a few words.",
  first: "Be the first to send your duas.",
  justNow: "just now",
  fewer: "Fewer",
  more: "More",
};

const ur: RepliesCopy = {
  rsvpEyebrow: "براہِ کرم جواب دیں",
  rsvpTitle: "کیا آپ تشریف لائیں گے؟",
  name: "آپ کا نام",
  namePh: "پورا نام",
  yes: "جی، ضرور آئیں گے",
  no: "معذرت، نہیں آ سکیں گے",
  which: "کون سی تقریبات میں؟",
  howMany: "آپ سمیت کتنے افراد؟",
  phone: "فون (اختیاری)",
  phonePh: "تاکہ گھر والے رابطہ کر سکیں",
  note: "کوئی پیغام (اختیاری)",
  send: "جواب بھیجیں",
  sending: "بھیجا جا رہا ہے…",
  thanksTitle: "شکریہ",
  thanks: "آپ کا جواب گھر والوں تک پہنچ گیا۔ آپ کا انتظار رہے گا۔",
  again: "ایک اور جواب بھیجیں",
  needName: "براہِ کرم اپنا نام لکھیں۔",
  needAnswer: "براہِ کرم بتائیں کہ آپ آ سکیں گے یا نہیں۔",
  needEvents: "براہِ کرم تقریبات منتخب کریں۔",
  notYet: "دعوت نامہ بھیجے جانے کے بعد جواب دیا جا سکے گا۔",
  wishesEyebrow: "دعائیں اور نیک خواہشات",
  wishesTitle: (n) => `${n} کے لیے`,
  write: "دعا لکھیں",
  wish: "آپ کی دعا",
  wishPh: "مبارک ہو! اللہ آپ دونوں کو خوش رکھے…",
  post: "دعا بھیجیں",
  needWords: "براہِ کرم چند الفاظ لکھیں۔",
  first: "سب سے پہلے دعا دیں۔",
  justNow: "ابھی",
  fewer: "کم",
  more: "زیادہ",
};

const hi: RepliesCopy = {
  rsvpEyebrow: "कृपया जवाब दें",
  rsvpTitle: "क्या आप आएँगे?",
  name: "आपका नाम",
  namePh: "पूरा नाम",
  yes: "ज़रूर आएँगे",
  no: "माफ़ कीजिए, नहीं आ पाएँगे",
  which: "किन कार्यक्रमों में?",
  howMany: "आपको मिलाकर कितने लोग?",
  phone: "फ़ोन (वैकल्पिक)",
  phonePh: "ताकि परिवार आपसे संपर्क कर सके",
  note: "कोई संदेश (वैकल्पिक)",
  send: "जवाब भेजें",
  sending: "भेजा जा रहा है…",
  thanksTitle: "शुक्रिया",
  thanks: "आपका जवाब परिवार तक पहुँच गया। आपका इंतज़ार रहेगा।",
  again: "एक और जवाब भेजें",
  needName: "कृपया अपना नाम लिखें।",
  needAnswer: "कृपया बताएँ कि आप आ पाएँगे या नहीं।",
  needEvents: "कृपया कार्यक्रम चुनें।",
  notYet: "निमंत्रण भेजे जाने के बाद जवाब दिया जा सकेगा।",
  wishesEyebrow: "दुआएँ और शुभकामनाएँ",
  wishesTitle: (n) => `${n} के लिए`,
  write: "शुभकामना लिखें",
  wish: "आपकी शुभकामना",
  wishPh: "मुबारक हो! आप दोनों हमेशा ख़ुश रहें…",
  post: "शुभकामना भेजें",
  needWords: "कृपया कुछ शब्द लिखें।",
  first: "सबसे पहले शुभकामना दें।",
  justNow: "अभी",
  fewer: "कम",
  more: "ज़्यादा",
};

export const repliesCopy = (lang: Lang): RepliesCopy => (lang === "ur" ? ur : lang === "hi" ? hi : en);
