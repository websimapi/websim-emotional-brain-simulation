/**
 * The Brain class that manages all emotions and their interactions
 */
class Brain {
    /**
     * Create a brain with all emotions
     */
    constructor() {
        this.emotions = {};
        this.initializeEmotions();
        this.tick = 0;
        this.activeEmotion = null;
    }

    /**
     * Initialize all emotions based on the configuration
     */
    initializeEmotions() {
        for (const [id, config] of Object.entries(CONFIG.emotions)) {
            this.emotions[id] = new Emotion(id, config);
        }
    }

    /**
     * Get a specific emotion by ID
     * @param {string} id - The emotion ID
     * @returns {Emotion} The emotion object
     */
    getEmotion(id) {
        return this.emotions[id];
    }

    /**
     * Get all emotions
     * @returns {Object} Map of all emotions
     */
    getAllEmotions() {
        return this.emotions;
    }

    /**
     * Set the currently active emotion
     * @param {string} emotionId - ID of the emotion to activate
     */
    setActiveEmotion(emotionId) {
        // Deactivate current emotion if any
        if (this.activeEmotion) {
            this.emotions[this.activeEmotion].setActive(false);
        }
        
        // Set and activate new emotion
        this.activeEmotion = emotionId;
        if (emotionId) {
            this.emotions[emotionId].setActive(true);
        }
    }

    /**
     * Get the currently active emotion
     * @returns {Emotion|null} The active emotion or null
     */
    getActiveEmotion() {
        return this.activeEmotion ? this.emotions[this.activeEmotion] : null;
    }

    /**
     * Calculate the overall mood based on emotion levels
     * @returns {Object} Mood data including value and description
     */
    calculateMood() {
        // Calculate weighted mood value
        let totalLevel = 0;
        let weightedSum = 0;
        
        // Positive emotions contribute positively, negative emotions negatively
        weightedSum += this.emotions.zeal.level * 1;        // Zeal is positive
        weightedSum += this.emotions.gloom.level * -0.7;    // Gloom is negative
        weightedSum += this.emotions.wrath.level * -0.5;    // Wrath is negative but can be motivating
        weightedSum += this.emotions.skeptic.level * -0.3;  // Skeptic is slightly negative
        weightedSum += this.emotions.jitters.level * -0.6;  // Jitters is negative
        
        // Calculate total levels for normalization
        for (const emotion of Object.values(this.emotions)) {
            totalLevel += emotion.level;
        }
        
        // Normalize to 0-100 scale
        const normalizedMood = 50 + (weightedSum / totalLevel) * 50;
        
        // Determine mood description
        let moodDescription;
        if (normalizedMood < CONFIG.moodThresholds.extremelyNegative) {
            moodDescription = "Deeply Troubled";
        } else if (normalizedMood < CONFIG.moodThresholds.negative) {
            moodDescription = "Distressed";
        } else if (normalizedMood < CONFIG.moodThresholds.neutral) {
            moodDescription = "Uneasy";
        } else if (normalizedMood < CONFIG.moodThresholds.positive) {
            moodDescription = "Content";
        } else if (normalizedMood < CONFIG.moodThresholds.extremelyPositive) {
            moodDescription = "Optimistic";
        } else {
            moodDescription = "Elated";
        }
        
        return {
            value: normalizedMood,
            description: moodDescription
        };
    }

    /**
     * Find the dominant emotion by level
     * @returns {Emotion} The dominant emotion object
     */
    getDominantEmotion() {
        let dominant = null;
        let highestLevel = -1;
        
        for (const emotion of Object.values(this.emotions)) {
            if (emotion.level > highestLevel) {
                highestLevel = emotion.level;
                dominant = emotion;
            }
        }
        
        return dominant;
    }

    /**
     * Process a simulation tick - update all emotions
     */
    processTick() {
        this.tick++;
        
        // Process each emotion's natural decay
        for (const emotion of Object.values(this.emotions)) {
            emotion.applyDecay();
        }
        
        // Process influence between emotions
        for (const sourceEmotion of Object.values(this.emotions)) {
            for (const targetEmotion of Object.values(this.emotions)) {
                sourceEmotion.influence(targetEmotion);
            }
        }
    }

    /**
     * Reset all emotions to baseline levels
     */
    reset() {
        for (const emotion of Object.values(this.emotions)) {
            emotion.setLevel(CONFIG.simulation.baselineEmotionLevel);
        }
        this.tick = 0;
    }
}

