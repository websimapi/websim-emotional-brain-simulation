/**
 * Service for managing conversations with emotions via LLM
 */
class ConversationService {
    /**
     * Initialize the conversation service
     */
    constructor() {
        // Initialize any conversation-specific settings
    }

    /**
     * Get a response from the LLM for a specific emotion
     * @param {Emotion} emotion - The emotion to get a response from
     * @param {string} userMessage - The user's message
     * @returns {Promise<string>} Promise resolving to the LLM response
     */
    async getEmotionResponse(emotion, userMessage) {
        try {
            // Create a system message based on the emotion's characteristics
            const systemMessage = this.createSystemMessage(emotion);
            
            // Create conversation history in the format expected by the LLM
            const conversationHistory = this.formatConversationHistory(emotion.getConversationHistory());
            
            // Add the current user message
            conversationHistory.push({
                role: "user",
                content: userMessage
            });
            
            // Get completion from LLM
            const completion = await websim.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: systemMessage
                    },
                    ...conversationHistory
                ]
            });
            
            return completion.content;
        } catch (error) {
            console.error("Error getting LLM response:", error);
            return "I'm having trouble processing that right now. Can you try again?";
        }
    }

    /**
     * Create a system message for the LLM based on emotion characteristics
     * @param {Emotion} emotion - The emotion to create a system message for
     * @returns {string} Formatted system message
     */
    createSystemMessage(emotion) {
        // Start with the template from config
        let message = CONFIG.llm.systemMessageTemplate;
        
        // Replace placeholders with actual emotion data
        message = message.replace('{emotion}', emotion.name);
        message = message.replace('{personality}', emotion.personality);
        message = message.replace('{description}', emotion.description);
        
        // Add additional context based on emotion level
        if (emotion.level > 75) {
            message += ` Currently, you are very intense and strongly expressed.`;
        } else if (emotion.level < 25) {
            message += ` Currently, you are subdued and less influential.`;
        } else {
            message += ` Currently, you are moderately expressed.`;
        }
        
        // Add information about emotion's signature move
        message += ` Your signature move is: ${emotion.signatureMove}.`;
        
        return message;
    }

    /**
     * Format conversation history for the LLM
     * @param {Array} history - Raw conversation history from emotion
     * @returns {Array} Formatted conversation history for LLM
     */
    formatConversationHistory(history) {
        return history.map(msg => ({
            role: msg.role === 'emotion' ? 'assistant' : 'user',
            content: msg.content
        }));
    }
}

