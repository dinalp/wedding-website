"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

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

  // Placeholder images for slideshow (will be replaced with actual photos)
  const leftSlides = [
    { id: 1, label: "Dinal Photo 1" },
    { id: 2, label: "Dinal Photo 2" },
    { id: 3, label: "Dinal Photo 3" },
  ];

  const rightSlides = [
    { id: 1, label: "Shayani Photo 1" },
    { id: 2, label: "Shayani Photo 2" },
    { id: 3, label: "Shayani Photo 3" },
  ];

  return (
    <main className="bg-background">
      {/* Navigation - Translucent Overlay */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-6 bg-gradient-to-b from-black/30 to-transparent">
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
            className="flex gap-8 font-[family-name:var(--font-montserrat)] text-sm tracking-wider"
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
              <AnimatePresence mode="wait">
                {leftSlides.map(
                  (slide, index) =>
                    index === currentSlide && (
                      <motion.div
                        key={slide.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 photo-placeholder flex items-center justify-center"
                      >
                        <span className="font-[family-name:var(--font-cormorant)] text-white/50 text-3xl italic drop-shadow-lg">
                          {slide.label}
                        </span>
                      </motion.div>
                    )
                )}
              </AnimatePresence>
              {/* Subtle gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 pointer-events-none" />
            </div>
          </motion.div>

          {/* Right Photo - Full Height Slideshow */}
          <motion.div
            style={{ x: rightPhotoX, opacity: photoOpacity }}
            className="absolute right-0 top-0 w-1/2 h-full z-10"
          >
            <div className="relative w-full h-full overflow-hidden">
              <AnimatePresence mode="wait">
                {rightSlides.map(
                  (slide, index) =>
                    index === currentSlide && (
                      <motion.div
                        key={slide.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 photo-placeholder flex items-center justify-center"
                      >
                        <span className="font-[family-name:var(--font-cormorant)] text-white/50 text-3xl italic drop-shadow-lg">
                          {slide.label}
                        </span>
                      </motion.div>
                    )
                )}
              </AnimatePresence>
              {/* Subtle gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/20 pointer-events-none" />
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
            <p className="font-[family-name:var(--font-montserrat)] text-accent tracking-[0.3em] text-sm mb-4">
              TOGETHER WITH THEIR FAMILIES
            </p>
            <h1 className="font-[family-name:var(--font-cormorant)] text-6xl md:text-8xl lg:text-9xl font-light text-charcoal mb-6">
              Dinal
              <span className="font-[family-name:var(--font-cormorant)] italic text-accent mx-4 md:mx-8">
                &
              </span>
              Shayani
            </h1>
            <div className="divider mx-auto mb-6" />
            <p className="font-[family-name:var(--font-montserrat)] text-charcoal/70 tracking-[0.2em] text-sm md:text-base">
              REQUEST THE PLEASURE OF YOUR COMPANY
            </p>
            <p className="font-[family-name:var(--font-montserrat)] text-charcoal/70 tracking-[0.2em] text-sm md:text-base mt-2">
              AT THEIR WEDDING CELEBRATION
            </p>
            <div className="mt-12">
              <p className="font-[family-name:var(--font-cormorant)] text-3xl md:text-4xl text-charcoal">
                May 20th, 2027
              </p>
              <p className="font-[family-name:var(--font-montserrat)] text-accent tracking-[0.15em] text-sm mt-2">
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
      <section id="about" className="py-32 px-8 bg-cream">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="font-[family-name:var(--font-montserrat)] text-accent tracking-[0.3em] text-xs mb-4">
              OUR STORY
            </p>
            <h2 className="font-[family-name:var(--font-cormorant)] text-5xl md:text-6xl font-light text-charcoal">
              About Us
            </h2>
            <div className="divider mx-auto mt-6" />
          </motion.div>

          <div className="grid md:grid-cols-2 gap-16 md:gap-24">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="photo-placeholder w-48 h-48 rounded-full mx-auto mb-8 flex items-center justify-center">
                <span className="font-[family-name:var(--font-cormorant)] text-accent-dark/50 italic">
                  Dinal
                </span>
              </div>
              <h3 className="font-[family-name:var(--font-cormorant)] text-3xl text-charcoal mb-4">
                Dinal
              </h3>
              <p className="font-[family-name:var(--font-montserrat)] text-charcoal/70 leading-relaxed text-sm">
                Born and raised with a love for life&apos;s adventures. When not
                dreaming of the perfect wedding day, you&apos;ll find Dinal
                exploring Sydney&apos;s hidden gems and planning the next great
                adventure.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="photo-placeholder w-48 h-48 rounded-full mx-auto mb-8 flex items-center justify-center">
                <span className="font-[family-name:var(--font-cormorant)] text-accent-dark/50 italic">
                  Shayani
                </span>
              </div>
              <h3 className="font-[family-name:var(--font-cormorant)] text-3xl text-charcoal mb-4">
                Shayani
              </h3>
              <p className="font-[family-name:var(--font-montserrat)] text-charcoal/70 leading-relaxed text-sm">
                A heart full of warmth and a spirit that lights up every room.
                Shayani brings joy and love to everything she does, making every
                moment together an unforgettable memory.
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
            <p className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl text-charcoal italic leading-relaxed max-w-2xl mx-auto">
              &quot;Two souls with but a single thought, two hearts that beat as
              one.&quot;
            </p>
            <p className="font-[family-name:var(--font-montserrat)] text-accent tracking-wider text-xs mt-6">
              - JOHN KEATS
            </p>
          </motion.div>
        </div>
      </section>

      {/* Destination Section */}
      <section className="py-32 px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="font-[family-name:var(--font-montserrat)] text-accent tracking-[0.3em] text-xs mb-4">
              A DESTINATION CELEBRATION
            </p>
            <h2 className="font-[family-name:var(--font-cormorant)] text-5xl md:text-6xl font-light text-charcoal">
              Uluwatu, Bali
            </h2>
            <div className="divider mx-auto mt-6" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="photo-placeholder aspect-[21/9] rounded-sm flex items-center justify-center mb-12"
          >
            <span className="font-[family-name:var(--font-cormorant)] text-accent-dark/50 text-2xl italic">
              Bali Landscape Photo
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <p className="font-[family-name:var(--font-montserrat)] text-charcoal/70 leading-relaxed">
              We&apos;re inviting our dearest family and friends to join us in
              the magical cliffs of Uluwatu, Bali for a destination wedding
              celebration. We&apos;ve planned an unforgettable three-day
              experience where we&apos;ll celebrate love, friendship, and new
              beginnings together.
            </p>
            <p className="font-[family-name:var(--font-montserrat)] text-charcoal/70 leading-relaxed mt-6">
              Flying from Sydney, we encourage you to make this a trip for
              yourselves too. Explore the beauty of Bali, relax on pristine
              beaches, and create memories that will last a lifetime.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Itinerary Section */}
      <section id="itinerary" className="py-32 px-8 bg-cream">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="font-[family-name:var(--font-montserrat)] text-accent tracking-[0.3em] text-xs mb-4">
              THREE DAYS OF CELEBRATION
            </p>
            <h2 className="font-[family-name:var(--font-cormorant)] text-5xl md:text-6xl font-light text-charcoal">
              The Schedule
            </h2>
            <div className="divider mx-auto mt-6" />
          </motion.div>

          <div className="space-y-16">
            {/* Day 1 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="grid md:grid-cols-[1fr,3fr] gap-8 items-start"
            >
              <div className="text-center md:text-right">
                <p className="font-[family-name:var(--font-montserrat)] text-accent tracking-[0.2em] text-xs">
                  DAY ONE
                </p>
                <h3 className="font-[family-name:var(--font-cormorant)] text-4xl text-charcoal mt-2">
                  May 18
                </h3>
                <p className="font-[family-name:var(--font-montserrat)] text-charcoal/50 text-sm mt-1">
                  Sunday
                </p>
              </div>
              <div className="bg-background p-8 md:p-12 rounded-sm shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-accent"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                      />
                    </svg>
                  </div>
                  <h4 className="font-[family-name:var(--font-cormorant)] text-3xl text-charcoal">
                    Welcome Dinner
                  </h4>
                </div>
                <p className="font-[family-name:var(--font-montserrat)] text-charcoal/70 leading-relaxed">
                  Arrive in Bali and settle in. Join us for an intimate welcome
                  dinner as we gather together for the first time. It&apos;s the
                  perfect opportunity to catch up, meet fellow guests, and begin
                  the celebrations with good food, drinks, and company.
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <span className="font-[family-name:var(--font-montserrat)] text-xs tracking-wider text-accent bg-accent/10 px-4 py-2 rounded-full">
                    ARRIVAL DAY
                  </span>
                  <span className="font-[family-name:var(--font-montserrat)] text-xs tracking-wider text-charcoal/50 bg-charcoal/5 px-4 py-2 rounded-full">
                    7:00 PM
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Day 2 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              className="grid md:grid-cols-[1fr,3fr] gap-8 items-start"
            >
              <div className="text-center md:text-right">
                <p className="font-[family-name:var(--font-montserrat)] text-accent tracking-[0.2em] text-xs">
                  DAY TWO
                </p>
                <h3 className="font-[family-name:var(--font-cormorant)] text-4xl text-charcoal mt-2">
                  May 19
                </h3>
                <p className="font-[family-name:var(--font-montserrat)] text-charcoal/50 text-sm mt-1">
                  Monday
                </p>
              </div>
              <div className="bg-background p-8 md:p-12 rounded-sm shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-sage/20 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-sage"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                      />
                    </svg>
                  </div>
                  <h4 className="font-[family-name:var(--font-cormorant)] text-3xl text-charcoal">
                    Boat Party
                  </h4>
                </div>
                <p className="font-[family-name:var(--font-montserrat)] text-charcoal/70 leading-relaxed">
                  Set sail on the beautiful waters surrounding Bali for a day of
                  fun, sun, and celebration. Enjoy stunning views, refreshing
                  drinks, delicious food, and great music as we cruise along the
                  coast. This is our chance to let loose before the big day!
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <span className="font-[family-name:var(--font-montserrat)] text-xs tracking-wider text-sage bg-sage/10 px-4 py-2 rounded-full">
                    ALL DAY EVENT
                  </span>
                  <span className="font-[family-name:var(--font-montserrat)] text-xs tracking-wider text-charcoal/50 bg-charcoal/5 px-4 py-2 rounded-full">
                    10:00 AM - 6:00 PM
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Day 3 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="grid md:grid-cols-[1fr,3fr] gap-8 items-start"
            >
              <div className="text-center md:text-right">
                <p className="font-[family-name:var(--font-montserrat)] text-accent tracking-[0.2em] text-xs">
                  DAY THREE
                </p>
                <h3 className="font-[family-name:var(--font-cormorant)] text-4xl text-charcoal mt-2">
                  May 20
                </h3>
                <p className="font-[family-name:var(--font-montserrat)] text-charcoal/50 text-sm mt-1">
                  Tuesday
                </p>
              </div>
              <div className="bg-background p-8 md:p-12 rounded-sm shadow-sm border-2 border-accent/20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-accent"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </div>
                  <h4 className="font-[family-name:var(--font-cormorant)] text-3xl text-charcoal">
                    Wedding Day
                  </h4>
                </div>
                <p className="font-[family-name:var(--font-montserrat)] text-charcoal/70 leading-relaxed">
                  The moment we&apos;ve all been waiting for. Join us as we
                  exchange vows in a beautiful ceremony overlooking the cliffs
                  of Uluwatu. Following the ceremony, we&apos;ll celebrate with
                  an evening reception filled with dinner, dancing, and memories
                  to last a lifetime.
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <span className="font-[family-name:var(--font-montserrat)] text-xs tracking-wider text-accent bg-accent/10 px-4 py-2 rounded-full">
                    CEREMONY
                  </span>
                  <span className="font-[family-name:var(--font-montserrat)] text-xs tracking-wider text-accent bg-accent/10 px-4 py-2 rounded-full">
                    RECEPTION
                  </span>
                  <span className="font-[family-name:var(--font-montserrat)] text-xs tracking-wider text-charcoal/50 bg-charcoal/5 px-4 py-2 rounded-full">
                    4:00 PM ONWARDS
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* RSVP Section */}
      <section id="rsvp" className="py-32 px-8 bg-charcoal">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="font-[family-name:var(--font-montserrat)] text-accent-light tracking-[0.3em] text-xs mb-4">
              WE HOPE YOU CAN JOIN US
            </p>
            <h2 className="font-[family-name:var(--font-cormorant)] text-5xl md:text-6xl font-light text-white">
              RSVP
            </h2>
            <div className="divider mx-auto mt-6" />
            <p className="font-[family-name:var(--font-montserrat)] text-white/60 mt-8 leading-relaxed">
              Please let us know if you&apos;ll be joining us in Bali for our
              wedding celebration. We kindly request your response by March 1st,
              2027.
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="font-[family-name:var(--font-montserrat)] text-white/80 text-xs tracking-wider block mb-2">
                  FIRST NAME
                </label>
                <input
                  type="text"
                  className="w-full bg-white/10 border border-white/20 rounded-sm px-4 py-3 text-white placeholder:text-white/30 font-[family-name:var(--font-montserrat)] text-sm"
                  placeholder="Your first name"
                />
              </div>
              <div>
                <label className="font-[family-name:var(--font-montserrat)] text-white/80 text-xs tracking-wider block mb-2">
                  LAST NAME
                </label>
                <input
                  type="text"
                  className="w-full bg-white/10 border border-white/20 rounded-sm px-4 py-3 text-white placeholder:text-white/30 font-[family-name:var(--font-montserrat)] text-sm"
                  placeholder="Your last name"
                />
              </div>
            </div>

            <div>
              <label className="font-[family-name:var(--font-montserrat)] text-white/80 text-xs tracking-wider block mb-2">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                className="w-full bg-white/10 border border-white/20 rounded-sm px-4 py-3 text-white placeholder:text-white/30 font-[family-name:var(--font-montserrat)] text-sm"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="font-[family-name:var(--font-montserrat)] text-white/80 text-xs tracking-wider block mb-2">
                NUMBER OF GUESTS IN YOUR PARTY
              </label>
              <select className="w-full bg-white/10 border border-white/20 rounded-sm px-4 py-3 text-white font-[family-name:var(--font-montserrat)] text-sm">
                <option value="1" className="text-charcoal">
                  1 Guest
                </option>
                <option value="2" className="text-charcoal">
                  2 Guests
                </option>
                <option value="3" className="text-charcoal">
                  3 Guests
                </option>
                <option value="4" className="text-charcoal">
                  4 Guests
                </option>
              </select>
            </div>

            {/* Event Attendance Section */}
            <div className="pt-4">
              <label className="font-[family-name:var(--font-montserrat)] text-white/80 text-xs tracking-wider block mb-4">
                WHICH EVENTS WILL YOU BE ATTENDING?
              </label>
              <div className="space-y-4">
                {/* Welcome Dinner */}
                <label className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-sm cursor-pointer hover:bg-white/10 transition-colors group">
                  <input
                    type="checkbox"
                    className="mt-1 w-5 h-5 rounded border-white/30 bg-white/10 text-accent focus:ring-accent focus:ring-offset-0 focus:ring-offset-transparent"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-[family-name:var(--font-cormorant)] text-white text-xl">
                        Welcome Dinner
                      </span>
                      <span className="font-[family-name:var(--font-montserrat)] text-white/40 text-xs">
                        May 18 · 7:00 PM
                      </span>
                    </div>
                    <p className="font-[family-name:var(--font-montserrat)] text-white/50 text-xs mt-1">
                      Join us for an intimate dinner to kick off the celebrations
                    </p>
                  </div>
                </label>

                {/* Boat Party */}
                <label className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-sm cursor-pointer hover:bg-white/10 transition-colors group">
                  <input
                    type="checkbox"
                    className="mt-1 w-5 h-5 rounded border-white/30 bg-white/10 text-accent focus:ring-accent focus:ring-offset-0 focus:ring-offset-transparent"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-[family-name:var(--font-cormorant)] text-white text-xl">
                        Boat Party
                      </span>
                      <span className="font-[family-name:var(--font-montserrat)] text-white/40 text-xs">
                        May 19 · 10:00 AM - 6:00 PM
                      </span>
                    </div>
                    <p className="font-[family-name:var(--font-montserrat)] text-white/50 text-xs mt-1">
                      Set sail for a day of fun, sun, and celebration on the water
                    </p>
                  </div>
                </label>

                {/* Wedding Ceremony & Reception */}
                <label className="flex items-start gap-4 p-4 bg-accent/10 border border-accent/30 rounded-sm cursor-pointer hover:bg-accent/20 transition-colors group">
                  <input
                    type="checkbox"
                    className="mt-1 w-5 h-5 rounded border-white/30 bg-white/10 text-accent focus:ring-accent focus:ring-offset-0 focus:ring-offset-transparent"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-[family-name:var(--font-cormorant)] text-white text-xl">
                        Wedding Ceremony & Reception
                      </span>
                      <span className="font-[family-name:var(--font-montserrat)] text-accent-light text-xs">
                        May 20 · 4:00 PM
                      </span>
                    </div>
                    <p className="font-[family-name:var(--font-montserrat)] text-white/50 text-xs mt-1">
                      The main event - ceremony followed by dinner and dancing
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="font-[family-name:var(--font-montserrat)] text-white/80 text-xs tracking-wider block mb-2">
                DIETARY REQUIREMENTS
              </label>
              <textarea
                rows={3}
                className="w-full bg-white/10 border border-white/20 rounded-sm px-4 py-3 text-white placeholder:text-white/30 font-[family-name:var(--font-montserrat)] text-sm resize-none"
                placeholder="Please let us know of any dietary requirements or allergies"
              />
            </div>

            <div>
              <label className="font-[family-name:var(--font-montserrat)] text-white/80 text-xs tracking-wider block mb-2">
                MESSAGE FOR THE COUPLE
              </label>
              <textarea
                rows={4}
                className="w-full bg-white/10 border border-white/20 rounded-sm px-4 py-3 text-white placeholder:text-white/30 font-[family-name:var(--font-montserrat)] text-sm resize-none"
                placeholder="Share your love and wishes..."
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-accent hover:bg-accent-dark text-white font-[family-name:var(--font-montserrat)] tracking-[0.2em] text-sm py-4 rounded-sm transition-colors mt-8"
            >
              SEND RSVP
            </motion.button>
          </motion.form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-8 bg-charcoal border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="font-[family-name:var(--font-cormorant)] text-4xl text-white mb-4">
            Dinal & Shayani
          </h3>
          <p className="font-[family-name:var(--font-montserrat)] text-white/50 tracking-[0.2em] text-xs">
            MAY 20, 2027 | ULUWATU, BALI
          </p>
          <div className="divider mx-auto mt-8 mb-8" />
          <p className="font-[family-name:var(--font-montserrat)] text-white/30 text-xs">
            Made with love from Sydney, Australia
          </p>
        </div>
      </footer>
    </main>
  );
}
