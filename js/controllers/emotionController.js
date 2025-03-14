/**
 * Controller for managing emotion interactions and conversations
 */
class EmotionController {
    /**
     * Initialize the emotion controller
     * @param {Brain} brain - The brain model containing emotions
     * @param {ConversationService} conversationService - Service for handling LLM conversations
     */
    constructor(brain, conversationService) {
        this.brain = brain;
        this.conversationService = conversationService;
        this.activeEmotion = null;
    }

    /**
     * Set the currently active emotion
     * @param {string} emotionId - ID of the emotion to activate
     */
    setActiveEmotion(emotionId) {
        this.activeEmotion = emotionId;
        this.brain.setActiveEmotion(emotionId);
        
        // Dispatch event to notify UI
        const event = new CustomEvent('activeEmotionChanged', {
            detail: {
                emotionId: emotionId,
                emotion: this.brain.getEmotion(emotionId)
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * Get the currently active emotion
     * @returns {Emotion|null} The active emotion or null
     */
    getActiveEmotion() {
        return this.activeEmotion ? this.brain.getEmotion(this.activeEmotion) : null;
    }

    /**
     * Send a message to the active emotion
     * @param {string} message - User message content
     * @returns {Promise<Object>} Promise resolving to the emotion's response
     */
    async sendMessageToEmotion(message) {
        const emotion = this.getActiveEmotion();
        if (!emotion) {
            throw new Error("No active emotion selected");
        }
        
        // Add user message to conversation history
        emotion.addMessage('user', message);
        
        // Process user message to potentially adjust emotion levels
        this.processUserMessage(emotion, message);
        
        // Get response from LLM
        const response = await this.conversationService.getEmotionResponse(
            emotion,
            message
        );
        
        // Add emotion response to conversation history
        emotion.addMessage('emotion', response);
        
        // Process emotion response to potentially adjust emotion levels
        this.processEmotionResponse(emotion, response);
        
        // Dispatch event to notify of message exchange
        const event = new CustomEvent('emotionMessageExchanged', {
            detail: {
                emotionId: emotion.id,
                userMessage: message,
                emotionResponse: response
            }
        });
        document.dispatchEvent(event);
        
        return {
            emotion: emotion.id,
            response: response
        };
    }

    /**
     * Process a user message to affect emotion levels
     * @param {Emotion} emotion - The emotion receiving the message
     * @param {string} message - User message content
     */
    processUserMessage(emotion, message) {
        // Simple sentiment analysis to adjust emotion levels
        const lowerMessage = message.toLowerCase();
        
        // Detect keywords that might affect emotion levels
        // This is a simple implementation - in a real system this could be more sophisticated
        
        // Positive triggers for each emotion
        if (emotion.id === 'zeal') {
            if (lowerMessage.includes('excited') || 
                lowerMessage.includes('happy') || 
                lowerMessage.includes('great') ||
                lowerMessage.includes('awesome')) {
                emotion.adjustLevel(5);
            }
        } else if (emotion.id === 'gloom') {
            if (lowerMessage.includes('sad') || 
                lowerMessage.includes('miss') || 
                lowerMessage.includes('lost') ||
                lowerMessage.includes('sorry')) {
                emotion.adjustLevel(5);
            }
        } else if (emotion.id === 'wrath') {
            if (lowerMessage.includes('angry') || 
                lowerMessage.includes('unfair') || 
                lowerMessage.includes('fight') ||
                lowerMessage.includes('wrong')) {
                emotion.adjustLevel(5);
            }
        } else if (emotion.id === 'skeptic') {
            if (lowerMessage.includes('doubt') || 
                lowerMessage.includes('sure') || 
                lowerMessage.includes('really') ||
                lowerMessage.includes('trust')) {
                emotion.adjustLevel(5);
            }
        } else if (emotion.id === 'jitters') {
            if (lowerMessage.includes('worried') || 
                lowerMessage.includes('scared') || 
                lowerMessage.includes('afraid') ||
                lowerMessage.includes('nervous')) {
                emotion.adjustLevel(5);
            }
        }
        
        // Negative triggers - emotion being asked to calm down or diminish
        if (lowerMessage.includes('calm down') || 
            lowerMessage.includes('relax') || 
            lowerMessage.includes('too much') ||
            lowerMessage.includes('stop')) {
            emotion.adjustLevel(-3);
        }
    }

    /**
     * Process an emotion's response to affect other emotions
     * @param {Emotion} emotion - The emotion that responded
     * @param {string} response - Emotion's response content
     */
    processEmotionResponse(emotion, response) {
        // Based on the intensity of the response, influence other emotions
        const responseLength = response.length;
        const intensityFactor = Math.min(responseLength / 100, 1.5); // Scale based on length, max 1.5
        
        // Apply influence to other emotions based on the active emotion's relationships
        const emotions = this.brain.getAllEmotions();
        
        for (const targetId in emotions) {
            if (targetId !== emotion.id) {
                const relationship = CONFIG.emotionRelationships[emotion.id][targetId];
                if (relationship) {
                    const influenceAmount = relationship * intensityFactor * 3; // Scale the influence
                    emotions[targetId].adjustLevel(influenceAmount);
                }
            }
        }
    }

    /**
     * Get conversation history for a specific emotion
     * @param {string} emotionId - ID of the emotion
     * @returns {Array} Conversation history for the emotion
     */
    getConversationHistory(emotionId) {
        const emotion = this.brain.getEmotion(emotionId);
        return emotion ? emotion.getConversationHistory() : [];
    }
}

