import { FormEvent, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './ChatbotWidget.css';

type ChatRole = 'bot' | 'user';
type ChatIntent = 'setup' | 'support' | 'pricing' | 'general';

type ChatMessage = {
  id: number;
  role: ChatRole;
  text: string;
};

const quickActions: Array<{ intent: ChatIntent; label: string }> = [
  { intent: 'setup', label: 'I am new and need help with setup & design' },
  { intent: 'support', label: 'I am a client and need support' },
  { intent: 'pricing', label: 'I need pricing details' },
];

const intentReplies: Record<ChatIntent, string> = {
  setup:
    'We offer FREE setup design and trial. Share your details below and our onboarding team will contact you shortly.',
  support:
    'Please share your details and support request below. Our team will reach out and resolve this quickly.',
  pricing:
    'You can review all plans on the Pricing page. If you want, submit your details and our team will help you choose the right plan.',
  general:
    'Thanks for your message. Please share your details below so our team can respond accurately.',
};

const ChatbotWidget = () => {
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: 'bot',
      text: 'Hello! Welcome to NETRIK SHOP support. How can we help you today?',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeIntent, setActiveIntent] = useState<ChatIntent>('general');
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  if (location.pathname.startsWith('/menu/')) return null;

  const addMessage = (role: ChatRole, text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + prev.length,
        role,
        text,
      },
    ]);
  };

  const sendBotReply = (intent: ChatIntent) => {
    setIsTyping(true);
    window.setTimeout(() => {
      setIsTyping(false);
      addMessage('bot', intentReplies[intent]);
      setShowLeadForm(true);
    }, 450);
  };

  const handleQuickAction = (intent: ChatIntent, label: string) => {
    setIsOpen(true);
    setIsMinimized(false);
    setActiveIntent(intent);
    addMessage('user', label);
    sendBotReply(intent);
  };

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    const value = chatInput.trim();
    if (!value) return;

    addMessage('user', value);
    setChatInput('');

    const normalized = value.toLowerCase();
    let nextIntent: ChatIntent = 'general';

    if (normalized.includes('price') || normalized.includes('plan')) {
      nextIntent = 'pricing';
    } else if (normalized.includes('support') || normalized.includes('issue') || normalized.includes('problem')) {
      nextIntent = 'support';
    } else if (normalized.includes('setup') || normalized.includes('design') || normalized.includes('new')) {
      nextIntent = 'setup';
    }

    setActiveIntent(nextIntent);
    sendBotReply(nextIntent);
  };

  const handleLeadSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      addMessage('bot', 'Please fill Name, Email, and Message so we can contact you.');
      return;
    }

    addMessage('user', 'I have submitted my contact details.');
    addMessage('bot', 'Thank you! Our team has received your request and will contact you shortly.');

    const subject = encodeURIComponent(`NETRIK SHOP Chat Request - ${activeIntent.toUpperCase()}`);
    const body = encodeURIComponent(
      `Intent: ${activeIntent}\nName: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone || 'N/A'}\nMessage: ${formData.message}`,
    );

    window.open(`mailto:support@netrikshop.com?subject=${subject}&body=${body}`, '_blank');

    setFormData({
      name: '',
      email: '',
      phone: '',
      message: '',
    });
    setShowLeadForm(false);
  };

  const openWhatsApp = () => {
    const waMessage = encodeURIComponent('Hi NETRIK SHOP team, I need help.');
    window.open(`https://wa.me/919000000000?text=${waMessage}`, '_blank');
  };

  return (
    <div className="chatbot-root">
      {!isOpen && (
        <button type="button" className="chatbot-trigger" onClick={() => setIsOpen(true)}>
          Contact Us
        </button>
      )}

      {isOpen && (
        <aside className={isMinimized ? 'chatbot-panel minimized' : 'chatbot-panel'} aria-label="Contact chatbot">
          <header className="chatbot-header">
            <div>
              <p className="chatbot-title">NETRIK SHOP Support</p>
              <p className="chatbot-subtitle">Online now</p>
            </div>
            <div className="chatbot-header-actions">
              <button type="button" onClick={() => setIsMinimized((prev) => !prev)} aria-label="Minimize chat">
                {isMinimized ? '+' : '-'}
              </button>
              <button type="button" onClick={() => setIsOpen(false)} aria-label="Close chat">
                x
              </button>
            </div>
          </header>

          {!isMinimized && (
            <>
              <section className="chatbot-actions">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    className="chatbot-action-btn"
                    onClick={() => handleQuickAction(action.intent, action.label)}
                  >
                    {action.label}
                  </button>
                ))}
              </section>

              <section className="chatbot-messages">
                {messages.map((msg) => (
                  <div key={msg.id} className={msg.role === 'bot' ? 'chat-bubble bot' : 'chat-bubble user'}>
                    {msg.text}
                  </div>
                ))}
                {isTyping && <div className="chat-bubble bot">Typing...</div>}
              </section>

              <div className="chatbot-shortcuts">
                <button type="button" onClick={openWhatsApp}>
                  Continue on WhatsApp
                </button>
                <a href="mailto:support@netrikshop.com">Email Support</a>
              </div>

              {showLeadForm && (
                <form className="chatbot-form" onSubmit={handleLeadSubmit}>
                  <input
                    type="text"
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                  <textarea
                    placeholder="Write your message"
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                  />
                  <button type="submit">Submit Request</button>
                </form>
              )}

              <form className="chatbot-input-row" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Write your message..."
                />
                <button type="submit">Send</button>
              </form>
            </>
          )}
        </aside>
      )}
    </div>
  );
};

export default ChatbotWidget;
