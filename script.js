document.addEventListener('DOMContentLoaded', init);
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
  initializeContactForm();

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

const initializeContactForm = () => {
  const form = document.querySelector('.contact form');
  
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Получаем данные формы
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);

      try {
        // Замените URL на ваш реальный эндпоинт
        const response = await fetch('https://your-backend.com/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          alert(translations[document.documentElement.lang]['contact.success']);
          form.reset();
        } else {
          throw new Error(translations[document.documentElement.lang]['contact.error']);
        }
      } catch (error) {
        alert(error.message);
      }
    });
  }
};