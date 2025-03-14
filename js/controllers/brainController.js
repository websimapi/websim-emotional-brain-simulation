/**
 * Controller for managing the brain simulation
 */
class BrainController {
    /**
     * Initialize the brain controller
     * @param {Brain} brain - The brain model to control
     * @param {Player} player - The player model affected by the brain
     */
    constructor(brain, player) {
        this.brain = brain;
        this.player = player;
        this.simulationInterval = null;
        this.isRunning = false;
    }

    /**
     * Start the brain simulation
     */
    startSimulation() {
        if (this.isRunning) return;
        
        this.simulationInterval = setInterval(() => {
            this.runSimulationTick();
        }, CONFIG.simulation.tickRate);
        
        this.isRunning = true;
    }

    /**
     * Pause the brain simulation
     */
    pauseSimulation() {
        if (!this.isRunning) return;
        
        clearInterval(this.simulationInterval);
        this.simulationInterval = null;
        this.isRunning = false;
    }

    /**
     * Run a single tick of the simulation
     */
    runSimulationTick() {
        // Update brain state
        this.brain.processTick();
        
        // Update player based on brain state
        this.player.update();
        
        // Trigger any UI updates
        this.dispatchUpdateEvent();
    }

    /**
     * Manually trigger an emotion change
     * @param {string} emotionId - ID of the emotion to change
     * @param {number} delta - Amount to change the emotion by
     */
    triggerEmotion(emotionId, delta) {
        const emotion = this.brain.getEmotion(emotionId);
        if (emotion) {
            emotion.adjustLevel(delta);
            this.player.update();
            this.dispatchUpdateEvent();
        }
    }

    /**
     * Set a specific emotion to a specific level
     * @param {string} emotionId - ID of the emotion to set
     * @param {number} level - New level for the emotion (0-100)
     */
    setEmotionLevel(emotionId, level) {
        const emotion = this.brain.getEmotion(emotionId);
        if (emotion) {
            emotion.setLevel(level);
            this.player.update();
            this.dispatchUpdateEvent();
        }
    }

    /**
     * Get the current state of all emotions
     * @returns {Object} Map of all emotions and their current levels
     */
    getEmotionLevels() {
        const levels = {};
        const emotions = this.brain.getAllEmotions();
        
        for (const [id, emotion] of Object.entries(emotions)) {
            levels[id] = emotion.level;
        }
        
        return levels;
    }

    /**
     * Get thought history for all emotions or a specific emotion
     * @param {string} emotionId - Optional ID of specific emotion
     * @returns {Array} Thought history
     */
    getThoughtHistory(emotionId = null) {
        if (emotionId) {
            const emotion = this.brain.getEmotion(emotionId);
            return emotion ? emotion.getThoughtHistory() : [];
        } else {
            // Get combined thought history from all emotions
            let allThoughts = [];
            const emotions = this.brain.getAllEmotions();
            
            for (const id in emotions) {
                allThoughts = [...allThoughts, ...emotions[id].getThoughtHistory()];
            }
            
            // Sort by timestamp (newest first)
            allThoughts.sort((a, b) => b.timestamp - a.timestamp);
            
            // Remove duplicates
            const uniqueThoughts = [];
            const seenIds = new Set();
            
            allThoughts.forEach(thought => {
                const thoughtId = thought.timestamp.getTime() + thought.content.substring(0, 20);
                if (!seenIds.has(thoughtId)) {
                    seenIds.add(thoughtId);
                    uniqueThoughts.push(thought);
                }
            });
            
            return uniqueThoughts;
        }
    }

    /**
     * Reset the brain to baseline state
     */
    resetBrain() {
        this.brain.reset();
        this.player.update();
        this.dispatchUpdateEvent();
    }

    /**
     * Dispatch a custom event when the brain state updates
     */
    dispatchUpdateEvent() {
        const event = new CustomEvent('brainStateUpdated', {
            detail: {
                emotionLevels: this.getEmotionLevels(),
                mood: this.player.getMood(),
                dominantEmotion: this.player.getDominantEmotion(),
                playerStats: this.player.getStats(),
                playerThoughts: this.player.getThoughts()
            }
        });
        
        document.dispatchEvent(event);
    }
}