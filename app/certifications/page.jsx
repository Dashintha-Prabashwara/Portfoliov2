import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { getEducation, getCertifications } from '@/lib/notion';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CertificationsPage() {
  let education = [];
  let certifications = [];

  try {
    [education, certifications] = await Promise.all([
      getEducation(),
      getCertifications(),
    ]);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching certifications data:', error);
    }
  }

  return (
    <>
      <Navigation />
      <main className="relative pt-20 sm:pt-24 md:pt-32 pb-16 sm:pb-20 md:pb-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <HeroSection />
        <EducationSection education={education} />
        <CertificationsSection certifications={certifications} />
      </main>
      <Footer />
    </>
  );
}

// ========== HERO SECTION ==========
function HeroSection() {
  return (
    <header className="mb-16 sm:mb-20 md:mb-24 relative">
      <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tighter mb-4 sm:mb-6 leading-tight">
        System <br />
        <span className="text-gradient italic">Validation.</span>
      </h1>
      <p className="font-body text-on-surface-variant max-w-xl text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed">
        Education and certifications I've pursued to build my skills. Continuous learning is important to me as I grow as a developer and engineer.
      </p>
    </header>
  );
}

// ========== EDUCATION SECTION ==========
function EducationSection({ education }) {
  if (!education || education.length === 0) {
    return null;
  }

  return (
    <section className="mb-32 sm:mb-40 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 relative">
      <div className="lg:col-span-4">
        <div className="sticky top-32 sm:top-40">
          <span className="font-label text-primary text-xs tracking-[0.2em] uppercase block mb-4">
            The Initialization
          </span>
          <h2 className="font-headline text-3xl sm:text-4xl font-bold mb-6">Academic Foundation</h2>
          <p className="text-on-surface-variant text-xs sm:text-sm leading-loose">
            My educational background and learning journey. Working on building a strong foundation in systems design and cloud technologies.
          </p>
        </div>
      </div>

      <div className="lg:col-span-8 relative">
        {/* Vertical Timeline Line */}
        <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary via-secondary to-tertiary opacity-20 hidden md:block transform -translate-x-1/2"></div>

        {/* Education Items */}
        {education.map((edu, index) => {
          const isLeft = index % 2 === 0;

          return (
            <div key={edu.id} className="relative mb-16 sm:mb-20 md:mb-24 md:flex items-center justify-between">
              <div className={`${isLeft ? 'md:w-[45%]' : 'md:w-[45%] md:order-2'} mb-6 sm:mb-8 md:mb-0`}>
                <div
                  className={`bg-surface-container-low relative p-4 sm:p-6 md:p-8 rounded-lg text-sm sm:text-base border-l-4 border-primary overflow-hidden hover:bg-surface-container transition-all duration-500 hover:translate-y-[-4px] group ${
                    isLeft ? '' : 'text-right'
                  }`}
                >
                  {/* Top accent bar animation */}
                  <div className="absolute top-0 left-0 h-[2px] w-6 group-hover:w-12 bg-primary transition-all duration-500"></div>

                  <span className="font-label text-[10px] text-on-surface-variant mb-2 block tracking-widest">
                    {edu.period}
                  </span>
                  <h3 className="font-headline text-lg sm:text-xl md:text-2xl font-bold mb-2 text-on-surface">{edu.title}</h3>
                  <p className="text-on-surface-variant text-xs sm:text-sm mb-4">{edu.institution}</p>
                  <p className="text-on-surface-variant text-xs sm:text-sm leading-relaxed mb-4">{edu.description}</p>
                  <div className={`flex flex-wrap gap-2 ${isLeft ? '' : 'justify-end'}`}>
                    {edu.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-surface-container-high px-2 sm:px-3 py-1 text-[10px] font-label text-on-surface flex items-center gap-1"
                      >
                        <span className="w-1 h-1 rounded-full bg-tertiary"></span>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute left-0 md:left-1/2 w-4 h-4 bg-primary rounded-full transform -translate-x-1/2 hidden md:block shadow-[0_0_15px_rgba(164,230,255,0.6)]"></div>
              <div className={`${isLeft ? 'md:w-[45%]' : 'md:w-[45%] md:order-1'}`}></div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ========== CERTIFICATIONS SECTION ==========
function CertificationsSection({ certifications }) {
  const verified = certifications.filter((c) => c.statusColor !== null);
  const queue = certifications.filter((c) => c.statusColor === null);

  return (
    <section>
      <div className="flex items-center gap-4 mb-12 sm:mb-16">
        <div className="w-8 sm:w-12 h-[2px] bg-secondary"></div>
        <h2 className="font-label text-xs sm:text-sm uppercase tracking-[0.3em] text-secondary">Verified Credentials</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Verified Certifications */}
        {verified.map((cert) => (
          <CertificationCard key={cert.id} cert={cert} />
        ))}

        {/* Validation Queue Card (if any) */}
        {queue.length > 0 && (
          <div className="p-6 sm:p-8 rounded-xl border border-dashed border-outline-variant/30 flex flex-col items-center justify-center text-center group hover:bg-surface-container-low transition-colors duration-300">
            <div className="w-12 h-12 rounded-full border border-outline-variant/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-on-surface-variant/50">add</span>
            </div>
            <h3 className="font-headline text-xs sm:text-sm font-bold uppercase tracking-widest opacity-40">Validation Queue</h3>
            <div className="text-[10px] font-label text-on-surface-variant mt-2 tracking-tighter space-y-1">
              {queue.map((cert) => (
                <p key={cert.id}>{cert.title} (Exam Scheduled)</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ========== CERTIFICATION CARD COMPONENT ==========
function CertificationCard({ cert }) {
  const colorValues = {
    primary: '#a4e6ff',
    secondary: '#d8b9ff',
    tertiary: '#00f9be',
    error: '#ffb4ab',
    warning: '#ffc107',
  };

  const accentColor = colorValues[cert.statusColor] || colorValues.primary;
  const defaultIcon = 'verified';

  return (
    <div className="glass-card p-4 sm:p-6 md:p-8 rounded-xl border border-outline-variant/10 relative overflow-hidden group hover:translate-y-[-4px] transition-all duration-500">
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 h-[2px] w-8 group-hover:w-16 transition-all duration-500"
        style={{ backgroundColor: accentColor }}
      ></div>

      {/* Icon and Credential ID */}
      <div className="flex justify-between items-start mb-4 sm:mb-6 gap-2">
        <div className="w-10 sm:w-12 h-10 sm:h-12 bg-surface-container-lowest rounded flex items-center justify-center border border-outline-variant/10 flex-shrink-0">
          <span
            className="material-symbols-outlined text-lg sm:text-xl"
            style={{ color: accentColor }}
          >
            {cert.icon || defaultIcon}
          </span>
        </div>
        <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest text-right">
          {cert.credentialId}
        </span>
      </div>

      {/* Status Badge */}
      {cert.status && (
        <div className="mb-4">
          <span
            className="inline-block px-3 py-1 rounded-full text-[10px] font-label uppercase tracking-widest font-bold border"
            style={{
              backgroundColor: `${accentColor}20`,
              color: accentColor,
              borderColor: accentColor,
            }}
          >
            {cert.status}
          </span>
        </div>
      )}

      {/* Title */}
      <h3 className="font-headline text-base sm:text-lg md:text-xl font-bold text-on-surface mb-2 tracking-tight">
        {cert.title}
      </h3>

      {/* Organization */}
      <p className="text-on-surface-variant text-xs sm:text-sm mb-4 sm:mb-6 font-light">
        {cert.organization}
      </p>

      {/* Dates Section */}
      <div className="space-y-2 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-outline-variant/10">
        {cert.issueDate && (
          <div className="flex justify-between text-[10px]">
            <span className="text-on-surface-variant uppercase tracking-widest">ISSUED</span>
            <span className="text-on-surface font-medium">{cert.issueDate}</span>
          </div>
        )}
        {cert.expiryDate && (
          <div className="flex justify-between text-[10px]">
            <span className="text-on-surface-variant uppercase tracking-widest">EXPIRES</span>
            <span className="text-on-surface font-medium">{cert.expiryDate}</span>
          </div>
        )}
      </div>

      {/* Verification Link */}
      {cert.verificationUrl && (
        <div className="flex justify-end">
          <a
            href={cert.verificationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm transition-colors cursor-pointer hover:opacity-80 flex items-center gap-2"
            style={{ color: accentColor }}
          >
            Verify
            <span className="material-symbols-outlined text-sm">open_in_new</span>
          </a>
        </div>
      )}
    </div>
  );
}

// ========== FOOTER SECTION ==========
