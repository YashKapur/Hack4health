// Chat state
let conversationHistory = [];
let currentAnalysis = null;

// Initialize particles
function createParticles() {
    const particles = document.querySelector('.particles');
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.width = Math.random() * 10 + 5 + 'px';
        particle.style.height = particle.style.width;
        particle.style.animationDelay = Math.random() * 6 + 's';
        particles.appendChild(particle);
    }
}

// Send message function
function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (message) {
        addMessage(message, 'user');
        input.value = '';
        
        // Show typing indicator
        showTypingIndicator();
        
        // Here you would integrate with your LLM model
        // For now, we'll simulate a response
        setTimeout(() => {
            simulateBotResponse(message);
        }, 1500);
    }
}

// Handle enter key
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Send suggestion
function sendSuggestion(suggestion) {
    addMessage(suggestion, 'user');
    showTypingIndicator();
    setTimeout(() => {
        simulateBotResponse(suggestion);
    }, 1500);
}

// Add message to chat
function addMessage(message, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const avatar = document.createElement('div');
    avatar.className = `message-avatar ${sender === 'user' ? 'user-avatar' : 'bot-avatar'}`;
    avatar.textContent = sender === 'user' ? '👤' : '🤖';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.innerHTML = message;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    messagesContainer.appendChild(messageDiv);
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Add to conversation history
    conversationHistory.push({ sender, message, timestamp: new Date() });
}

// Show typing indicator
function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message typing-message';
    typingDiv.id = 'typingIndicator';
    
    typingDiv.innerHTML = `
        <div class="message-avatar bot-avatar">🤖</div>
        <div class="message-content">
            <div class="typing-indicator">
                <span>MediBot is analyzing...</span>
                <div class="typing-dots">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>
        </div>
    `;
    
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Simulate bot response (replace this with your LLM integration)
function simulateBotResponse(userMessage) {
    removeTypingIndicator();
    
    // This is where you would call your LLM model
    // For demonstration, we'll show a template response
    const response = `
        <p><strong>🔍 Analyzing your symptoms...</strong></p>
        <p>I've received your message: "${userMessage}"</p>
        <p><strong>📋 Next Steps:</strong></p>
        <ul>
            <li>Processing symptoms with advanced AI model</li>
            <li>Analyzing medical database</li>
            <li>Generating specialist recommendations</li>
        </ul>
        <p><strong>⚠️ Note:</strong> This analysis is for informational purposes only. Please consult a healthcare professional for medical advice.</p>
    `;
    
    addMessage(response, 'bot');
    
    // Show PDF button after getting a response
    document.getElementById('pdfButton').style.display = 'block';
    
    // Store current analysis for PDF generation
    currentAnalysis = {
        userMessage,
        timestamp: new Date(),
        // Add your LLM response data here
        symptoms: ['Example symptom 1', 'Example symptom 2'],
        diseases: ['Example condition 1', 'Example condition 2'],
        specialists: ['Example specialist 1', 'Example specialist 2']
    };
}

// Generate PDF report
function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('MEDICAL SYMPTOM ANALYSIS REPORT', 105, 20, { align: 'center' });
    
    // Subtitle
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('Generated by MediBot AI', 105, 30, { align: 'center' });
    
    // Date
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 45);
    doc.text(`Time: ${new Date().toLocaleTimeString()}`, 20, 55);
    
    // Patient Input
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('PATIENT INPUT:', 20, 70);
    
    doc.setFontSize(12);
    let yPosition = 80;
    
    if (currentAnalysis && currentAnalysis.userMessage) {
        const splitText = doc.splitTextToSize(currentAnalysis.userMessage, 170);
        doc.text(splitText, 20, yPosition);
        yPosition += splitText.length * 7 + 10;
    }
    
    // Symptoms section (replace with your LLM data)
    doc.setFontSize(14);
    doc.text('IDENTIFIED SYMPTOMS:', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    if (currentAnalysis && currentAnalysis.symptoms) {
        currentAnalysis.symptoms.forEach((symptom, index) => {
            doc.text(`• ${symptom}`, 25, yPosition);
            yPosition += 10;
        });
    } else {
        doc.text('• To be populated by your LLM model', 25, yPosition);
        yPosition += 10;
    }
    
    // Predicted diseases section (replace with your LLM data)
    yPosition += 10;
    doc.setFontSize(14);
    doc.text('POSSIBLE CONDITIONS:', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    if (currentAnalysis && currentAnalysis.diseases) {
        currentAnalysis.diseases.forEach((disease, index) => {
            doc.text(`${index + 1}. ${disease}`, 25, yPosition);
            yPosition += 10;
        });
    } else {
        doc.text('1. To be populated by your LLM model', 25, yPosition);
        yPosition += 10;
    }
    
    // Specialists section (replace with your LLM data)
    yPosition += 10;
    doc.setFontSize(14);
    doc.text('RECOMMENDED SPECIALISTS:', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    if (currentAnalysis && currentAnalysis.specialists) {
        currentAnalysis.specialists.forEach((specialist, index) => {
            doc.text(`• ${specialist}`, 25, yPosition);
            yPosition += 10;
        });
    } else {
        doc.text('• To be populated by your LLM model', 25, yPosition);
        yPosition += 10;
    }
    
    // Conversation History
    yPosition += 20;
    doc.setFontSize(14);
    doc.text('CONVERSATION SUMMARY:', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    conversationHistory.forEach((entry, index) => {
        if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
        }
        
        const role = entry.sender === 'user' ? 'Patient' : 'MediBot AI';
        doc.text(`${role}: ${entry.message.replace(/<[^>]*>/g, '')}`, 20, yPosition);
        yPosition += 7;
    });
    
    // Add new page if needed for disclaimer
    if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
    }
    
    // Disclaimer
    yPosition += 20;
    doc.setFontSize(10);
    doc.setTextColor(200, 0, 0);
    doc.text('DISCLAIMER:', 20, yPosition);
    yPosition += 10;
    doc.setTextColor(100, 100, 100);
    const disclaimer = 'This report is generated by AI for informational purposes only. It should not replace professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider for medical concerns.';
    const splitDisclaimer = doc.splitTextToSize(disclaimer, 170);
    doc.text(splitDisclaimer, 20, yPosition);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Generated by MediBot AI - Your Virtual Health Assistant', 105, 280, { align: 'center' });
    
      // Save the PDF
    doc.save('Medical_Report_' + new Date().toISOString().split('T')[0] + '.pdf');
}

// Add download report button functionality
function addDownloadButton() {
    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = '📄 Download Report';
    downloadBtn.className = 'download-btn';
    downloadBtn.onclick = generatePDF;
    
    const chatContainer = document.querySelector('.chat-container');
    chatContainer.appendChild(downloadBtn);
}

// Initialize the download button when page loads
document.addEventListener('DOMContentLoaded', function() {
    addDownloadButton();
}); 
