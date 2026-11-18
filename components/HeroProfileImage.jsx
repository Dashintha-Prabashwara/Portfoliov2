import Image from 'next/image';

export default function HeroProfileImage() {
  return (
    <div className="relative w-full max-w-[420px] lg:max-w-[460px] aspect-square mx-auto flex items-center justify-center">
      {/* 1. Ambient Background Glow (Pure Circle) */}
      <div
        className="absolute inset-4 bg-gradient-to-tr from-[#D9541E]/20 via-[#D9541E]/10 to-transparent blur-3xl animate-pulse-glow pointer-events-none"
        style={{ borderRadius: '50%' }}
      />

      {/* 2. Radar Sonar Pulse Wave (Pure Circle) */}
      <div
        className="absolute inset-8 border border-[#D9541E]/30 animate-radar-ping pointer-events-none"
        style={{ borderRadius: '50%' }}
      />

      {/* 3. Outer Orbital Ring (Slow Clockwise Circle) */}
      <div
        className="absolute inset-0 border border-dashed border-[#111111]/15 animate-orbit-slow pointer-events-none"
        style={{ borderRadius: '50%' }}
      >
        {/* Orbital Satellite Node 1 (Burnt Orange) */}
        <div
          className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#D9541E] shadow-[0_0_14px_rgba(217,84,30,0.7)]"
          style={{ borderRadius: '50%' }}
        />
        {/* Orbital Satellite Node 2 (Ink Black) */}
        <div
          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#111111] shadow-[0_0_10px_rgba(17,17,17,0.4)]"
          style={{ borderRadius: '50%' }}
        />
      </div>

      {/* 4. Middle Orbital Ring (Counter-Clockwise Circle with Gradient Accents) */}
      <div
        className="absolute inset-8 border border-[#D9541E]/25 border-t-[#D9541E] border-b-[#111111]/40 animate-orbit-ccw pointer-events-none"
        style={{ borderRadius: '50%' }}
      >
        {/* Orbital Satellite Node 3 (Burnt Orange) */}
        <div
          className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2.5 h-2.5 bg-[#D9541E] shadow-[0_0_10px_rgba(217,84,30,0.6)]"
          style={{ borderRadius: '50%' }}
        />
        {/* Orbital Satellite Node 4 (Ink Black) */}
        <div
          className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2 h-2 bg-[#111111] shadow-[0_0_8px_rgba(17,17,17,0.4)]"
          style={{ borderRadius: '50%' }}
        />
      </div>

      {/* 5. Inner Tech Orbital Ring (Clockwise Circle) */}
      <div
        className="absolute inset-16 border border-dotted border-[#111111]/20 animate-orbit-cw pointer-events-none"
        style={{ borderRadius: '50%' }}
      >
        <div
          className="absolute top-3 right-6 w-1.5 h-1.5 bg-[#111111]/70"
          style={{ borderRadius: '50%' }}
        />
        <div
          className="absolute bottom-3 left-6 w-1.5 h-1.5 bg-[#D9541E]/90"
          style={{ borderRadius: '50%' }}
        />
      </div>

      {/* 6. Profile Image with Alpha Mask Fade and Gentle Float */}
      <div className="relative z-10 w-full h-full flex items-center justify-center animate-float-gentle">
        <div className="relative w-full h-full profile-mask-fade">
          <Image
            className="profile-photo w-full h-full object-contain"
            alt="Dashintha Jayawardana"
            src="/images/profile.png"
            width={460}
            height={460}
            priority
          />
        </div>
      </div>
    </div>
  );
}
