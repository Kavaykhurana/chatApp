const TypingIndicator = ({ userName }) => (
  <div className="typing-indicator">
    <span className="typing-dots" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
    <span>{userName} is typing...</span>
  </div>
);

export default TypingIndicator;
