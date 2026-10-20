"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Schedule from "@/components/schedule";

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Slideshow state
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 3;

  // Auto-advance slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 4000); // Change slide every 4 seconds
    return () => clearInterval(interval);
  }, []);

  const leftPhotoX = useTransform(scrollYProgress, [0, 0.5], ["0%", "-100%"]);
  const rightPhotoX = useTransform(scrollYProgress, [0, 0.5], ["0%", "100%"]);
  const centerOpacity = useTransform(scrollYProgress, [0.15, 0.4], [0, 1]);
  const centerY = useTransform(scrollYProgress, [0.15, 0.4], [50, 0]);
  const photoOpacity = useTransform(scrollYProgress, [0.3, 0.5], [1, 0]);

  // Order is provisional; reshuffle by moving entries between the two lists
  // Subjects sit at the very bottom of these shots, so anchor the crop there
  const bottomAnchored = [4, 7];
  const slide = (n: number) => ({
    id: n,
    src: `/photos/hero-${n}.jpg`,
    position: bottomAnchored.includes(n) ? "object-bottom" : "object-center",
  });
  const leftSlides = [3, 1, 2].map(slide);
  const rightSlides = [5, 4, 7].map(slide);
  // Each panel is 50vw x 100vh and the photos are 2:3 portrait, so on screens
  // narrower than 4:3 object-cover sizes them by height (100vh * 2/3), not width
  const heroSizes = "(max-aspect-ratio: 4/3) 67vh, 50vw";

  return (
    <main className="bg-background">
      {/* Navigation - Translucent Overlay */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-4 md:py-6 bg-gradient-to-b from-black/30 to-transparent">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="font-[family-name:var(--font-cormorant)] text-xl tracking-widest text-white drop-shadow-md"
          >
            D & S
          </motion.span>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex gap-4 md:gap-8 font-[family-name:var(--font-montserrat)] text-xs md:text-sm tracking-wider"
          >
            <a
              href="#about"
              className="text-white/90 hover:text-white transition-colors drop-shadow-md"
            >
              About
            </a>
            <a
              href="#itinerary"
              className="text-white/90 hover:text-white transition-colors drop-shadow-md"
            >
              Itinerary
            </a>
            <a
              href="#travel"
              className="text-white/90 hover:text-white transition-colors drop-shadow-md"
            >
              Travel
            </a>
            <a
              href="#rsvp"
              className="text-white/90 hover:text-white transition-colors drop-shadow-md"
            >
              RSVP
            </a>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section with Full-Screen Splitting Photos */}
      <section ref={heroRef} className="relative h-[200vh]">
        <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
          {/* Left Photo - Full Height Slideshow */}
          <motion.div
            style={{ x: leftPhotoX, opacity: photoOpacity }}
            className="absolute left-0 top-0 w-1/2 h-full z-10"
          >
            <div className="relative w-full h-full overflow-hidden">
              {leftSlides.map((slide, index) => (
                <Image
                  key={slide.id}
                  src={slide.src}
                  alt="Dinal and Shayani"
                  fill
                  priority={index === 0}
                  loading={index === 0 ? undefined : "eager"}
                  sizes={heroSizes}
                  quality={90}
                  className={`object-cover ${slide.position} transition-opacity duration-1000 ${
                    index === currentSlide ? "opacity-100 z-10" : "opacity-0 delay-1000"
                  }`}
                />
              ))}
              {/* Subtle gradient overlay for text readability */}
              <div className="absolute inset-0 z-20 bg-gradient-to-r from-transparent to-black/20 pointer-events-none" />
            </div>
          </motion.div>

          {/* Right Photo - Full Height Slideshow */}
          <motion.div
            style={{ x: rightPhotoX, opacity: photoOpacity }}
            className="absolute right-0 top-0 w-1/2 h-full z-10"
          >
            <div className="relative w-full h-full overflow-hidden">
              {rightSlides.map((slide, index) => (
                <Image
                  key={slide.id}
                  src={slide.src}
                  alt="Dinal and Shayani"
                  fill
                  priority={index === 0}
                  loading={index === 0 ? undefined : "eager"}
                  sizes={heroSizes}
                  quality={90}
                  className={`object-cover ${slide.position} transition-opacity duration-1000 ${
                    index === currentSlide ? "opacity-100 z-10" : "opacity-0 delay-1000"
                  }`}
                />
              ))}
              {/* Subtle gradient overlay for text readability */}
              <div className="absolute inset-0 z-20 bg-gradient-to-l from-transparent to-black/20 pointer-events-none" />
            </div>
          </motion.div>

          {/* Center dividing line */}
          <motion.div
            style={{ opacity: photoOpacity }}
            className="absolute left-1/2 top-0 w-px h-full bg-white/20 z-20 -translate-x-1/2"
          />

          {/* Slideshow indicators */}
          <motion.div
            style={{ opacity: photoOpacity }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2"
          >
            {[0, 1, 2].map((index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentSlide === index
                    ? "bg-white w-6"
                    : "bg-white/50 hover:bg-white/70"
                }`}
              />
            ))}
          </motion.div>

          {/* Center Content (Revealed on scroll) */}
          <motion.div
            style={{ opacity: centerOpacity, y: centerY }}
            className="absolute text-center z-0 px-4"
          >
            <p className="font-[family-name:var(--font-montserrat)] text-accent tracking-[0.15em] md:tracking-[0.3em] text-xs md:text-sm mb-4">
              TOGETHER WITH THEIR FAMILIES
            </p>
            <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-8xl lg:text-9xl font-light text-charcoal mb-4 md:mb-6">
              Dinal
              <span className="font-[family-name:var(--font-cormorant)] italic text-accent mx-2 md:mx-8">
                &
              </span>
              Shayani
            </h1>
            <div className="divider mx-auto mb-4 md:mb-6" />
            <p className="font-[family-name:var(--font-montserrat)] text-charcoal/70 tracking-[0.1em] md:tracking-[0.2em] text-xs md:text-base">
              REQUEST THE PLEASURE OF YOUR COMPANY
            </p>
            <p className="font-[family-name:var(--font-montserrat)] text-charcoal/70 tracking-[0.1em] md:tracking-[0.2em] text-xs md:text-base mt-2">
              AT THEIR WEDDING CELEBRATION
            </p>
            <div className="mt-8 md:mt-12">
              <p className="font-[family-name:var(--font-cormorant)] text-2xl md:text-4xl text-charcoal">
                May 19th &ndash; 21st, 2027
              </p>
              <p className="font-[family-name:var(--font-montserrat)] text-accent tracking-[0.15em] text-xs md:text-sm mt-2">
                ULUWATU, BALI
              </p>
            </div>
          </motion.div>

          {/* Initial overlay text - positioned over the photos */}
          <motion.div
            style={{
              opacity: useTransform(scrollYProgress, [0, 0.15], [1, 0]),
            }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 text-center z-20"
          >
            <p className="font-[family-name:var(--font-montserrat)] text-white/80 tracking-widest text-xs drop-shadow-lg">
              SCROLL TO DISCOVER
            </p>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="mt-4"
            >
              <svg
                className="w-6 h-6 mx-auto text-white drop-shadow-lg"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 md:py-32 px-4 md:px-8 bg-cream">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-6xl font-light text-charcoal">
              About Us
            </h2>
            <div className="divider mx-auto mt-6" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative aspect-[3/2] max-w-2xl rounded-3xl overflow-hidden mx-auto mb-16 shadow-[0_24px_60px_-24px_rgba(42,51,24,0.45)] ring-1 ring-charcoal/5"
          >
            <Image
              src="/photos/about.jpg"
              alt="Dinal and Shayani at dinner"
              fill
              sizes="(min-width: 672px) 672px, 100vw"
              quality={85}
              className="object-cover"
            />
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 md:gap-24">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h3 className="font-[family-name:var(--font-cormorant)] text-3xl text-charcoal mb-4">
                Dinal
              </h3>
              <p className="font-[family-name:var(--font-montserrat)] text-charcoal/70 leading-relaxed text-sm">
                Easygoing until it matters, then all in. Dinal has an eye for
                the small things, a sense of humour that sneaks up on you, and a
                habit of turning ordinary plans into something worth
                remembering. He&apos;s happiest with good people around a long
                table, and happiest of all next to Shayani.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h3 className="font-[family-name:var(--font-cormorant)] text-3xl text-charcoal mb-4">
                Shayani
              </h3>
              <p className="font-[family-name:var(--font-montserrat)] text-charcoal/70 leading-relaxed text-sm">
                Warm from the first hello, and always the one who remembers.
                Shayani notices how people are really doing, laughs easily and
                often, and makes anywhere feel like home. She&apos;s the calm in
                a busy day, unapologetically herself in every room, and the
                best thing that ever happened to Dinal.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="mt-24 text-center"
          >
            <p className="font-[family-name:var(--font-cormorant)] text-xl md:text-3xl text-charcoal italic leading-relaxed max-w-2xl mx-auto">
              &quot;To love and be loved is to feel the sun from both
              sides.&quot;
            </p>
            <p className="font-[family-name:var(--font-montserrat)] text-accent tracking-wider text-xs mt-6">
              - DAVID VISCOTT
            </p>
          </motion.div>
        </div>
      </section>

      {/* Destination Section: full-bleed collage of our Bali photos */}
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-4 md:grid-cols-4 md:grid-rows-2 gap-1 bg-background">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="relative overflow-hidden">
              <Image
                src={`/photos/bali-v2-${n}.jpg`}
                alt=""
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                quality={85}
                className="object-cover"
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-charcoal/60" />

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 md:px-8 py-24">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <p className="font-[family-name:var(--font-montserrat)] text-cream tracking-[0.2em] md:tracking-[0.3em] text-xs mb-4">
                A DESTINATION CELEBRATION
              </p>
              <h2 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-6xl font-light text-white">
                Uluwatu, Bali
              </h2>
              <div className="divider mx-auto mt-6" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center"
            >
              <p className="font-[family-name:var(--font-montserrat)] text-white/85 leading-relaxed">
                We&apos;re inviting our dearest family and friends to join us in
                the magical cliffs of Uluwatu, Bali for a destination wedding
                celebration. We&apos;ve planned an unforgettable three-day
                experience where we&apos;ll celebrate love, friendship, and new
                beginnings together.
              </p>
              <p className="font-[family-name:var(--font-montserrat)] text-white/85 leading-relaxed mt-6">
                Flying from Sydney, we encourage you to make this a trip for
                yourselves too. Explore the beauty of Bali, relax on pristine
                beaches, and create memories that will last a lifetime.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <Schedule />

      {/* Travel Section */}
      <section id="travel" className="py-16 md:py-32 px-4 md:px-8 bg-background">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="font-[family-name:var(--font-montserrat)] text-accent tracking-[0.2em] md:tracking-[0.3em] text-xs mb-4">
              GETTING THERE
            </p>
            <h2 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-6xl font-light text-charcoal">
              Travel
            </h2>
            <div className="divider mx-auto mt-6" />
            <p className="font-[family-name:var(--font-montserrat)] text-charcoal/70 mt-8 leading-relaxed max-w-2xl mx-auto">
              We&rsquo;re keeping an eye on flight and accommodation prices so you
              don&rsquo;t have to. Have a look at how they&rsquo;re moving, or tick
              price updates on your RSVP to get them by email.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4 md:gap-6 mt-12">
            {[
              {
                href: "/flights",
                title: "Flights",
                body: "Sydney to Bali return fares for the wedding week, checked every morning.",
              },
              {
                href: "/stays",
                title: "Stays",
                body: "Villas and hotels near Stone Villas, around A$100 per person per night or less.",
              },
            ].map((card) => (
              <a
                key={card.href}
                href={card.href}
                className="block bg-cream rounded-sm p-8 text-center border border-transparent hover:border-accent-light transition-colors"
              >
                <h3 className="font-[family-name:var(--font-cormorant)] text-3xl text-charcoal">
                  {card.title}
                </h3>
                <p className="font-[family-name:var(--font-montserrat)] text-charcoal/60 text-sm mt-3 leading-relaxed">
                  {card.body}
                </p>
                <span className="inline-block mt-6 font-[family-name:var(--font-montserrat)] text-accent tracking-[0.2em] text-xs">
                  SEE PRICES &rarr;
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* RSVP Section */}
      <section id="rsvp" className="py-16 md:py-32 px-4 md:px-8 bg-charcoal">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="font-[family-name:var(--font-montserrat)] text-accent-light tracking-[0.2em] md:tracking-[0.3em] text-xs mb-4">
              WE HOPE YOU CAN JOIN US
            </p>
            <h2 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-6xl font-light text-white">
              RSVP
            </h2>
            <div className="divider mx-auto mt-6" />
            <p className="font-[family-name:var(--font-montserrat)] text-white/60 mt-8 leading-relaxed">
              Find your name below and you can RSVP for everyone on your
              invitation at once. Please respond by January 20th, 2027.
            </p>

            <a
              href="/rsvp"
              className="inline-block mt-10 bg-accent hover:bg-accent-dark text-white font-[family-name:var(--font-montserrat)] tracking-[0.2em] text-xs px-12 py-4 rounded-sm transition-colors"
            >
              RSVP NOW
            </a>

            <p className="font-[family-name:var(--font-montserrat)] text-white/40 mt-6 text-sm leading-relaxed">
              You can change your answers any time before the deadline.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 md:py-16 px-4 md:px-8 bg-charcoal border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="font-[family-name:var(--font-cormorant)] text-4xl text-white mb-4">
            Dinal & Shayani
          </h3>
          <p className="font-[family-name:var(--font-montserrat)] text-white/50 tracking-[0.2em] text-xs">
            MAY 19–21, 2027 | ULUWATU, BALI
          </p>
        </div>
      </footer>
    </main>
  );
}
