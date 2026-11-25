import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { getSkillsDb } from '@/lib/dbData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Technical Skills & Domains | Dashintha Jayawardana',
  description:
    'Full-stack engineering, cloud infrastructure, backend architecture, databases, and dev tools for Dashintha Jayawardana.',
};

export default async function SkillsPage() {
  let skills = [];
  try {
    skills = await getSkillsDb();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching skills in SkillsPage:', error);
    }
  }

  return (
    <>
      <Navigation />
      <main className="pt-20 sm:pt-24 md:pt-32 pb-16 sm:pb-20 md:pb-24 px-4 sm:px-6 max-w-7xl mx-auto overflow-hidden">
        <SkillsHero />
        <SkillsBentoGrid skills={skills} />
      </main>
      <Footer />
    </>
  );
}

// ========== HERO SECTION ==========
function SkillsHero() {
  return (
    <section className="mb-12 sm:mb-16 md:mb-20 relative">
      <h1 className="font-headline text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tighter mb-4 opacity-90 leading-tight">
        Building Things <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Reliably</span>
        <br />
        and Learning Always.
      </h1>
      <p className="font-body text-on-surface-variant max-w-xl text-sm sm:text-base md:text-lg lg:text-xl">
        Working across full-stack development and cloud infrastructure. Still learning, always improving, and enjoying the process.
      </p>
    </section>
  );
}

// ========== SKILLS BENTO GRID SECTION ==========
function SkillsBentoGrid({ skills = [] }) {
  if (!skills.length) {
    return (
      <div className="border border-dashed border-outline-variant/30 rounded-xl p-12 text-center text-on-surface-variant">
        <span className="material-symbols-outlined text-4xl mb-3 text-primary">psychology</span>
        <p className="text-sm">Skills are being updated. Please check back shortly.</p>
      </div>
    );
  }

  const spanPatterns = [
    'md:col-span-8',
    'md:col-span-4',
    'md:col-span-5',
    'md:col-span-7',
    'md:col-span-6',
    'md:col-span-6',
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-stretch mb-12">
      {skills.map((item, index) => {
        const spanClass = spanPatterns[index % spanPatterns.length];
        const barColor =
          item.color === 'secondary'
            ? 'bg-secondary'
            : item.color === 'tertiary'
              ? 'bg-tertiary'
              : 'bg-primary';

        const textColor =
          item.color === 'secondary'
            ? 'text-secondary'
            : item.color === 'tertiary'
              ? 'text-tertiary'
              : 'text-primary';

        const dotGlow =
          item.color === 'secondary'
            ? 'bg-secondary shadow-[0_0_8px_rgba(201,114,37,0.5)]'
            : item.color === 'tertiary'
              ? 'bg-tertiary shadow-[0_0_8px_rgba(56,142,60,0.5)]'
              : 'bg-primary shadow-[0_0_8px_rgba(217,84,30,0.5)]';

        return (
          <div
            key={item.id || item._id || index}
            className={`${spanClass} bg-surface-container-low p-6 sm:p-8 rounded-lg relative overflow-hidden group flex flex-col justify-between`}
          >
            {/* Top accent bar */}
            <div className={`absolute top-0 left-0 w-8 h-[2px] ${barColor} transition-all duration-300 group-hover:w-16`}></div>

            <div>
              {/* Header with Icon and Title */}
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <span className={`material-symbols-outlined ${textColor} text-2xl sm:text-3xl`}>
                  {item.icon || 'terminal'}
                </span>
                <h2 className="font-headline text-lg sm:text-xl md:text-2xl font-semibold tracking-tight uppercase">
                  {item.title}
                </h2>
              </div>

              {/* Description */}
              {item.description && (
                <p className="text-on-surface-variant mb-6 sm:mb-8 max-w-xl text-sm sm:text-base leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>

            {/* Skills Pills */}
            {Array.isArray(item.skills) && item.skills.length > 0 && (
              <div className="flex flex-wrap gap-2.5 sm:gap-3 mt-auto pt-4">
                {item.skills.map((skillName) => (
                  <div
                    key={skillName}
                    className="bg-surface-container-high px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-md flex items-center gap-2 hover:bg-surface-container-highest transition-all duration-300 border border-outline-variant/10 text-xs sm:text-sm"
                  >
                    <span className={`w-2 h-2 rounded-full ${dotGlow}`}></span>
                    <span className="font-label text-xs sm:text-sm uppercase tracking-widest font-bold">
                      {skillName}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Large Watermark Icon */}
            <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-[100px] sm:text-[180px]">
                {item.icon || 'terminal'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
