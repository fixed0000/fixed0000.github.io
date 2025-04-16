/**
 * js/game-logic.js
 *
 * Логика для демонстрационной мини-стратегии на странице playground.html
 */

// Оборачиваем весь код в IIFE для изоляции области видимости
(function() {
    // --- Константы и Настройки Игры ---
    const GRID_ROWS = 12; // Количество рядов
    const GRID_COLS = 16; // Количество колонок
    const CELL_SIZE_PX = 35; // Размер ячейки в пикселях (должен +/- совпадать с CSS)
    const HERO_MAX_AP = 3; // Максимальное количество очков действия героя за ход

    // Вероятности генерации объектов (сумма не обязательно 100)
    const TERRAIN_PROB = { grass: 0.75, forest: 0.15, sand: 0.08, water: 0.01, mountain: 0.01 };
    const OBJECT_PROB = { gold: 0.05, wood: 0.06, city: 0.01, quest: 0.01, enemyWeak: 0.04, enemyStrong: 0.01, none: 0.82 }; // Сумма вероятностей + none должна быть ~1

    // Типы местности и проходимость
    const TERRAIN_TYPES = {
        GRASS: 'terrain-grass',
        FOREST: 'terrain-forest',
        SAND: 'terrain-sand',
        WATER: 'terrain-water',
        MOUNTAIN: 'terrain-mountain'
    };
    const PASSABLE_TERRAIN = [TERRAIN_TYPES.GRASS, TERRAIN_TYPES.FOREST, TERRAIN_TYPES.SAND];

    // Типы объектов
    const OBJECT_TYPES = {
        GOLD: 'object-resource-gold',
        WOOD: 'object-resource-wood',
        CITY: 'object-city',
        QUEST: 'object-quest',
        ENEMY_WEAK: 'object-enemy-weak',
        ENEMY_STRONG: 'object-enemy-strong',
        HERO: 'unit-hero' // Используем префикс unit- для юнитов
    };

    // --- Переменные Состояния Игры ---
    let mapData = []; // 2D массив данных карты [row][col] = { terrain: '...', object: '...' }
    let heroPosition = { row: -1, col: -1 };
    let selectedUnitPosition = null; // { row: r, col: c } или null
    let currentAP = HERO_MAX_AP;
    let resources = { gold: 100, wood: 50 };
    let gameLogMessages = [];
    let turnNumber = 1; // Если понадобится

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

    /** Инициализирует все элементы игры */
    function initializeGame() {
        console.log('[Game] Initializing...');
        // Получаем ссылки на DOM
        gameGridElement = document.getElementById('gameGrid');
        heroNameElement = document.getElementById('heroName'); // Предполагается, что он есть
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
        modalCloseButton = interactionModal ? interactionModal.querySelector('.modal-close') : null; // Находим кнопку закрытия

        if (!gameGridElement || !actionPointsElement || !goldAmountElement || !woodAmountElement || !gameLogElement || !endTurnButton || !newGameButton || !interactionModal || !modalCloseButton) {
            console.error("[Game] Critical DOM elements not found. Cannot initialize game.");
            return;
        }

        // Установка CSS переменных для сетки
        gameGridElement.style.setProperty('--grid-rows', GRID_ROWS);
        gameGridElement.style.setProperty('--grid-cols', GRID_COLS);
        gameGridElement.style.setProperty('--cell-size', `${CELL_SIZE_PX}px`);
        gameGridElement.style.gridTemplateColumns = `repeat(${GRID_COLS}, var(--cell-size))`;
        gameGridElement.style.gridTemplateRows = `repeat(${GRID_ROWS}, var(--cell-size))`;


        // Добавляем обработчики событий
        gameGridElement.addEventListener('click', handleGridClick);
        endTurnButton.addEventListener('click', endTurn);
        newGameButton.addEventListener('click', resetGame);
        modalCloseButton.addEventListener('click', closeModal); // Закрытие по кнопке Х

        // Генерируем и отрисовываем начальную карту
        resetGame();
        console.log('[Game] Initialization complete.');
    }

    /** Сбрасывает игру и генерирует новую карту */
    function resetGame() {
        console.log('[Game] Resetting game...');
        mapData = generateMapData(GRID_ROWS, GRID_COLS);
        currentAP = HERO_MAX_AP;
        resources = { gold: 100, wood: 50 }; // Сброс ресурсов
        gameLogMessages = [];
        selectedUnitPosition = null;
        turnNumber = 1;

        renderMap(mapData);
        updateHeroPanel();
        updateResourcePanel();
        clearLog();
        addLogMessage('playground.gameDemo.logStart'); // Используем ключ перевода
        console.log('[Game] New map generated.');
    }


    // --- Функции Генерации Карты ---

    /** Генерирует 2D массив данных карты */
    function generateMapData(rows, cols) {
        const newMap = [];
        let heroPlaced = false;

        for (let r = 0; r < rows; r++) {
            newMap[r] = [];
            for (let c = 0; c < cols; c++) {
                const terrain = getRandomWithProbability(TERRAIN_PROB);
                let object = null;

                // Размещаем объекты только на проходимой местности
                if (PASSABLE_TERRAIN.includes(terrain)) {
                    object = getRandomWithProbability(OBJECT_PROB);
                    // Не размещаем другие объекты на старте героя (если уже размещен)
                    if (object === OBJECT_TYPES.HERO && heroPlaced) {
                        object = null;
                    }
                    if (object === OBJECT_TYPES.HERO) {
                        heroPosition = { row: r, col: c };
                        heroPlaced = true;
                    }
                }

                newMap[r][c] = {
                    terrain: terrain,
                    object: object === 'none' ? null : object // Убираем 'none'
                };
            }
        }

        // Если герой не разместился случайно (маловероятно, но возможно)
        if (!heroPlaced) {
            let placed = false;
            while (!placed) {
                const r = Math.floor(Math.random() * rows);
                const c = Math.floor(Math.random() * cols);
                if (PASSABLE_TERRAIN.includes(newMap[r][c].terrain) && !newMap[r][c].object) {
                    newMap[r][c].object = OBJECT_TYPES.HERO;
                    heroPosition = { row: r, col: c };
                    placed = true;
                }
            }
            console.log('[Game] Hero placed manually at:', heroPosition);
        } else {
             console.log('[Game] Hero placed randomly at:', heroPosition);
        }


        return newMap;
    }

    /** Вспомогательная функция для случайного выбора по вероятностям */
    function getRandomWithProbability(probabilities) {
        const rand = Math.random();
        let cumulativeProb = 0;
        for (const key in probabilities) {
            cumulativeProb += probabilities[key];
            if (rand < cumulativeProb) {
                return key;
            }
        }
        return Object.keys(probabilities).pop(); // Возвращаем последний ключ, если что-то пошло не так
    }


    // --- Функции Отрисовки ---

    /** Отрисовывает игровую сетку в HTML */
    function renderMap(data) {
        if (!gameGridElement) return;
        gameGridElement.innerHTML = ''; // Очищаем сетку

        data.forEach((row, r) => {
            row.forEach((cellData, c) => {
                const cellElement = document.createElement('div');
                cellElement.classList.add('grid-cell');
                cellElement.classList.add(cellData.terrain || TERRAIN_TYPES.GRASS); // Добавляем класс местности
                if (cellData.object) {
                    cellElement.classList.add(cellData.object); // Добавляем класс объекта/юнита
                }
                cellElement.dataset.row = r;
                cellElement.dataset.col = c;
                cellElement.setAttribute('role', 'button'); // Для доступности
                cellElement.setAttribute('tabindex', '0'); // Для фокуса клавиатурой
                gameGridElement.appendChild(cellElement);
            });
        });
    }

    /** Обновляет информацию на панели героя */
    function updateHeroPanel() {
        if (actionPointsElement) {
            actionPointsElement.textContent = currentAP;
        }
        // Обновление имени, если оно меняется
        if(heroNameElement && typeof translations !== 'undefined' && translations[document.documentElement.lang]) {
             heroNameElement.textContent = translations[document.documentElement.lang]['playground.gameDemo.heroNameDefault'] || 'Герой';
        }
    }

    /** Обновляет информацию о ресурсах */
    function updateResourcePanel() {
        if (goldAmountElement) {
            goldAmountElement.textContent = resources.gold;
        }
        if (woodAmountElement) {
            woodAmountElement.textContent = resources.wood;
        }
    }

    /** Добавляет сообщение в игровой лог */
    function addLogMessage(messageKey, params = {}) {
        if (!gameLogElement || typeof translations === 'undefined') return;

        const lang = document.documentElement.lang || 'ru';
        let message = (translations[lang] && translations[lang][messageKey]) ? translations[lang][messageKey] : messageKey; // Получаем перевод или используем ключ

        // Простая замена плейсхолдеров типа {amount} или {resource}
        for (const key in params) {
            message = message.replace(`{${key}}`, params[key]);
        }

        const p = document.createElement('p');
        p.textContent = message;
        // gameLogElement.appendChild(p);
        gameLogElement.insertBefore(p, gameLogElement.firstChild); // Добавляем сверху
        gameLogMessages.unshift(message); // Добавляем в начало массива логов

        // Ограничиваем количество сообщений в логе (опционально)
        // const maxLogMessages = 10;
        // while (gameLogElement.childElementCount > maxLogMessages) {
        //     gameLogElement.removeChild(gameLogElement.lastChild);
        //     gameLogMessages.pop();
        // }

        // gameLogElement.scrollTop = gameLogElement.scrollHeight; // Автопрокрутка вниз (если добавляем снизу)
    }

     /** Очищает игровой лог */
     function clearLog() {
        if (gameLogElement) {
            gameLogElement.innerHTML = '';
        }
        gameLogMessages = [];
     }

    // --- Функции Игровой Логики ---

    /** Обрабатывает клик по ячейке сетки */
    function handleGridClick(event) {
        const clickedCell = event.target.closest('.grid-cell');
        if (!clickedCell) return; // Клик не по ячейке

        const row = parseInt(clickedCell.dataset.row, 10);
        const col = parseInt(clickedCell.dataset.col, 10);

        // console.log(`[Game] Clicked on cell: [${row}, ${col}]`); // DEBUG

        // 1. Если юнит не выбран
        if (!selectedUnitPosition) {
            if (row === heroPosition.row && col === heroPosition.col) {
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
                moveUnit(row, col);
            }
            // Клик по соседней ячейке с объектом/врагом
            else if (isAdjacent(selectedUnitPosition, { row, col }) && mapData[row][col].object && mapData[row][col].object !== OBJECT_TYPES.HERO) {
                 interactWithObject(row, col);
            }
             // Клик по другой ячейке - отмена выбора
            else {
                deselectUnit();
            }
        }
    }

    /** Выделяет юнита и показывает возможные ходы */
    function selectUnit(row, col) {
        // console.log(`[Game] Selecting unit at [${row}, ${col}]`); // DEBUG
        deselectUnit(); // Снимаем предыдущее выделение, если было
        selectedUnitPosition = { row, col };
        getCellElement(row, col)?.classList.add('selected');
        showPossibleMoves(row, col, currentAP);
        addLogMessage('playground.gameDemo.logHeroSelected'); // Используем ключ
    }

    /** Снимает выделение с юнита и убирает подсветку ходов */
    function deselectUnit() {
        if (selectedUnitPosition) {
            getCellElement(selectedUnitPosition.row, selectedUnitPosition.col)?.classList.remove('selected');
        }
        document.querySelectorAll('.possible-move').forEach(el => el.classList.remove('possible-move'));
        selectedUnitPosition = null;
        // console.log('[Game] Unit deselected.'); // DEBUG
    }

    /** Показывает доступные для хода ячейки (упрощенная версия - только соседи) */
    function showPossibleMoves(startRow, startCol, range) {
        // Очищаем предыдущие подсветки
         document.querySelectorAll('.possible-move').forEach(el => el.classList.remove('possible-move'));

         if (range <= 0) return; // Нет очков хода

         const cellsToCheck = [{ r: startRow, c: startCol, dist: 0 }]; // Очередь для BFS-подобного поиска
         const visited = new Set([`${startRow}-${startCol}`]); // Посещенные ячейки
         const possibleMoves = []; // Массив координат доступных ходов

         while(cellsToCheck.length > 0) {
            const current = cellsToCheck.shift();

             // Проверяем соседей
             const neighbors = [
                 { r: current.r - 1, c: current.c }, { r: current.r + 1, c: current.c },
                 { r: current.r, c: current.c - 1 }, { r: current.r, c: current.c + 1 }
             ];

             for (const neighbor of neighbors) {
                 const { r, c } = neighbor;
                 const key = `${r}-${c}`;
                 const newDist = current.dist + 1; // Стоимость хода пока 1

                 // Проверяем границы и расстояние
                 if (r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS && newDist <= range && !visited.has(key)) {
                      const cellData = mapData[r][c];
                      // Проверяем проходимость и отсутствие других юнитов/объектов (кроме ресурсов)
                      if (PASSABLE_TERRAIN.includes(cellData.terrain) && (!cellData.object || cellData.object.startsWith('object-resource-'))) {
                          visited.add(key);
                          possibleMoves.push({r, c});
                          cellsToCheck.push({r, c, dist: newDist}); // Добавляем в очередь для дальнейшего поиска
                      }
                 }
             }
         }

         // Подсвечиваем найденные ячейки
         possibleMoves.forEach(({r, c}) => {
            getCellElement(r, c)?.classList.add('possible-move');
         });
    }

    /** Перемещает героя */
    function moveUnit(targetRow, targetCol) {
        if (!selectedUnitPosition || currentAP <= 0) return;

        const startRow = selectedUnitPosition.row;
        const startCol = selectedUnitPosition.col;
        const cost = 1; // Стоимость хода (можно усложнить для разной местности)

        if (currentAP >= cost) {
             // 1. Обновляем данные карты
             mapData[targetRow][targetCol].object = mapData[startRow][startCol].object; // Перемещаем объект (героя)
             mapData[startRow][startCol].object = null; // Очищаем старую ячейку

             // 2. Обновляем позицию героя и ОД
             heroPosition = { row: targetRow, col: targetCol };
             currentAP -= cost;

             // 3. Перерисовываем затронутые ячейки
             renderCell(startRow, startCol);
             renderCell(targetRow, targetCol);

             // 4. Снимаем выделение и обновляем UI
             deselectUnit(); // Снимет и подсветку ходов
             updateHeroPanel();
             addLogMessage('playground.gameDemo.logHeroMoved', { row: targetRow, col: targetCol });

             // 5. Если на новой клетке есть ресурс - собираем
             if (mapData[targetRow][targetCol].object === OBJECT_TYPES.HERO &&
                 (mapData[targetRow][targetCol].terrain === TERRAIN_TYPES.GRASS || mapData[targetRow][targetCol].terrain === TERRAIN_TYPES.FOREST || mapData[targetRow][targetCol].terrain === TERRAIN_TYPES.SAND)) { // Допустим ресурсы могут быть и на песке
                 const cellElement = getCellElement(targetRow, targetCol);
                 if (cellElement.classList.contains(OBJECT_TYPES.GOLD)) {
                    collectResource(targetRow, targetCol, OBJECT_TYPES.GOLD, 'gold', 10);
                 } else if (cellElement.classList.contains(OBJECT_TYPES.WOOD)) {
                    collectResource(targetRow, targetCol, OBJECT_TYPES.WOOD, 'wood', 5);
                 }
             }

        } else {
             addLogMessage('playground.gameDemo.logNoAP');
        }
    }

    /** Обрабатывает взаимодействие с объектом/врагом */
    function interactWithObject(row, col) {
        if (currentAP <= 0) {
             addLogMessage('playground.gameDemo.logNoAPInteract');
             deselectUnit();
             return;
        }

        const objectType = mapData[row][col].object;
        console.log(`[Game] Interacting with ${objectType} at [${row}, ${col}]`);

        switch (objectType) {
            case OBJECT_TYPES.GOLD:
            case OBJECT_TYPES.WOOD:
                // Перемещаемся и собираем (логика сбора в moveUnit)
                moveUnit(row, col);
                break;
            case OBJECT_TYPES.CITY:
                openModal(
                    'playground.gameDemo.cityTitle', // Ключ заголовка
                    'playground.gameDemo.cityDesc',  // Ключ описания
                    [ // Массив действий
                        { textKey: 'playground.gameDemo.cityActionHire', cost: { gold: 50 }, action: () => hireUnit('Мечник') },
                        { textKey: 'playground.gameDemo.cityActionUpgrade', cost: { gold: 100 }, action: () => upgradeBuilding('Стена') },
                        { textKey: 'playground.gameDemo.cityActionLeave', action: closeModal }
                    ]
                );
                addLogMessage('playground.gameDemo.logEnterCity');
                deselectUnit(); // Снимаем выделение после взаимодействия
                break;
            case OBJECT_TYPES.QUEST:
                 openModal(
                    'playground.gameDemo.questTitle',
                    'playground.gameDemo.questDesc',
                    [
                        { textKey: 'playground.gameDemo.questActionAccept', action: () => acceptQuest(row, col) },
                        { textKey: 'playground.gameDemo.questActionDecline', action: closeModal }
                    ]
                );
                addLogMessage('playground.gameDemo.logFoundQuest');
                deselectUnit();
                break;
            case OBJECT_TYPES.ENEMY_WEAK:
            case OBJECT_TYPES.ENEMY_STRONG:
                fightEnemy(row, col, objectType);
                deselectUnit();
                break;
            default:
                console.warn(`[Game] Unknown object type for interaction: ${objectType}`);
                deselectUnit();
        }
    }

    /** Собирает ресурс */
    function collectResource(row, col, objectClass, resourceType, amount) {
        resources[resourceType] += amount;
        mapData[row][col].object = OBJECT_TYPES.HERO; // Оставляем только героя
        renderCell(row, col); // Перерисовываем ячейку без ресурса
        updateResourcePanel();
        addLogMessage('playground.gameDemo.logResourceCollected', { amount: amount, resource: translations[document.documentElement.lang || 'ru'][`resource.${resourceType}`] || resourceType });
    }

    /** Имитирует бой с врагом */
    function fightEnemy(row, col, enemyType) {
         if (currentAP < 1) { addLogMessage('playground.gameDemo.logNoAPFight'); return; }
         currentAP -= 1; // Бой тратит ОД

         const enemyStrength = (enemyType === OBJECT_TYPES.ENEMY_STRONG) ? 5 : 2;
         const heroStrength = 3; // Упрощенная сила героя
         const outcome = Math.random(); // Случайный исход для демо

         addLogMessage('playground.gameDemo.logFightStart', { enemy: enemyType });

         if (heroStrength + outcome * 3 > enemyStrength) { // Шанс на победу
            addLogMessage('playground.gameDemo.logFightWin');
            const goldReward = (enemyType === OBJECT_TYPES.ENEMY_STRONG) ? 50 : 10;
            resources.gold += goldReward;
            mapData[row][col].object = null; // Враг побежден
         } else {
            addLogMessage('playground.gameDemo.logFightLoss');
            const goldLoss = 20;
            resources.gold = Math.max(0, resources.gold - goldLoss); // Теряем золото, но не уходим в минус
            // Враг остается на месте в демо
         }
         renderCell(row, col); // Обновляем ячейку (враг мог исчезнуть)
         updateHeroPanel();
         updateResourcePanel();
    }

    /** Имитация найма юнита */
    function hireUnit(unitName) {
        const cost = { gold: 50 }; // Пример стоимости
        if (resources.gold >= cost.gold) {
            resources.gold -= cost.gold;
            updateResourcePanel();
            addLogMessage('playground.gameDemo.logUnitHired', { unit: unitName });
            closeModal();
        } else {
            addLogMessage('playground.gameDemo.logNotEnoughGold');
        }
    }

    /** Имитация улучшения здания */
    function upgradeBuilding(buildingName) {
         const cost = { gold: 100 };
         if (resources.gold >= cost.gold) {
             resources.gold -= cost.gold;
             updateResourcePanel();
             addLogMessage('playground.gameDemo.logBuildingUpgraded', { building: buildingName });
             closeModal();
         } else {
             addLogMessage('playground.gameDemo.logNotEnoughGold');
         }
    }

     /** Принятие квеста */
    function acceptQuest(row, col) {
        // В демо просто меняем объект на карте и выводим сообщение
        // mapData[row][col].object = null; // Убираем '?'
        // renderCell(row, col);
        addLogMessage('playground.gameDemo.logQuestAccepted');
        closeModal();
    }

    /** Завершает ход героя */
    function endTurn() {
        currentAP = HERO_MAX_AP; // Восстанавливаем ОД
        deselectUnit();
        updateHeroPanel();
        turnNumber++;
        addLogMessage('playground.gameDemo.logTurnEnd', { turn: turnNumber });
        // Сюда можно добавить логику хода ИИ (если будет)
    }


    // --- Вспомогательные Функции ---

    /** Получает DOM-элемент ячейки по координатам */
    function getCellElement(row, col) {
        return gameGridElement.querySelector(`.grid-cell[data-row="${row}"][data-col="${col}"]`);
    }

    /** Перерисовывает одну ячейку */
    function renderCell(row, col) {
        const cellElement = getCellElement(row, col);
        const cellData = mapData[row][col];
        if (cellElement && cellData) {
             // Удаляем все старые классы объекта/юнита и местности
             cellElement.className = 'grid-cell';
             // Добавляем актуальные
             cellElement.classList.add(cellData.terrain || TERRAIN_TYPES.GRASS);
             if (cellData.object) {
                 cellElement.classList.add(cellData.object);
             }
             // Убираем подсветку хода, если она была
             cellElement.classList.remove('possible-move', 'selected', 'path-highlight');
        }
    }

     /** Проверяет, являются ли две ячейки соседними */
    function isAdjacent(pos1, pos2) {
        const rowDiff = Math.abs(pos1.row - pos2.row);
        const colDiff = Math.abs(pos1.col - pos2.col);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }


    // --- Функции Модального Окна ---

    /** Открывает модальное окно с заданным контентом */
    function openModal(titleKey, descriptionKey, actions = []) {
        if (!interactionModal || !modalTitle || !modalDescription || !modalActions || typeof translations === 'undefined') {
            console.error("Modal elements or translations not found.");
            return;
        }
        const lang = document.documentElement.lang || 'ru';

        // Устанавливаем заголовок и описание из переводов
        modalTitle.textContent = translations[lang]?.[titleKey] || titleKey;
        modalDescription.textContent = translations[lang]?.[descriptionKey] || descriptionKey;

        // Очищаем предыдущие кнопки действий
        modalActions.innerHTML = '';

        // Создаем новые кнопки
        actions.forEach(actionInfo => {
            const button = document.createElement('button');
            button.classList.add('btn'); // Используем общий класс кнопки
            button.classList.add(actionInfo.primary ? 'btn-primary' : 'btn-secondary'); // Стиль кнопки

            let buttonText = translations[lang]?.[actionInfo.textKey] || actionInfo.textKey;
            // Добавляем стоимость, если есть
            if (actionInfo.cost) {
                const costString = Object.entries(actionInfo.cost)
                                       .map(([res, amount]) => `${amount} ${translations[lang]?.[`resource.${res}`] || res}`)
                                       .join(', ');
                buttonText += ` (${costString})`;
                // Проверяем, хватает ли ресурсов для кнопки
                button.disabled = Object.entries(actionInfo.cost).some(([res, amount]) => resources[res] < amount);
            }

            button.textContent = buttonText;
            button.addEventListener('click', actionInfo.action); // Привязываем действие
            modalActions.appendChild(button);
        });

        interactionModal.style.display = 'block'; // Показываем окно
    }

    /** Закрывает модальное окно */
    function closeModal() {
        if (interactionModal) {
            interactionModal.style.display = 'none';
            // Очищаем контент для следующего открытия
            modalActions.innerHTML = '';
            modalTitle.textContent = '';
            modalDescription.textContent = '';
        }
    }

    // --- Инициализация при загрузке DOM ---
    document.addEventListener('DOMContentLoaded', initializeGame);

})(); // Завершение IIFE