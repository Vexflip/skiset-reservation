import Image from "next/image";

interface BrandLogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export default function BrandLogo({ className = "", size = 'md' }: BrandLogoProps) {
    // Size classes mapping
    const textSize = size === 'sm' ? 'text-2xl' : size === 'md' ? 'text-4xl' : 'text-6xl';
    const xSize = size === 'sm' ? 'text-sm' : size === 'md' ? 'text-lg' : 'text-2xl';
    const logoWidth = size === 'sm' ? 80 : size === 'md' ? 120 : 160;
    const logoHeight = size === 'sm' ? 25 : size === 'md' ? 40 : 50;

    return (
        <div className={`flex items-center gap-4 ${className}`}>
            {/* RELIEF . */}
            <h1 className={`${textSize} font-black text-white tracking-tighter drop-shadow-lg`}>
                RELIEF
                <span className="text-blue-400">.</span>
            </h1>

            {/* x */}
            <span className={`${xSize} text-white font-bold opacity-80 hidden md:inline`}>x</span>

            {/* Skiset Logo */}
            <div className="hidden md:block bg-white px-2 py-1 rounded-lg shadow-lg transform rotate-[-2deg] hover:rotate-0 transition-transform duration-300">
                <Image
                    src="/skiset_logo.webp"
                    alt="Skiset"
                    width={logoWidth}
                    height={logoHeight}
                    className="h-auto w-auto object-contain"
                    style={{ maxHeight: size === 'sm' ? '24px' : size === 'md' ? '36px' : '48px' }}
                />
            </div>
        </div>
    );
}
