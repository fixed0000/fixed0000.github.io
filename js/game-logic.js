/**
 * js/game-logic.js
 *
 * Логика для демонстрационной мини-стратегии на странице playground.html
 */

(function() {
    // --- Константы и Настройки Игры ---
    const GRID_ROWS = 12;
    const GRID_COLS = 16;
    const CELL_SIZE_PX = 35;
    const HERO_MAX_AP = 3;

    const TERRAIN_PROB = { grass: 0.75, forest: 0.15, sand: 0.08, water: 0.01, mountain: 0.01 };
    const OBJECT_PROB = { gold: 0.05, wood: 0.06, city: 0.01, quest: 0.01, enemyWeak: 0.04, enemyStrong: 0.01, none: 0.82 };

    const TERRAIN_TYPES = {
        GRASS: 'terrain-grass',
        FOREST: 'terrain-forest',
        SAND: 'terrain-sand',
        WATER: 'terrain-water',
        MOUNTAIN: 'terrain-mountain'
    };
    const PASSABLE_TERRAIN = [TERRAIN_TYPES.GRASS, TERRAIN_TYPES.FOREST, TERRAIN_TYPES.SAND];

    const OBJECT_TYPES = {
        GOLD: 'object-resource-gold',
        WOOD: 'object-resource-wood',
        CITY: 'object-city',
        QUEST: 'object-quest',
        ENEMY_WEAK: 'object-enemy-weak',
        ENEMY_STRONG: 'object-enemy-strong',
        HERO: 'unit-hero'
    };

    // --- Переменные Состояния Игры ---
    let mapData = [];
    let heroPosition = { row: -1, col: -1 };
    let selectedUnitPosition = null;
    let currentAP = HERO_MAX_AP;
    let resources = { gold: 100, wood: 50 };
    let gameLogMessages = [];
    let turnNumber = 1;
    let translations = {}; // Переменная для переводов


    // --- Ссылки на DOM Элементы ---
    let gameGridElement = null;
    let heroNameElement = null;
    let actionPointsElement = null;
    let goldAmountElement = null;
    let woodAmountElement = null;
    let gameLogElement = null;
    let endTurnButton = null;
    let newGameButton = null;
    let interactionModal = null;
    let modalTitle = null;
    let modalDescription = null;
    let modalActions = null;
    let modalCloseButton = null;


    // --- Функции Инициализации ---
    async function initializeGame() {
        console.log('[Game] Initializing...');

        // Получаем ссылки на DOM-элементы
        gameGridElement = document.getElementById('gameGrid');
        heroNameElement = document.getElementById('heroName');
        actionPointsElement = document.getElementById('actionPoints');
        goldAmountElement = document.getElementById('goldAmount');
        woodAmountElement = document.getElementById('woodAmount');
        gameLogElement = document.getElementById('gameLog');
        endTurnButton = document.getElementById('endTurnButton');
        newGameButton = document.getElementById('newGameButton');
        interactionModal = document.getElementById('interactionModal');
        modalTitle = document.getElementById('modalTitle');
        modalDescription = document.getElementById('modalDescription');
        modalActions = document.getElementById('modalActions');
        modalCloseButton = interactionModal?.querySelector('.modal-close');


        // Проверка на существование элементов
        const missingElements = [];
        if (!gameGridElement) missingElements.push('gameGrid');
        if (!actionPointsElement) missingElements.push('actionPoints');
        if (!goldAmountElement) missingElements.push('goldAmount');
        if (!woodAmountElement) missingElements.push('woodAmount');
        if (!gameLogElement) missingElements.push('gameLog');
        if (!endTurnButton) missingElements.push('endTurnButton');
        if (!newGameButton) missingElements.push('newGameButton');
        if (!interactionModal) missingElements.push('interactionModal');
        if (!modalCloseButton) missingElements.push('modalCloseButton');


        if (missingElements.length > 0) {
            console.error(`[Game] Missing DOM elements: ${missingElements.join(', ')}. Cannot initialize game.`);
            return;
        }

        // Установка CSS переменных для сетки
        gameGridElement.style.setProperty('--grid-rows', GRID_ROWS);
        gameGridElement.style.setProperty('--grid-cols', GRID_COLS);
        gameGridElement.style.setProperty('--cell-size', `${CELL_SIZE_PX}px`);
        gameGridElement.style.gridTemplateColumns = `repeat(${GRID_COLS}, var(--cell-size))`;
        gameGridElement.style.gridTemplateRows = `repeat(${GRID_ROWS}, var(--cell-size))`;


        // Загрузка переводов
        const lang = document.documentElement.lang || 'ru';
        try {
            translations = await loadTranslations(lang);
            if (!translations) {
                console.error(`[Game] Failed to load translations for language: ${lang}`);
                return;
            }
        } catch (error) {
            console.error(`[Game] Error loading translations: ${error}`);
            return;
        }

        // Добавляем обработчики событий
        gameGridElement.addEventListener('click', () => handleGridClick(translations));
        endTurnButton.addEventListener('click', () => endTurn(translations));
        newGameButton.addEventListener('click', () => resetGame(translations));
        modalCloseButton.addEventListener('click', closeModal);


        resetGame(translations);
        console.log('[Game] Initialization complete.');
    }

    // ... (остальные функции с необходимыми изменениями) ...
    /** Обрабатывает клик по ячейке сетки */
function handleGridClick(translations, event) {
    const clickedCell = event.target.closest('.grid-cell');
    if (!clickedCell) return;

    const row = parseInt(clickedCell.dataset.row, 10);
    const col = parseInt(clickedCell.dataset.col, 10);

    // 1. Если юнит не выбран
    if (!selectedUnitPosition) {
        // Проверяем, кликнули ли по герою
        if (mapData[row][col].object === OBJECT_TYPES.HERO) {
            selectUnit(row, col);
        }
    }
    // 2. Если юнит выбран
    else {
        // Клик по самому себе - отмена выбора
        if (row === selectedUnitPosition.row && col === selectedUnitPosition.col) {
            deselectUnit();
        }
        // Клик по доступной для хода ячейке
        else if (clickedCell.classList.contains('possible-move')) {
            moveUnit(translations, row, col);
        }
        // Клик по ячейке с объектом/врагом (только если соседняя)
        else if (isAdjacent(selectedUnitPosition, { row, col }) && mapData[row][col].object) {
            interactWithObject(translations, row, col);
        }
        // Клик по другой ячейке - отмена выбора
        else {
            deselectUnit();
        }
    }
}
/** Обрабатывает взаимодействие с объектом/врагом */
function interactWithObject(translations, row, col) {
    if (currentAP <= 0) {
        addLogMessage(translations, 'playground.gameDemo.logNoAPInteract');
        deselectUnit();
        return;
    }

    const objectType = mapData[row][col].object;
    console.log(`[Game] Interacting with ${objectType} at [${row}, ${col}]`);

    switch (objectType) {
        case OBJECT_TYPES.GOLD:
        case OBJECT_TYPES.WOOD:
            collectResource(row, col, objectType);
            break;
        case OBJECT_TYPES.CITY:
            openModal(translations, 'playground.gameDemo.cityTitle', 'playground.gameDemo.cityDesc', [
                { textKey: 'playground.gameDemo.cityActionHire', cost: { gold: 50 }, action: () => hireUnit('Мечник') },
                { textKey: 'playground.gameDemo.cityActionUpgrade', cost: { gold: 100 }, action: () => upgradeBuilding('Стена') },
                { textKey: 'playground.gameDemo.cityActionLeave', action: closeModal }
            ]);
            addLogMessage(translations, 'playground.gameDemo.logEnterCity');
            break;
        case OBJECT_TYPES.QUEST:
            openModal(translations, 'playground.gameDemo.questTitle', 'playground.gameDemo.questDesc', [
                { textKey: 'playground.gameDemo.questActionAccept', action: () => acceptQuest(row, col) },
                { textKey: 'playground.gameDemo.questActionDecline', action: closeModal }
            ]);
            addLogMessage(translations, 'playground.gameDemo.logFoundQuest');
            break;
        case OBJECT_TYPES.ENEMY_WEAK:
        case OBJECT_TYPES.ENEMY_STRONG:
            fightEnemy(row, col, objectType);
            break;
        default:
            console.warn(`[Game] Unknown object type for interaction: ${objectType}`);
    }
    deselectUnit();
}

/** Собирает ресурс */
function collectResource(row, col, objectClass) {
    let resourceType, amount;
    if (objectClass === OBJECT_TYPES.GOLD) {
        resourceType = 'gold';
        amount = 10;
    } else if (objectClass === OBJECT_TYPES.WOOD) {
        resourceType = 'wood';
        amount = 5;
    } else {
        return; // Неизвестный тип ресурса
    }
    resources[resourceType] += amount;
    mapData[row][col].object = null; // Убираем ресурс после сбора
    renderCell(row, col);
    updateResourcePanel();
    addLogMessage(translations, 'playground.gameDemo.logResourceCollected', { amount: amount, resource: translations[document.documentElement.lang || 'ru'][`resource.${resourceType}`] || resourceType });
}

// ... (другие функции взаимодействия: fightEnemy, hireUnit, upgradeBuilding, acceptQuest) ...

/** Завершает ход героя */
function endTurn(translations) {
    currentAP = HERO_MAX_AP;
    deselectUnit();
    updateHeroPanel(translations);
    turnNumber++;
    addLogMessage(translations, 'playground.gameDemo.logTurnEnd', { turn: turnNumber });
}


    /** Сбрасывает игру и генерирует новую карту */
    function resetGame(translations) {
        console.log('[Game] Resetting game...');
        mapData = generateMapData(GRID_ROWS, GRID_COLS);
        currentAP = HERO_MAX_AP;
        resources = { gold: 100, wood: 50 };
        gameLogMessages = [];
        selectedUnitPosition = null;
        turnNumber = 1;

        renderMap(mapData);
        updateHeroPanel(translations);
        updateResourcePanel();
        clearLog();
        addLogMessage(translations, 'playground.gameDemo.logStart');
        console.log('[Game] New map generated.');
    }

    // ... (функции generateMapData, getRandomWithProbability остаются без изменений) ...


    // --- Функции Отрисовки ---
    // ... (функции renderMap, updateHeroPanel, updateResourcePanel, addLogMessage, clearLog остаются без изменений, но addLogMessage и updateHeroPanel принимают translations) ...

    // --- Функции Игровой Логики ---
    // ... (функции handleGridClick, selectUnit, deselectUnit, showPossibleMoves, moveUnit, interactWithObject, collectResource, fightEnemy, hireUnit, upgradeBuilding, acceptQuest, endTurn остаются без изменений, но interactWithObject и endTurn принимают translations) ...


    // --- Вспомогательные Функции ---
    // ... (функции getCellElement, renderCell, isAdjacent остаются без изменений) ...

    // --- Функции Модального Окна ---
    // ... (функции openModal, closeModal остаются без изменений, но openModal принимает translations) ...

    // --- Инициализация при загрузке DOM ---
    document.addEventListener('DOMContentLoaded', initializeGame);

})();


// Загрузка переводов
async function loadTranslations(lang) {
    try {
        const response = await fetch(`translations/${lang}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} loading ${lang}.json`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch translations for ${lang}:`, error);
        return null;
    }
}