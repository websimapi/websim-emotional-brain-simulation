// Configuration settings for the emotional brain simulation

const CONFIG = {
    // Emotion settings and default values
    emotions: {
        zeal: {
            name: "Zeal",
            color: "#FFD700",
            initialLevel: 50,
            description: "A vibrant, energetic force that thrives on excitement, optimism, and passion.",
            personality: "Encouraging, high-energy, playful, sometimes overly idealistic",
            signatureMove: "Sparks bursts of motivation and laughter in others"
        },
        gloom: {
            name: "Gloom",
            color: "#0000CD",
            initialLevel: 50,
            description: "A deep, introspective emotion that processes loss, empathy, and personal growth.",
            personality: "Thoughtful, nurturing, slow-moving but wise, sometimes self-doubting",
            signatureMove: "Encourages reflection, releases bottled-up emotions"
        },
        wrath: {
            name: "Wrath",
            color: "#DC143C",
            initialLevel: 50,
            description: "A fiery, unyielding emotion that fuels determination and justice.",
            personality: "Blunt, intense, fiercely loyal, often impatient",
            signatureMove: "Ignites bursts of energy for action, but can overheat if unchecked"
        },
        skeptic: {
            name: "Skeptic",
            color: "#32CD32",
            initialLevel: 50,
            description: "A sharp, discerning force that guards against bad decisions and unhealthy influences.",
            personality: "Witty, sharp-tongued, protective, sometimes snobbish",
            signatureMove: "Instant judgment that filters out risks and inefficiencies"
        },
        jitters: {
            name: "Jitters",
            color: "#8A2BE2",
            initialLevel: 50,
            description: "An alert and hyperaware emotion designed to detect danger and avoid risks.",
            personality: "High-strung, analytical, caring, can be overprotective",
            signatureMove: "Heightened senses, quick decision-making in high-pressure moments"
        }
    },
    
    // Simulation settings
    simulation: {
        tickRate: 1000, // milliseconds between brain state updates
        emotionDecayRate: 0.2, // how quickly emotions return to baseline
        emotionInfluenceRate: 0.5, // how strongly emotions affect each other
        minEmotionLevel: 0,
        maxEmotionLevel: 100,
        baselineEmotionLevel: 50
    },
    
    // Mood thresholds and classifications
    moodThresholds: {
        extremelyNegative: 20,
        negative: 40,
        neutral: 60,
        positive: 80,
        extremelyPositive: 100
    },
    
    // Emotion relationships (how emotions affect each other)
    emotionRelationships: {
        zeal: {
            gloom: -0.5,  // Zeal decreases Gloom
            wrath: 0.2,   // Zeal slightly increases Wrath (passion → anger)
            skeptic: -0.3, // Zeal decreases Skeptic
            jitters: -0.4  // Zeal decreases Jitters
        },
        gloom: {
            zeal: -0.5,    // Gloom decreases Zeal
            wrath: -0.2,   // Gloom slightly decreases Wrath
            skeptic: 0.2,  // Gloom slightly increases Skeptic
            jitters: 0.3   // Gloom increases Jitters
        },
        wrath: {
            zeal: -0.1,    // Wrath slightly decreases Zeal
            gloom: 0.3,    // Wrath increases Gloom
            skeptic: 0.3,  // Wrath increases Skeptic
            jitters: 0.1   // Wrath slightly increases Jitters
        },
        skeptic: {
            zeal: -0.4,    // Skeptic decreases Zeal
            gloom: 0.2,    // Skeptic increases Gloom
            wrath: 0.2,    // Skeptic increases Wrath
            jitters: 0.3   // Skeptic increases Jitters
        },
        jitters: {
            zeal: -0.3,    // Jitters decreases Zeal
            gloom: 0.3,    // Jitters increases Gloom
            wrath: 0.3,    // Jitters increases Wrath
            skeptic: 0.2   // Jitters increases Skeptic
        }
    },
    
    // LLM (Language Learning Model) conversation settings
    llm: {
        maxConversationHistory: 10,
        systemMessageTemplate: "You are the emotion '{emotion}' in a person's brain. " +
            "Your personality is: {personality}. " +
            "{description} " +
            "Always respond in-character as this emotion, with the perspective and biases that would come with it. " +
            "Keep responses concise (2-3 sentences maximum)."
    }
};

