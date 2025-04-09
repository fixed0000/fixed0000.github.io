// js/translations.js

// Полный объект переводов с ИСПРАВЛЕННЫМИ ЗАПЯТЫМИ
const translations = {
  ru: {
    "page.title": "Мой сайт", // Добавлен ключ для <title>
    "contact.success": "Сообщение успешно отправлено!",
    "contact.error": "Ошибка отправки. Попробуйте позже.",
    "contact.sending": "Отправка...", // <<< ДОБАВЛЕНА ЗАПЯТАЯ
    "main_title": "Академический путь 🎓", // Кажется, этот ключ не используется в HTML?
    "current_status": "Студент 4 курса",
    "year1": "2020-2024",
    "degree": "Бакалавр лингвистики",
    "specialty": "Специальность:",
    "specialty_name": "Перевод и переводоведение (японский язык)",
    "gpa": "Средний балл",
    "nav.home": "Главная",
    "nav.about": "Образование", // Ключ соответствует about.html, но секция называется 'Об авторе'
    "nav.experience": "Опыт",
    "nav.services": "Услуги",
    "nav.playground": "Код",
    "welcome": "Добро пожаловать!",
    "theme.toggle": "Сменить тему",
    "about.title": "Об авторе", // Ключ для <h2> в секции intro
    "about.education": "Образование", // Ключ для <h3> внутри блока
    "about.education.item1": "Студентка 4 курса МГПУ: Переводчик японского языка",
    "about.education.item2": "Программа обмена: Университет Цукубы (Япония), 2022",
    "about.education.item3": "Дополнительное образование: Основы программирования",
    "about.education.item4": "Методика преподавания РКИ: Курс для преподавателей-русистов",
    "experience.title": "Профессиональный опыт", // Ключ для <h3>
    "experience.item1": "Локализация контента для японских компаний",
    "experience.item2": "Персональное сопровождение CEO из Японии",
    "experience.item3": "Работа с клиентами: кассир в Японии (Mosburger)",
    "experience.item4": "Преподавание русского языка для иностранцев",
    "skills.title": "Мои навыки",
    "skills.html": "HTML",
    "skills.css": "CSS",
    "skills.js": "JavaScript (в процессе)",
    "skills.japanese": "Японский язык (продвинутый уровень)", // Убедитесь, что ключ в HTML правильный (data-i18n)
    "skills.english": "Английский язык (продвинутый уровень)",
    "skills.russian": "Русский язык (носитель)",
    "faq.title": "Часто задаваемые вопросы", // Добавлен ключ для заголовка FAQ
    "faq.question1": "Как вы начали программировать?", // Используем question1 для первого
    "faq.answer1": "Я начал с онлайн-курсов и практики...", // Используем answer1 для первого
    "faq.question2": "Какие языки вы знаете?", // Пример второго вопроса
    "faq.answer2": "Японский, Английский, Русский...", // Пример второго ответа
    "contact.title": "Свяжитесь со мной",
    "contact.namePlaceholder": "Ваше имя", // Ключ для плейсхолдера
    "contact.emailPlaceholder": "Ваш Email", // Ключ для плейсхолдера
    "contact.messagePlaceholder": "Ваше сообщение...", // Ключ для плейсхолдера
    "contact.nameLabel": "Имя", // Ключ для скрытой метки
    "contact.emailLabel": "Email", // Ключ для скрытой метки
    "contact.messageLabel": "Сообщение", // Ключ для скрытой метки
    "contact.submit": "Отправить",
    "footer.copyright": "© 2024 Мой первый сайт",
    "image.alt": "Портретное фото",
    "image.caption": "Токио",
    "gallery.image1.alt": "Пример работы 1", // Alt для галереи
    "gallery.image2.alt": "Пример работы 2",
    "gallery.image3.alt": "Пример работы 3"
    // Убраны дублирующиеся ключи "page_title", "main_title" и т.д. Оставьте только один набор для каждой страницы или используйте более специфичные ключи.
  },
  en: {
    "page.title": "My Website",
    "contact.success": "Message sent successfully!",
    "contact.error": "Sending error. Please try later.",
    "contact.sending": "Sending...", // <<< ДОБАВЛЕНА ЗАПЯТАЯ
    "main_title": "Academic Journey 🎓",
    "current_status": "4th Year Student",
    "year1": "2020-2024",
    "degree": "Bachelor of Linguistics",
    "specialty": "Major:",
    "specialty_name": "Translation Studies (Japanese)",
    "gpa": "GPA",
    "nav.home": "Home",
    "nav.about": "Education",
    "nav.experience": "Experience",
    "nav.services": "Services",
    "nav.playground": "Code",
    "welcome": "Welcome!",
    "theme.toggle": "Toggle theme",
    "about.title": "About Me",
    "about.education": "Education",
    "about.education.item1": "4th year student at MSPU: Japanese Translator",
    "about.education.item2": "Exchange program: University of Tsukuba (Japan), 2022",
    "about.education.item3": "Additional education: Programming Basics",
    "about.education.item4": "RFL Teaching Methodology: Course for Russian Teachers",
    "experience.title": "Professional Experience",
    "experience.item1": "Content localization for Japanese companies",
    "experience.item2": "Personal assistance for Japanese CEOs",
    "experience.item3": "Customer service: Cashier in Japan (Mosburger)",
    "experience.item4": "Teaching Russian to foreign students",
    "skills.title": "My Skills",
    "skills.html": "HTML",
    "skills.css": "CSS",
    "skills.js": "JavaScript (learning)",
    "skills.japanese": "Japanese (Advanced)",
    "skills.english": "English (Advanced)",
    "skills.russian": "Russian (Native)",
    "faq.title": "Frequently Asked Questions",
    "faq.question1": "How did you start programming?",
    "faq.answer1": "I started with online courses and practice...",
    "faq.question2": "Which languages do you speak?",
    "faq.answer2": "Japanese, English, Russian...",
    "contact.title": "Contact Me",
    "contact.namePlaceholder": "Your Name",
    "contact.emailPlaceholder": "Your Email",
    "contact.messagePlaceholder": "Your message...",
    "contact.nameLabel": "Name",
    "contact.emailLabel": "Email",
    "contact.messageLabel": "Message",
    "contact.submit": "Submit",
    "footer.copyright": "© 2024 My First Website",
    "image.alt": "Portrait photo",
    "image.caption": "Tokyo",
    "gallery.image1.alt": "Work Example 1",
    "gallery.image2.alt": "Work Example 2",
    "gallery.image3.alt": "Work Example 3"
  },
  ja: {
    "page.title": "私のサイト",
    "contact.success": "メッセージを送信しました！",
    "contact.error": "送信エラー。後でもう一度お試しください。",
    "contact.sending": "送信中...", // <<< ДОБАВЛЕНА ЗАПЯТАЯ
    "main_title": "学業の歩み 🎓",
    "current_status": "4年生",
    "year1": "2020-2024年",
    "degree": "言語学学士",
    "specialty": "専攻:",
    "specialty_name": "翻訳学（日本語）",
    "gpa": "GPA",
    "nav.home": "ホーム",
    "nav.about": "学歴",
    "nav.experience": "職務経歴",
    "nav.services": "サービス",
    "nav.playground": "コード",
    "welcome": "ようこそ！",
    "theme.toggle": "テーマ切替",
    "about.title": "自己紹介",
    "about.education": "学歴",
    "about.education.item1": "モスクワ市立教育大学4年生：日本語翻訳者",
    "about.education.item2": "交換留学：筑波大学（日本）、2022年",
    "about.education.item3": "追加教育：プログラミング基礎",
    "about.education.item4": "ロシア語教授法：教師向けコース",
    "experience.title": "職務経験",
    "experience.item1": "日本企業向けコンテンツのローカライズ",
    "experience.item2": "日本企業CEOのパーソナルアシスタント",
    "experience.item3": "接客業務：モスバーガーでのレジ担当（日本）",
    "experience.item4": "外国人向けロシア語教育",
    "skills.title": "スキル",
    "skills.html": "HTML",
    "skills.css": "CSS",
    "skills.js": "JavaScript (学習中)",
    "skills.japanese": "日本語（上級）",
    "skills.english": "英語（上級）",
    "skills.russian": "ロシア語（ネイティブ）",
    "faq.title": "よくある質問",
    "faq.question1": "プログラミングを始めたきっかけは？",
    "faq.answer1": "オンラインコースと自主学習から始めました...",
    "faq.question2": "どの言語を話せますか？",
    "faq.answer2": "日本語、英語、ロシア語...",
    "contact.title": "連絡先",
    "contact.namePlaceholder": "お名前",
    "contact.emailPlaceholder": "メールアドレス",
    "contact.messagePlaceholder": "メッセージ...",
    "contact.nameLabel": "名前",
    "contact.emailLabel": "メールアドレス",
    "contact.messageLabel": "メッセージ",
    "contact.submit": "送信",
    "footer.copyright": "© 2024 私の最初のサイト",
    "image.alt": "ポートレート写真",
    "image.caption": "東京",
    "gallery.image1.alt": "制作例 1",
    "gallery.image2.alt": "制作例 2",
    "gallery.image3.alt": "制作例 3"
  }
};

console.log("translations.js loaded successfully."); // Для проверки загрузки