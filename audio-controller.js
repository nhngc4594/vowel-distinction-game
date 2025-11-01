// audio-controller.js

import { VOWEL_DATA } from './game-data.js';
import { showMainMenu } from './main-menu.js';

// --- GAME STAGE DATA ---
const GAME_STAGES = {
    // LEVEL 1: FAMILIARIZATION
    'level1_familiarize': [
        { id: '1A', name: 'Short Vowels (A, E, I)', rounds: 7, vowels: ['aligator', 'elephant', 'pin'] },
        { id: '1B', name: 'Short Vowels (U, O, OO)', rounds: 7, vowels: ['umbrella', 'ostrich', 'foot'] },
        { id: '1C', name: 'Long Vowels (A, I, O)', rounds: 7, vowels: ['acorn', 'icecream', 'ocean'] },
        { id: '1D', name: 'Long Vowels (U, E) & AU', rounds: 7, vowels: ['ukulele', 'eagle', 'australia'] },
        { id: '1E', name: 'R-Controlled & Final Group (earth, horn, spoon)', rounds: 7, vowels: ['earth', 'horn', 'spoon'] }
    ],

    // LEVEL 2: DISTINCTION. FIXED cards for 5 rounds. Strict pass/fail condition.
    'level2': [
        { id: '2.1.A', name: 'Earth Distinction 1', rounds: 5, targetVowels: ['earth', 'elephant', 'ocean'] },
        { id: '2.2.A', name: 'Australia Distinction 1', rounds: 5, targetVowels: ['australia', 'earth', 'elephant'] },
        { id: '2.2.B', name: 'Australia Distinction 2', rounds: 5, targetVowels: ['australia', 'ocean', 'pin'] },
        { id: '2.3.A', name: 'Aligator Distinction 1', rounds: 5, targetVowels: ['aligator', 'elephant', 'earth'] },
        { id: '2.3.B', name: 'Aligator Distinction 2', rounds: 5, targetVowels: ['aligator', 'acorn', 'umbrella'] },
        { id: '2.3.C', name: 'Aligator Distinction 3', rounds: 5, targetVowels: ['aligator', 'australia', 'pin'] },
        { id: '2.4.A', name: 'Foot Distinction 1', rounds: 5, targetVowels: ['foot', 'ocean', 'earth'] },
        { id: '2.4.B', name: 'Foot Distinction 2', rounds: 5, targetVowels: ['foot', 'australia', 'icecream'] },
        { id: '2.4.C', name: 'Foot Distinction 3', rounds: 5, targetVowels: ['foot', 'ukulele', 'pin'] },
        { id: '2.4.D', name: 'Foot Distinction 4', rounds: 5, targetVowels: ['foot', 'elephant', 'ostrich'] },
        { id: '2.5.A', name: 'Umbrella Distinction 1', rounds: 5, targetVowels: ['umbrella', 'foot', 'elephant'] },
        { id: '2.5.B', name: 'Umbrella Distinction 2', rounds: 5, targetVowels: ['umbrella', 'ocean', 'ostrich'] },
        { id: '2.5.C', name: 'Umbrella Distinction 3', rounds: 5, targetVowels: ['umbrella', 'australia', 'eagle'] },
        { id: '2.5.D', name: 'Umbrella Distinction 4', rounds: 5, targetVowels: ['umbrella', 'ukulele', 'earth'] },
        { id: '2.6.A', name: 'Ostrich Distinction 1', rounds: 5, targetVowels: ['ostrich', 'ocean', 'eagle'] },
        { id: '2.6.B', name: 'Ostrich Distinction 2', rounds: 5, targetVowels: ['ostrich', 'umbrella', 'acorn'] },
        { id: '2.6.C', name: 'Ostrich Distinction 3', rounds: 5, targetVowels: ['ostrich', 'foot', 'icecream'] },
        { id: '2.6.D', name: 'Ostrich Distinction 4', rounds: 5, targetVowels: ['ostrich', 'australia', 'elephant'] },
        { id: '2.6.E', name: 'Ostrich Distinction 5', rounds: 5, targetVowels: ['ostrich', 'aligator', 'pin'] },
        { id: '2.6.F', name: 'Ostrich Distinction 6', rounds: 5, targetVowels: ['ostrich', 'australia', 'icecream'] },
        { id: '2.7.A', name: 'Pin Distinction 1', rounds: 5, targetVowels: ['pin', 'eagle', 'icecream'] },
        { id: '2.7.B', name: 'Pin Distinction 2', rounds: 5, targetVowels: ['pin', 'elephant', 'ocean'] },
        { id: '2.7.C', name: 'Pin Distinction 3', rounds: 5, targetVowels: ['pin', 'ostrich', 'acorn'] },
        { id: '2.7.D', name: 'Pin Distinction 4', rounds: 5, targetVowels: ['pin', 'umbrella', 'australia'] },
        { id: '2.7.E', name: 'Pin Distinction 5', rounds: 5, targetVowels: ['pin', 'foot', 'ostrich'] },
        { id: '2.7.F', name: 'Pin Distinction 6', rounds: 5, targetVowels: ['pin', 'australia', 'icecream'] },
    ]
};


// --- GLOBAL STATE VARIABLES ---
let currentLevelId = 'level1_familiarize';
let currentSubLevelIndex = 0;
let currentRound = 0;
let correctAnswerId = '';
let score = 0;
let mistakes = 0;
let replaysUsed = 0;
let currentRoundAudioPath = '';
let lastCorrectVowelName = '';
let currentSubLevelVowelQueue = []; // Used for Level 1 only

// --- HELPER FUNCTIONS ---
function playAudio(audioPath) {
    const audio = new Audio(audioPath);
    audio.play();
}

function updateScoreAndRoundDisplay() {
    const subLevels = GAME_STAGES[currentLevelId];
    const subLevel = subLevels[currentSubLevelIndex];
    const totalRounds = subLevel.rounds;

    const scoreElement = document.getElementById('scoreDisplay');
    const roundElement = document.getElementById('roundDisplay');

    if (scoreElement) {
        scoreElement.textContent = `Completed: ${score}`;
    }
    if (roundElement) {
        roundElement.textContent = `Round: ${currentRound} / ${totalRounds}`;
    }
}

function updateProgressBar() {
    const subLevels = GAME_STAGES[currentLevelId];
    const subLevel = subLevels[currentSubLevelIndex];
    const totalRounds = subLevel.rounds;

    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        const progress = (currentRound / totalRounds) * 100;
        progressBar.style.width = `${progress}%`;
    }
}

// NOTE: This function is only used by Level 1 now, as Level 2 renders its cards once in startGame.
function renderCards(cardsToRender) {
    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) return;

    gameContainer.innerHTML = ''; // Clear existing cards

    cardsToRender.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'game-card';
        cardElement.dataset.matchId = card.matchId;

        const img = document.createElement('img');
        img.src = card.content;
        img.alt = 'Vowel Card';
        cardElement.appendChild(img);

        gameContainer.appendChild(cardElement);
    });
}

function handleCardClick(event) {
    const clickedCardElement = event.target.closest('.game-card');
    if (!clickedCardElement) return;

    if (clickedCardElement.dataset.matchId === correctAnswerId) {
        clickedCardElement.classList.add('correct');
        score++;
        updateScoreAndRoundDisplay();
        updateProgressBar();
        lastCorrectVowelName = correctAnswerId;

        setTimeout(() => {
            clickedCardElement.classList.remove('correct');
            startNewRound();
        }, 1000);
    } else {
        clickedCardElement.classList.add('incorrect');
        mistakes++;
        setTimeout(() => {
            clickedCardElement.classList.remove('incorrect');
        }, 1000);
    }
}


function isDifficultVowel(vowelName) {
    const difficultVowels = [
        'icecream', 'australia', 'eagle', 'earth', 'ukulele'
    ];
    return difficultVowels.includes(vowelName);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function selectCorrectVowelWeighted(targetVowels) {
    // Level 2 Weights: Card 1 (40%), Card 2 (40%), Card 3 (20%)
    const weights = [0.4, 0.4, 0.2];
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let randomNum = Math.random() * totalWeight;

    for (let i = 0; i < targetVowels.length; i++) {
        if (randomNum < weights[i]) {
            return targetVowels[i];
        }
        randomNum -= weights[i];
    }
    return targetVowels[0];
}


// --- CORE GAME LOGIC ---

export function startNewRound() {
    const subLevels = GAME_STAGES[currentLevelId];
    const subLevel = subLevels[currentSubLevelIndex];
    const totalRounds = subLevel.rounds;

    if (currentRound >= totalRounds) {
        endGame();
        return;
    }

    currentRound++;
    updateScoreAndRoundDisplay();
    updateProgressBar();

    let correctVowelName = '';

    if (currentLevelId === 'level2') {
        // --- LEVEL 2: Fixed Card Pool & Weighted Audio Selection (5 rounds) ---

        const targetVowels = subLevel.targetVowels;

        // 1. DETERMINE CORRECT VOWEL (Weighted Random)
        let selectedName;
        let attempts = 0;
        do {
            selectedName = selectCorrectVowelWeighted(targetVowels);
            attempts++;
        } while (selectedName === lastCorrectVowelName && attempts < 5);

        correctVowelName = selectedName;

        // Cards are already rendered and fixed from startGame()

    } else if (currentLevelId === 'level1_familiarize') {
        // --- LEVEL 1: Controlled Distribution Logic (Vowel Queue) (7 rounds) ---

        // 1. DETERMINE CORRECT VOWEL (from pre-shuffled queue)
        correctVowelName = currentSubLevelVowelQueue.shift();

        // Simple repeat prevention 
        if (correctVowelName === lastCorrectVowelName && currentSubLevelVowelQueue.length > 0) {
            currentSubLevelVowelQueue.push(correctVowelName);
            correctVowelName = currentSubLevelVowelQueue.shift();
        }

        const correctVowel = VOWEL_DATA.find(v => v.name === correctVowelName);

        // 2. RENDER CARDS (Correct Vowel + 2 Distractors - Renders every round)
        const allOtherVowelNames = VOWEL_DATA.map(v => v.name).filter(name => name !== correctVowelName);
        const subLevelVowels = subLevel.vowels;

        let incorrectVowels = [];
        let easyDistractors = allOtherVowelNames.filter(name => !subLevelVowels.includes(name) && !isDifficultVowel(name)).map(name => VOWEL_DATA.find(v => v.name === name));
        let difficultDistractors = allOtherVowelNames.filter(name => !subLevelVowels.includes(name) && isDifficultVowel(name)).map(name => VOWEL_DATA.find(v => v.name === name));

        shuffleArray(easyDistractors);
        if (easyDistractors[0]) incorrectVowels.push(easyDistractors[0]);
        shuffleArray(difficultDistractors);
        if (difficultDistractors[0]) incorrectVowels.push(difficultDistractors[0]);

        while (incorrectVowels.length < 2) {
            const remainingNames = VOWEL_DATA.map(v => v.name).filter(name => ![correctVowelName, ...incorrectVowels.map(v => v.name)].includes(name));
            if (remainingNames.length > 0) {
                const randomName = remainingNames[Math.floor(Math.random() * remainingNames.length)];
                incorrectVowels.push(VOWEL_DATA.find(v => v.name === randomName));
            } else {
                break;
            }
        }

        const allVowelsForRound = shuffleArray([correctVowel, ...incorrectVowels]);

        const cardsToRender = allVowelsForRound.map(vowel => ({
            id: `img-${vowel.name}`,
            type: 'image',
            content: vowel.image,
            matchId: vowel.name
        }));

        renderCards(cardsToRender);
    }

    // 3. Play Audio
    const finalCorrectVowel = VOWEL_DATA.find(v => v.name === correctVowelName);

    // Filter for words only (exclude the single vowel sound file)
    const availableWords = finalCorrectVowel.words.filter(word => !word.audio.includes('vowel_sound_only'));

    if (!finalCorrectVowel || availableWords.length === 0) {
        console.error("No valid word audio found for:", correctVowelName);
        startNewRound();
        return;
    }

    const randomIndex = Math.floor(Math.random() * availableWords.length);
    const promptAudio = availableWords[randomIndex];

    playAudio(promptAudio.audio);
    currentRoundAudioPath = promptAudio.audio;
    correctAnswerId = correctVowelName;
}


function endGame() {
    const appContainer = document.getElementById('app-container');
    if (!appContainer) return;

    const subLevels = GAME_STAGES[currentLevelId];
    const subLevel = subLevels[currentSubLevelIndex];
    const isLastSubLevel = currentSubLevelIndex === subLevels.length - 1;
    const isLevel2 = currentLevelId === 'level2';

    // Capture diagnostic stats
    const finalScore = score;
    const finalReplays = replaysUsed;
    const maxRounds = subLevel.rounds;

    const diagnosticReport = `
        <div class="diagnostic-report-container">
            <h3>Performance Summary:</h3>
            <p>Rounds Completed: <strong>${finalScore} / ${maxRounds}</strong></p>
            <p>Replays Used: <strong>${finalReplays}</strong></p>
        </div>
    `;

    // LEVEL 2 PASS/FAIL CHECK
    let passLevel = true;
    let feedbackTitle = `Sub-Level ${subLevel.id} Complete!`;
    let feedbackMessage = `Ready for the next challenge. Next: **${subLevels[currentSubLevelIndex + 1]?.name || 'Final Challenge'}**`;

    if (isLevel2) {
        // Strict failure conditions: less than 5/5 correct OR 2 or more replays
        if (finalScore < maxRounds || finalReplays >= 2) {
            passLevel = false;
            feedbackTitle = "Nice Try! Practice Required";
            feedbackMessage = `To ensure mastery of this distinction, please complete this section perfectly (5/5 correct and using the replay button less than twice).`;
        }
    }

    // Reset state for the next game/sub-level
    score = 0;
    replaysUsed = 0;
    lastCorrectVowelName = '';
    currentSubLevelVowelQueue = [];

    // --- RENDER END SCREEN ---

    if (!isLevel2 || passLevel) {
        // Progression or Final Completion
        if (currentLevelId === 'level1_familiarize' && isLastSubLevel) {
            // Level 1 Complete -> Go to Level 2
            appContainer.innerHTML = `
                <h1>Level 1 Mastery Achieved!</h1>
                ${diagnosticReport}
                <p>Great work! You have successfully practiced all 15 core vowel sounds.</p>
                <p>Next: **Level 2 (Distinction)** - Time to tackle the most confusing sound pairs!</p>
                <button id="nextLevelBtn" class="primary-btn">Start Level 2</button>
                <button id="backToMenuBtn" class="back-btn">Back to Main Menu</button>
            `;
            document.getElementById('nextLevelBtn').addEventListener('click', () => {
                currentLevelId = 'level2';
                currentSubLevelIndex = 0;
                startGame('level2');
            });
        }
        else if (isLastSubLevel) {
            // Final Level 2 Completion
            appContainer.innerHTML = `
                <h1>FINAL CONGRATULATIONS! 🏆</h1>
                <h2>Game Master!</h2>
                ${diagnosticReport}
                <p>You have successfully completed all stages of the Vowel Game! Your listening skills are excellent.</p>
                <button id="backToMenuBtn" class="back-btn">Back to Main Menu</button>
            `;
            currentLevelId = 'level1_familiarize';
            currentSubLevelIndex = 0;
        } else {
            // Progression to next sub-level
            appContainer.innerHTML = `
                <h1>${feedbackTitle}</h1>
                ${diagnosticReport}
                <p>${feedbackMessage}</p>
                <button id="nextLevelBtn" class="primary-btn">Continue to Next Sub-Level</button>
                <button id="backToMenuBtn" class="back-btn">Back to Main Menu</button>
            `;
            document.getElementById('nextLevelBtn').addEventListener('click', () => {
                currentSubLevelIndex++;
                startGame(currentLevelId);
            });
        }
    } else {
        // Level 2 Failure - Must Repeat
        appContainer.innerHTML = `
            <h1>${feedbackTitle}</h1>
            ${diagnosticReport}
            <p style="color: red; font-weight: bold;">${feedbackMessage}</p>
            <button id="repeatLevelBtn" class="primary-btn">Repeat Sub-Level ${subLevel.id}</button>
            <button id="backToMenuBtn" class="back-btn">Back to Main Menu</button>
        `;
        document.getElementById('repeatLevelBtn').addEventListener('click', () => {
            startGame(currentLevelId);
        });
    }

    // Common event listeners
    document.getElementById('backToMenuBtn').addEventListener('click', showMainMenu);
}

export function startGame(level) {
    // Determine the correct level ID
    if (level === 'level2_hard' || level === 'level2') {
        currentLevelId = 'level2';
    } else {
        currentLevelId = 'level1_familiarize'; // Default to Level 1
    }

    // Reset ALL stats and set the correct sub-level data
    currentRound = 0;
    score = 0;
    replaysUsed = 0;
    lastCorrectVowelName = '';

    const subLevels = GAME_STAGES[currentLevelId];
    const subLevel = subLevels[currentSubLevelIndex];
    const totalRounds = subLevel.rounds;

    // --- SETUP VOWEL QUEUE / CARD RENDER ---
    currentSubLevelVowelQueue = [];
    let cardsToRender = [];

    if (currentLevelId === 'level1_familiarize') {
        // Level 1: Initialize the controlled queue (3, 2, 2 distribution)
        const targetVowels = subLevel.vowels;
        let queue = [];
        queue.push(targetVowels[0], targetVowels[0], targetVowels[0]);
        queue.push(targetVowels[1], targetVowels[1]);
        queue.push(targetVowels[2], targetVowels[2]);
        currentSubLevelVowelQueue = shuffleArray(queue);

        // Cards are rendered inside startNewRound() for Level 1

    } else if (currentLevelId === 'level2') {
        // Level 2: Prepare the fixed set of 3 cards ONCE
        const targetVowelNames = subLevel.targetVowels;
        const allVowelsForRound = targetVowelNames.map(name => VOWEL_DATA.find(v => v.name === name));

        // Shuffle the card display order for visual variety
        cardsToRender = shuffleArray(allVowelsForRound.map(vowel => ({
            id: `img-${vowel.name}`,
            type: 'image',
            content: vowel.image,
            matchId: vowel.name
        })));
    }

    const appContainer = document.getElementById('app-container');
    if (!appContainer) return;

    appContainer.innerHTML = `
        <div class="game-layout-container">
            <h1>LEVEL ${currentLevelId.replace('level', '').toUpperCase()} - Sub-Level ${subLevel.id}: ${subLevel.name}</h1>
            <p>Click on the card that matches the word you hear.</p>
            <div class="game-info-bar">
                <span id="scoreDisplay">Completed: 0</span>
                <span id="roundDisplay">Round: 0 / ${totalRounds}</span>
            </div>
            <section id="game-container" class="game-cards-grid"></section>
            <div class="progress-container">
                <div id="progressBar" class="progress-bar"></div>
            </div>
            <div class="controls-container">
                <button id="replayBtn">Replay Word</button>
            </div>
            <button id="backToMenuBtn" class="back-btn">Back to Main Menu</button>
        </div>
    `;

    // RENDER FIXED CARDS FOR LEVEL 2
    if (currentLevelId === 'level2' && cardsToRender.length > 0) {
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            // Instead of using renderCards, we inject the HTML directly to set the fixed cards
            const cardHtml = cardsToRender.map(card => `
                <div class="game-card" data-match-id="${card.matchId}">
                    <img src="${card.content}" alt="Vowel Card">
                </div>
            `).join('');
            gameContainer.innerHTML = cardHtml;
        }
    }

    // Start the first round immediately
    startNewRound();

    document.getElementById('backToMenuBtn').addEventListener('click', showMainMenu);
    document.getElementById('replayBtn').addEventListener('click', () => {
        if (currentRoundAudioPath) {
            playAudio(currentRoundAudioPath);
            replaysUsed++;
        }
    });

    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        gameContainer.addEventListener('click', handleCardClick);
    }
}