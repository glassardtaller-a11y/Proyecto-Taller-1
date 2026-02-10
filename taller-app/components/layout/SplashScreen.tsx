'use client';

export default function SplashScreen() {
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black overflow-hidden">

            <img
                src="/splash/miguel.png"
                alt="Miguel Merino"
                className="w-48 max-w-[70vw] mb-8 object-contain"
            />

            <h1 className="splash-text">
                Miguel Merino
            </h1>

            <style jsx>{`
        .splash-text {
          position: relative;
          font-size: 2.2rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          color: #ffffff;
          text-transform: uppercase;
        }

        .splash-text::after {
          content: '';
          position: absolute;
          top: 0;
          left: -150%;
          width: 150%;
          height: 100%;
          background: linear-gradient(
            120deg,
            transparent 0%,
            rgba(255,255,255,0.2) 30%,
            rgba(255,255,255,0.8) 50%,
            rgba(255,255,255,0.2) 70%,
            transparent 100%
          );
          animation: shine 1.4s ease-in-out forwards;
        }

        @keyframes shine {
          to {
            left: 150%;
          }
        }
      `}</style>

        </div>
    );
}
