/**
 * Represents the Player entity that is affected by the brain's emotions
 */
class Player {
    /**
     * Initialize a new Player
     * @param {Brain} brain - Reference to the brain controlling this player
     */
    constructor(brain) {
        this.brain = brain;
        this.mood = "Neutral";
        this.dominantEmotion = null;
        this.stats = {
            energy: 50,
            focus: 50,
            creativity: 50,
            caution: 50,
            motivation: 50
        };
        this.thoughts = [];
        this.maxThoughts = 10; // Maximum number of thoughts to keep in history
    }

    /**
     * Update player state based on current brain emotions
     */
    update() {
        // Update mood based on brain's overall emotional state
        const moodData = this.brain.calculateMood();
        this.mood = moodData.description;
        
        // Update dominant emotion
        const dominant = this.brain.getDominantEmotion();
        this.dominantEmotion = dominant ? dominant.name : "None";
        
        // Update player stats based on emotion levels
        this.updateStats();
        
        // Generate thoughts based on current emotional state
        this.generateThought();
    }

    /**
     * Update player statistics based on current emotion levels
     */
    updateStats() {
        const emotions = this.brain.getAllEmotions();
        
        // Reset stats to baseline before applying emotion effects
        this.resetStats();
        
        // Apply effects of each emotion to player stats
        
        // Zeal affects energy, creativity, and motivation positively
        const zealLevel = emotions.zeal.level;
        this.stats.energy += (zealLevel - 50) * 0.5;
        this.stats.creativity += (zealLevel - 50) * 0.6;
        this.stats.motivation += (zealLevel - 50) * 0.7;
        
        // Gloom affects energy negatively, but can increase creativity
        const gloomLevel = emotions.gloom.level;
        this.stats.energy -= (gloomLevel - 50) * 0.4;
        this.stats.creativity += (gloomLevel - 50) * 0.3; // Introspection can foster creativity
        this.stats.motivation -= (gloomLevel - 50) * 0.5;
        
        // Wrath affects energy and motivation, but reduces focus
        const wrathLevel = emotions.wrath.level;
        this.stats.energy += (wrathLevel - 50) * 0.4;
        this.stats.focus -= (wrathLevel - 50) * 0.5;
        this.stats.motivation += (wrathLevel - 50) * 0.3;
        
        // Skeptic affects caution and focus
        const skepticLevel = emotions.skeptic.level;
        this.stats.caution += (skepticLevel - 50) * 0.6;
        this.stats.focus += (skepticLevel - 50) * 0.3;
        this.stats.creativity -= (skepticLevel - 50) * 0.3;
        
        // Jitters affects caution but reduces energy
        const jittersLevel = emotions.jitters.level;
        this.stats.caution += (jittersLevel - 50) * 0.7;
        this.stats.energy -= (jittersLevel - 50) * 0.4;
        this.stats.focus -= (jittersLevel - 50) * 0.3;
        
        // Clamp all stats to valid range (0-100)
        this.clampStats();
    }

    /**
     * Reset all stats to baseline values
     */
    resetStats() {
        for (const stat in this.stats) {
            this.stats[stat] = 50;
        }
    }

    /**
     * Ensure all stats are within valid range
     */
    clampStats() {
        for (const stat in this.stats) {
            this.stats[stat] = Math.max(0, Math.min(100, this.stats[stat]));
        }
    }

    /**
     * Generate a thought based on current emotional state
     */
    generateThought() {
        const emotions = this.brain.getAllEmotions();
        const dominant = this.brain.getDominantEmotion();
        let thought = "";
        
        // Generate thought based on dominant emotion
        if (dominant.id === "zeal") {
            thought = this.generateZealThought(emotions);
        } else if (dominant.id === "gloom") {
            thought = this.generateGloomThought(emotions);
        } else if (dominant.id === "wrath") {
            thought = this.generateWrathThought(emotions);
        } else if (dominant.id === "skeptic") {
            thought = this.generateSkepticThought(emotions);
        } else if (dominant.id === "jitters") {
            thought = this.generateJittersThought(emotions);
        }
        
        // Add timestamp and store thought
        const timestamp = new Date();
        this.thoughts.unshift({ thought, timestamp, dominantEmotion: dominant.id });
        
        // Limit thought history size
        if (this.thoughts.length > this.maxThoughts) {
            this.thoughts.pop();
        }
        
        return thought;
    }

    /**
     * Generate a thought influenced by Zeal
     */
    generateZealThought(emotions) {
        const zealLevel = emotions.zeal.level;
        const thoughts = [
            "I'm feeling energized and ready to take on new challenges!",
            "There's so much possibility in today. I can't wait to see what happens!",
            "What if I tried something completely new today?",
            "I have a good feeling about this. Let's go for it!",
            "This could be the start of something amazing!"
        ];
        
        return thoughts[Math.floor(Math.random() * thoughts.length)];
    }

    /**
     * Generate a thought influenced by Gloom
     */
    generateGloomThought(emotions) {
        const gloomLevel = emotions.gloom.level;
        const thoughts = [
            "I need some time to process my feelings right now.",
            "Sometimes it's okay to not be okay.",
            "I wonder if anyone else feels this way sometimes.",
            "Maybe I should take a moment to reflect on what's happening.",
            "There's a certain beauty in melancholy."
        ];
        
        return thoughts[Math.floor(Math.random() * thoughts.length)];
    }

    /**
     * Generate a thought influenced by Wrath
     */
    generateWrathThought(emotions) {
        const wrathLevel = emotions.wrath.level;
        const thoughts = [
            "That was completely unfair. I won't stand for this.",
            "Someone needs to speak up about this situation.",
            "I'm not going to let this slide again.",
            "This needs to change, and I might need to be the one to change it.",
            "I have every right to feel angry about this."
        ];
        
        return thoughts[Math.floor(Math.random() * thoughts.length)];
    }

    /**
     * Generate a thought influenced by Skeptic
     */
    generateSkepticThought(emotions) {
        const skepticLevel = emotions.skeptic.level;
        const thoughts = [
            "I should double-check these facts before proceeding.",
            "Something doesn't quite add up here.",
            "I'm not sure I can trust this information.",
            "Let's consider all angles before making a decision.",
            "Is this really as good as it seems?"
        ];
        
        return thoughts[Math.floor(Math.random() * thoughts.length)];
    }

    /**
     * Generate a thought influenced by Jitters
     */
    generateJittersThought(emotions) {
        const jittersLevel = emotions.jitters.level;
        const thoughts = [
            "What if something goes wrong? I should prepare for all scenarios.",
            "I need to be careful here. There's a lot at stake.",
            "I'm not sure I'm ready for this. Maybe I need more time.",
            "What are all the possible outcomes? I need to consider everything.",
            "I should have a backup plan, just in case."
        ];
        
        return thoughts[Math.floor(Math.random() * thoughts.length)];
    }

    /**
     * Get recent thoughts
     * @returns {Array} Recent thoughts with timestamps
     */
    getThoughts() {
        return this.thoughts;
    }

    /**
     * Get the player's current stats
     * @returns {Object} Current player stats
     */
    getStats() {
        return this.stats;
    }

    /**
     * Get current mood
     * @returns {string} Current mood description
     */
    getMood() {
        return this.mood;
    }

    /**
     * Get dominant emotion name
     * @returns {string} Name of dominant emotion
     */
    getDominantEmotion() {
        return this.dominantEmotion;
    }
}

