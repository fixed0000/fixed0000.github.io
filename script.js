document.addEventListener('DOMContentLoaded', () => {
  // Анимации при скролле
  const cards = document.querySelectorAll('.skill-card');
  
  if (cards.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          console.log('Анимация запущена для:', entry.target);
        }
      });
    }, { 
      threshold: 0.5,
      rootMargin: '0px' 
    });

    cards.forEach(card => observer.observe(card));
  } else {
    console.warn('Элементы .skill-card не найдены');
  }

  // Смена темы
  const toggle = document.getElementById('theme-toggle');
  
  if (toggle) {
    // Проверяем начальную тему
    if (!document.body.dataset.theme) {
      document.body.dataset.theme = 'light';
    }

    toggle.addEventListener('click', () => {
      const newTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
      document.body.dataset.theme = newTheme;
      console.log('Тема изменена:', newTheme);
      
      // Сохраняем в localStorage
      localStorage.setItem('theme', newTheme);
    });

    // Восстанавливаем тему при загрузке
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.body.dataset.theme = savedTheme;
    }
  } else {
    console.warn('Кнопка смены темы не найдена');
  }
});