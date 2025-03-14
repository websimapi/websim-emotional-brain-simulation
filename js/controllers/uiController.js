/**
 * Controller for managing the user interface
 */
class UIController {
    /**
     * Initialize the UI controller
     * @param {BrainController} brainController - Controller for the brain
     * @param {EmotionController} emotionController - Controller for emotions
     */
    constructor(brainController, emotionController) {
        this.brainController = brainController;
        this.emotionController = emotionController;
        this.initializeUI();
        this.setupEventListeners();
    }

    /**
     * Initialize the UI components
     */
    initializeUI() {
        // Set up initial UI state
        this.updateEmotionTabs();
        this.setActiveTab('zeal'); // Set default active tab
    }

    /**
     * Set up event listeners for UI elements
     */
    setupEventListeners() {
        // Set up emotion tab buttons
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const emotionId = button.getAttribute('data-emotion');
                this.setActiveTab(emotionId);
                this.emotionController.setActiveEmotion(emotionId);
            });
        });
        
        // Set up send message button
        const sendButton = document.getElementById('send-btn');
        const inputField = document.getElementById('emotion-input');
        
        sendButton.addEventListener('click', () => {
            this.sendMessage();
        });
        
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // Brain regions in SVG as clickable areas
        const brainRegions = document.querySelectorAll('.brain-region');
        brainRegions.forEach(region => {
            const emotionId = region.id.split('-')[1]; // Extract emotion ID from brain-{emotion}
            
            region.addEventListener('click', () => {
                this.setActiveTab(emotionId);
                this.emotionController.setActiveEmotion(emotionId);
            });
        });
        
        // Listen for brain state updates
        document.addEventListener('brainStateUpdated', (e) => {
            this.updateBrainVisualization(e.detail.emotionLevels);
            this.updatePlayerStatus(e.detail.mood, e.detail.dominantEmotion);
        });
        
        // Listen for active emotion changes
        document.addEventListener('activeEmotionChanged', (e) => {
            this.updateConversationDisplay(e.detail.emotionId);
        });
        
        // Listen for new messages
        document.addEventListener('emotionMessageExchanged', (e) => {
            this.updateConversationDisplay(e.detail.emotionId);
        });
        
        // Listen for brain stimulation events
        document.addEventListener('brainStimulusOccurred', (e) => {
            this.displayStimulusEffect(e.detail);
        });
    }

    /**
     * Send a message to the active emotion
     */
    async sendMessage() {
        const inputField = document.getElementById('emotion-input');
        const message = inputField.value.trim();
        
        if (message === '') return;
        
        // Clear input field
        inputField.value = '';
        
        try {
            // Send message to emotion controller
            const response = await this.emotionController.sendMessageToEmotion(message);
            
            // Conversation display is updated via the emotionMessageExchanged event
        } catch (error) {
            console.error('Error sending message:', error);
            this.displayErrorMessage('Failed to send message. Please try again.');
        }
    }

    /**
     * Display an error message in the conversation
     * @param {string} message - Error message to display
     */
    displayErrorMessage(message) {
        const conversationDisplay = document.getElementById('conversation-display');
        const errorElement = document.createElement('div');
        errorElement.className = 'message system-message';
        errorElement.textContent = message;
        conversationDisplay.appendChild(errorElement);
        conversationDisplay.scrollTop = conversationDisplay.scrollHeight;
    }

    /**
     * Set the active emotion tab
     * @param {string} emotionId - ID of the emotion to activate
     */
    setActiveTab(emotionId) {
        // Update tab buttons
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            if (button.getAttribute('data-emotion') === emotionId) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        // Update brain regions
        const brainRegions = document.querySelectorAll('.brain-region');
        brainRegions.forEach(region => {
            const regionEmotionId = region.id.split('-')[1];
            if (regionEmotionId === emotionId) {
                region.classList.add('active');
            } else {
                region.classList.remove('active');
            }
        });
        
        // Update conversation display
        this.updateConversationDisplay(emotionId);
    }

    /**
     * Update the conversation display for a specific emotion
     * @param {string} emotionId - ID of the emotion
     */
    updateConversationDisplay(emotionId) {
        const conversationDisplay = document.getElementById('conversation-display');
        const history = this.emotionController.getConversationHistory(emotionId);
        
        // Clear current display
        conversationDisplay.innerHTML = '';
        
        // Add messages from history
        history.forEach(msg => {
            const messageElement = document.createElement('div');
            messageElement.className = msg.role === 'user' 
                ? 'message user-message'
                : `message emotion-message ${emotionId}-message`;
            messageElement.textContent = msg.content;
            conversationDisplay.appendChild(messageElement);
        });
        
        // Scroll to bottom
        conversationDisplay.scrollTop = conversationDisplay.scrollHeight;
    }

    /**
     * Update the visualization of the brain based on emotion levels
     * @param {Object} emotionLevels - Current levels of all emotions
     */
    updateBrainVisualization(emotionLevels) {
        // Update opacity and size of brain regions based on emotion levels
        for (const [id, level] of Object.entries(emotionLevels)) {
            const brainRegion = document.getElementById(`brain-${id}`);
            if (brainRegion) {
                // Set opacity based on emotion level (50 is baseline)
                const normalizedLevel = level / 100; // Convert to 0-1 scale
                brainRegion.style.opacity = 0.3 + (normalizedLevel * 0.7); // Range from 0.3 to 1.0
                
                // Add pulsing animation for high emotion levels
                if (level > 75) {
                    brainRegion.classList.add('pulsing');
                } else {
                    brainRegion.classList.remove('pulsing');
                }
            }
        }
    }

    /**
     * Update the player status display
     * @param {string} mood - Current mood description
     * @param {string} dominantEmotion - Name of dominant emotion
     */
    updatePlayerStatus(mood, dominantEmotion) {
        const moodIndicator = document.querySelector('.mood-indicator');
        const dominantEmotionElement = document.querySelector('.dominant-emotion');
        
        moodIndicator.textContent = mood;
        dominantEmotionElement.textContent = dominantEmotion;
        
        // Set colors based on mood and dominant emotion
        this.setMoodColor(moodIndicator, mood);
        this.setEmotionColor(dominantEmotionElement, dominantEmotion);
    }

    /**
     * Set the color of the mood indicator based on mood
     * @param {HTMLElement} element - Mood indicator element
     * @param {string} mood - Current mood
     */
    setMoodColor(element, mood) {
        // Set background color based on mood
        if (mood.includes('Elated') || mood.includes('Optimistic')) {
            element.style.backgroundColor = 'rgba(255, 215, 0, 0.2)';
            element.style.color = '#8B6914';
        } else if (mood.includes('Content')) {
            element.style.backgroundColor = 'rgba(144, 238, 144, 0.2)';
            element.style.color = '#006400';
        } else if (mood.includes('Uneasy')) {
            element.style.backgroundColor = 'rgba(211, 211, 211, 0.2)';
            element.style.color = '#696969';
        } else if (mood.includes('Distressed')) {
            element.style.backgroundColor = 'rgba(138, 43, 226, 0.1)';
            element.style.color = '#4B0082';
        } else if (mood.includes('Troubled')) {
            element.style.backgroundColor = 'rgba(0, 0, 205, 0.1)';
            element.style.color = '#00008B';
        } else {
            // Default
            element.style.backgroundColor = '#eee';
            element.style.color = '#333';
        }
    }

    /**
     * Set the color of the dominant emotion indicator
     * @param {HTMLElement} element - Dominant emotion element
     * @param {string} emotion - Name of dominant emotion
     */
    setEmotionColor(element, emotion) {
        switch (emotion) {
            case 'Zeal':
                element.style.backgroundColor = 'rgba(255, 215, 0, 0.2)';
                element.style.color = '#8B6914';
                break;
            case 'Gloom':
                element.style.backgroundColor = 'rgba(0, 0, 205, 0.1)';
                element.style.color = '#00008B';
                break;
            case 'Wrath':
                element.style.backgroundColor = 'rgba(220, 20, 60, 0.1)';
                element.style.color = '#8B0000';
                break;
            case 'Skeptic':
                element.style.backgroundColor = 'rgba(50, 205, 50, 0.1)';
                element.style.color = '#006400';
                break;
            case 'Jitters':
                element.style.backgroundColor = 'rgba(138, 43, 226, 0.1)';
                element.style.color = '#4B0082';
                break;
            default:
                element.style.backgroundColor = '#eee';
                element.style.color = '#333';
        }
    }

    /**
     * Update the emotion tabs to reflect current emotion levels
     */
    updateEmotionTabs() {
        const emotions = this.brainController.getEmotionLevels();
        
        for (const [id, level] of Object.entries(emotions)) {
            const tabButton = document.querySelector(`.tab-btn[data-emotion="${id}"]`);
            if (tabButton) {
                // Visual indicator of emotion level on tab
                const intensity = Math.min(level / 100, 1); // Normalize to 0-1
                tabButton.style.opacity = 0.5 + (intensity * 0.5); // Range from 0.5 to 1.0
            }
        }
    }

    /**
     * Display a notification about internal brain stimulus
     * @param {Object} stimulusDetails - Details about the stimulus
     */
    displayStimulusEffect(stimulusDetails) {
        const conversationDisplay = document.getElementById('conversation-display');
        const activeEmotionId = this.emotionController.getActiveEmotion()?.id;
        const thoughtBubble = document.getElementById('thought-bubble');
        const thoughtContent = document.getElementById('thought-content');
        
        // Only show the stimulus notification if related to active emotion
        if (activeEmotionId && stimulusDetails.emotions.includes(activeEmotionId)) {
            // Create a notification element
            const notificationElement = document.createElement('div');
            notificationElement.className = 'message system-message';
            
            // Build the notification message
            let message = 'Internal thought process: ';
            
            if (stimulusDetails.emotions.length === 1) {
                const emotionId = stimulusDetails.emotions[0];
                const emotionName = this.brainController.brain.getEmotion(emotionId).name;
                message += `${emotionName} is processing internally.`;
            } else {
                const emotionNames = stimulusDetails.emotions.map(id => 
                    this.brainController.brain.getEmotion(id).name
                );
                
                if (emotionNames.length === 2) {
                    message += `${emotionNames[0]} and ${emotionNames[1]} are interacting.`;
                } else {
                    const lastEmotion = emotionNames.pop();
                    message += `${emotionNames.join(', ')} and ${lastEmotion} are interacting.`;
                }
            }
            
            notificationElement.textContent = message;
            conversationDisplay.appendChild(notificationElement);
            conversationDisplay.scrollTop = conversationDisplay.scrollHeight;
        }
        
        // Display the thought conversation in the thought bubble
        if (stimulusDetails.conversation) {
            // Show the thought bubble with conversation
            thoughtBubble.style.display = 'block';
            thoughtContent.innerHTML = '';
            
            // Format the conversation with emotion colors
            const formattedConversation = this.formatEmotionConversation(stimulusDetails);
            thoughtContent.innerHTML = formattedConversation;
            
            // Show the thought bubble for a limited time
            setTimeout(() => {
                thoughtBubble.style.display = 'none';
            }, 10000); // Hide after 10 seconds
            
            // Also update the thought history panel
            this.updateThoughtHistory();
            
            // Add full conversation to active emotion's conversation history as a system message
            if (activeEmotionId && stimulusDetails.emotions.includes(activeEmotionId)) {
                const notificationElement = document.createElement('div');
                notificationElement.className = 'message system-message';
                notificationElement.innerHTML = formattedConversation;
                conversationDisplay.appendChild(notificationElement);
                conversationDisplay.scrollTop = conversationDisplay.scrollHeight;
            }
        }
    }

    /**
     * Format an emotion conversation with colored text for each emotion
     * @param {Object} stimulusDetails - Stimulus details with conversation
     * @returns {string} HTML formatted conversation
     */
    formatEmotionConversation(stimulusDetails) {
        if (!stimulusDetails.conversation) return '';
        
        let formattedText = stimulusDetails.conversation;
        const emotions = this.brainController.brain.getAllEmotions();
        
        // Replace emotion names with colored versions
        for (const emotionId of stimulusDetails.emotions) {
            const emotion = emotions[emotionId];
            const regex = new RegExp(`${emotion.name}:`, 'g');
            formattedText = formattedText.replace(
                regex, 
                `<span style="color:${emotion.color};font-weight:bold;">${emotion.name}:</span>`
            );
        }
        
        // Convert newlines to HTML breaks
        formattedText = formattedText.replace(/\n/g, '<br>');
        
        return formattedText;
    }

    /**
     * Update the thought history panel
     */
    updateThoughtHistory() {
        const thoughtHistoryPanel = document.getElementById('thought-history-panel');
        if (!thoughtHistoryPanel) return;
        
        // Get all thoughts from all emotions
        const thoughtsFromEmotions = [];
        const emotions = this.brainController.brain.getAllEmotions();
        
        for (const id in emotions) {
            const emotion = emotions[id];
            const thoughts = emotion.getThoughtHistory ? emotion.getThoughtHistory() : [];
            thoughtsFromEmotions.push(...thoughts);
        }
        
        // Sort by timestamp (newest first)
        thoughtsFromEmotions.sort((a, b) => b.timestamp - a.timestamp);
        
        // Remove duplicates (same conversation appearing in multiple emotions)
        const uniqueThoughts = [];
        const seenIds = new Set();
        
        thoughtsFromEmotions.forEach(thought => {
            if (!thought) return; // Skip undefined thoughts
            
            // Create a unique ID for the thought based on content and time
            const thoughtId = thought.timestamp.getTime() + 
                (thought.content ? thought.content.substring(0, 20) : '');
            
            if (!seenIds.has(thoughtId)) {
                seenIds.add(thoughtId);
                uniqueThoughts.push(thought);
            }
        });
        
        // Limit to most recent 10 thoughts
        const recentThoughts = uniqueThoughts.slice(0, 10);
        
        // Clear current content
        thoughtHistoryPanel.innerHTML = '';
        
        // Add thoughts to panel
        recentThoughts.forEach(thought => {
            const thoughtElement = document.createElement('div');
            thoughtElement.className = 'thought-item';
            
            // Format timestamp
            const formattedTime = thought.timestamp.toLocaleTimeString();
            
            // Create header with timestamp and participants
            const header = document.createElement('div');
            header.className = 'thought-header';
            
            if (thought.participants) {
                const participantNames = thought.participants.map(id => 
                    `<span style="color:${emotions[id].color}">${emotions[id].name}</span>`
                ).join(', ');
                
                header.innerHTML = `<span class="thought-time">${formattedTime}</span> - 
                                    <span class="thought-participants">${participantNames}</span>`;
            } else {
                header.innerHTML = `<span class="thought-time">${formattedTime}</span>`;
            }
            
            // Create body with conversation content
            const body = document.createElement('div');
            body.className = 'thought-body';
            
            if (thought.type === 'conversation' && thought.content) {
                // Format the conversation with colored names
                let formattedContent = thought.content;
                if (thought.participants) {
                    thought.participants.forEach(id => {
                        const emotion = emotions[id];
                        if (emotion) {
                            const regex = new RegExp(`${emotion.name}:`, 'g');
                            formattedContent = formattedContent.replace(
                                regex, 
                                `<span style="color:${emotion.color};font-weight:bold;">${emotion.name}:</span>`
                            );
                        }
                    });
                }
                
                // Convert newlines to HTML breaks
                formattedContent = formattedContent.replace(/\n/g, '<br>');
                body.innerHTML = formattedContent;
            } else if (thought.content) {
                body.textContent = thought.content;
            } else {
                body.textContent = "No content available";
            }
            
            thoughtElement.appendChild(header);
            thoughtElement.appendChild(body);
            thoughtHistoryPanel.appendChild(thoughtElement);
        });
    }
}