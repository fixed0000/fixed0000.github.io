// --- js/script.js (ФИНАЛЬНАЯ ВЕРСИЯ) ---

document.addEventListener('DOMContentLoaded', () => {
    console.log('>>> DOM fully loaded. Starting initializations...');

    let translations = {};

    async function setLanguage(lang) {
        if (translations[lang]) {
            applyTranslations(lang);
            return;
        }
        try {
            const response = await fetch(`js/translations/${lang}.json`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            translations[lang] = await response.json();
            applyTranslations(lang);
        } catch (error) {
            console.error(`Error loading translations for ${lang}:`, error);
            if (lang !== 'ru') {
                console.warn('Falling back to "ru".');
                await setLanguage('ru');
            }
        }
    }

    function applyTranslations(lang) {
        if (!translations[lang]) return;
        const langData = translations[lang];
        document.documentElement.lang = lang;

        document.querySelectorAll('[data-i18n]').forEach(el => {
            if (langData[el.dataset.i18n]) el.innerHTML = langData[el.dataset.i18n];
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            if (langData[el.dataset.i18nPlaceholder]) el.placeholder = langData[el.dataset.i18nPlaceholder];
        });
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            if (langData[el.dataset.i18nTitle]) {
                el.title = langData[el.dataset.i18nTitle];
                if (el.tagName === 'TITLE') document.title = langData[el.dataset.i18nTitle];
            }
        });
        document.querySelectorAll('[data-i18n-alt]').forEach(el => {
            if (langData[el.dataset.i18nAlt]) el.alt = langData[el.dataset.i18nAlt];
        });
        document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
            if (langData[el.dataset.i18nAriaLabel]) el.setAttribute('aria-label', langData[el.dataset.i18nAriaLabel]);
        });

        updateAllLinksWithLang(lang);
        localStorage.setItem('selectedLanguage', lang);
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) languageSelect.value = lang;
    }

    function updateAllLinksWithLang(lang) {
        const langParam = `?lang=${lang}`;
        document.querySelectorAll('a').forEach(link => {
            let href = link.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.endsWith('.pdf')) {
                const cleanHref = href.split('?')[0];
                if (cleanHref.endsWith('.html')) {
                    link.setAttribute('href', cleanHref + langParam);
                }
            }
        });
    }

    function initializeLanguageSwitcher() {
        const languageSelect = document.getElementById('language-select');
        if (!languageSelect) return;
        languageSelect.addEventListener('change', (event) => {
            const newLang = event.target.value;
            const url = new URL(window.location);
            url.searchParams.set('lang', newLang);
            window.history.pushState({}, '', url);
            setLanguage(newLang);
        });
    }

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

    function initializeScrollAnimations() {
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
    
    function initializeCarousels() {
        document.querySelectorAll('.carousel-container').forEach(carousel => {
            const slidesContainer = carousel.querySelector('.carousel-slides');
            if (!slidesContainer) return;
            const slides = slidesContainer.children;
            const prevButton = carousel.querySelector('.carousel-arrow.prev');
            const nextButton = carousel.querySelector('.carousel-arrow.next');
            const dotsContainer = carousel.querySelector('.carousel-dots');
            if (slides.length <= 1) {
                if(prevButton) prevButton.style.display = 'none';
                if(nextButton) nextButton.style.display = 'none';
                if(dotsContainer) dotsContainer.style.display = 'none';
                return;
            }
            let currentIndex = 0;
            const showSlide = (index) => {
                slidesContainer.style.transform = `translateX(-${index * 100}%)`;
                currentIndex = index;
                if(dotsContainer) {
                    Array.from(dotsContainer.children).forEach((dot, dotIndex) => dot.classList.toggle('active', dotIndex === currentIndex));
                }
            };
            if(dotsContainer) {
                dotsContainer.innerHTML = '';
                Array.from(slides).forEach((_, i) => {
                    const dot = document.createElement('button');
                    dot.classList.add('carousel-dot');
                    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
                    dot.addEventListener('click', () => showSlide(i));
                    dotsContainer.appendChild(dot);
                });
            }
            if(nextButton) nextButton.addEventListener('click', () => showSlide((currentIndex + 1) % slides.length));
            if(prevButton) prevButton.addEventListener('click', () => showSlide((currentIndex - 1 + slides.length) % slides.length));
            showSlide(0);
        });
    };

    function initializeBackToTopButton() {
        const btn = document.getElementById('back-to-top-btn');
        if (!btn) return;
        window.addEventListener('scroll', () => {
            btn.classList.toggle('show', window.scrollY > 300);
        }, { passive: true });
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    };

    const urlParams = new URLSearchParams(window.location.search);
    const initialLang = urlParams.get('lang') || localStorage.getItem('selectedLanguage') || 'ru';

    initializeTheme();
    initializeLanguageSwitcher();
    initializeScrollAnimations();
    initializeCarousels();
    initializeBackToTopButton();
    setLanguage(initialLang);

    console.log('>>> All initializations complete.');
});