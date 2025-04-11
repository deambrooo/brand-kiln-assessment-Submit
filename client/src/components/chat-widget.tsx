import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, X, Send, User, Bot } from 'lucide-react';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: "Hello! I'm your car assistant. How can I help you today?"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;

    // Add user message
    setMessages(prev => [...prev, { type: 'user', text: inputValue }]);
    
    // Clear input
    const userMessage = inputValue;
    setInputValue('');
    
    // Show typing indicator
    setIsTyping(true);
    
    // Simulate bot response after delay
    setTimeout(() => {
      setIsTyping(false);
      
      // Generate bot response based on user input
      let responseText = "I'm sorry, I don't have information about that. Is there something else I can help you with?";
      
      const lowercaseMsg = userMessage.toLowerCase();
      if (lowercaseMsg.includes('electric') || lowercaseMsg.includes('ev')) {
        responseText = 'We have several electric vehicles available, including the Tesla Model 3, Tesla Model Y, and Ford Mustang Mach-E. Would you like more information about any of these?';
      } else if (lowercaseMsg.includes('suv') || lowercaseMsg.includes('crossover')) {
        responseText = 'We have many SUVs in stock, ranging from compact models like the Honda CR-V to larger ones like the BMW X5. What size and price range are you interested in?';
      } else if (lowercaseMsg.includes('price') || lowercaseMsg.includes('cost') || lowercaseMsg.includes('expensive')) {
        responseText = 'Our vehicles range from around $20,000 for economy cars up to $60,000+ for luxury models. You can use the price filter to narrow down options within your budget.';
      } else if (lowercaseMsg.includes('hello') || lowercaseMsg.includes('hi')) {
        responseText = 'Hello! Welcome to Brand Kiln. How can I assist you with your car search today?';
      } else if (lowercaseMsg.includes('hybrid')) {
        responseText = 'We have several hybrid vehicles like the Toyota Prius, Honda Insight, and Toyota RAV4 Hybrid that offer excellent fuel economy.';
      } else if (lowercaseMsg.includes('sports') || lowercaseMsg.includes('fast')) {
        responseText = 'For sports cars, we have models like the Porsche 911, Ford Mustang, and Chevrolet Camaro with powerful engines and dynamic handling.';
      }
      
      setMessages(prev => [...prev, { type: 'bot', text: responseText }]);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={toggleChat}
        className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center p-0"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </Button>
      
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          <div className="bg-primary p-4 text-white">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Car Assistant</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:text-white/80 h-auto p-1"
                onClick={toggleChat}
              >
                <X size={18} />
              </Button>
            </div>
            <p className="text-xs text-white/80 mt-1">Ask me anything about cars or your search</p>
          </div>
          
          <div className="p-4 h-80 overflow-y-auto">
            {messages.map((message, index) => (
              <div key={index} className={`flex mb-4 ${message.type === 'user' ? 'justify-end' : ''}`}>
                {message.type === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary flex-shrink-0">
                    <Bot size={16} />
                  </div>
                )}
                
                <div className={`${message.type === 'user' 
                  ? 'mr-3 bg-primary text-white' 
                  : 'ml-3 bg-gray-100 dark:bg-gray-700'} rounded-lg py-2 px-3 max-w-[80%]`}>
                  <p className="text-sm">{message.text}</p>
                </div>
                
                {message.type === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-300 flex-shrink-0">
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex mb-4">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary flex-shrink-0">
                  <Bot size={16} />
                </div>
                <div className="ml-3 bg-gray-100 dark:bg-gray-700 rounded-lg py-2 px-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 p-3">
            <form onSubmit={handleSubmit} className="flex">
              <Input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="flex-1 rounded-r-none"
              />
              <Button 
                type="submit" 
                className="rounded-l-none"
              >
                <Send size={18} />
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
