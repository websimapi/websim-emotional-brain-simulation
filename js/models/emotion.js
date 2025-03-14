/**
 * Class representing an individual emotion in the brain
 */
class Emotion {
    /**
     * Create an emotion
     * @param {string} id - Unique identifier for the emotion
     * @param {Object} config - Configuration data for this emotion
     */
    constructor(id, config) {
        this.id = id;
        this.name = config.name;
        this.color = config.color;
        this.level = config.initialLevel;
        this.description = config.description;
        this.personality = config.personality;
        this.signatureMove = config.signatureMove;
        this.conversationHistory = [];
        this.isActive = false;
    }

    /**
     * Set the current level of this emotion
     * @param {number} newLevel - New emotion level (0-100)
     */
    setLevel(newLevel) {
        // Clamp value between min and max
        this.level = Math.max(
            CONFIG.simulation.minEmotionLevel,
            Math.min(CONFIG.simulation.maxEmotionLevel, newLevel)
        );
    }

    /**
     * Adjust the emotion level by a delta
     * @param {number} delta - Amount to change (positive or negative)
     */
    adjustLevel(delta) {
        this.setLevel(this.level + delta);
    }

    /**
     * Apply natural decay to move this emotion back toward baseline
     */
    applyDecay() {
        const baseline = CONFIG.simulation.baselineEmotionLevel;
        const decayRate = CONFIG.simulation.emotionDecayRate;
        
        if (this.level > baseline) {
            this.adjustLevel(-decayRate);
        } else if (this.level < baseline) {
            this.adjustLevel(decayRate);
        }
    }

    /**
     * Influence another emotion based on relationship mapping
     * @param {Emotion} targetEmotion - Emotion to influence
     * @returns {number} The amount of influence applied
     */
    influence(targetEmotion) {
        if (targetEmotion.id === this.id) return 0;
        
        const relationship = CONFIG.emotionRelationships[this.id][targetEmotion.id];
        if (relationship === undefined) return 0;
        
        // Calculate influence based on this emotion's current level and relationship strength
        const deviation = this.level - CONFIG.simulation.baselineEmotionLevel;
        const influence = deviation * relationship * CONFIG.simulation.emotionInfluenceRate;
        
        // Apply the influence to the target emotion
        targetEmotion.adjustLevel(influence);
        
        return influence;
    }

    /**
     * Add a message to this emotion's conversation history
     * @param {string} role - 'user' or 'emotion'
     * @param {string} content - Message content
     */
    addMessage(role, content) {
        this.conversationHistory.push({ role, content, timestamp: new Date() });
        
        // Limit history size
        if (this.conversationHistory.length > CONFIG.llm.maxConversationHistory) {
            this.conversationHistory.shift();
        }
    }

    /**
     * Get the current conversation history
     * @returns {Array} Conversation history array
     */
    getConversationHistory() {
        return this.conversationHistory;
    }

    /**
     * Set the active state of this emotion
     * @param {boolean} isActive - Whether this emotion is currently active (focused)
     */
    setActive(isActive) {
        this.isActive = isActive;
    }
}

