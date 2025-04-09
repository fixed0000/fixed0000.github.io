/**
 * script.js
 *
 * Содержит основной JavaScript для инициализации интерактивных элементов страницы:
 * - Анимации появления элементов при прокрутке
 * - Переключение тем (светлая/темная)
 * - Переключение языка интерфейса
 * - Обработка отправки контактной формы
 */

// --- Определения Функций Инициализации ---

/**
 * Инициализирует Intersection Observer для анимации появления
 * элементов с классом '.animate-on-scroll' при прокрутке.
 */
const initializeScrollAnimations = () => {
  const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
  console.log(`Found ${elementsToAnimate.length} elements to animate on scroll.`); // DEBUG

  if (elementsToAnimate.length > 0) {
    const observer = new IntersectionObserver((entries, observerInstance) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Добавляем класс 'active' для запуска CSS анимации/transition
          entry.target.classList.add('active');
          // Перестаем наблюдать за этим элементом после активации
          observerInstance.unobserve(entry.target);
          // console.log('Element animated:', entry.target); // DEBUG (можно раскомментировать)
        }
      });
    }, {
      threshold: 0.1, // Начать анимацию, когда видно хотя бы 10% элемента
    });

    elementsToAnimate.forEach(element => observer.observe(element));
  }
};

/**
 * Инициализирует переключатель темы (светлая/темная).
 * Сохраняет выбор пользователя в localStorage.
 */
const initializeTheme = () => {
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.dataset.theme = savedTheme;
    // console.log(`Initial theme set to: ${savedTheme}`); // DEBUG

    toggle.addEventListener('click', () => {
      const currentTheme = document.body.dataset.theme;
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.body.dataset.theme = newTheme;
      console.log(`Theme changed to: ${newTheme}`); // DEBUG
      localStorage.setItem('theme', newTheme);
    });
  } else {
    console.error("Theme toggle button with id 'theme-toggle' not found.");
  }
};

/**
 * Инициализирует переключатель языка интерфейса.
 * Сохраняет выбор пользователя в localStorage и обновляет текст на странице.
 */
const initializeLanguage = () => {
  const languageSelect = document.getElementById('language-select');
  if (languageSelect) {
    // Проверяем наличие translations ПЕРЕД использованием
    if (typeof translations === 'undefined') {
        console.error("CRITICAL in initializeLanguage: 'translations' object is undefined! Cannot initialize language features.");
        return; // Прерываем инициализацию языка
    }
    // console.log("'translations' object seems defined."); // DEBUG

    const savedLang = localStorage.getItem('selectedLanguage') || document.documentElement.lang || 'ru'; // Используем lang из HTML как запасной вариант
    languageSelect.value = savedLang;
    // console.log(`Initial language set to: ${savedLang}`); // DEBUG
    updateLanguage(savedLang); // Первичное обновление

    languageSelect.addEventListener('change', (event) => {
      const newLang = event.target.value;
      // console.log(`Language select CHANGED to: ${newLang}`); // DEBUG
      updateLanguage(newLang);
    });
  } else {
    console.error("Language select dropdown with id 'language-select' not found.");
  }
};

/**
 * Инициализирует обработчик отправки контактной формы.
 * Отправляет данные на сервер асинхронно (fetch).
 */
const initializeContactForm = () => {
    const form = document.getElementById('contactForm'); // Используем ID
    if (form) {
      // console.log('Contact form FOUND.'); // DEBUG
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        // console.log('Contact form submitted.'); // DEBUG

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const currentLang = document.documentElement.lang || 'ru';
        const successMsgKey = 'contact.success';
        const errorMsgKey = 'contact.error';
        const sendingMsgKey = 'contact.sending'; // Ключ для "Отправка..."
        const genericErrorMsg = 'An error occurred during submission.';
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;

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
          // console.log('Attempting to send form data:', data); // DEBUG

          // --- !!! ВАЖНО: УКАЖИТЕ ВАШ URL ЭНДПОИНТА ЗДЕСЬ !!! ---
          const endpointURL = 'YOUR_BACKEND_ENDPOINT_URL';
          if (endpointURL === 'YOUR_BACKEND_ENDPOINT_URL') {
              console.error('Please replace YOUR_BACKEND_ENDPOINT_URL with your actual form processing URL.');
              alert('Form endpoint URL is not configured.');
              if(submitButton) { // Разблокируем кнопку при ошибке конфигурации
                  submitButton.disabled = false;
                  submitButton.textContent = originalButtonText;
              }
              return;
          }
          // ---------------------------------------------------------

          const response = await fetch(endpointURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          if (response.ok) {
            console.log('Form submitted successfully.');
            alert(translations[currentLang][successMsgKey]);
            form.reset();
          } else {
            const errorData = await response.text();
            console.error(`Server error: ${response.status} - ${response.statusText}. Response: ${errorData}`);
            throw new Error(translations[currentLang][errorMsgKey]);
          }
        } catch (error) {
          console.error('Form submission fetch error:', error);
          alert(error.message || genericErrorMsg);
        } finally {
            // Разблокируем кнопку и возвращаем исходный текст в любом случае
            if(submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        }
      });
    } else {
      // console.log("Contact form with id 'contactForm' not found."); // DEBUG
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
    // console.log(`--- Updating language TO: ${lang} ---`); // DEBUG
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.dataset.i18n;
      if (translations[lang][key] !== undefined) {
        element.textContent = translations[lang][key];
      } else {
        // console.warn(`Translation key '${key}' not found for lang '${lang}' in element:`, element); // DEBUG
      }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.dataset.i18nPlaceholder;
      if (translations[lang][key] !== undefined) {
        element.placeholder = translations[lang][key];
      } else {
        // console.warn(`Placeholder key '${key}' not found for lang '${lang}' in element:`, element); // DEBUG
      }
    });
    document.querySelectorAll('[data-i18n-alt]').forEach(img => {
      const key = img.dataset.i18nAlt;
      if (translations[lang][key] !== undefined) {
        img.alt = translations[lang][key];
      } else {
        // console.warn(`Alt text key '${key}' not found for lang '${lang}' in element:`, img); // DEBUG
      }
    });

    localStorage.setItem('selectedLanguage', lang);
    // console.log(`--- Language update complete for ${lang}. Preference saved. ---`); // DEBUG
}


// --- Точка Входа: Инициализация после Загрузки DOM ---
document.addEventListener('DOMContentLoaded', () => {
  // console.log('>>> DOM fully loaded. Starting initializations...'); // DEBUG

  if (typeof translations === 'undefined') {
    console.error('>>> CRITICAL: translations object is UNDEFINED right after DOMContentLoaded!');
  } else {
    // console.log('>>> translations object seems OK right after DOMContentLoaded.'); // DEBUG
  }

  initializeScrollAnimations(); // Используем новую функцию для анимаций
  initializeTheme();
  initializeLanguage();
  initializeContactForm();

  // console.log('>>> All initializations attempted.'); // DEBUG
});