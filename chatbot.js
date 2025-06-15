// Pawfect Pals Chatbot - Standalone Implementation
class PawfectChatbot {
    constructor() {
      this.chatOpen = false;
      this.messages = [];
      this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.isTyping = false;
      this.showNotification = true;
      this.isMobile = window.innerWidth < 768;
      
      // API endpoint - update this to match your server
      this.apiEndpoint = window.location.origin;
      
      this.init();
    }
  
    init() {
      this.injectStyles();
      this.createChatWidget();
      this.setupEventListeners();
      this.createSession();
      
      // Show tooltip after 2 seconds
      setTimeout(() => {
        this.showTooltip();
      }, 2000);
    }
  
    injectStyles() {
      const styles = `
        .pawfect-chatbot * {
          box-sizing: border-box;
        }
        
        .pawfect-chat-button {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 64px;
          height: 64px;
          background: #7b5cb7;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(123, 92, 183, 0.3);
          z-index: 1000;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .pawfect-chat-button:hover {
          background: #5d4496;
          transform: scale(1.1);
        }
        
        .pawfect-chat-button svg {
          width: 24px;
          height: 24px;
          fill: white;
        }
        
        .pawfect-notification-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 24px;
          height: 24px;
          background: #ef4444;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: bold;
          animation: bounce 1s infinite;
        }
        
        .pawfect-pulse-ring {
          position: absolute;
          inset: 0;
          background: #7b5cb7;
          border-radius: 50%;
          animation: pulse-ring 2s infinite;
        }
        
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.3; }
          100% { transform: scale(0.8); opacity: 1; }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        
        .pawfect-tooltip {
          position: absolute;
          bottom: 80px;
          right: 0;
          background: white;
          padding: 12px 16px;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          white-space: nowrap;
          font-family: system-ui, sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #2d2d2d;
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.3s ease;
          pointer-events: none;
        }
        
        .pawfect-tooltip.show {
          opacity: 1;
          transform: translateY(0);
        }
        
        .pawfect-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          right: 16px;
          border: 6px solid transparent;
          border-top-color: white;
        }
        
        .pawfect-chat-window {
          position: fixed;
          bottom: 100px;
          right: 24px;
          width: 384px;
          height: 512px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          z-index: 999;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.3s ease;
          pointer-events: none;
        }
        
        .pawfect-chat-window.open {
          opacity: 1;
          transform: translateY(0);
          pointer-events: all;
        }
        
        @media (max-width: 768px) {
          .pawfect-chat-window {
            position: fixed;
            inset: 0;
            width: 100%;
            height: 100%;
            border-radius: 0;
            bottom: 0;
            right: 0;
            transform: translateX(100%);
          }
          
          .pawfect-chat-window.open {
            transform: translateX(0);
          }
        }
        
        .pawfect-chat-header {
          background: linear-gradient(135deg, #7b5cb7, #5d4496);
          color: white;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .pawfect-chat-header-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .pawfect-bot-avatar {
          width: 40px;
          height: 40px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .pawfect-bot-avatar svg {
          width: 20px;
          height: 20px;
          fill: #7b5cb7;
        }
        
        .pawfect-chat-title {
          font-weight: bold;
          font-size: 14px;
          margin: 0;
        }
        
        .pawfect-online-status {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          opacity: 0.9;
        }
        
        .pawfect-online-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
        }
        
        .pawfect-close-btn {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          transition: background 0.2s ease;
        }
        
        .pawfect-close-btn:hover {
          background: rgba(255,255,255,0.2);
        }
        
        .pawfect-close-btn svg {
          width: 16px;
          height: 16px;
          fill: currentColor;
        }
        
        .pawfect-chat-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          background: #f9fafb;
          max-height: 320px;
        }
        
        .pawfect-message {
          margin-bottom: 16px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          animation: fadeInMessage 0.3s ease;
        }
        
        @keyframes fadeInMessage {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .pawfect-message.user {
          flex-direction: row-reverse;
        }
        
        .pawfect-message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .pawfect-message-avatar.bot {
          background: #d8c3ff;
        }
        
        .pawfect-message-avatar.user {
          background: #7b5cb7;
        }
        
        .pawfect-message-avatar svg {
          width: 16px;
          height: 16px;
        }
        
        .pawfect-message-avatar.bot svg {
          fill: #7b5cb7;
        }
        
        .pawfect-message-avatar.user svg {
          fill: white;
        }
        
        .pawfect-message-content {
          background: white;
          padding: 12px 16px;
          border-radius: 16px;
          max-width: 240px;
          font-size: 14px;
          line-height: 1.4;
          color: #2d2d2d;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .pawfect-message.user .pawfect-message-content {
          background: #7b5cb7;
          color: white;
          border-radius: 16px 16px 4px 16px;
        }
        
        .pawfect-message.bot .pawfect-message-content {
          border-radius: 4px 16px 16px 16px;
        }
        
        .pawfect-quick-actions {
          padding: 12px 16px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        
        .pawfect-quick-btn {
          background: #d8c3ff;
          border: none;
          padding: 8px 12px;
          border-radius: 20px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #2d2d2d;
          font-weight: 500;
        }
        
        .pawfect-quick-btn:hover {
          background: #7b5cb7;
          color: white;
        }
        
        .pawfect-typing-indicator {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 12px 16px;
          background: white;
          border-radius: 4px 16px 16px 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          max-width: 80px;
        }
        
        .pawfect-typing-dot {
          width: 8px;
          height: 8px;
          background: #9ca3af;
          border-radius: 50%;
          animation: typing 1.5s infinite;
        }
        
        .pawfect-typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .pawfect-typing-dot:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-8px); }
        }
        
        .pawfect-chat-input {
          padding: 16px;
          border-top: 1px solid #e5e7eb;
          background: white;
        }
        
        .pawfect-input-container {
          display: flex;
          gap: 8px;
        }
        
        .pawfect-input {
          flex: 1;
          border: 1px solid #d1d5db;
          border-radius: 24px;
          padding: 12px 16px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s ease;
        }
        
        .pawfect-input:focus {
          border-color: #7b5cb7;
        }
        
        .pawfect-send-btn {
          background: #7b5cb7;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s ease;
        }
        
        .pawfect-send-btn:hover {
          background: #5d4496;
        }
        
        .pawfect-send-btn svg {
          width: 16px;
          height: 16px;
          fill: white;
        }
        
        .pawfect-quick-contact {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }
        
        .pawfect-contact-btn {
          background: #f3f4f6;
          border: none;
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #2d2d2d;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .pawfect-contact-btn:hover {
          background: #d8c3ff;
        }
        
        .pawfect-contact-btn svg {
          width: 12px;
          height: 12px;
          fill: currentColor;
        }
      `;
  
      const styleSheet = document.createElement('style');
      styleSheet.textContent = styles;
      document.head.appendChild(styleSheet);
    }
  
    createChatWidget() {
      const container = document.createElement('div');
      container.className = 'pawfect-chatbot';
      container.innerHTML = `
        <!-- Chat Button -->
        <div class="pawfect-chat-button" id="pawfect-chat-button">
          <div class="pawfect-pulse-ring"></div>
          <svg viewBox="0 0 24 24" id="pawfect-chat-icon">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
          </svg>
          <svg viewBox="0 0 24 24" id="pawfect-close-icon" style="display: none;">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
          <div class="pawfect-notification-badge" id="pawfect-notification" style="display: ${this.showNotification ? 'flex' : 'none'};">!</div>
        </div>
  
        <!-- Tooltip -->
        <div class="pawfect-tooltip" id="pawfect-tooltip">
          Need help? Ask me anything!
        </div>
  
        <!-- Chat Window -->
        <div class="pawfect-chat-window" id="pawfect-chat-window">
          <!-- Header -->
          <div class="pawfect-chat-header">
            <div class="pawfect-chat-header-info">
              <div class="pawfect-bot-avatar">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L13.5 2.5L15.17 4.17L13.24 6.1C12.46 5.85 11.61 5.85 10.76 6.1L8.83 4.17L10.5 2.5L9 1L3 7V9L4.6 10.6L2 22L4 22L6.18 15.43L8 17.25V22H10V16L8 14L6.82 8.93L8.07 7.68C9.89 6.84 14.11 6.84 15.93 7.68L17.18 8.93L16 14L14 16V22H16V17.25L17.82 15.43L20 22L22 22L19.4 10.6L21 9Z"/>
                </svg>
              </div>
              <div>
                <h3 class="pawfect-chat-title">Pawfect Assistant</h3>
                <div class="pawfect-online-status">
                  <div class="pawfect-online-dot"></div>
                  <span>Online</span>
                </div>
              </div>
            </div>
            <button class="pawfect-close-btn" id="pawfect-close-chat">
              <svg viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
  
          <!-- Messages -->
          <div class="pawfect-chat-messages" id="pawfect-messages">
            <!-- Welcome Message -->
            <div class="pawfect-message bot">
              <div class="pawfect-message-avatar bot">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L13.5 2.5L15.17 4.17L13.24 6.1C12.46 5.85 11.61 5.85 10.76 6.1L8.83 4.17L10.5 2.5L9 1L3 7V9L4.6 10.6L2 22L4 22L6.18 15.43L8 17.25V22H10V16L8 14L6.82 8.93L8.07 7.68C9.89 6.84 14.11 6.84 15.93 7.68L17.18 8.93L16 14L14 16V22H16V17.25L17.82 15.43L20 22L22 22L19.4 10.6L21 9Z"/>
                </svg>
              </div>
              <div class="pawfect-message-content">
                Hi! I'm your Pawfect Pals assistant. I can help you with information about our pets, adoption process, services, and store!
              </div>
            </div>
  
            <!-- Quick Actions -->
            <div class="pawfect-quick-actions">
              <button class="pawfect-quick-btn" onclick="pawfectBot.sendQuickMessage('Tell me about available dogs')">🐕 Available Dogs</button>
              <button class="pawfect-quick-btn" onclick="pawfectBot.sendQuickMessage('What is the adoption process?')">📋 Adoption Process</button>
              <button class="pawfect-quick-btn" onclick="pawfectBot.sendQuickMessage('What services do you offer?')">✂️ Services</button>
              <button class="pawfect-quick-btn" onclick="pawfectBot.sendQuickMessage('Show me pet food options')">🥘 Pet Store</button>
            </div>
          </div>
  
          <!-- Input -->
          <div class="pawfect-chat-input">
            <div class="pawfect-input-container">
              <input type="text" class="pawfect-input" id="pawfect-input" placeholder="Ask about pets, adoption, services...">
              <button class="pawfect-send-btn" id="pawfect-send">
                <svg viewBox="0 0 24 24">
                  <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
                </svg>
              </button>
            </div>
            <div class="pawfect-quick-contact">
              <button class="pawfect-contact-btn" onclick="pawfectBot.sendQuickMessage('Book appointment')">
                <svg viewBox="0 0 24 24"><path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z"/></svg>
                Book Appointment
              </button>
              <button class="pawfect-contact-btn" onclick="pawfectBot.sendQuickMessage('Contact info')">
                <svg viewBox="0 0 24 24"><path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"/></svg>
                Contact
              </button>
            </div>
          </div>
        </div>
      `;
  
      document.body.appendChild(container);
    }
  
    setupEventListeners() {
      const button = document.getElementById('pawfect-chat-button');
      const closeBtn = document.getElementById('pawfect-close-chat');
      const sendBtn = document.getElementById('pawfect-send');
      const input = document.getElementById('pawfect-input');
  
      button.addEventListener('click', () => this.toggleChat());
      closeBtn.addEventListener('click', () => this.toggleChat());
      sendBtn.addEventListener('click', () => this.sendMessage());
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.sendMessage();
      });
    }
  
    showTooltip() {
      const tooltip = document.getElementById('pawfect-tooltip');
      if (!this.chatOpen) {
        tooltip.classList.add('show');
        setTimeout(() => {
          tooltip.classList.remove('show');
        }, 3000);
      }
    }
  
    toggleChat() {
      this.chatOpen = !this.chatOpen;
      const window = document.getElementById('pawfect-chat-window');
      const chatIcon = document.getElementById('pawfect-chat-icon');
      const closeIcon = document.getElementById('pawfect-close-icon');
      const notification = document.getElementById('pawfect-notification');
  
      if (this.chatOpen) {
        window.classList.add('open');
        chatIcon.style.display = 'none';
        closeIcon.style.display = 'block';
        notification.style.display = 'none';
        this.showNotification = false;
      } else {
        window.classList.remove('open');
        chatIcon.style.display = 'block';
        closeIcon.style.display = 'none';
      }
    }
  
    async createSession() {
      try {
        const response = await fetch(`${this.apiEndpoint}/api/chat/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: this.sessionId })
        });
        if (!response.ok) console.warn('Failed to create chat session');
      } catch (error) {
        console.warn('Chat session creation failed:', error);
      }
    }
  
    async sendMessage(content = null) {
      const input = document.getElementById('pawfect-input');
      const messageContent = content || input.value.trim();
      
      if (!messageContent) return;
  
      this.addMessage(messageContent, 'user');
      input.value = '';
      this.showTyping();
  
      try {
        const response = await fetch(`${this.apiEndpoint}/api/chat/${this.sessionId}/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: messageContent })
        });
  
        if (response.ok) {
          const data = await response.json();
          this.hideTyping();
          this.addMessage(data.assistantMessage.content, 'bot');
        } else {
          throw new Error('API request failed');
        }
      } catch (error) {
        this.hideTyping();
        this.addMessage(this.getFallbackResponse(messageContent), 'bot');
      }
    }
  
    sendQuickMessage(message) {
      this.sendMessage(message);
    }
  
    addMessage(content, role) {
      const messagesContainer = document.getElementById('pawfect-messages');
      const messageDiv = document.createElement('div');
      messageDiv.className = `pawfect-message ${role}`;
      
      const avatarSvg = role === 'bot' 
        ? '<svg viewBox="0 0 24 24"><path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L13.5 2.5L15.17 4.17L13.24 6.1C12.46 5.85 11.61 5.85 10.76 6.1L8.83 4.17L10.5 2.5L9 1L3 7V9L4.6 10.6L2 22L4 22L6.18 15.43L8 17.25V22H10V16L8 14L6.82 8.93L8.07 7.68C9.89 6.84 14.11 6.84 15.93 7.68L17.18 8.93L16 14L14 16V22H16V17.25L17.82 15.43L20 22L22 22L19.4 10.6L21 9Z"/></svg>'
        : '<svg viewBox="0 0 24 24"><path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/></svg>';
  
      messageDiv.innerHTML = `
        <div class="pawfect-message-avatar ${role}">
          ${avatarSvg}
        </div>
        <div class="pawfect-message-content">
          ${content}
        </div>
      `;
  
      messagesContainer.appendChild(messageDiv);
      this.scrollToBottom();
    }
  
    showTyping() {
      const messagesContainer = document.getElementById('pawfect-messages');
      const typingDiv = document.createElement('div');
      typingDiv.className = 'pawfect-message bot';
      typingDiv.id = 'pawfect-typing';
      typingDiv.innerHTML = `
        <div class="pawfect-message-avatar bot">
          <svg viewBox="0 0 24 24"><path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L13.5 2.5L15.17 4.17L13.24 6.1C12.46 5.85 11.61 5.85 10.76 6.1L8.83 4.17L10.5 2.5L9 1L3 7V9L4.6 10.6L2 22L4 22L6.18 15.43L8 17.25V22H10V16L8 14L6.82 8.93L8.07 7.68C9.89 6.84 14.11 6.84 15.93 7.68L17.18 8.93L16 14L14 16V22H16V17.25L17.82 15.43L20 22L22 22L19.4 10.6L21 9Z"/></svg>
        </div>
        <div class="pawfect-typing-indicator">
          <div class="pawfect-typing-dot"></div>
          <div class="pawfect-typing-dot"></div>
          <div class="pawfect-typing-dot"></div>
        </div>
      `;
      messagesContainer.appendChild(typingDiv);
      this.scrollToBottom();
    }
  
    hideTyping() {
      const typing = document.getElementById('pawfect-typing');
      if (typing) typing.remove();
    }
  
    scrollToBottom() {
      const messagesContainer = document.getElementById('pawfect-messages');
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  
    getFallbackResponse(message) {
      const msg = message.toLowerCase();
      
      if (msg.includes('dog') || msg.includes('puppy')) {
        return "🐕 We have amazing dogs available for adoption! Our current breeds include Golden Retrievers, French Bulldogs, Pugs, and Beagles. Each dog is health-checked, vaccinated, and ready for their forever home. Would you like to know more about a specific breed?";
      }
      if (msg.includes('cat') || msg.includes('kitten')) {
        return "🐱 Our cats are wonderful companions! We have Persian cats, Siamese, Maine Coons, Bengals, and Ragdolls available. All cats are spayed/neutered, vaccinated, and socialized.";
      }
      if (msg.includes('adoption') || msg.includes('adopt')) {
        return "📋 Our adoption process is simple: 1) Browse our available pets, 2) Submit an adoption application, 3) Meet & greet with your chosen pet, 4) Finalize adoption with paperwork. We ensure perfect matches!";
      }
      if (msg.includes('service') || msg.includes('grooming')) {
        return "✂️ We offer comprehensive pet services: Professional grooming, veterinary services, pet boarding & daycare, training classes, and microchipping services.";
      }
      if (msg.includes('food') || msg.includes('store')) {
        return "🥘 Our store carries premium pet foods including Royal Canin, Hill's Science Diet, Blue Buffalo, and Purina Pro Plan. We also have pet accessories, toys, and supplies.";
      }
      if (msg.includes('contact') || msg.includes('phone')) {
        return "📞 Visit us at 123 Pet Haven Lane, Lavender Valley. Hours: Mon-Fri 9am-7pm, Sat 10am-6pm, Sun 11am-4pm. Call us at (123) 456-7890 or email info@pawfectpals.com";
      }
      if (msg.includes('appointment') || msg.includes('book')) {
        return "📅 To book an appointment for grooming, veterinary services, or pet boarding, please call us at (123) 456-7890 or visit us during business hours.";
      }
      if (msg.includes('bird') || msg.includes('parrot')) {
        return "🦜 We have beautiful birds available! Our species include African Grey Parrots, Budgerigars, Cockatiels, Amazon Parrots, and more.";
      }
      if (msg.includes('fish') || msg.includes('aquarium')) {
        return "🐠 Our aquatic friends include Betta fish, Guppies, Neon Tetras, Goldfish, and Angelfish. We also carry all aquarium supplies you need.";
      }
      
      return `I'm here to help with information about our pets, adoption process, services, and store! Here's what I can tell you:
  
  🐕 **Available Pets**: Dogs, Cats, Birds, and Fish ready for adoption
  📋 **Adoption Process**: Simple 4-step process
  ✂️ **Services**: Grooming, veterinary care, boarding, and training
  🥘 **Store**: Premium pet foods and accessories
  
  For immediate assistance, call us at (123) 456-7890. What would you like to know more about?`;
    }
  }
  
  // Initialize the chatbot when the page loads
  let pawfectBot;
  document.addEventListener('DOMContentLoaded', () => {
    pawfectBot = new PawfectChatbot();
  });


  