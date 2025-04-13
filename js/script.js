/**
 * script.js
 *
 * Основной JavaScript для интерактивных элементов страницы:
 * - Анимации появления элементов при прокрутке
 * - Переключение тем (светлая/темная)
 * - Переключение языка интерфейса
 * - Обработка отправки контактной формы
 * - Инициализация каруселей
 * - Фиксированные кнопки навигации ("Наверх", "На главную")
 */

// --- Определения Функций Инициализации ---

/**
 * Инициализирует Intersection Observer для анимации появления
 * элементов с классом '.animate-on-scroll'.
 */
const initializeScrollAnimations = () => {
  const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
  // console.log(`Found ${elementsToAnimate.length} elements to animate on scroll.`); // DEBUG

  if (elementsToAnimate.length > 0) {
    const observer = new IntersectionObserver((entries, observerInstance) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observerInstance.unobserve(entry.target);
          // console.log('Element animated:', entry.target); // DEBUG
        }
      });
    }, {
      threshold: 0.1, // Начать анимацию при 10% видимости
    });
    elementsToAnimate.forEach(element => observer.observe(element));
  }
};

/**
 * Инициализирует переключатель темы (светлая/темная).
 */
const initializeTheme = () => {
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.dataset.theme = savedTheme;

    toggle.addEventListener('click', () => {
      const currentTheme = document.body.dataset.theme;
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.body.dataset.theme = newTheme;
      localStorage.setItem('theme', newTheme);
       // console.log(`Theme changed to: ${newTheme}`); // DEBUG
    });
  } else {
    console.error("Theme toggle button with id 'theme-toggle' not found.");
  }
};

/**
 * Инициализирует переключатель языка интерфейса.
 */
const initializeLanguage = () => {
  const languageSelect = document.getElementById('language-select');
  if (languageSelect) {
    if (typeof translations === 'undefined') {
        console.error("CRITICAL in initializeLanguage: 'translations' object is undefined! Cannot initialize language features.");
        return;
    }

    const savedLang = localStorage.getItem('selectedLanguage') || document.documentElement.lang || 'ru';
    languageSelect.value = savedLang;
    updateLanguage(savedLang); // Первичное обновление

    languageSelect.addEventListener('change', (event) => {
      updateLanguage(event.target.value);
    });
  } else {
    console.error("Language select dropdown with id 'language-select' not found.");
  }
};

/**
 * Инициализирует обработчик отправки контактной формы.
 */
const initializeContactForm = () => {
    const form = document.getElementById('contactForm'); // Используем ID
    if (form) {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const currentLang = document.documentElement.lang || 'ru';
        const successMsgKey = 'contact.success';
        const errorMsgKey = 'contact.error';
        const sendingMsgKey = 'contact.sending';
        const genericErrorMsg = 'An error occurred during submission.';
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton ? submitButton.textContent : 'Submit'; // Сохраняем исходный текст

        // Проверка наличия переводов
         if (typeof translations === 'undefined' || !translations[currentLang] || !translations[currentLang][successMsgKey] || !translations[currentLang][errorMsgKey] || !translations[currentLang][sendingMsgKey]) {
           console.error('Translation keys for contact form messages are missing!');
           alert(genericErrorMsg);
           return;
         }

        // Блокируем кнопку и показываем статус отправки
        if(submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = translations[currentLang][sendingMsgKey];
        }

        try {
          // --- !!! ЗАМЕНИТЕ URL !!! ---
          const endpointURL = 'YOUR_BACKEND_ENDPOINT_URL';
          if (endpointURL === 'YOUR_BACKEND_ENDPOINT_URL') {
              console.error('Please replace YOUR_BACKEND_ENDPOINT_URL with your actual form processing URL.');
              alert('Form endpoint URL is not configured.');
              throw new Error('Form endpoint not configured'); // Бросаем ошибку, чтобы попасть в finally
          }
          // --------------------------------

          const response = await fetch(endpointURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          if (response.ok) {
            alert(translations[currentLang][successMsgKey]);
            form.reset();
          } else {
            let errorText = translations[currentLang][errorMsgKey] || genericErrorMsg;
            try { const errorDetails = await response.text(); if(errorDetails) { console.error(`Server error: ${response.status}. Details: ${errorDetails}`); } } catch(e){}
            throw new Error(errorText);
          }
        } catch (error) {
          console.error('Form submission error:', error);
          alert(error.message || genericErrorMsg);
        } finally {
            if(submitButton) {
                submitButton.disabled = false;
                const buttonTextKey = submitButton.dataset.i18n || 'contact.submit';
                submitButton.textContent = translations[currentLang][buttonTextKey] || originalButtonText || 'Submit';
            }
        }
      });
    }
};


// --- Вспомогательная Функция Обновления Языка ---
function updateLanguage(lang) {
    if (typeof translations === 'undefined') {
      console.error("CRITICAL in updateLanguage: Global 'translations' object is not defined.");
      return;
    }
    if (!translations[lang]) {
      console.error(`Translations for language '${lang}' not found.`);
      return;
    }
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.dataset.i18n;
      if (translations[lang][key] !== undefined) element.textContent = translations[lang][key];
      else console.warn(`Translation key '${key}' not found for lang '${lang}'`);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.dataset.i18nPlaceholder;
      if (translations[lang][key] !== undefined) element.placeholder = translations[lang][key];
      else console.warn(`Placeholder key '${key}' not found for lang '${lang}'`);
    });
    document.querySelectorAll('[data-i18n-alt]').forEach(img => {
      const key = img.dataset.i18nAlt;
      if (translations[lang][key] !== undefined) img.alt = translations[lang][key];
      else console.warn(`Alt text key '${key}' not found for lang '${lang}'`);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.dataset.i18nTitle;
        if (translations[lang][key] !== undefined) {
            element.title = translations[lang][key];
            if (element.tagName === 'TITLE') document.title = translations[lang][key];
        } else console.warn(`Title key '${key}' not found for lang '${lang}'`);
    });
    document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
        const key = element.dataset.i18nAriaLabel;
        if (translations[lang][key] !== undefined) element.setAttribute('aria-label', translations[lang][key]);
        else console.warn(`Aria-label key '${key}' not found for lang '${lang}'`);
    });

    localStorage.setItem('selectedLanguage', lang);
}


// --- Логика для Карусели ---
const initializeCarousels = () => {
  const carousels = document.querySelectorAll('.carousel-container');
  if (carousels.length === 0) { return; }

  carousels.forEach((carousel, carouselIndex) => {
      const slidesContainer = carousel.querySelector('.carousel-slides');
      const slides = carousel.querySelectorAll('.carousel-slide');
      const prevButton = carousel.querySelector('.carousel-arrow.prev');
      const nextButton = carousel.querySelector('.carousel-arrow.next');
      const dotsContainer = carousel.querySelector('.carousel-dots');

      if (!slidesContainer || slides.length === 0 || !prevButton || !nextButton || !dotsContainer) {
          console.error(`Carousel ${carouselIndex + 1} is missing required elements. Skipping.`);
          return;
      }
      if (slides.length <= 1) {
           prevButton.style.display = 'none'; nextButton.style.display = 'none'; dotsContainer.style.display = 'none'; return;
      }

      let currentIndex = 0; const totalSlides = slides.length;
      dotsContainer.innerHTML = '';
      for (let i = 0; i < totalSlides; i++) {
          const dot = document.createElement('button'); dot.classList.add('carousel-dot');
          dot.setAttribute('aria-label', `Go to slide ${i + 1}`); dot.dataset.index = i; dotsContainer.appendChild(dot);
      }
      const dots = dotsContainer.querySelectorAll('.carousel-dot');

      const showSlide = (index) => {
          if (index >= totalSlides) index = 0; else if (index < 0) index = totalSlides - 1;
          slidesContainer.style.transform = `translateX(-${index * 100}%)`; currentIndex = index;
          dots.forEach((dot, dotIndex) => dot.classList.toggle('active', dotIndex === currentIndex));
      };

      nextButton.addEventListener('click', () => showSlide(currentIndex + 1));
      prevButton.addEventListener('click', () => showSlide(currentIndex - 1));
      dots.forEach(dot => dot.addEventListener('click', (e) => showSlide(parseInt(e.target.dataset.index, 10))));
      showSlide(currentIndex);
  });
};

// --- ИСПРАВЛЕННАЯ Логика для Фиксированных Кнопок Навигации ---
/**
 * Инициализирует кнопки "Наверх" и "На главную".
 * Показывает/скрывает кнопку "Наверх" при прокрутке.
 * Кнопка "На главную" всегда видна.
 */
const initializeFixedNavButtons = () => {
    const backToTopButton = document.getElementById('back-to-top-btn'); // Ищем кнопку "Наверх"
    const backToHomeButton = document.getElementById('back-to-home-btn'); // Ищем кнопку "Домой"

    // Проверяем наличие кнопки "Наверх" для управления ее видимостью
    if (backToTopButton) {
        const scrollThreshold = 200; // Порог прокрутки

        const checkScroll = () => {
            if (window.scrollY > scrollThreshold) {
                backToTopButton.classList.add('active'); // Показываем кнопку "Наверх"
            } else {
                backToTopButton.classList.remove('active'); // Скрываем кнопку "Наверх"
            }
        };

        window.addEventListener('scroll', checkScroll);

        // Обработчик клика для кнопки "Наверх"
        backToTopButton.addEventListener('click', (event) => {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        checkScroll(); // Первоначальная проверка видимости кнопки "Наверх"
        console.log('Back to top button initialized.'); // DEBUG

    } else {
         console.warn("Back-to-top button with id 'back-to-top-btn' not found.");
    }

    // Просто проверяем наличие кнопки "Домой" для отладки, JS для нее не нужен
    if (!backToHomeButton) {
         console.warn("Back-to-home button with id 'back-to-home-btn' not found.");
    } else {
         console.log('Back to home button found (always visible via CSS).'); // DEBUG
    }
};


// --- Точка Входа: Инициализация после Загрузки DOM ---
document.addEventListener('DOMContentLoaded', () => {
  // console.log('>>> DOM fully loaded. Starting initializations...'); // DEBUG
  if (typeof translations === 'undefined') {
    console.error('>>> CRITICAL: translations object is UNDEFINED right after DOMContentLoaded!');
  } else {
    // console.log('>>> translations object seems OK right after DOMContentLoaded.'); // DEBUG
  }

  // Вызов всех функций инициализации
  initializeScrollAnimations();
  initializeTheme();
  initializeLanguage();
  initializeContactForm();
  initializeCarousels();
  initializeFixedNavButtons(); // Используем ИСПРАВЛЕННУЮ функцию

  // console.log('>>> All initializations attempted.'); // DEBUG
});