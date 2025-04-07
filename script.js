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
    "nav.home": "Главная",
    "nav.about": "Обо мне",
    "welcome": "Добро пожаловать! 👋",
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
    "experience.title": "Профессиональный опыт",
    "experience.item1": "Локализация контента для японских компаний",
    "experience.item2": "Персональное сопровождение CEO из Японии",
    "experience.item3": "Работа с клиентами: кассир в Японии (Mosburger)",
    "experience.item4": "Преподавание русского языка для иностранцев"
  },
  en: {
    "nav.home": "Home",
    "nav.about": "About",
    "welcome": "Welcome! 👋",
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
    "experience.title": "Professional Experience",
    "experience.item1": "Content localization for Japanese companies",
    "experience.item2": "Personal assistance for Japanese CEOs",
    "experience.item3": "Customer service: Cashier in Japan (Mosburger)",
    "experience.item4": "Teaching Russian to foreign students"
  },
  ja: {
    "nav.home": "ホーム",
    "nav.about": "自己紹介",
    "welcome": "ようこそ！ 👋",
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
    "experience.item4": "外国人向けロシア語教育"
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