/**
 * script.js
 *
 * Основной JavaScript для интерактивных элементов страницы.
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
            throw new Error(translations[currentLang][errorMsgKey]); // Бросаем ошибку с текстом из перевода
          }
        } catch (error) {
          console.error('Form submission error:', error);
          alert(error.message || genericErrorMsg);
        } finally {
            // Разблокируем кнопку и возвращаем исходный текст
            if(submitButton) {
                submitButton.disabled = false;
                // Убедимся, что originalButtonText не пустой (если кнопка без текста)
                const buttonTextKey = submitButton.dataset.i18n || 'contact.submit'; // Получаем ключ перевода кнопки
                submitButton.textContent = translations[currentLang][buttonTextKey] || originalButtonText || 'Submit'; // Восстанавливаем переведенный текст или исходный
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
      if (translations[lang][key] !== undefined) {
        element.textContent = translations[lang][key];
      } else {
         console.warn(`Translation key '${key}' not found for lang '${lang}' in element:`, element);
      }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.dataset.i18nPlaceholder;
      if (translations[lang][key] !== undefined) {
        element.placeholder = translations[lang][key];
      } else {
         console.warn(`Placeholder key '${key}' not found for lang '${lang}' in element:`, element);
      }
    });
    document.querySelectorAll('[data-i18n-alt]').forEach(img => {
      const key = img.dataset.i18nAlt;
      if (translations[lang][key] !== undefined) {
        img.alt = translations[lang][key];
      } else {
         console.warn(`Alt text key '${key}' not found for lang '${lang}' in element:`, img);
      }
    });

    localStorage.setItem('selectedLanguage', lang);
    // console.log(`--- Language update complete for ${lang}. Preference saved. ---`); // DEBUG
}


// --- Логика для Карусели ---
const initializeCarousels = () => {
  // console.log('Attempting to initialize Carousels...'); // DEBUG
  const carousels = document.querySelectorAll('.carousel-container');

  if (carousels.length === 0) {
      // console.log('No carousels found on the page.'); // DEBUG
      return;
  }

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

      let currentIndex = 0;
      const totalSlides = slides.length;

      // --- Создание точек ---
      dotsContainer.innerHTML = '';
      for (let i = 0; i < totalSlides; i++) {
          const dot = document.createElement('button');
          dot.classList.add('carousel-dot');
          dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
          dot.dataset.index = i;
          dotsContainer.appendChild(dot);
      }
      const dots = dotsContainer.querySelectorAll('.carousel-dot');

      // --- Отображение слайда ---
      const showSlide = (index) => {
          if (index >= totalSlides) index = 0;
          else if (index < 0) index = totalSlides - 1;

          slidesContainer.style.transform = `translateX(-${index * 100}%)`;
          currentIndex = index;

          dots.forEach((dot, dotIndex) => dot.classList.toggle('active', dotIndex === currentIndex));
          // Убираем disabled для бесконечной прокрутки
          // prevButton.disabled = currentIndex === 0;
          // nextButton.disabled = currentIndex === totalSlides - 1;
      };

      // --- События ---
      nextButton.addEventListener('click', () => showSlide(currentIndex + 1));
      prevButton.addEventListener('click', () => showSlide(currentIndex - 1));
      dots.forEach(dot => {
          dot.addEventListener('click', (e) => showSlide(parseInt(e.target.dataset.index, 10)));
      });

      // --- Инициализация ---
      showSlide(currentIndex);
      // console.log(`Carousel ${carouselIndex + 1} initialized.`); // DEBUG

  }); // конец forEach(carousel)
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
  initializeScrollAnimations(); // Используем новый класс .animate-on-scroll
  initializeTheme();
  initializeLanguage();
  initializeContactForm();
  initializeCarousels();

  // console.log('>>> All initializations attempted.'); // DEBUG
});