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
            <p className="font-[family-name:var(--font-montserrat)] text-accent tracking-[0.2em] md:tracking-[0.3em] text-xs mb-4">
              OUR STORY
            </p>
            <h2 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-6xl font-light text-charcoal">
              About Us
            </h2>
            <div className="divider mx-auto mt-6" />
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 md:gap-24">
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
            <p className="font-[family-name:var(--font-cormorant)] text-xl md:text-3xl text-charcoal italic leading-relaxed max-w-2xl mx-auto">
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
      <section className="py-16 md:py-32 px-4 md:px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="font-[family-name:var(--font-montserrat)] text-accent tracking-[0.2em] md:tracking-[0.3em] text-xs mb-4">
              A DESTINATION CELEBRATION
            </p>
            <h2 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-6xl font-light text-charcoal">
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
      <section id="itinerary" className="py-16 md:py-32 px-4 md:px-8 bg-cream">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="font-[family-name:var(--font-montserrat)] text-accent tracking-[0.2em] md:tracking-[0.3em] text-xs mb-4">
              THREE DAYS OF CELEBRATION
            </p>
            <h2 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-6xl font-light text-charcoal">
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
                  May 19
                </h3>
                <p className="font-[family-name:var(--font-montserrat)] text-charcoal/50 text-sm mt-1">
                  Wednesday
                </p>
              </div>
              <div className="bg-background p-6 md:p-12 rounded-sm shadow-sm">
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
                  May 20
                </h3>
                <p className="font-[family-name:var(--font-montserrat)] text-charcoal/50 text-sm mt-1">
                  Thursday
                </p>
              </div>
              <div className="bg-background p-6 md:p-12 rounded-sm shadow-sm border-2 border-accent/20">
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
                  of Uluwatu. Cocktail hour follows as the sun goes down, and
                  then we celebrate with an evening reception filled with
                  dinner, dancing, and memories to last a lifetime.
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <span className="font-[family-name:var(--font-montserrat)] text-xs tracking-wider text-accent bg-accent/10 px-4 py-2 rounded-full">
                    CEREMONY
                  </span>
                  <span className="font-[family-name:var(--font-montserrat)] text-xs tracking-wider text-accent bg-accent/10 px-4 py-2 rounded-full">
                    COCKTAIL HOUR
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
                  May 21
                </h3>
                <p className="font-[family-name:var(--font-montserrat)] text-charcoal/50 text-sm mt-1">
                  Friday
                </p>
              </div>
              <div className="bg-background p-6 md:p-12 rounded-sm shadow-sm">
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
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <h4 className="font-[family-name:var(--font-cormorant)] text-3xl text-charcoal">
                    Recovery Day
                  </h4>
                </div>
                <p className="font-[family-name:var(--font-montserrat)] text-charcoal/70 leading-relaxed">
                  One last day together before everyone heads home. We&apos;re
                  still finalising the plan &mdash; it may be a boat party out on
                  the water, or a reserved area at a beach club for all of our
                  guests. Either way, expect sun, food, and a slow, easy end to
                  the celebrations. Details to follow closer to the date.
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <span className="font-[family-name:var(--font-montserrat)] text-xs tracking-wider text-sage bg-sage/10 px-4 py-2 rounded-full">
                    PLANS TO BE CONFIRMED
                  </span>
                  <span className="font-[family-name:var(--font-montserrat)] text-xs tracking-wider text-charcoal/50 bg-charcoal/5 px-4 py-2 rounded-full">
                    ALL DAY
                  </span>
                </div>
              </div>
            </motion.div>
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
          <div className="divider mx-auto mt-8 mb-8" />
          <p className="font-[family-name:var(--font-montserrat)] text-white/30 text-xs">
            Made with love from Sydney, Australia
          </p>
        </div>
      </footer>
    </main>
  );
}
