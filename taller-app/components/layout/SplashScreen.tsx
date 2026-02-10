'use client';

export default function SplashScreen() {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black overflow-hidden">

            {/* FOTO */}
            <div className="w-28 h-28 rounded-full overflow-hidden border border-white/20 shadow-xl">
                <img
                    src="/splash/miguel.png"
                    alt="Miguel Merino"
                    className="w-full h-full object-cover"
                />
            </div>
            <h1 className="splash-text">
                Miguel Merino
            </h1>

            <style jsx>{`
        .splash-text {
          position: relative;
          font-size: 2rem;
          font-weight: 600;
          letter-spacing: 0.15em;
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
