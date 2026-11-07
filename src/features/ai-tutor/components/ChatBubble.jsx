import React from 'react';

const ChatBubble = ({ message, sender }) => {
  return (
    <div className={`p-4 rounded-2xl ${sender === 'ai' ? 'bg-indigo-100' : 'bg-slate-100'}`}>
      <p className="text-sm">{message}</p>
    </div>
  );
};

export default ChatBubble;
