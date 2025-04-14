/**
 * script.js
 *
 * Содержит основной JavaScript для интерактивных элементов страницы:
 * - Анимации появления элементов при прокрутке
 * - Переключение тем (светлая/темная)
 * - Переключение языка интерфейса (с загрузкой JSON)
 * - Обработка отправки контактной формы
 * - Инициализация каруселей
 * - Кнопка "Наверх"
 */

// --- Глобальная переменная для хранения ЗАГРУЖЕННЫХ переводов ---
let translations = {}; // Начинаем с пустого объекта

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
 * Инициализирует переключатель языка интерфейса, загружая переводы.
 */
const initializeLanguage = () => {
  const languageSelect = document.getElementById('language-select');
  if (languageSelect) {
    // Определяем язык по умолчанию или из localStorage
    const savedLang = localStorage.getItem('selectedLanguage') || document.documentElement.lang || 'ru';
    // Проверяем, есть ли такое значение в select, иначе ставим первое
    if ([...languageSelect.options].map(o => o.value).includes(savedLang)) {
        languageSelect.value = savedLang;
    } else {
        const defaultOption = languageSelect.options[0].value;
        languageSelect.value = defaultOption;
        console.warn(`Saved language "${savedLang}" not found in select options, defaulting to "${defaultOption}"`);
    }

    // Загружаем сохраненный или дефолтный язык
    loadAndSetLanguage(languageSelect.value);

    // Обработчик на изменение языка
    languageSelect.addEventListener('change', (event) => {
      loadAndSetLanguage(event.target.value);
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
        const originalButtonText = submitButton ? submitButton.textContent : 'Submit';

        // Проверка наличия объекта translations и ключей ПЕРЕД использованием
         if (typeof translations === 'undefined' || !translations[currentLang] || !translations[currentLang][successMsgKey] || !translations[currentLang][errorMsgKey] || !translations[currentLang][sendingMsgKey]) {
           console.error('Translation keys for contact form messages are missing! Cannot proceed with submission.');
           alert(genericErrorMsg);
           return;
         }

        if(submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = translations[currentLang][sendingMsgKey];
        }

        try {
          const endpointURL = 'YOUR_BACKEND_ENDPOINT_URL'; // ЗАМЕНИТЕ URL
          if (endpointURL === 'YOUR_BACKEND_ENDPOINT_URL') {
              console.error('Form endpoint URL is not configured.');
              alert('Form endpoint URL is not configured.');
              throw new Error('Form endpoint not configured');
          }

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
                const displayLang = document.documentElement.lang || 'ru';
                if (translations && translations[displayLang] && translations[displayLang][buttonTextKey]) { // Проверка translations
                    submitButton.textContent = translations[displayLang][buttonTextKey];
                } else {
                    submitButton.textContent = originalButtonText || 'Submit';
                }
            }
        }
      });
    }
};


// --- Асинхронная Функция Загрузки и Применения Языка ---
async function loadAndSetLanguage(lang) {
    // console.log(`[DEBUG] Attempting to load language: ${lang}`);

    // Если переводы уже есть, просто обновляем UI
    if (translations && translations[lang]) {
        // console.log(`[DEBUG] Translations for ${lang} already loaded. Updating UI.`);
        updateUIForLanguage(lang);
        return;
    }

    // Если нет, загружаем JSON
    const filePath = `js/translations/${lang}.json`; // ПРЕДПОЛАГАЕТСЯ ПАПКА translations
    // console.log(`[DEBUG] Fetching translations for ${lang} from: ${filePath}`);

    try {
        const response = await fetch(filePath);
        // console.log(`[DEBUG] Fetch response status for ${lang}.json: ${response.status}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for ${filePath}`);
        }

        const langData = await response.json();
        // console.log(`[DEBUG] Successfully fetched and parsed ${lang}.json`);

        // Сохраняем загруженные переводы глобально
        translations[lang] = langData;

        // Обновляем интерфейс
        updateUIForLanguage(lang);

    } catch (error) {
        console.error(`[DEBUG] Error loading or parsing translations for ${lang}:`, error);
        // Можно показать сообщение пользователю или оставить язык по умолчанию
        alert(`Error loading language file for "${lang}". Please check console.`);
    }
}

// --- Функция Обновления Интерфейса по Языку ---
function updateUIForLanguage(lang) {
    // Дополнительная проверка на наличие объекта translations
    if (typeof translations === 'undefined' || !translations || !translations[lang]) {
      console.error(`[DEBUG] ERROR in updateUIForLanguage: Translations for '${lang}' are not loaded or available.`);
      return; // Прерываем, если нет данных
    }
    // console.log(`[DEBUG] --- Updating UI TO: ${lang} ---`);
    document.documentElement.lang = lang;

    // --- Обобщенная функция для обновления атрибутов/текста ---
    const translateElements = (selector, attribute, isContent = false, useSetAttribute = false) => {
        document.querySelectorAll(selector).forEach(element => {
            // Ключ берем из соответствующего data-атрибута
            const dataAttributeName = attribute ? attribute.replace(/-/g, '') : 'i18n'; // Преобразуем data-i18n-xyz в i18nХyz
            const key = element.dataset[dataAttributeName];

            if (!key) { // Если у элемента нет нужного data-атрибута со значением
                 // console.warn(`[DEBUG] Missing data attribute for ${attribute || 'content'} on element:`, element);
                 return;
            }

            const translation = translations[lang][key]; // Ищем перевод

            if (translation !== undefined) {
                if (isContent) {
                    element.textContent = translation;
                } else if (useSetAttribute) {
                    element.setAttribute(attribute, translation);
                } else if (attribute === 'placeholder' || attribute === 'title' || attribute === 'alt') {
                    element[attribute] = translation; // Прямое присвоение для этих атрибутов
                }
                // Обновляем title документа отдельно
                if (element.tagName === 'TITLE' && attribute === 'title') {
                    document.title = translation;
                }
            } else {
                 console.warn(`[DEBUG] Key '${key}' (for ${attribute || 'content'}) not found for lang '${lang}'`);
            }
        });
    };

    // --- Вызов функции для каждого типа перевода ---
    translateElements('[data-i18n]', null, true);                           // Text Content
    translateElements('[data-i18n-placeholder]', 'placeholder');             // Placeholder
    translateElements('[data-i18n-alt]', 'alt');                             // Alt text
    translateElements('[data-i18n-title]', 'title');                         // Title attribute (and document title)
    translateElements('[data-i18n-aria-label]', 'aria-label', false, true); // Aria-label (use setAttribute)
    // Добавьте другие атрибуты при необходимости

    localStorage.setItem('selectedLanguage', lang);
    // console.log(`[DEBUG] --- Language UI update complete for ${lang}. Preference saved. ---`);
}


// --- Логика для Карусели ---
const initializeCarousels = () => {
  // console.log('Attempting to initialize Carousels...');
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
      // Скрываем контролы, если слайд один
      if (slides.length <= 1) {
           prevButton.style.display = 'none'; nextButton.style.display = 'none'; dotsContainer.style.display = 'none'; return;
      }

      let currentIndex = 0; const totalSlides = slides.length;
      dotsContainer.innerHTML = '';
      for (let i = 0; i < totalSlides; i++) {
          const dot = document.createElement('button'); dot.classList.add('carousel-dot');
          dot.dataset.i18nAriaLabel = 'carousel.goToSlide'; // Ключ для перевода
          dot.setAttribute('aria-label', `Go to slide ${i + 1}`); // Дефолтное значение
          dot.dataset.index = i; dotsContainer.appendChild(dot);
      }
      const dots = dotsContainer.querySelectorAll('.carousel-dot');

      const showSlide = (index) => {
          if (index >= totalSlides) index = 0; else if (index < 0) index = totalSlides - 1;
          slidesContainer.style.transform = `translateX(-${index * 100}%)`; currentIndex = index;
          dots.forEach((dot, dotIndex) => dot.classList.toggle('active', dotIndex === currentIndex));
      };

      nextButton.addEventListener('click', () => showSlide(currentIndex + 1));
      prevButton.addEventListener('click', () => showSlide(currentIndex - 1));
      dots.forEach(dot => {
          dot.addEventListener('click', (e) => showSlide(parseInt(e.target.dataset.index, 10)));
      });
      showSlide(currentIndex);
  });
  // После инициализации всех каруселей, обновим aria-label для точек
  updateUIForLanguage(document.documentElement.lang || 'ru');
};

// --- Логика для Кнопки "Наверх" ---
const initializeBackToTopButton = () => {
    const backToTopButton = document.getElementById('back-to-top-btn');
    if (!backToTopButton) { return; }

    const scrollThreshold = 300; // Показать кнопку после прокрутки 300px
    // Функция для проверки видимости кнопки
    const checkScroll = () => {
        if (window.scrollY > scrollThreshold) {
            backToTopButton.classList.add('show'); // Используем класс 'show' из вашего CSS
        } else {
            backToTopButton.classList.remove('show');
        }
    };
    // Слушатель события прокрутки
    window.addEventListener('scroll', checkScroll, { passive: true }); // Оптимизация
    // Слушатель клика по кнопке
    backToTopButton.addEventListener('click', (event) => {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    // Проверяем видимость при загрузке страницы
    checkScroll();
};


// --- Точка Входа: Инициализация после Загрузки DOM ---
document.addEventListener('DOMContentLoaded', () => {
  console.log('>>> DOM fully loaded. Starting initializations...');

  // Вызов всех функций инициализации
  initializeScrollAnimations();
  initializeTheme();
  initializeLanguage(); // Запускает асинхронную загрузку переводов
  initializeContactForm();
  initializeCarousels();
  initializeBackToTopButton();

  console.log('>>> All initialization functions called.');
});