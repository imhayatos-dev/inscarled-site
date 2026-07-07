export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <img
          src="/inscarled-logo.png"
          alt="inScarled"
          className="hero-logo"
        />
      </div>

      <div className="scroll-indicator">
        <span>SCROLL</span>
        <div className="arrow">↓</div>
      </div>
    </section>
  );
}