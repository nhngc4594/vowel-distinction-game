// main-menu.js
import { startGame } from './audio-controller.js';
import { VOWEL_DATA } from './game-data.js';

// Function to render the sound introduction cards
function renderSoundIntroduction() {
    const appContainer = document.getElementById('app-container');
    if (!appContainer) return;
    
    // Sort VOWEL_DATA alphabetically by name for consistent display
    const sortedVowels = [...VOWEL_DATA].sort((a, b) => a.name.localeCompare(b.name));
    
    const cardHtml = sortedVowels.map(vowel => `
        <div class="sound-intro-card" 
             data-vowel-name="${vowel.name}" 
             role="button" 
             tabindex="0"
             aria-label="Play ${vowel.name} sound">
            <h3>${vowel.name}</h3> 
            <div class="card-image-container">
                <img src="${vowel.image}" 
                     alt="${vowel.name} vowel sound" 
                     onerror="this.src='images/placeholder.jpg'; this.alt='Image not available';">
                <div class="card-title-overlay">${vowel.name}</div>
            </div>
        </div>
    `).join('');
    
    appContainer.innerHTML = `
        <div class="sound-introduction-container">
            <h1>Vowel Sound Introduction</h1>
            <p>Familiarize yourself with the 15 core vowel sounds and their corresponding images/words. Click any card to hear the sound.</p>
            <div class="vowel-card-grid">
                ${cardHtml}
            </div>
            <button id="backToMenuBtn" class="primary-btn">Back to Main Menu</button>
        </div>
    `;
    
    document.getElementById('backToMenuBtn').addEventListener('click', showMainMenu);
    
    // Event listener for making the cards clickable to play individual sounds
    document.querySelectorAll('.sound-intro-card').forEach(card => {
        // Click handler
        card.addEventListener('click', (event) => {
            playVowelSound(event.currentTarget.dataset.vowelName);
        });
        
        // Keyboard accessibility (Enter or Space key)
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                playVowelSound(event.currentTarget.dataset.vowelName);
            }
        });
    });
}

// Helper function to play vowel sound with error handling
function playVowelSound(vowelName) {
    const vowel = VOWEL_DATA.find(v => v.name === vowelName);
    
    if (!vowel || !vowel.words || vowel.words.length === 0) {
        console.error("Vowel data not found for:", vowelName);
        return;
    }
    
    // Find the raw vowel sound
    const rawVowelAudio = vowel.words.find(w => w.audio.includes('vowel_sound_only'));
    
    if (rawVowelAudio) {
        const audio = new Audio(rawVowelAudio.audio);
        audio.play().catch(error => {
            console.error("Audio playback failed for:", vowelName, error);
            alert('Audio failed to play. Please check your connection or audio settings.');
        });
    } else {
        console.error("Raw vowel sound not found for:", vowelName);
    }
}

// Main function to display the menu
export function showMainMenu() {
    const appContainer = document.getElementById('app-container');
    if (!appContainer) return;
    
    appContainer.innerHTML = `
        <h1>The Vowel Distinction Game</h1>
        <p>Choose your level:</p>
        <div class="main-menu-options">
            <button id="introBtn" class="primary-btn intro-btn-special">Sound Introduction</button>
            <button id="level1Btn" class="primary-btn">Level 1: Familiarization (7 Rounds)</button>
            <button id="level2Btn" class="primary-btn">Level 2: Distinction (5 Rounds)</button>
        </div>
    `;
    
    document.getElementById('level1Btn').addEventListener('click', () => {
        startGame('level1_familiarize');
    });
    
    document.getElementById('level2Btn').addEventListener('click', () => {
        startGame('level2');
    });
    
    document.getElementById('introBtn').addEventListener('click', renderSoundIntroduction);
}
