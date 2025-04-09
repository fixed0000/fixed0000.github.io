document.addEventListener('DOMContentLoaded', () => {
  // Инициализация анимаций
  const initializeAnimations = () => {
    const cards = document.querySelectorAll('.skill-card');
    if (cards.length > 0) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('active');
        });
      }, { threshold: 0.5 });
      cards.forEach(card => observer.observe(card));
    }
  };

  // Инициализация темы
  const initializeTheme = () => {
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      const savedTheme = localStorage.getItem('theme') || 'light';
      document.body.dataset.theme = savedTheme;
      toggle.addEventListener('click', () => {
        const newTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
        document.body.dataset.theme = newTheme;
        localStorage.setItem('theme', newTheme);
      });
    }
  };

  // Инициализация языка
  const initializeLanguage = () => {
    const savedLang = localStorage.getItem('selectedLanguage') || 'ru';
    document.getElementById('language-select').value = savedLang;
    updateLanguage(savedLang);

    document.getElementById('language-select').addEventListener('change', (e) => {
      updateLanguage(e.target.value);
    });
  };

  // Запуск всех инициализаций
  initializeAnimations();
  initializeTheme();
  initializeLanguage();
});

// Полный объект переводов
const translations = {
  ru: {
    "page_title": "Образование",
    "main_title": "Академический путь 🎓",
    "current_status": "Студент 4 курса",
    "year1": "2020-2024",
    "degree": "Бакалавр лингвистики",
    "specialty": "Специальность:",
    "specialty_name": "Перевод и переводоведение (японский язык)",
    "gpa": "Средний балл",
    "nav.home": "Главная",
    "nav.about": "Образование",
    "welcome": "Добро пожаловать! ",
    "theme.toggle": "Сменить тему",
    "about.title": "Обо мне",
    "about.education": "Образование",
    "about.education.item1": "Студентка 4 курса МГПУ: Переводчик японского языка",
    "about.education.item2": "Программа обмена: Университет Цукубы (Япония), 2022",
    "about.education.item3": "Дополнительное образование: Основы программирования",
    "about.education.item4": "Методика преподавания РКИ: Курс для преподавателей-русистов",
    "skills.title": "Мои навыки",
    "skills.html": "HTML",
    "skills.css": "CSS",
    "skills.js": "JavaScript (в процессе)",
    "faq.question": "Как вы начали программировать?",
    "faq.answer": "Я начал с онлайн-курсов и практики...",
    "contact.title": "Свяжитесь со мной",
    "contact.name": "Ваше имя",
    "contact.email": "Email",
    "contact.message": "Сообщение...",
    "contact.submit": "Отправить",
    "footer.copyright": "© 2024 Мой первый сайт",
    "image.alt": "Портретное фото",
    "image.caption": "Токио",
    "experience": "Профессиональный опыт",
    "experience.item1": "Локализация контента для японских компаний",
    "experience.item2": "Персональное сопровождение CEO из Японии",
    "experience.item3": "Работа с клиентами: кассир в Японии (Mosburger)",
    "experience.item4": "Преподавание русского языка для иностранцев",
    "services.title": "Services",
    "services.webdev": "Web Development",
    "playground.title": "Code Playground",
    "page_title": "Опыт работы",
    "main_title": "Профессиональный путь",
    "full_time": "Основная занятость",
    "part_time": "Проектная работа"
  },
  en: {
    "page_title": "Education",
    "main_title": "Academic Journey 🎓",
    "current_status": "4th Year Student",
    "year1": "2020-2024",
    "degree": "Bachelor of Linguistics",
    "specialty": "Major:",
    "specialty_name": "Translation Studies (Japanese)",
    "gpa": "GPA",
    "nav.home": "Home",
    "nav.about": "Education",
    "welcome": "Welcome! ",
    "theme.toggle": "Toggle theme",
    "about.title": "About Me",
    "about.education": "Education",
    "about.education.item1": "4th year student at MSPU: Japanese Translator",
    "about.education.item2": "Exchange program: University of Tsukuba (Japan), 2022",
    "about.education.item3": "Additional education: Programming Basics",
    "about.education.item4": "RFL Teaching Methodology: Course for Russian Teachers",
    "skills.title": "My Skills",
    "skills.html": "HTML",
    "skills.css": "CSS",
    "skills.js": "JavaScript (learning)",
    "faq.question": "How did you start programming?",
    "faq.answer": "I started with online courses and practice...",
    "contact.title": "Contact Me",
    "contact.name": "Your Name",
    "contact.email": "Email",
    "contact.message": "Message...",
    "contact.submit": "Submit",
    "footer.copyright": "© 2024 My Portfolio",
    "image.alt": "portrait photo",
    "image.caption": "Tokyo",
    "experience": "Professional Experience",
    "experience.item1": "Content localization for Japanese companies",
    "experience.item2": "Personal assistance for Japanese CEOs",
    "experience.item3": "Customer service: Cashier in Japan (Mosburger)",
    "experience.item4": "Teaching Russian to foreign students",
    "services.title": "Services",
    "services.webdev": "Web Development",
    "playground.title": "Code Playground",
    "nav.services": "Services",
    "nav.playground": "Code Playground",
    "services.localization": "Localization",
    "services.feature1": "Multilingual Websites",
    "services.feature2": "CMS Integration",
    "services.feature3": "Japan Market Optimization",
    "services.order": "Order Now",
    "playground.demo1": "<!-- Localization Example -->",
    "playground.input": "Enter Japanese Text",
    "playground.analyze": "Analyze",
    "playground.result": "Analysis Results",
    "education.title": "Education",
    "goals.title": "Goals",
    "goals.short": "Short-term (2024)",
    "goals.long": "Long-term",
    "goals.react": "Learn React",
    "goals.portfolio": "Build Portfolio",
    "goals.company": "Work in Global Company",
    "goals.startup": "Launch Startup",
    "contact-main.title": "Contact Options",
    "contact-qr.alt": "QR Code with Contacts",
    "service-icon.webdev": "🌐 Web Development",
    "service-icon.localization": "🗣️ Localization",
    "nlp-demo.title": "Japanese Text Processing",
    "code-editor.title": "Interactive Code Samples",
    "experience.location": "Tokyo, Japan",
    "certificates.title": "Certifications",
    "testimonial.quote": "Professional and culturally aware approach",
    "page_title": "Work Experience",
    "main_title": "Professional Journey",
    "full_time": "Full-Time Positions",
    "part_time": "Freelance & Contract Work",
    "date1": "2023-Present",
    "position1": "Senior Translator",
    "company1": "Japanese IT Company \"Sakura Tech\"",
    "achievement1": "Mobile app UI/UX localization",
    "stat1": "completed projects"
  },
  ja: {
    "page_title": "学歴",
    "main_title": "学業の歩み 🎓",
    "current_status": "4年生",
    "year1": "2020-2024年",
    "degree": "言語学学士",
    "specialty": "専攻:",
    "specialty_name": "翻訳学（日本語）",
    "gpa": "GPA",
    "nav.home": "ホーム",
    "nav.about": "学歴",
    "welcome": "ようこそ！ ",
    "theme.toggle": "テーマ切替",
    "about.title": "自己紹介",
    "about.education": "学歴",
    "about.education.item1": "モスクワ市立教育大学4年生：日本語翻訳者",
    "about.education.item2": "交換留学：筑波大学（日本）、2022年",
    "about.education.item3": "追加教育：プログラミング基礎",
    "about.education.item4": "ロシア語教授法：教師向けコース",
    "skills.title": "スキル",
    "skills.html": "HTML",
    "skills.css": "CSS",
    "skills.js": "JavaScript (学習中)",
    "faq.question": "プログラミングを始めたきっかけは？",
    "faq.answer": "オンラインコースと自主学習から始めました...",
    "contact.title": "連絡先",
    "contact.name": "お名前",
    "contact.email": "メールアドレス",
    "contact.message": "メッセージ...",
    "contact.submit": "送信",
    "footer.copyright": "© 2024 私のポートフォリオ",
    "image.alt": "ポートレート写真",
    "image.caption": "東京",
    "experience.title": "職務経験",
    "experience.item1": "日本企業向けコンテンツのローカライズ",
    "experience.item2": "日本企業CEOのパーソナルアシスタント",
    "experience.item3": "接客業務：モスバーガーでのレジ担当",
    "experience.item4": "外国人向けロシア語教育",
    "nav.experience": "職務経歴",
    "nav.services": "サービス",
    "nav.playground": "コードプレイグラウンド",
    "services.title": "提供サービス",
    "services.webdev": "ウェブ開発",
    "services.localization": "ローカライゼーション",
    "services.feature1": "多言語サイト制作",
    "services.feature2": "CMS連携",
    "services.feature3": "日本市場向け最適化",
    "services.order": "注文する",
    "playground.title": "コード実演場",
    "playground.demo1": "<!-- ローカライゼーションの例 -->",
    "playground.input": "日本語テキストを入力",
    "playground.analyze": "解析",
    "playground.result": "解析結果",
    "education.title": "学歴",
    "goals.title": "目標",
    "goals.short": "短期目標 (2024)",
    "goals.long": "長期目標",
    "goals.react": "Reactを習得",
    "goals.portfolio": "ポートフォリオ作成",
    "goals.company": "国際企業での勤務",
    "goals.startup": "スタートアップ起業",
    "contact-main.title": "連絡方法",
    "contact-qr.alt": "連絡先QRコード",
    "page_title": "職務経歴",
    "main_title": "プロフェッショナルな歩み",
    "full_time": "正社員経験",
    "part_time": "フリーランス業務",
    "date1": "2023年-現在",
    "position1": "シニア翻訳者",
    "company1": "日本のIT企業「サクラテック」",
    "achievement1": "モバイルアプリUI/UXのローカライズ",
    "stat1": "完了プロジェクト数"
  }
};

// Функция обновления языка
function updateLanguage(lang) {
  // Обновление атрибута lang
  document.documentElement.lang = lang;
  
  // Обновление текстовых элементов
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  // Обновление плейсхолдеров
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (translations[lang][key]) {
      el.placeholder = translations[lang][key];
    }
  });

  // Обновление alt-текстов
  document.querySelectorAll('[data-i18n-alt]').forEach(img => {
    const key = img.dataset.i18nAlt;
    if (translations[lang][key]) {
      img.alt = translations[lang][key];
    }
  });

  // Сохранение выбора языка
  localStorage.setItem('selectedLanguage', lang);
}

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.post('/submit-form', (req, res) => {
    console.log('Получены данные:', req.body);
    res.sendStatus(200);
});

app.listen(3000, () => console.log('Сервер запущен'));