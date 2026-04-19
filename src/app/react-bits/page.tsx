import BlurText from '@/components/BlurText';
import DecryptedText from '@/components/DecryptedText';
import RotatingText from '@/components/RotatingText';
import SplitText from '@/components/SplitText';

export const metadata = {
  title: 'Forma — Motion for React',
  description: 'Copy-paste animated React components. Beautiful by default.',
};

// ─── Nav ──────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex h-12 items-center justify-between px-8"
      style={{
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
      }}
    >
      <span className="text-[12px] font-medium tracking-[0.02em] text-white">
        Forma
      </span>
      <ul className="flex items-center gap-8">
        {['Docs', 'Components', 'Pricing', 'Blog'].map((item) => (
          <li key={item}>
            <a
              href="#"
              className="text-[12px] text-white/80 transition-colors hover:text-white"
            >
              {item}
            </a>
          </li>
        ))}
      </ul>
      <a
        href="#"
        className="rounded-full border border-white/30 px-4 py-1 text-[12px] text-white transition-colors hover:border-white/60"
      >
        Get started
      </a>
    </nav>
  );
}

// ─── Hero (black) ─────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center bg-black px-6 pt-12 text-center">
      <p className="mb-5 text-[14px] tracking-[0.12em] text-[#2997ff]">
        Introducing Forma 2.0
      </p>

      <BlurText
        text="Motion that feels completely natural."
        delay={100}
        animateBy="words"
        direction="top"
        className="mx-auto max-w-3xl text-[56px] font-semibold leading-[1.07] tracking-[-0.28px] text-white"
      />

      <p
        className="mx-auto mt-6 max-w-xl text-[21px] font-light leading-[1.47] text-white/70"
        style={{ letterSpacing: '-0.374px' }}
      >
        Copy-paste animated React components. Beautiful by default. Zero runtime
        overhead.
      </p>

      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
        <a
          href="#"
          className="flex h-11 items-center rounded-lg bg-[#0071e3] px-[15px] text-[17px] text-white transition-colors hover:bg-[#0077ed]"
        >
          Get started free
        </a>
        <a
          href="#"
          className="flex h-11 items-center rounded-full border border-white/30 px-[15px] text-[14px] text-[#2997ff] transition-colors hover:border-[#2997ff]"
        >
          Browse components →
        </a>
      </div>

      <div className="mt-24 grid grid-cols-3 gap-16 border-t border-white/10 pt-16">
        {[
          { value: '50K+', label: 'developers' },
          { value: '200+', label: 'components' },
          { value: '4.9★', label: 'average rating' },
        ].map(({ value, label }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <span className="text-[40px] font-semibold leading-[1.1] tracking-[-0.28px] text-white">
              {value}
            </span>
            <span className="text-[14px] text-white/48">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Features (#f5f5f7) ───────────────────────────────────────────────────────

const features = [
  {
    title: 'BlurText',
    description:
      'Reveal text word-by-word or letter-by-letter with a smooth blur fade. Triggers on scroll via IntersectionObserver — no extra setup required.',
    tag: 'Text',
  },
  {
    title: 'SplitText',
    description:
      'Split headlines into characters or words and stagger each element into view. Full control over from/to keyframes and easing.',
    tag: 'Text',
  },
  {
    title: 'RotatingText',
    description:
      'Cycle through a list of words using spring-based enter and exit animations. Perfect for hero taglines with multiple value propositions.',
    tag: 'Text',
  },
  {
    title: 'DecryptedText',
    description:
      'Scramble characters then reveal the real text on hover or on scroll. The signature glitch effect seen across crypto and developer brands.',
    tag: 'Interactive',
  },
  {
    title: 'Magnet',
    description:
      'Make any element follow the cursor with a configurable magnetic pull. Subtle enough for CTAs, dramatic enough for logos.',
    tag: 'Cursor',
  },
  {
    title: 'Aurora',
    description:
      'GPU-accelerated mesh gradient background that shifts slowly like the northern lights. Dark mode native, no canvas overhead.',
    tag: 'Background',
  },
];

function Features() {
  return (
    <section className="bg-[#f5f5f7] px-6 py-32">
      <div className="mx-auto max-w-[980px]">
        <SplitText
          text="Everything you need."
          splitType="words"
          delay={80}
          duration={0.6}
          from={{ opacity: 0, y: 24 }}
          to={{ opacity: 1, y: 0 }}
          className="text-[40px] font-semibold leading-[1.1] tracking-[-0.28px] text-[#1d1d1f]"
        />

        <p
          className="mt-5 max-w-lg text-[17px] leading-[1.47] text-black/60"
          style={{ letterSpacing: '-0.374px' }}
        >
          Every component ships with sensible defaults, full TypeScript types,
          and zero mandatory dependencies beyond motion/react.
        </p>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ title, description, tag }) => (
            <div
              key={title}
              className="flex flex-col gap-4 rounded-[12px] bg-white p-8"
              style={{ boxShadow: 'rgba(0,0,0,0.22) 3px 5px 30px 0px' }}
            >
              <span className="w-fit rounded-full bg-[#f5f5f7] px-3 py-1 text-[12px] font-semibold text-[#1d1d1f]">
                {tag}
              </span>
              <h3 className="text-[21px] font-bold leading-[1.19] tracking-[0.231px] text-[#1d1d1f]">
                {title}
              </h3>
              <p
                className="text-[14px] leading-[1.43] text-black/60"
                style={{ letterSpacing: '-0.224px' }}
              >
                {description}
              </p>
              <a
                href="#"
                className="mt-auto text-[14px] text-[#0066cc] hover:underline"
                style={{ letterSpacing: '-0.224px' }}
              >
                View component →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Interactive Demo (black) ─────────────────────────────────────────────────

function InteractiveDemo() {
  return (
    <section className="bg-black px-6 py-32">
      <div className="mx-auto max-w-[980px]">
        <p className="mb-4 text-[14px] tracking-[0.12em] text-[#2997ff]">
          Interactive
        </p>
        <SplitText
          text="Hover. Watch the magic."
          splitType="chars"
          delay={30}
          duration={0.5}
          from={{ opacity: 0, y: 20 }}
          to={{ opacity: 1, y: 0 }}
          className="text-[40px] font-semibold leading-[1.1] tracking-[-0.28px] text-white"
        />

        <div className="mt-16 grid gap-8 sm:grid-cols-2">
          <div className="flex flex-col justify-between rounded-[12px] bg-[#1c1c1e] p-10">
            <p className="mb-8 text-[12px] tracking-[0.1em] text-white/40">
              DecryptedText — hover to trigger
            </p>
            <DecryptedText
              text="The future of web animation"
              animateOn="hover"
              speed={35}
              className="text-[28px] font-semibold leading-[1.14] text-white"
              encryptedClassName="text-white/30"
              parentClassName="cursor-pointer leading-[1.2]"
            />
          </div>

          <div className="flex flex-col justify-between rounded-[12px] bg-[#1c1c1e] p-10">
            <p className="mb-8 text-[12px] tracking-[0.1em] text-white/40">
              DecryptedText — reveals on scroll
            </p>
            <DecryptedText
              text="Engineered for performance"
              animateOn="view"
              speed={40}
              className="text-[28px] font-semibold leading-[1.14] text-white"
              encryptedClassName="text-white/30"
              parentClassName="leading-[1.2]"
            />
          </div>

          <div className="col-span-full flex flex-col items-start justify-between rounded-[12px] bg-[#1c1c1e] p-10 sm:flex-row sm:items-center">
            <p className="mb-6 text-[12px] tracking-[0.1em] text-white/40 sm:mb-0">
              RotatingText — auto-cycles every 2.2s
            </p>
            <p className="text-[28px] font-semibold leading-[1.14] text-white">
              Built for&nbsp;
              <RotatingText
                texts={['developers', 'designers', 'startups', 'everyone']}
                rotationInterval={2200}
                staggerDuration={0.025}
                staggerFrom="first"
                mainClassName="text-[#2997ff]"
                transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              />
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials (#f5f5f7) ───────────────────────────────────────────────────

const quotes = [
  {
    body: 'Forma saved us weeks of animation work. Drop it in, tweak a prop, ship.',
    author: 'Yuki Tanaka',
    role: 'Lead Engineer, Arc',
  },
  {
    body: "The best copy-paste component library I've used. The TypeScript DX is flawless.",
    author: 'Mia Kovač',
    role: 'Design Systems, Linear',
  },
  {
    body: 'We replaced three animation libraries with Forma. Smaller bundle, better output.',
    author: 'Ethan Park',
    role: 'CTO, Tusk',
  },
];

function Testimonials() {
  return (
    <section className="bg-[#f5f5f7] px-6 py-32">
      <div className="mx-auto max-w-[980px]">
        <SplitText
          text="Loved by the teams building tomorrow."
          splitType="words"
          delay={70}
          duration={0.55}
          from={{ opacity: 0, y: 20 }}
          to={{ opacity: 1, y: 0 }}
          className="max-w-lg text-[40px] font-semibold leading-[1.1] tracking-[-0.28px] text-[#1d1d1f]"
        />

        <div className="mt-16 grid gap-5 sm:grid-cols-3">
          {quotes.map(({ body, author, role }) => (
            <figure
              key={author}
              className="flex flex-col gap-6 rounded-[12px] bg-white p-8"
            >
              <blockquote
                className="flex-1 text-[17px] leading-[1.47] text-black/70"
                style={{ letterSpacing: '-0.374px' }}
              >
                &ldquo;{body}&rdquo;
              </blockquote>
              <figcaption>
                <p
                  className="text-[14px] font-semibold text-[#1d1d1f]"
                  style={{ letterSpacing: '-0.224px' }}
                >
                  {author}
                </p>
                <p className="text-[12px] text-black/48">{role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA (black) ──────────────────────────────────────────────────────────────

function CTA() {
  return (
    <section className="flex flex-col items-center bg-black px-6 py-40 text-center">
      <BlurText
        text="Start building in minutes."
        delay={90}
        animateBy="words"
        direction="bottom"
        className="text-[56px] font-semibold leading-[1.07] tracking-[-0.28px] text-white"
      />
      <p
        className="mt-6 text-[21px] font-light text-white/60"
        style={{ letterSpacing: '-0.374px' }}
      >
        Free forever for personal projects.
      </p>
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
        <a
          href="#"
          className="flex h-11 items-center rounded-lg bg-[#0071e3] px-[15px] text-[17px] text-white transition-colors hover:bg-[#0077ed]"
        >
          Get started free
        </a>
        <a
          href="#"
          className="flex h-11 items-center rounded-full border border-white/30 px-[15px] text-[14px] text-[#2997ff] transition-colors hover:border-[#2997ff]"
        >
          View on GitHub →
        </a>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black px-8 py-10">
      <div className="mx-auto flex max-w-[980px] items-center justify-between">
        <span className="text-[12px] text-white/40">© 2026 Forma</span>
        <p className="text-[12px] text-white/30">
          Components sourced from{' '}
          <a
            href="https://www.reactbits.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#2997ff] hover:underline"
          >
            reactbits.dev
          </a>
        </p>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReactBitsPage() {
  return (
    <>
      <Nav />
      <Hero />
      <Features />
      <InteractiveDemo />
      <Testimonials />
      <CTA />
      <Footer />
    </>
  );
}
