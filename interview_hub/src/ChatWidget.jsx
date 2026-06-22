const sendMessage = async () => {
  if (!input.trim()) return;
  
  const userMsg = { role: 'user', content: input };
  setMessages(prev => [...prev, userMsg]);
  setInput('');
  setIsLoading(true);

  try {
    const res = await axios.post(API_URL, { message: input });
    const reply = res.data.answer || res.data.reply || 'Sorry, I could not process that.';
    const botMsg = { role: 'assistant', content: reply };
    setMessages(prev => [...prev, botMsg]);
  } catch (err) {
    console.error('Chat error:', err.response?.data || err.message);
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: '⚠️ Sorry, I\'m having trouble connecting. Please try again later.' 
    }]);
  } finally {
    setIsLoading(false);
  }
};