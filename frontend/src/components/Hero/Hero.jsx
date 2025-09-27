import "./Hero.css";

export default function Hero({ onGetStarted = () => {} }) {
  return (
    <div className="hero">
      <h1 className="title">Meet <span className="title-accent">HaRi</span>, Your AI onboarding assistant</h1>
      <p className="text">Seamlessly onboard, train, and support your team with a touch of intelligence.</p>
      <button className="get-started" onClick={onGetStarted}>Get started right now</button>
    </div>
  );
}