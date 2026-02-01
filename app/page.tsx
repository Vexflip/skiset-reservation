"use client"

import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

export default function Home() {
  // Option 1: Redirect direct to booking
  // redirect('/booking/equipment')

  // Option 2: Nice landing page
  return (
    <div className="min-h-screen relative flex overflow-hidden">
      {/* Left Side - Ski Slope Image (1/3) - Hidden on small screens */}
      <div
        className="hidden lg:block lg:w-1/3 bg-cover bg-center relative animate-fade-in"
        style={{
          backgroundImage: 'url(/ski-slope-bg.jpg)',
          animationDelay: '0.2s',
          opacity: 0,
          animationFillMode: 'forwards'
        }}
      >
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* Right Side - Content (Full width on mobile, 2/3 on desktop) */}
      <div className="w-full lg:w-2/3 relative flex flex-col">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-slate-800 to-slate-900 z-0 text-white overflow-hidden animate-gradient">
          {/* Animated Abstract Shapes */}
          <div className="absolute top-0 left-0 w-full h-full opacity-20">
            <div className="absolute top-[10%] left-[20%] w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-[10%] right-[20%] w-96 h-96 bg-cyan-400 rounded-full blur-3xl animate-float-delayed"></div>
            <div className="absolute top-[50%] left-[50%] w-64 h-64 bg-purple-500 rounded-full blur-3xl animate-float-slow"></div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center flex-grow text-center px-4">
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-2 drop-shadow-lg animate-slide-up">
            RELIEF
            <span className="text-blue-400">.</span>
          </h1>

          <div className="flex flex-col items-center justify-center gap-2 mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <span className="text-lg text-white font-bold">x</span>
            <div className="bg-white px-3 py-1.5 rounded-lg shadow-lg transform rotate-[-2deg] hover:rotate-0 transition-transform duration-300">
              <Image
                src="/skiset_logo.webp"
                alt="Skiset"
                width={120}
                height={40}
                className="h-8 md:h-12 w-auto object-contain"
              />
            </div>
          </div>
          <p className="text-xl text-blue-100 max-w-2xl mb-6 font-light">
            Relief x SKISET from <span className="font-bold text-white">La Norma</span> offering: Premium ski & snowboard equipment rental. Book online and save time on the slopes.
          </p>

          <Link
            href="/booking/equipment"
            className="group relative px-6 py-3 bg-white text-slate-900 text-lg font-bold rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-blue-200 to-transparent translate-x-[-100%] group-hover:animate-shimmer"></div>
            Start Booking
          </Link>
        </div>

        <footer className="relative z-10 py-6 text-center text-blue-300/50 text-sm flex flex-col gap-2">
          <span>© {new Date().getFullYear()} Skiset Reservation</span>
          <div className="flex justify-center gap-4 text-xs">
            <Link href="/privacy" className="hover:text-blue-200 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-blue-200 transition-colors">Terms of Service</Link>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(-40px, 30px) scale(0.9);
          }
          66% {
            transform: translate(25px, -25px) scale(1.1);
          }
        }

        @keyframes float-slow {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-30px, -40px) scale(1.05);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }

        .animate-float {
          animation: float 20s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 18s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow 25s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
