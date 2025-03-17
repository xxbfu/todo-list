/**
 * Hra Had - implementace
 * 
 * Jednoduchá hra Had pro jednoho nebo dva hráče s náhodně se objevujícími
 * překážkami a odměnami. Při kolizi se stěnou, překážkou nebo jiným hadem
 * hra končí a zobrazí se skóre.
 */

// Herní proměnné
let snakeCanvas = null;       // Canvas element hry
let snakeContext = null;      // Canvas kontext pro vykreslování
let snakeGameActive = false;  // Flag zda hra běží
let snakeGameMode = 'single'; // Režim hry - 'single' nebo 'two-player'
let gameLoopInterval = null;  // Interval herního cyklu
let gameSpeed = 110;          // Rychlost hry v ms (nižší = rychlejší)

// Herní objekty
let snake1 = null;            // Modrý had
let snake2 = null;            // Červený had
let food = null;              // Jídlo (králíček)
let obstacle = null;          // Překážka uprostřed herní plochy

// Rozměry hry
let gridSize = 20;            // Velikost jednoho čtverce mřížky
let gameBoardSize = 500;      // Velikost celé herní plochy
let gridCount = 25;           // Počet čtverců v mřížce (gameBoardSize / gridSize)

// Skóre
let score1 = 0;
let score2 = 0;

/**
 * Inicializace hry Had
 * 
 * Nastaví počáteční hodnoty a event listenery pro herní tlačítka
 */
function initSnakeGame() {
    console.log('Initializing Snake game');
    
    // Získání reference na canvas a jeho kontext
    snakeCanvas = document.getElementById('snake-game-canvas');
    if (!snakeCanvas) {
        console.error('Snake canvas element not found!');
        return;
    }
    
    snakeContext = snakeCanvas.getContext('2d');
    
    // Nastavení velikosti canvasu
    snakeCanvas.width = gameBoardSize;
    snakeCanvas.height = gameBoardSize;
    
    // Nastavení event listenerů pro ovládací tlačítka
    document.getElementById('single-player-btn').addEventListener('click', () => setGameMode('single'));
    document.getElementById('two-player-btn').addEventListener('click', () => setGameMode('two-player'));
    document.getElementById('start-game-btn').addEventListener('click', startSnakeGame);
    document.getElementById('restart-game-btn').addEventListener('click', restartSnakeGame);
    
    // Nastavení event listeneru pro přepínání zobrazení ovládacích tlačítek
    const showControlsToggle = document.getElementById('show-controls-toggle');
    if (showControlsToggle) {
        showControlsToggle.addEventListener('change', function() {
            updateControlsVisibility();
        });
    }
    
    // Nastavení event listenerů pro mobilní ovládání
    setupMobileControls();
    
    // Nastavení event listeneru pro zobrazení modálního okna
    // Tento event je už nastaven v hlavním souboru app.js
    
    // Nakreslit úvodní obrazovku
    drawSnakeGameScreen();
    
    console.log('Snake game initialized successfully');
    return true;
}

/**
 * Zobrazení modálního okna s hrou Had
 * Tato funkce je už definována v hlavním souboru app.js,
 * proto je zde přejmenována, aby nedošlo ke konfliktu.
 */
function _showSnakeGameScreen() {
    // Překreslení herní plochy pro případ, že se změnila velikost okna
    drawSnakeGameScreen();
}

/**
 * Nastavení event listenerů pro mobilní ovládání
 */
function setupMobileControls() {
    // Najít všechna mobilní tlačítka ovládání
    const mobileButtons = document.querySelectorAll('.mobile-control-btn');
    
    // Přidat event listenery ke každému tlačítku
    mobileButtons.forEach(button => {
        ['mousedown', 'touchstart'].forEach(eventType => {
            button.addEventListener(eventType, function(e) {
                e.preventDefault(); // Zabránit výchozímu chování (např. scrollování při dotyku)
                
                const player = this.getAttribute('data-player');
                const direction = this.getAttribute('data-direction');
                
                if (!snakeGameActive) return;
                
                // Ovládání hada v závislosti na hráči
                if (player === '1') {
                    handleMobileDirection(snake1, direction);
                } else if (player === '2' && snakeGameMode === 'two-player') {
                    handleMobileDirection(snake2, direction);
                }
            });
        });
    });
}

/**
 * Zpracování mobilního ovládání hada (relativní změna směru)
 * 
 * @param {Object} snake - Instance hada, kterého ovládáme
 * @param {string} turn - Směr otočení ('left' nebo 'right')
 */
function handleMobileDirection(snake, turn) {
    // Mapování směrů pro otáčení doleva
    const turnLeftMap = {
        'up': 'left',
        'left': 'down',
        'down': 'right',
        'right': 'up'
    };
    
    // Mapování směrů pro otáčení doprava
    const turnRightMap = {
        'up': 'right',
        'right': 'down',
        'down': 'left',
        'left': 'up'
    };
    
    if (turn === 'left') {
        // Otočení doleva o 90°
        const newDirection = turnLeftMap[snake.direction];
        
        // Kontrola, že nový směr není opačný k aktuálnímu
        const oppositeDir = getOppositeDirection(snake.direction);
        if (newDirection !== oppositeDir) {
            snake.nextDirection = newDirection;
        }
    } 
    else if (turn === 'right') {
        // Otočení doprava o 90°
        const newDirection = turnRightMap[snake.direction];
        
        // Kontrola, že nový směr není opačný k aktuálnímu
        const oppositeDir = getOppositeDirection(snake.direction);
        if (newDirection !== oppositeDir) {
            snake.nextDirection = newDirection;
        }
    }
}

/**
 * Vrací opačný směr k zadanému směru
 * 
 * @param {string} direction - Vstupní směr
 * @returns {string} Opačný směr
 */
function getOppositeDirection(direction) {
    switch (direction) {
        case 'up': return 'down';
        case 'down': return 'up';
        case 'left': return 'right';
        case 'right': return 'left';
        default: return '';
    }
}

/**
 * Aktualizace viditelnosti ovládacích prvků podle nastavení 
 */
function updateControlsVisibility() {
    const mobileToggle = document.getElementById('show-controls-toggle');
    if (!mobileToggle) return;
    
    const isMobileMode = mobileToggle.checked;
    const mobileControls = document.querySelectorAll('.mobile-touch-controls');
    
    // Aktualizace viditelnosti dle režimu
    mobileControls.forEach(control => {
        // Přepnout zobrazení podle stavu checkboxu
        control.style.display = isMobileMode ? 'block' : 'none';
        
        // Pro 1-hráčový režim skrýt ovládání pro druhého hráče
        const isPlayer2Control = control.querySelector('.mobile-player2-controls');
        if (isPlayer2Control && snakeGameMode === 'single') {
            control.style.display = 'none';
        }
    });
}

/**
 * Nastavení herního režimu (jeden/dva hráči)
 * 
 * @param {string} mode - 'single' nebo 'two-player'
 */
function setGameMode(mode) {
    // Nastavení režimu
    snakeGameMode = mode;
    
    // Aktualizace UI - zvýraznění aktivního tlačítka režimu
    document.getElementById('single-player-btn').classList.toggle('active', mode === 'single');
    document.getElementById('two-player-btn').classList.toggle('active', mode === 'two-player');
    
    // Zobrazení/skrytí skóre druhého hráče
    document.getElementById('player2-score').classList.toggle('hidden', mode === 'single');
    
    // Zobrazení/skrytí odpovídajícího popisku režimu
    document.getElementById('single-player-desc').classList.toggle('hidden', mode !== 'single');
    document.getElementById('two-player-desc').classList.toggle('hidden', mode !== 'two-player');
    
    // Aktualizace viditelnosti ovládacích prvků
    updateControlsVisibility();
    
    // Pokud je hra aktivní, restartujeme ji při změně režimu
    if (snakeGameActive) {
        restartSnakeGame();
    }
}

/**
 * Spuštění hry Had
 */
function startSnakeGame() {
    // Reset skóre
    score1 = 0;
    score2 = 0;
    updateSnakeScores();
    
    // Nastavení herních objektů
    resetSnakeGame();
    
    // Ovládání - přidání event listeneru pro klávesnici
    window.addEventListener('keydown', handleSnakeKeyPress);
    
    // Spuštění herního cyklu
    snakeGameActive = true;
    gameLoopInterval = setInterval(gameLoop, gameSpeed);
    
    // Update UI
    document.getElementById('start-game-btn').classList.add('hidden');
    document.getElementById('restart-game-btn').classList.remove('hidden');
    
    // Aktualizace viditelnosti mobilních ovládacích prvků
    updateControlsVisibility();
    
    // Odstranění game over zprávy, pokud existuje
    const gameOverMessage = document.querySelector('.game-over-message');
    if (gameOverMessage) {
        gameOverMessage.remove();
    }
}

/**
 * Zastavení hry Had
 */
function stopSnakeGame() {
    // Zastavení herního cyklu
    if (gameLoopInterval) {
        clearInterval(gameLoopInterval);
        gameLoopInterval = null;
    }
    
    // Odstranění event listeneru pro klávesnici
    window.removeEventListener('keydown', handleSnakeKeyPress);
    
    // Nastavení flagu, že hra není aktivní
    snakeGameActive = false;
}

/**
 * Restart hry Had
 */
function restartSnakeGame() {
    // Zastavení aktuální hry
    stopSnakeGame();
    
    // Odstranění game over zprávy, pokud existuje
    const gameOverMessage = document.querySelector('.game-over-message');
    if (gameOverMessage) {
        gameOverMessage.remove();
    }
    
    // Spuštění nové hry
    startSnakeGame();
}

/**
 * Reset herních objektů
 * 
 * Vytvoří nové instance hadů, jídla a překážky na výchozích pozicích
 */
function resetSnakeGame() {
    // Vytvoření prvního hada (vlevo nahoře)
    snake1 = {
        body: [
            { x: 5, y: 3 },
            { x: 4, y: 3 },
            { x: 3, y: 3 }
        ],
        direction: 'right',
        nextDirection: 'right',
        color: '#4285f4' // modrá
    };
    
    // Vytvoření druhého hada (vpravo dole), pouze pro režim dvou hráčů
    snake2 = {
        body: [
            { x: gridCount - 6, y: gridCount - 4 },
            { x: gridCount - 5, y: gridCount - 4 },
            { x: gridCount - 4, y: gridCount - 4 }
        ],
        direction: 'left',
        nextDirection: 'left',
        color: '#ea4335' // červená
    };
    
    // Vytvoření překážky uprostřed
    obstacle = {
        x: Math.floor(gridCount / 2) - 2,
        y: Math.floor(gridCount / 2) - 2,
        width: 4,
        height: 4,
        color: '#333'
    };
    
    // Vytvoření jídla (králíčka) na náhodné pozici
    generateFood();
}

/**
 * Generování jídla na náhodné pozici
 * 
 * Zajišťuje, že se jídlo neobjeví na hadovi nebo v překážce
 */
function generateFood() {
    let validPosition = false;
    let newFood = null;
    
    // Dokud nenajdeme validní pozici
    while (!validPosition) {
        // Náhodná pozice v mřížce
        const x = Math.floor(Math.random() * gridCount);
        const y = Math.floor(Math.random() * gridCount);
        
        newFood = { x, y };
        validPosition = true;
        
        // Kontrola kolize s překážkou
        if (x >= obstacle.x && x < obstacle.x + obstacle.width &&
            y >= obstacle.y && y < obstacle.y + obstacle.height) {
            validPosition = false;
            continue;
        }
        
        // Kontrola kolize s prvním hadem
        for (const segment of snake1.body) {
            if (segment.x === x && segment.y === y) {
                validPosition = false;
                break;
            }
        }
        
        // Kontrola kolize s druhým hadem (pokud je ve hře)
        if (snakeGameMode === 'two-player' && validPosition) {
            for (const segment of snake2.body) {
                if (segment.x === x && segment.y === y) {
                    validPosition = false;
                    break;
                }
            }
        }
    }
    
    // Nastavení nového jídla
    food = newFood;
}

/**
 * Herní cyklus
 * 
 * Hlavní funkce, která se volá v pravidelných intervalech
 * a řídí pohyb, kolize a vykreslování
 */
function gameLoop() {
    // Aktualizace pozic hadů
    updateSnakes();
    
    // Kontrola kolizí
    checkCollisions();
    
    // Vykreslení herní plochy
    drawSnakeGameScreen();
}

/**
 * Aktualizace pozic hadů
 * 
 * Přepočítá pozice hadů dle jejich směrů pohybu
 */
function updateSnakes() {
    // Aktualizace prvního hada
    updateSnake(snake1);
    
    // Aktualizace druhého hada, pokud je ve hře
    if (snakeGameMode === 'two-player') {
        updateSnake(snake2);
    }
}

/**
 * Aktualizace pozice jednoho hada
 * 
 * @param {Object} snake - Instance hada pro aktualizaci
 */
function updateSnake(snake) {
    // Aktualizace směru pohybu
    snake.direction = snake.nextDirection;
    
    // Získání souřadnic hlavy hada
    const head = { ...snake.body[0] };
    
    // Výpočet nové pozice hlavy dle směru
    switch (snake.direction) {
        case 'up':
            head.y -= 1;
            break;
        case 'down':
            head.y += 1;
            break;
        case 'left':
            head.x -= 1;
            break;
        case 'right':
            head.x += 1;
            break;
    }
    
    // Přidání nové hlavy na začátek těla
    snake.body.unshift(head);
    
    // Kontrola, zda had sežral jídlo
    if (head.x === food.x && head.y === food.y) {
        // Zvýšení skóre příslušného hada
        if (snake === snake1) {
            score1++;
        } else {
            score2++;
        }
        
        // Aktualizace skóre
        updateSnakeScores();
        
        // Generování nového jídla
        generateFood();
    } else {
        // Pokud had nesežral jídlo, odstraníme poslední segment (had se pohybuje)
        snake.body.pop();
    }
}

/**
 * Kontrola kolizí
 * 
 * Kontroluje kolize hadů se stěnami, překážkou nebo sami se sebou
 */
function checkCollisions() {
    // Kontrola prvního hada
    if (checkSnakeCollision(snake1)) {
        // Pokud je režim jednoho hráče nebo druhý had již narazil, hra končí
        if (snakeGameMode === 'single' || (snake2 && checkSnakeCollision(snake2))) {
            gameOver();
        } else {
            // Druhý hráč vyhrál
            gameOver(2);
        }
        return;
    }
    
    // Kontrola druhého hada (pouze v režimu dvou hráčů)
    if (snakeGameMode === 'two-player' && checkSnakeCollision(snake2)) {
        // První hráč vyhrál
        gameOver(1);
        return;
    }
    
    // V režimu dvou hráčů kontrolujeme vzájemnou kolizi hadů
    if (snakeGameMode === 'two-player') {
        const head1 = snake1.body[0];
        const head2 = snake2.body[0];
        
        // Kontrola, zda hlava prvního hada narazila do těla druhého
        for (let i = 0; i < snake2.body.length; i++) {
            if (head1.x === snake2.body[i].x && head1.y === snake2.body[i].y) {
                // Druhý hráč vyhrál
                gameOver(2);
                return;
            }
        }
        
        // Kontrola, zda hlava druhého hada narazila do těla prvního
        for (let i = 0; i < snake1.body.length; i++) {
            if (head2.x === snake1.body[i].x && head2.y === snake1.body[i].y) {
                // První hráč vyhrál
                gameOver(1);
                return;
            }
        }
        
        // Kontrola, zda hlavy hadů nenarazily do sebe navzájem
        if (head1.x === head2.x && head1.y === head2.y) {
            // Remíza
            gameOver(0);
            return;
        }
    }
}

/**
 * Kontrola kolize jednoho hada
 * 
 * @param {Object} snake - Instance hada pro kontrolu
 * @returns {boolean} true, pokud došlo ke kolizi
 */
function checkSnakeCollision(snake) {
    const head = snake.body[0];
    
    // Kontrola kolize se stěnami
    if (head.x < 0 || head.x >= gridCount || head.y < 0 || head.y >= gridCount) {
        return true;
    }
    
    // Kontrola kolize s překážkou uprostřed
    if (head.x >= obstacle.x && head.x < obstacle.x + obstacle.width &&
        head.y >= obstacle.y && head.y < obstacle.y + obstacle.height) {
        return true;
    }
    
    // Kontrola kolize s vlastním tělem (od druhého segmentu)
    for (let i = 1; i < snake.body.length; i++) {
        if (head.x === snake.body[i].x && head.y === snake.body[i].y) {
            return true;
        }
    }
    
    // Žádná kolize
    return false;
}

/**
 * Konec hry
 * 
 * @param {number} winner - Číslo vítězného hráče (1, 2) nebo 0 pro remízu
 */
function gameOver(winner) {
    // Zastavení hry
    stopSnakeGame();
    
    // Vytvoření zprávy o konci hry
    const gameOverDiv = document.createElement('div');
    gameOverDiv.className = 'game-over-message';
    
    // Text zprávy dle režimu a vítěze
    if (snakeGameMode === 'single') {
        gameOverDiv.innerHTML = `
            <h3>Konec hry... dáme další?</h3>
            <p>Tvoje skóre: ${score1}</p>
        `;
    } else if (winner === 0) {
        gameOverDiv.innerHTML = `
            <h3>Remíza!</h3>
            <p>Modrý: ${score1}</p>
            <p>Červený: ${score2}</p>
            <p>Úkol musí dělat oba!</p>
        `;
    } else {
        const winnerColor = winner === 1 ? "Modrý" : "Červený";
        gameOverDiv.innerHTML = `
            <h3>${winnerColor} had vyhrál!</h3>
            <p>Modrý: ${score1}</p>
            <p>Červený: ${score2}</p>
            <p>Úkol nemusí dělat ${winnerColor}!</p>
        `;
    }
    
    // Přidání zprávy do herní plochy
    document.querySelector('.snake-game-container').appendChild(gameOverDiv);
}

/**
 * Aktualizace zobrazení skóre
 */
function updateSnakeScores() {
    document.getElementById('player1-score').textContent = `Modrý: ${score1}`;
    document.getElementById('player2-score').textContent = `Červený: ${score2}`;
}

/**
 * Vykreslení herní plochy
 * 
 * Vykreslí všechny herní prvky na canvas
 */
function drawSnakeGameScreen() {
    // Vyčištění canvasu
    snakeContext.fillStyle = '#000';
    snakeContext.fillRect(0, 0, gameBoardSize, gameBoardSize);
    
    // Vykreslení středové překážky
    snakeContext.fillStyle = obstacle.color;
    snakeContext.fillRect(
        obstacle.x * gridSize,
        obstacle.y * gridSize,
        obstacle.width * gridSize,
        obstacle.height * gridSize
    );
    
    // Vykreslení jídla (králíčka)
    if (food) {
        snakeContext.fillStyle = '#ffffff';
        snakeContext.fillRect(
            food.x * gridSize,
            food.y * gridSize,
            gridSize,
            gridSize
        );
    }
    
    // Vykreslení prvního hada
    drawSnake(snake1);
    
    // Vykreslení druhého hada (v režimu dvou hráčů)
    if (snakeGameMode === 'two-player') {
        drawSnake(snake2);
    }
}

/**
 * Vykreslení jednoho hada
 * 
 * @param {Object} snake - Instance hada pro vykreslení
 */
function drawSnake(snake) {
    // Pokud had neexistuje, ukončíme funkci
    if (!snake) return;
    
    // Nastavení barvy vykreslení
    snakeContext.fillStyle = snake.color;
    
    // Vykreslení každého segmentu hada
    snake.body.forEach(segment => {
        snakeContext.fillRect(
            segment.x * gridSize,
            segment.y * gridSize,
            gridSize,
            gridSize
        );
    });
}

/**
 * Zpracování stisku kláves pro ovládání hadů
 * 
 * @param {KeyboardEvent} event - Událost stisku klávesy
 */
function handleSnakeKeyPress(event) {
    // Pokud hra není aktivní, nereagujeme na klávesy
    if (!snakeGameActive) return;
    
    switch (event.key) {
        // Ovládání prvního hada (šipky)
        case 'ArrowUp':
            if (snake1.direction !== 'down') {
                snake1.nextDirection = 'up';
            }
            break;
        case 'ArrowDown':
            if (snake1.direction !== 'up') {
                snake1.nextDirection = 'down';
            }
            break;
        case 'ArrowLeft':
            if (snake1.direction !== 'right') {
                snake1.nextDirection = 'left';
            }
            break;
        case 'ArrowRight':
            if (snake1.direction !== 'left') {
                snake1.nextDirection = 'right';
            }
            break;
            
        // Ovládání druhého hada (klávesy W, A, S, D)
        case 'w':
        case 'W':
            if (snakeGameMode === 'two-player' && snake2.direction !== 'down') {
                snake2.nextDirection = 'up';
            }
            break;
        case 's':
        case 'S':
            if (snakeGameMode === 'two-player' && snake2.direction !== 'up') {
                snake2.nextDirection = 'down';
            }
            break;
        case 'a':
        case 'A':
            if (snakeGameMode === 'two-player' && snake2.direction !== 'right') {
                snake2.nextDirection = 'left';
            }
            break;
        case 'd':
        case 'D':
            if (snakeGameMode === 'two-player' && snake2.direction !== 'left') {
                snake2.nextDirection = 'right';
            }
            break;
    }
}
