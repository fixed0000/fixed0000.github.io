/**
 * script.js
 *
 * Основной JavaScript для интерактивных элементов страницы:
 * - Анимации появления элементов при прокрутке
 * - Переключение тем (светлая/темная)
 * - Переключение языка интерфейса (с загрузкой JSON)
 * - Обработка отправки контактной формы
 * - Инициализация каруселей
 * - Фиксированная кнопка навигации ("Наверх")
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
        languageSelect.value = languageSelect.options[0].value; // Ставим первое значение
        console.warn(`Saved language "${savedLang}" not found in select options, defaulting to "${languageSelect.value}"`);
    }

    // Сразу загружаем сохраненный или дефолтный язык
    // Функция loadAndSetLanguage вызовет updateUIForLanguage после загрузки
    loadAndSetLanguage(languageSelect.value);

    // Добавляем обработчик на изменение - теперь он тоже загружает язык
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
           return; // Прерываем отправку
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
                // Проверяем еще раз на случай, если язык успел смениться
                const displayLang = document.documentElement.lang || 'ru';
                if (translations[displayLang] && translations[displayLang][buttonTextKey]) {
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
    // console.log(`[DEBUG] Attempting to load language: ${lang}`); // DEBUG

    if (translations[lang]) {
        // console.log(`[DEBUG] Translations for ${lang} already loaded. Updating UI.`); // DEBUG
        updateUIForLanguage(lang);
        return;
    }

    const filePath = `js/${lang}.json`;
    // console.log(`[DEBUG] Fetching translations for ${lang} from: ${filePath}`); // DEBUG

    try {
        const response = await fetch(filePath);
        // console.log(`[DEBUG] Fetch response status for ${lang}.json: ${response.status}`); // DEBUG

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for ${filePath}`);
        }

        const langData = await response.json();
        // console.log(`[DEBUG] Successfully fetched and parsed ${lang}.json`); // DEBUG

        translations[lang] = langData;

        updateUIForLanguage(lang);

    } catch (error) {
        console.error(`[DEBUG] Error loading or parsing translations for ${lang}:`, error);
        alert(`Error loading language file for "${lang}". Check console.`);
    }
}

// --- Функция Обновления Интерфейса по Языку ---
function updateUIForLanguage(lang) {
    if (!translations || !translations[lang]) {
      console.error(`[DEBUG] ERROR in updateUIForLanguage: Translations for '${lang}' are not loaded.`);
      return;
    }
    // console.log(`[DEBUG] --- Updating UI TO: ${lang} ---`); // DEBUG
    document.documentElement.lang = lang;
    let updatedCount = 0;

    const translateElements = (selector, attribute, isContent = false) => {
        document.querySelectorAll(selector).forEach(element => {
            const key = isContent ? element.dataset.i18n : element.dataset[attribute.replace('data-','').replace(/-(\w)/g, (match, chr) => chr.toUpperCase())]; // Преобразуем data-i18n-placeholder в i18nPlaceholder
            let translationFound = false;
            if (translations[lang][key] !== undefined) {
                if (isContent) {
                    element.textContent = translations[lang][key];
                } else if (attribute === 'placeholder') {
                    element.placeholder = translations[lang][key];
                } else if (attribute === 'alt') {
                    element.alt = translations[lang][key];
                } else if (attribute === 'title') {
                    element.title = translations[lang][key];
                    if (element.tagName === 'TITLE') {
                        document.title = translations[lang][key];
                    }
                } else if (attribute === 'aria-label') {
                     element.setAttribute('aria-label', translations[lang][key]);
                }
                translationFound = true;
                updatedCount++;
            }
            if (!translationFound) {
                 console.warn(`[DEBUG] Key '${key}' (for ${attribute}) not found for lang '${lang}'`);
            }
        });
    };

    translateElements('[data-i18n]', null, true); // Text Content
    translateElements('[data-i18n-placeholder]', 'placeholder');
    translateElements('[data-i18n-alt]', 'alt');
    translateElements('[data-i18n-title]', 'title');
    translateElements('[data-i18n-aria-label]', 'aria-label');

    localStorage.setItem('selectedLanguage', lang);
    // console.log(`[DEBUG] --- Language UI update complete for ${lang}. ${updatedCount} elements updated. ---`); // DEBUG
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
          // Используем data-i18n-aria-label для доступности точки
          dot.setAttribute('data-i18n-aria-label', 'carousel.goToSlide'); // Пример ключа
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
      dots.forEach(dot => dot.addEventListener('click', (e) => showSlide(parseInt(e.target.dataset.index, 10))));
      showSlide(currentIndex);
       // Обновляем aria-label для точек после инициализации языка
       updateUIForLanguage(document.documentElement.lang || 'ru');
  });
};

// --- Логика для Кнопки "Наверх" ---
const initializeBackToTopButton = () => {
    const backToTopButton = document.getElementById('back-to-top-btn');
    if (!backToTopButton) { return; }

    const scrollThreshold = 200;
    const checkScroll = () => {
        if (window.scrollY > scrollThreshold) backToTopButton.classList.add('active');
        else backToTopButton.classList.remove('active');
    };
    window.addEventListener('scroll', checkScroll);
    backToTopButton.addEventListener('click', (event) => {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
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