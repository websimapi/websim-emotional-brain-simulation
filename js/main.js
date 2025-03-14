/**
 * Main entry point for the emotional brain simulation
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize core components
    const brain = new Brain();
    const player = new Player(brain);
    const conversationService = new ConversationService();
    
    // Initialize controllers
    const brainController = new BrainController(brain, player);
    const emotionController = new EmotionController(brain, conversationService);
    const uiController = new UIController(brainController, emotionController);
    
    // Set initial active emotion
    emotionController.setActiveEmotion('zeal');
    
    // Start the simulation
    brainController.startSimulation();
    
    // Make components available globally for debugging
    window.brainSim = {
        brain,
        player,
        brainController,
        emotionController,
        uiController
    };
    
    console.log('Emotional Brain Simulation initialized');
});

