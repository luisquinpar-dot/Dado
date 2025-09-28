class DiceSimulator {
    constructor() {
        this.diceContainer = document.getElementById('dice-container');
        this.rollButton = document.getElementById('rollButton');
        this.result = document.getElementById('result');
        this.stats = document.getElementById('stats');
        this.diceCountSelect = document.getElementById('dice-count');
        
        this.rollCount = 0;
        this.diceElements = [];
        this.rollHistory = [];

        // Mapeo de número a la rotación CSS para mostrar la cara correcta
        this.faceRotations = {
            1: 'rotateY(0deg) rotateX(0deg)',
            2: 'rotateX(-90deg)',
            3: 'rotateY(-90deg)',
            4: 'rotateY(90deg)',
            5: 'rotateX(90deg)',
            6: 'rotateY(180deg)'
        };
        
        this.init();
    }

    init() {
        this.diceCountSelect.addEventListener('change', (e) => this.createDice(parseInt(e.target.value, 10)));
        this.rollButton.addEventListener('click', () => this.rollDice());
        this.initThemeSelector();

        // Mostrar resultado inicial
        this.createDice(1);
        this.updateResult([1]);
    }

    initThemeSelector() {
        const themeButtons = document.querySelectorAll('.theme-btn');
        themeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const theme = e.target.dataset.theme;

                // Quitar clase activa y estado presionado de todos los botones
                themeButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-pressed', 'false');
                });
                // Añadir clase activa al botón clickeado
                e.target.setAttribute('aria-pressed', 'true');
                e.target.classList.add('active');

                // Aplicar el tema al body
                document.body.className = `theme-${theme}`;
            });
        });
    }

    async rollDice() {
        // Evitar lanzamientos múltiples durante la animación
        if (this.rollButton.disabled) return; 

        // Deshabilitar botón durante la animación
        this.rollButton.disabled = true;
        this.rollButton.textContent = 'Lanzando...';

        // Reproducir sonido de dado
        this.playDiceSound();

        const randomNumbers = [];

        this.diceElements.forEach(die => {
            // Generar número aleatorio (1 a 6) para cada dado
            const randomNumber = Math.floor(Math.random() * 6) + 1;
            randomNumbers.push(randomNumber);

            // Iniciar animación de rodar aplicando una rotación aleatoria grande
            const randomX = (Math.floor(Math.random() * 4) + 4) * 360; // 4 a 7 vueltas
            const randomY = (Math.floor(Math.random() * 4) + 4) * 360; // 4 a 7 vueltas
            die.style.transform = `rotateX(${randomX}deg) rotateY(${randomY}deg)`;
        });
        
        // Esperar a que termine la animación
        await this.delay(1000);

        // Reproducir sonido de "parada"
        this.playStopSound();

        // Actualizar visual de los dados y resultado
        this.diceElements.forEach((die, index) => {
            this.updateDice(die, randomNumbers[index]);
        });

        this.updateResult(randomNumbers);
        this.updateStats(randomNumbers);

        // Rehabilitar botón
        this.rollButton.disabled = false;
        this.rollButton.textContent = 'Lanzar Dado';
    }

    updateDice(die, number) {
        // Aplicar la rotación final para mostrar la cara correcta del d6
        die.style.transform = this.faceRotations[number];
        die.setAttribute('aria-label', `Dado mostrando el número ${number}`);
    }

    updateResult(numbers) {
        let resultText;
        if (numbers.length > 1) {
            resultText = `Resultados: <strong>${numbers.join(', ')}</strong>`;
        } else {
            resultText = `¡Salió un <strong>${numbers[0]}</strong>!`;
        }
        this.result.innerHTML = resultText;
        this.result.classList.remove('show');
        
        // Trigger reflow para reiniciar animación
        this.result.offsetHeight;
        this.result.classList.add('show');
    }

    updateStats(numbers) {
        this.rollCount++;
        const sum = numbers.reduce((acc, num) => acc + num, 0);
        this.rollHistory.push(sum);
        
        // Mantener solo los últimos 10 lanzamientos
        if (this.rollHistory.length > 10) {
            this.rollHistory.shift();
        }
        
        // Mostrar los últimos 5 lanzamientos (sumas) en las estadísticas
        const lastRollsText = this.rollHistory.slice(-5).join(', ');
        this.stats.innerHTML = `
            Lanzamientos: ${this.rollCount}<br>
            Últimas 5 sumas: ${lastRollsText}
        `;
    }

    createDice(count) {
        this.diceContainer.innerHTML = '';
        this.diceElements = [];

        // Añadir/quitar una clase específica para la cuadrícula de 4 dados
        if (count === 4) {
            this.diceContainer.classList.add('four-dice-grid');
        } else {
            this.diceContainer.classList.remove('four-dice-grid');
        }

        for (let i = 0; i < count; i++) {
            const die = document.createElement('div');
            die.className = 'dice';
            die.setAttribute('role', 'img');
            die.setAttribute('tabindex', '0'); // Hacer el dado enfocable
            
            const facesHTML = `
                <div class="face face-front"> <!-- Cara 1 --> <div class="dot"></div> </div>
                <div class="face face-back">  <!-- Cara 6 --> <div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div> </div>
                <div class="face face-right"> <!-- Cara 3 --> <div class="dot"></div><div class="dot"></div><div class="dot"></div> </div>
                <div class="face face-left">  <!-- Cara 4 --> <div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div> </div>
                <div class="face face-top">   <!-- Cara 2 --> <div class="dot"></div><div class="dot"></div> </div>
                <div class="face face-bottom"><!-- Cara 5 --> <div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div> </div>
            `;
            die.innerHTML = facesHTML;

            // Añadir evento de click a cada dado
            die.addEventListener('click', () => this.rollDice());
            // Añadir evento de teclado para lanzar con Enter o Espacio
            die.addEventListener('keydown', (event) => {
                if (event.code === 'Enter' || event.code === 'Space') {
                    this.rollDice();
                }
            });

            this.diceContainer.appendChild(die);
            this.diceElements.push(die);
        }

        // Establecer estado inicial
        const initialResults = [];
        this.diceElements.forEach(die => {
            const initialValue = 1;
            this.updateDice(die, initialValue);
            initialResults.push(initialValue);
        });
        this.updateResult(initialResults);
    }

    playStopSound() {
        // Crear un sonido de "pop" para cuando el dado se detiene
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            const now = audioContext.currentTime;

            // Configuración del sonido "Pop"
            gainNode.gain.setValueAtTime(0.4, now); // Volumen inicial
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15); // Decaimiento rápido

            oscillator.frequency.setValueAtTime(120, now); // Tono inicial
            oscillator.frequency.exponentialRampToValueAtTime(60, now + 0.15); // Caída de tono
            oscillator.type = 'sine'; // Una onda suave para un 'pop' limpio

            oscillator.start(now);
            oscillator.stop(now + 0.15);
        } catch (error) {
            console.warn('Audio no disponible.', error);
        }
    }

    playDiceSound() {
        // Crear sonido sintético usando Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Crear una serie de clics para simular el sonido del dado
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    // Frecuencia y tipo de onda para un sonido de 'clic'
                    oscillator.frequency.setValueAtTime(200 + Math.random() * 300, audioContext.currentTime);
                    oscillator.type = 'square';
                    
                    // Envolvente de volumen (ataque rápido, decaimiento rápido)
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.1);
                }, i * 100); // Pequeño retraso entre cada 'clic'
            }
        } catch (error) {
            console.warn('Audio no disponible. Se requiere interacción del usuario o el navegador no lo soporta completamente.', error);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Inicializar el simulador cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new DiceSimulator();
});

// Agregar soporte para teclado (Espacio para lanzar)
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        event.preventDefault();
        const rollButton = document.getElementById('rollButton');
        if (rollButton && !rollButton.disabled) {
            rollButton.click();
        }
    }
});