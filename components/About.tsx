export default function About() {
  return (
    <section
      id="about"
      className="content-section"
      aria-labelledby="about-heading"
    >
      <h2 id="about-heading">ABOUT</h2>

      <div className="about-container">
        <img
          src="/inscarled-logo.png"
          alt="inScarled（インスカーレッド）公式ロゴ"
          className="about-image"
        />

        <div className="about-text">
          <p>
            心に刻まれた傷跡は、消えることなく生き続ける。
            <br />
            <br />
            inScarled（インスカーレッド）は、
            青森を拠点に活動するオルタナティブロックバンド。
            <br />
            その痛みや葛藤をありのまま抱きしめながら
            <br />
            音楽へと変えていく。
            <br />
            <br />
            静寂と激情が交差するサウンド、
            <br />
            等身大の言葉で紡がれるメッセージを通して、
            <br />
            誰かの孤独にそっと寄り添う。
            <br />
            <br />
            傷から生まれる叫びが、
            <br />
            明日を照らす光になることを信じて。
          </p>
        </div>
      </div>
    </section>
  );
}