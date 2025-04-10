// js/sakura-animation.js

document.addEventListener('DOMContentLoaded', () => {
    const sakuraContainer = document.querySelector('.sakura-background');
    if (!sakuraContainer) return; // Выходим, если контейнера нет

    const numberOfPetals = 30; // Количество лепестков на экране одновременно
    const petalImages = [ // Массив с путями к вашим лепесткам
        'images/sakura1.png',
        'images/sakura2.png',
        'images/sakura3.png',
        'images/sakura4.png',
        'images/sakura5.png',
        'images/sakura6.png',
        'images/sakura7.png',
        'images/sakura8.png',
        'images/sakura9.png',
    ];

    for (let i = 0; i < numberOfPetals; i++) {
        createPetal(sakuraContainer, petalImages);
    }

    console.log("Sakura animation initialized with petals.");
});

function createPetal(container, images) {
    const petal = document.createElement('div');
    petal.classList.add('petal');

    // Случайные параметры для каждого лепестка
    const randomImage = images[Math.floor(Math.random() * images.length)];
    const randomLeft = Math.random() * 100; // % ширины экрана
    const randomFallDuration = Math.random() * 5 + 8; // Длительность падения от 8 до 13 секунд
    const randomSwayDuration = Math.random() * 2 + 2; // Длительность покачивания от 2 до 4 секунд
    const randomFallDelay = Math.random() * 10; // Задержка начала падения до 10 секунд
    const randomSwayDelay = Math.random() * 3; // Задержка начала покачивания до 3 секунд
    const randomSize = Math.random() * 10 + 15; // Размер от 15px до 25px

    // Применяем стили
    petal.style.backgroundImage = `url('${randomImage}')`;
    petal.style.left = `${randomLeft}vw`; // Используем vw для адаптивности по ширине
    petal.style.width = `${randomSize}px`;
    petal.style.height = `${randomSize}px`;
    petal.style.animationDuration = `${randomFallDuration}s, ${randomSwayDuration}s`;
    petal.style.animationDelay = `${randomFallDelay}s, ${randomSwayDelay}s`;

    // Добавляем лепесток в контейнер
    container.appendChild(petal);

    // (Опционально) Удалять лепесток из DOM после завершения анимации, чтобы не накапливать элементы
    // petal.addEventListener('animationend', (e) => {
    //     // Проверяем, что завершилась именно анимация падения
    //     if (e.animationName === 'fall') {
    //        petal.remove();
             // Можно сразу создать новый лепесток взамен удаленного
             // createPetal(container, images);
    //     }
    // });
    // Примечание: Если анимация бесконечная (infinite), событие animationend не сработает так, как нужно для удаления.
    // В этом случае можно оставить как есть или реализовать более сложную логику с таймерами.
}