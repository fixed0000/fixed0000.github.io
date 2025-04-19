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
        // Сохраняем КЛЮЧ перевода кнопки, если он есть, или исходный текст
        const originalButtonTextKey = submitButton ? submitButton.dataset.i18n : 'contact.submit';
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
                // Восстанавливаем переведенный текст кнопки
                const displayLang = document.documentElement.lang || 'ru';
                if (translations && translations[displayLang] && translations[displayLang][originalButtonTextKey]) { // Проверка translations
                    submitButton.textContent = translations[displayLang][originalButtonTextKey];
                } else {
                    submitButton.textContent = originalButtonText; // Возвращаем исходный текст, если перевод не найден
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

        translations[lang] = langData; // Сохраняем загруженные переводы глобально
        updateUIForLanguage(lang); // Обновляем интерфейс

    } catch (error) {
        console.error(`[DEBUG] Error loading or parsing translations for ${lang}:`, error);
        alert(`Error loading language file for "${lang}". Please check console.`);
    }
}

// --- Функция Обновления Интерфейса по Языку ---
function updateUIForLanguage(lang) {
    // Дополнительная проверка на наличие объекта translations
    if (typeof translations === 'undefined' || !translations || !translations[lang]) {
      console.error(`[DEBUG] ERROR in updateUIForLanguage: Translations for '${lang}' are not loaded or available.`);
      return;
    }
    // console.log(`[DEBUG] --- Updating UI TO: ${lang} ---`);
    document.documentElement.lang = lang;

    // --- Обобщенная функция для обновления атрибутов/текста ---
    const translateElements = (selector, attribute, isContent = false, useSetAttribute = false) => {
        document.querySelectorAll(selector).forEach(element => {
            // Ключ берем из соответствующего data-атрибута
            // Преобразуем data-i18n-xyz в i18nХyz для доступа к dataset
            const datasetKey = attribute ? attribute.replace(/^data-/, '').replace(/-(\w)/g, (match, chr) => chr.toUpperCase()) : 'i18n';
            const key = element.dataset[datasetKey];

            if (!key) { // Если у элемента нет нужного data-атрибута со значением
                 // console.warn(`[DEBUG] Missing data attribute for ${attribute || 'content'} on element:`, element);
                 return;
            }

            const translation = translations[lang][key]; // Ищем перевод

            if (translation !== undefined) {
                if (isContent) {
                    // Для <title> используем document.title
                    if (element.tagName === 'TITLE') {
                         document.title = translation;
                    } else {
                        element.textContent = translation;
                    }
                } else if (useSetAttribute) {
                    // Используем setAttribute для aria-* и, возможно, других атрибутов
                    element.setAttribute(attribute, translation);
                } else if (attribute === 'placeholder' || attribute === 'title' || attribute === 'alt') {
                    // Прямое присвоение для стандартных атрибутов
                    element[attribute] = translation;
                }
                // Можно добавить обработку других атрибутов по аналогии
            } else {
                 console.warn(`[DEBUG] Key '${key}' (for ${attribute || 'content'}) not found for lang '${lang}'`);
            }
        });
    };

    // --- Вызов функции для каждого типа перевода ---
    translateElements('[data-i18n]', null, true);                           // Text Content (использует data-i18n)
    translateElements('[data-i18n-placeholder]', 'placeholder');             // Placeholder (использует data-i18n-placeholder)
    translateElements('[data-i18n-alt]', 'alt');                             // Alt text (использует data-i18n-alt)
    translateElements('[data-i18n-title]', 'title');                         // Title attribute (использует data-i18n-title)
    translateElements('[data-i18n-aria-label]', 'aria-label', false, true); // Aria-label (использует data-i18n-aria-label и setAttribute)
    // Обрабатываем title документа отдельно, если у тега title нет data-i18n-title, но есть data-i18n
    const titleElement = document.querySelector('title[data-i18n]');
    if (titleElement && titleElement.dataset.i18n && translations[lang][titleElement.dataset.i18n]) {
        document.title = translations[lang][titleElement.dataset.i18n];
    }

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
          dot.dataset.i18nAriaLabel = 'carousel.goToSlide'; // Ключ для перевода aria-label
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
  // После инициализации всех каруселей, обновим aria-label для точек и стрелок
  updateUIForLanguage(document.documentElement.lang || 'ru');
};

// --- Логика для Кнопки "Наверх" ---
const initializeBackToTopButton = () => {
    const backToTopButton = document.getElementById('back-to-top-btn');
    if (!backToTopButton) {
        // Убрали ошибку, так как кнопка может отсутствовать на некоторых страницах
        // console.error("Back to top button with id 'back-to-top-btn' not found.");
        return;
    }

    const scrollThreshold = 300;
    const checkScroll = () => {
        if (backToTopButton) { // Проверяем еще раз на всякий случай
            if (window.scrollY > scrollThreshold) {
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        }
    };
    window.addEventListener('scroll', checkScroll, { passive: true });
    backToTopButton.addEventListener('click', (event) => {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    checkScroll(); // Проверка при загрузке
};


// --- Точка Входа: Инициализация после Загрузки DOM ---
document.addEventListener('DOMContentLoaded', () => {
  console.log('>>> DOM fully loaded. Starting initializations...');

  // Вызов всех функций инициализации (без try...catch по запросу)
  initializeScrollAnimations();
  initializeTheme();
  initializeLanguage(); // Запускает асинхронную загрузку переводов
  initializeContactForm();
  initializeCarousels();
  initializeBackToTopButton(); // Вызываем инициализацию кнопки

  console.log('>>> All initialization functions called.');
});