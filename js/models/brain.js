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
        this.lastStimulusTime = Date.now();
        this.nextStimulusDelay = this.getRandomStimulusDelay();
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
     * Get a random delay for the next stimulus (7-15 seconds)
     * @returns {number} Delay in milliseconds
     */
    getRandomStimulusDelay() {
        return (Math.random() * 8000) + 7000; // 7-15 seconds in milliseconds
    }
    
    /**
     * Select a random number of emotions to stimulate
     * Weighted to favor fewer emotions (1-2 most common)
     * @returns {Array} Array of emotion IDs to stimulate
     */
    selectRandomEmotionsToStimulate() {
        // Get all emotion IDs
        const emotionIds = Object.keys(this.emotions);
        
        // Determine how many emotions to stimulate
        // Weighted probability: 1-2 emotions most common, 3+ increasingly rare
        const weightedRandom = Math.random();
        let numEmotionsToStimulate;
        
        if (weightedRandom < 0.45) {
            numEmotionsToStimulate = 1;
        } else if (weightedRandom < 0.75) {
            numEmotionsToStimulate = 2;
        } else if (weightedRandom < 0.90) {
            numEmotionsToStimulate = 3;
        } else if (weightedRandom < 0.97) {
            numEmotionsToStimulate = 4;
        } else {
            numEmotionsToStimulate = 5;
        }
        
        // Shuffle emotion IDs and take the number we need
        const shuffled = [...emotionIds].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, numEmotionsToStimulate);
    }
    
    /**
     * Stimulate random emotions to interact
     * @returns {Object} Details about the stimulation
     */
    stimulateEmotions() {
        const emotionsToStimulate = this.selectRandomEmotionsToStimulate();
        const stimulationDetails = {
            emotions: emotionsToStimulate,
            interactions: [],
            conversation: null
        };
        
        // If only one emotion is stimulated, it affects itself
        if (emotionsToStimulate.length === 1) {
            const emotionId = emotionsToStimulate[0];
            const emotion = this.emotions[emotionId];
            const delta = (Math.random() * 10) - 5; // Random change between -5 and +5
            emotion.adjustLevel(delta);
            
            stimulationDetails.interactions.push({
                source: emotionId,
                target: emotionId,
                delta: delta
            });
        } else {
            // Multiple emotions interact with each other
            for (let i = 0; i < emotionsToStimulate.length; i++) {
                const sourceId = emotionsToStimulate[i];
                const sourceEmotion = this.emotions[sourceId];
                
                // Each emotion influences other emotions in the selection
                for (let j = 0; j < emotionsToStimulate.length; j++) {
                    if (i !== j) {
                        const targetId = emotionsToStimulate[j];
                        const targetEmotion = this.emotions[targetId];
                        
                        // Apply influence and record the interaction
                        const influenceAmount = sourceEmotion.influence(targetEmotion);
                        
                        if (influenceAmount !== 0) {
                            stimulationDetails.interactions.push({
                                source: sourceId,
                                target: targetId,
                                delta: influenceAmount
                            });
                        }
                    }
                }
            }
            
            // Generate an internal conversation between emotions
            this.generateInternalConversation(stimulationDetails);
        }
        
        return stimulationDetails;
    }

    /**
     * Generate an internal conversation between emotions
     * @param {Object} stimulationDetails - Details about the stimulus
     */
    async generateInternalConversation(stimulationDetails) {
        const emotionIds = stimulationDetails.emotions;
        if (emotionIds.length < 2) return; // Need at least 2 emotions to have a conversation
        
        try {
            // Get emotion names for conversation
            const emotionNames = emotionIds.map(id => this.emotions[id].name);
            
            // Build a prompt for the LLM
            const emotionLevels = {};
            emotionIds.forEach(id => {
                emotionLevels[this.emotions[id].name] = this.emotions[id].level;
            });
            
            const conversationPrompt = `The following emotions in a person's brain are interacting: ${emotionNames.join(', ')}. 
            Their current intensity levels (0-100) are: ${JSON.stringify(emotionLevels)}.
            Generate a brief conversation (2-3 lines per emotion) between these emotions discussing how they feel about the current situation.
            Each emotion should speak according to its personality and current intensity level.`;
            
            // Generate conversation with LLM
            const completion = await websim.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You generate short internal dialogues between emotions in a person's brain. Keep each emotion's dialogue brief (1-3 lines), distinct to their personality, and relevant to their current intensity."
                    },
                    {
                        role: "user",
                        content: conversationPrompt
                    }
                ]
            });
            
            // Store the conversation in the stimulation details
            stimulationDetails.conversation = completion.content;
            
            // Add this conversation to thought history for each emotion involved
            const timestamp = new Date();
            emotionIds.forEach(id => {
                // Initialize thoughtHistory array if it doesn't exist
                if (!this.emotions[id].thoughtHistory) {
                    this.emotions[id].thoughtHistory = [];
                }
                
                this.emotions[id].addThought({
                    type: 'conversation',
                    participants: emotionIds,
                    content: completion.content,
                    timestamp
                });
            });
            
            // Dispatch a custom event for thought history updates
            const event = new CustomEvent('thoughtHistoryUpdated', {
                detail: {
                    conversation: completion.content,
                    participants: emotionIds,
                    timestamp: timestamp
                }
            });
            document.dispatchEvent(event);
            
        } catch (error) {
            console.error("Error generating emotion conversation:", error);
            // Add fallback conversation when LLM fails
            stimulationDetails.conversation = `Error: Couldn't generate conversation between ${emotionNames.join(', ')}`;
        }
    }

    /**
     * Check if it's time for a stimulus and process it if needed
     * @returns {Object|null} Stimulus details if processed, null otherwise
     */
    checkAndProcessStimulus() {
        const currentTime = Date.now();
        
        if (currentTime - this.lastStimulusTime >= this.nextStimulusDelay) {
            // Time for a stimulus
            const stimulusDetails = this.stimulateEmotions();
            
            // Reset timer with a new random delay
            this.lastStimulusTime = currentTime;
            this.nextStimulusDelay = this.getRandomStimulusDelay();
            
            return stimulusDetails;
        }
        
        return null;
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
        
        // Check for and process automatic stimulation
        const stimulusDetails = this.checkAndProcessStimulus();
        if (stimulusDetails) {
            // Dispatch an event about the stimulus
            const event = new CustomEvent('brainStimulusOccurred', {
                detail: stimulusDetails
            });
            document.dispatchEvent(event);
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