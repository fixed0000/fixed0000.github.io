// --- js/script.js (ИСПРАВЛЕННАЯ ВЕРСИЯ) ---

document.addEventListener('DOMContentLoaded', () => {
  console.log('>>> DOM fully loaded. Starting initializations...');

  // --- ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ---
  let translations = {};

  // --- ФУНКЦИИ ---

  /**
   * Загружает и применяет переводы для указанного языка.
   * @param {string} lang - Код языка (например, "ru", "en", "ja").
   */
  async function setLanguage(lang) {
      // Если переводы для этого языка уже загружены, просто применяем их.
      if (translations[lang]) {
          applyTranslations(lang);
          return;
      }

      // Если нет, загружаем JSON-файл.
      try {
          const response = await fetch(`js/translations/${lang}.json`);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          
          translations[lang] = await response.json();
          applyTranslations(lang);
      } catch (error) {
          console.error(`Error loading or parsing translations for ${lang}:`, error);
          // Если не удалось загрузить выбранный язык, пытаемся загрузить русский по умолчанию.
          if (lang !== 'ru') {
              console.warn('Falling back to default language "ru".');
              await setLanguage('ru');
          }
      }
  }

  /**
   * Применяет загруженные переводы ко всем элементам на странице.
   * @param {string} lang - Код языка.
   */
  function applyTranslations(lang) {
      if (!translations[lang]) return;

      const langData = translations[lang];
      document.documentElement.lang = lang; // Обновляем атрибут <html lang="...">

      // Текст, заголовки, alt-теги и т.д.
      document.querySelectorAll('[data-i18n]').forEach(el => el.innerHTML = langData[el.dataset.i18n] || el.innerHTML);
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => el.placeholder = langData[el.dataset.i18nPlaceholder] || el.placeholder);
      document.querySelectorAll('[data-i18n-title]').forEach(el => {
          const translation = langData[el.dataset.i18nTitle];
          if(translation) {
              el.title = translation;
              if (el.tagName === 'TITLE') document.title = translation;
          }
      });
      document.querySelectorAll('[data-i18n-alt]').forEach(el => el.alt = langData[el.dataset.i18nAlt] || el.alt);
      document.querySelectorAll('[data-i18n-aria-label]').forEach(el => el.setAttribute('aria-label', langData[el.dataset.i18nAriaLabel] || el.getAttribute('aria-label')));

      // *** ВАЖНО: Обновляем все ссылки, добавляя параметр языка ***
      updateAllLinksWithLang(lang);
      
      // Сохраняем выбор пользователя
      localStorage.setItem('selectedLanguage', lang);
      const languageSelect = document.getElementById('language-select');
      if (languageSelect) languageSelect.value = lang;
  }

  /**
   * [НОВАЯ ФУНКЦИЯ] Добавляет параметр языка ко всем внутренним ссылкам на странице.
   * Решает проблему сброса языка при навигации.
   * @param {string} lang - Текущий язык.
   */
  function updateAllLinksWithLang(lang) {
      const langParam = `?lang=${lang}`;
      document.querySelectorAll('a').forEach(link => {
          let href = link.getAttribute('href');
          // Обновляем только внутренние HTML-ссылки, игнорируя внешние, якоря, почту и файлы
          if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.endsWith('.pdf')) {
              // Убираем старый параметр языка, если он был
              const cleanHref = href.split('?')[0];
              if (cleanHref.endsWith('.html')) {
                  link.setAttribute('href', cleanHref + langParam);
              }
          }
      });
  }

  /**
   * Инициализирует переключатель языка.
   */
  function initializeLanguageSwitcher() {
      const languageSelect = document.getElementById('language-select');
      if (!languageSelect) return;

      languageSelect.addEventListener('change', (event) => {
          const newLang = event.target.value;
          // Обновляем URL в браузере без перезагрузки
          const url = new URL(window.location);
          url.searchParams.set('lang', newLang);
          window.history.pushState({}, '', url);

          setLanguage(newLang);
      });
  }

  /**
   * Инициализация переключателя темы.
   */
  function initializeTheme() {
      const toggle = document.getElementById('theme-toggle');
      if (!toggle) return;

      const applyTheme = (theme) => {
          document.body.dataset.theme = theme;
          localStorage.setItem('theme', theme);
      };
      
      const savedTheme = localStorage.getItem('theme') || 'light';
      applyTheme(savedTheme);

      toggle.addEventListener('click', () => {
          const newTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
          applyTheme(newTheme);
      });
  }

  // ... Другие твои функции инициализации (анимации, карусели, кнопка "наверх") могут остаться без изменений...
  // Я скопирую их из твоего файла для полноты.
  
  const initializeScrollAnimations = () => {
      const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
      if (elementsToAnimate.length > 0) {
          const observer = new IntersectionObserver((entries, observerInstance) => {
              entries.forEach(entry => {
                  if (entry.isIntersecting) {
                      entry.target.classList.add('active');
                      observerInstance.unobserve(entry.target);
                  }
              });
          }, { threshold: 0.1 });
          elementsToAnimate.forEach(element => observer.observe(element));
      }
  };

  const initializeCarousels = () => {
    const carousels = document.querySelectorAll('.carousel-container');
    if (carousels.length === 0) return;
    carousels.forEach((carousel) => {
        const slidesContainer = carousel.querySelector('.carousel-slides');
        const slides = carousel.querySelectorAll('.carousel-slide');
        const prevButton = carousel.querySelector('.carousel-arrow.prev');
        const nextButton = carousel.querySelector('.carousel-arrow.next');
        const dotsContainer = carousel.querySelector('.carousel-dots');
        if (!slidesContainer || slides.length <= 1 || !prevButton || !nextButton || !dotsContainer) {
            if (prevButton) prevButton.style.display = 'none';
            if (nextButton) nextButton.style.display = 'none';
            if (dotsContainer) dotsContainer.style.display = 'none';
            return;
        }
        let currentIndex = 0;
        const showSlide = (index) => {
            slidesContainer.style.transform = `translateX(-${index * 100}%)`;
            currentIndex = index;
            dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, dotIndex) => dot.classList.toggle('active', dotIndex === currentIndex));
        };
        dotsContainer.innerHTML = '';
        slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dot.addEventListener('click', () => showSlide(i));
            dotsContainer.appendChild(dot);
        });
        nextButton.addEventListener('click', () => showSlide((currentIndex + 1) % slides.length));
        prevButton.addEventListener('click', () => showSlide((currentIndex - 1 + slides.length) % slides.length));
        showSlide(0);
    });
  };
  
  const initializeBackToTopButton = () => {
      const backToTopButton = document.getElementById('back-to-top-btn');
      if (!backToTopButton) return;
      window.addEventListener('scroll', () => {
          backToTopButton.classList.toggle('show', window.scrollY > 300);
      }, { passive: true });
      backToTopButton.addEventListener('click', (event) => {
          event.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
      });
  };

  // --- ТОЧКА ВХОДА ---
  
  // 1. Определяем язык (URL > localStorage > default)
  const urlParams = new URLSearchParams(window.location.search);
  const langFromUrl = urlParams.get('lang');
  const langFromStorage = localStorage.getItem('selectedLanguage');
  const initialLang = langFromUrl || langFromStorage || 'ru';

  // 2. Вызываем все функции инициализации
  initializeTheme();
  initializeLanguageSwitcher();
  initializeScrollAnimations();
  initializeCarousels();
  initializeBackToTopButton();

  // 3. Устанавливаем язык (это асинхронная операция)
  setLanguage(initialLang);

  console.log('>>> All initialization functions called.');
});