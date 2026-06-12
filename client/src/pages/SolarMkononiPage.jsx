import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { getSolarMkononiSettings } from "../lib/api.js";

const useCountUp = (endValue, duration = 2000) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const originalValue = endValue.toString();
          const hasPlus = originalValue.includes("+");
          const hasComma = originalValue.includes(",");
          const numericValue = parseFloat(originalValue.replace(/[^0-9.]/g, "")) || 0;

          let startTime;
          const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentCount = easeOutQuart * numericValue;

            let displayValue = Math.floor(currentCount);
            if (hasComma) {
              displayValue = displayValue.toLocaleString();
            }
            if (hasPlus) {
              displayValue = displayValue + "+";
            }

            setCount(displayValue);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(originalValue);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [endValue, duration, hasAnimated]);

  return [count, elementRef];
};

const SolarMkononiPage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getSolarMkononiSettings();
        setSettings(data.settings);
      } catch (error) {
        console.error("Failed to load Solar Mkononi settings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#f0fdf4" }}>
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600 mx-auto" />
          <p className="text-emerald-800">Loading Solar Mkononi...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#f0fdf4" }}>
        <p className="text-emerald-800">Unable to load Solar Mkononi settings.</p>
      </div>
    );
  }

  const theme = settings.theme || {};
  const sections = settings.sections || {};

  return (
    <div style={{ backgroundColor: theme.backgroundColor || "#f0fdf4", color: theme.textColor || "#064e3b" }}>
      {sections.hero !== false && <HeroSection settings={settings} theme={theme} />}
      {sections.stats !== false && <StatsSection settings={settings} theme={theme} />}
      {sections.services !== false && <ServicesSection settings={settings} theme={theme} />}
      {sections.registration !== false && <RegistrationSection settings={settings} theme={theme} />}
      {sections.howItWorks !== false && <HowItWorksSection settings={settings} theme={theme} />}
      {sections.ussd !== false && <USSDSection settings={settings} theme={theme} />}
      {sections.paygo !== false && <PAYGOSection settings={settings} theme={theme} />}
      {sections.resourceLibrary !== false && <ResourceLibrarySection settings={settings} theme={theme} />}
      {sections.impact !== false && <ImpactSection settings={settings} theme={theme} />}
      {sections.partners !== false && <PartnersSection settings={settings} theme={theme} />}
      {sections.contact !== false && <ContactSection settings={settings} theme={theme} />}
      {sections.footer !== false && <FooterSection settings={settings} theme={theme} />}
    </div>
  );
};

const HeroSection = ({ settings, theme }) => {
  const hero = settings.hero || {};
  const branding = settings.branding || {};
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const useDesktopOnMobile = hero.useDesktopOnMobile !== false;
  let backgroundUrl;
  if (isMobile) {
    backgroundUrl = hero.backgroundUrlMobile || (useDesktopOnMobile ? hero.backgroundUrl : null);
  } else {
    backgroundUrl = hero.backgroundUrl;
  }

  const heroStyle = {
    backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
    backgroundColor: backgroundUrl ? undefined : theme.primaryColor || "#059669",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat"
  };

  const overlayOpacity = hero.overlayOpacity !== undefined ? hero.overlayOpacity : 0.5;
  const overlayStyle = {
    backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4" style={heroStyle}>
      <div className="absolute inset-0" style={overlayStyle} />
      <div className="relative z-10 max-w-6xl mx-auto text-center text-white">
        {branding.logoUrl && (
          <img src={branding.logoUrl} alt={branding.logoAlt || "Solar Mkononi"} className="h-20 mx-auto mb-8" />
        )}
        <h1 className="text-4xl md:text-6xl font-bold mb-6">{hero.headline || "Renewable Energy at Your Fingertips"}</h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
          {hero.description || "Connect with verified renewable energy suppliers, technicians, financial institutions, and innovative clean energy solutions through Solar Mkononi."}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={hero.primaryCtaHref || "#services"}
            className="px-8 py-4 rounded-full font-bold text-white transition hover:scale-105"
            style={{ backgroundColor: theme.primaryColor || "#059669" }}
          >
            {hero.primaryCta || "Explore Services"}
          </a>
          <a
            href={hero.secondaryCtaHref || "#ussd"}
            className="px-8 py-4 rounded-full font-bold border-2 border-white text-white transition hover:scale-105"
          >
            {hero.secondaryCta || "Access USSD Platform"}
          </a>
        </div>
      </div>
    </section>
  );
};

const StatsSection = ({ settings, theme }) => {
  const stats = settings.stats || {};
  const items = stats.items || [];
  const isOdd = items.length % 2 !== 0;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <section className="py-20 px-4" style={{ backgroundColor: theme.surfaceBackground || "#ffffff" }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {items.map((item, index) => {
            const [count, ref] = useCountUp(item.value);
            const isLastItem = index === items.length - 1;
            return (
              <div
                key={index}
                className="text-center"
                ref={ref}
                style={isMobile && isOdd && isLastItem ? { gridColumn: "1 / -1", maxWidth: "50%", margin: "0 auto" } : {}}
              >
                <div className="text-4xl md:text-5xl font-bold mb-2" style={{ color: theme.primaryColor || "#059669" }}>
                  {count}
                </div>
                <div className="text-sm md:text-base" style={{ color: theme.mutedTextColor || "#475569" }}>
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const ServicesSection = ({ settings, theme }) => {
  const services = settings.services || {};
  const cards = services.cards || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const carouselRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const cardWidth = useRef(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef(null);

  // Duplicate cards for infinite scrolling
  const duplicatedCards = [...cards, ...cards];

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (carouselRef.current && isMobile) {
      cardWidth.current = carouselRef.current.offsetWidth;
    }
  }, [isMobile, cards]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  const nextSlide = () => {
    if (isMobile) {
      setTranslateX((prev) => {
        const newTranslate = prev - cardWidth.current;
        return newTranslate;
      });
    } else {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      }
    }
  };

  const prevSlide = () => {
    if (isMobile) {
      setTranslateX((prev) => {
        const newTranslate = prev + cardWidth.current;
        return newTranslate;
      });
    } else {
      if (currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
      }
    }
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    touchEndX.current = e.touches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    setTranslateX((prev) => prev - diff);
    touchStartX.current = touchEndX.current;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    } else {
      // Snap to nearest card
      const currentCardIndex = Math.round(Math.abs(translateX) / cardWidth.current);
      const snappedTranslate = -currentCardIndex * cardWidth.current;
      
      // Reset position if we've gone beyond the original cards
      if (snappedTranslate <= -cardWidth.current * cards.length) {
        setTranslateX(0);
      } else if (snappedTranslate > 0) {
        setTranslateX(-cardWidth.current * (cards.length - 1));
      } else {
        setTranslateX(snappedTranslate);
      }
    }
  };

  const getAnimationStyle = (index) => {
    const animationEnabled = isMobile ? services.mobileAnimationEnabled : services.animationEnabled;
    if (!animationEnabled || !hasAnimated) return {};
    const animationStyle = isMobile ? services.mobileAnimationStyle : services.animationStyle;
    const animationDelay = isMobile ? services.mobileAnimationDelay : services.animationDelay;
    const style = animationStyle || "fade-up";
    const delay = index * (animationDelay || 100);
    const animations = {
      "fade-up": { opacity: 0, transform: "translateY(30px)", animation: `fadeInUp 0.6s ease-out ${delay}ms forwards` },
      "fade-down": { opacity: 0, transform: "translateY(-30px)", animation: `fadeInDown 0.6s ease-out ${delay}ms forwards` },
      "fade-left": { opacity: 0, transform: "translateX(30px)", animation: `fadeInLeft 0.6s ease-out ${delay}ms forwards` },
      "fade-right": { opacity: 0, transform: "translateX(-30px)", animation: `fadeInRight 0.6s ease-out ${delay}ms forwards` },
      "scale-up": { opacity: 0, transform: "scale(0.8)", animation: `scaleUp 0.6s ease-out ${delay}ms forwards` },
      "scale-down": { opacity: 0, transform: "scale(1.2)", animation: `scaleDown 0.6s ease-out ${delay}ms forwards` },
      "slide-up": { opacity: 0, transform: "translateY(100%)", animation: `slideUp 0.6s ease-out ${delay}ms forwards` },
      "slide-down": { opacity: 0, transform: "translateY(-100%)", animation: `slideDown 0.6s ease-out ${delay}ms forwards` }
    };
    return animations[style] || animations["fade-up"];
  };

  return (
    <section id="services" ref={sectionRef} className="py-20 px-4" style={{ backgroundColor: services.backgroundColor || theme.backgroundColor || "#f0fdf4" }}>
      <style>{`
        @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInDown { to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInLeft { to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeInRight { to { opacity: 1; transform: translateX(0); } }
        @keyframes scaleUp { to { opacity: 1; transform: scale(1); } }
        @keyframes scaleDown { to { opacity: 1; transform: scale(1); } }
        @keyframes slideUp { to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: theme.textColor || "#064e3b" }}>
          {services.title || "Our Services"}
        </h2>
        <p className="text-center mb-12 max-w-2xl mx-auto" style={{ color: theme.mutedTextColor || "#475569" }}>
          {services.description || "Comprehensive renewable energy solutions for Kenya"}
        </p>

        {isMobile ? (
          <div className="relative">
            <div
              ref={carouselRef}
              className="overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="flex"
                style={{
                  transform: `translateX(${translateX}px)`,
                  transition: isDragging ? 'none' : 'transform 0.3s ease-out'
                }}
              >
                {duplicatedCards.map((card, index) => (
                  <div key={index} className="w-full flex-shrink-0 px-4">
                    <div
                      className="p-6 rounded-2xl"
                      style={{
                        backgroundColor: theme.surfaceBackground || "#ffffff",
                        border: `1px solid ${theme.borderColor || "#a7f3d0"}`,
                        ...getAnimationStyle(index % cards.length)
                      }}
                    >
                      <div className="text-4xl mb-4">🌟</div>
                      <h3 className="text-xl font-bold mb-2" style={{ color: theme.textColor || "#064e3b" }}>
                        {card.title}
                      </h3>
                      <p style={{ color: theme.mutedTextColor || "#475569" }}>{card.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={prevSlide}
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold transition hover:scale-110"
                style={{ backgroundColor: theme.primaryColor || "#059669", color: "#ffffff" }}
              >
                ←
              </button>
              <div className="flex items-center gap-2">
                {cards.map((_, index) => {
                  const currentCardIndex = Math.round(Math.abs(translateX) / cardWidth.current) % cards.length;
                  return (
                    <button
                      key={index}
                      onClick={() => setTranslateX(-index * cardWidth.current)}
                      className={`w-3 h-3 rounded-full transition ${index === currentCardIndex ? "scale-125" : ""}`}
                      style={{
                        backgroundColor: index === currentCardIndex ? theme.primaryColor || "#059669" : theme.borderColor || "#a7f3d0"
                      }}
                    />
                  );
                })}
              </div>
              <button
                onClick={nextSlide}
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold transition hover:scale-110"
                style={{ backgroundColor: theme.primaryColor || "#059669", color: "#ffffff" }}
              >
                →
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cards.map((card, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl transition hover:scale-105"
                style={{
                  backgroundColor: theme.surfaceBackground || "#ffffff",
                  border: `1px solid ${theme.borderColor || "#a7f3d0"}`,
                  ...getAnimationStyle(index)
                }}
              >
                <div className="text-4xl mb-4">🌟</div>
                <h3 className="text-xl font-bold mb-2" style={{ color: theme.textColor || "#064e3b" }}>
                  {card.title}
                </h3>
                <p style={{ color: theme.mutedTextColor || "#475569" }}>{card.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const RegistrationSection = ({ settings, theme }) => {
  const registration = settings.registration || {};
  const backgroundColor = registration.backgroundColor || "#059669";
  const backgroundPattern = registration.backgroundPattern || "none";

  const getPatternStyle = () => {
    switch (backgroundPattern) {
      case "wave":
        return {
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
          backgroundSize: "60px 60px",
          animation: "wavePattern 3s ease-in-out infinite"
        };
      case "web":
        return {
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "30px 30px",
          animation: "webPattern 2s linear infinite"
        };
      case "dots":
        return {
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.2) 2px, transparent 2px)`,
          backgroundSize: "20px 20px",
          animation: "dotsPattern 1.5s ease-in-out infinite"
        };
      case "grid":
        return {
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.1) 2px, transparent 2px)`,
          backgroundSize: "40px 40px",
          animation: "gridPattern 3s linear infinite"
        };
      case "zigzag":
        return {
          backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 0, rgba(255,255,255,0.1) 10px, transparent 10px, transparent 20px)`,
          backgroundSize: "40px 40px",
          animation: "zigzagPattern 2s linear infinite"
        };
      default:
        return {};
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes wavePattern {
            0%, 100% { background-position: 0% 0%; }
            50% { background-position: 100% 100%; }
          }
          @keyframes webPattern {
            0% { background-position: 0 0; }
            100% { background-position: 30px 30px; }
          }
          @keyframes dotsPattern {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes gridPattern {
            0% { background-position: 0 0; }
            100% { background-position: 40px 40px; }
          }
          @keyframes zigzagPattern {
            0% { background-position: 0 0; }
            100% { background-position: 40px 40px; }
          }
        `}
      </style>
      <section className="py-20 px-4 relative overflow-hidden" style={{ backgroundColor, ...getPatternStyle() }}>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#ffffff" }}>
            {registration.title || "Register as a Stakeholder"}
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.9)" }}>
            {registration.description || "Join our network of solar suppliers, installers, financing institutions, biogas suppliers, and more. Register today to become part of Kenya's renewable energy ecosystem."}
          </p>
          <a
            href={registration.link || "https://ussd.kerea.org"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 rounded-full text-lg font-bold text-white transition hover:scale-105 hover:shadow-lg"
            style={{ backgroundColor: "#ffffff", color: backgroundColor }}
          >
            {registration.buttonText || "Register Now"}
          </a>
        </div>
      </section>
    </>
  );
};

const HowItWorksSection = ({ settings, theme }) => {
  const howItWorks = settings.howItWorks || {};
  const steps = howItWorks.steps || [];
  const backgroundColor = howItWorks.backgroundColor || "#ffffff";

  return (
    <section className="py-20 px-4" style={{ backgroundColor }}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: theme.textColor || "#064e3b" }}>
          {howItWorks.title || "How It Works"}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div
                className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 text-lg md:text-2xl font-bold text-white"
                style={{ backgroundColor: theme.primaryColor || "#059669" }}
              >
                {index + 1}
              </div>
              <h3 className="text-sm md:text-lg font-bold mb-2" style={{ color: theme.textColor || "#064e3b" }}>
                {step.title}
              </h3>
              <p className="text-xs md:text-sm" style={{ color: theme.mutedTextColor || "#475569" }}>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const USSDSection = ({ settings, theme }) => {
  const ussd = settings.ussd || {};
  const backgroundColor = ussd.backgroundColor || theme.primaryColor || "#059669";
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const getAnimationStyle = (index) => {
    const animationEnabled = isMobile ? ussd.mobileAnimationEnabled : ussd.animationEnabled;
    if (!animationEnabled) return {};
    const animationStyle = isMobile ? ussd.mobileAnimationStyle : ussd.animationStyle;
    const animationDelay = isMobile ? ussd.mobileAnimationDelay : ussd.animationDelay;
    const style = animationStyle || "fade-up";
    const delay = index * (animationDelay || 100);
    const animations = {
      "fade-up": { opacity: 0, transform: "translateY(30px)", animation: `fadeInUp 0.6s ease-out ${delay}ms forwards` },
      "fade-down": { opacity: 0, transform: "translateY(-30px)", animation: `fadeInDown 0.6s ease-out ${delay}ms forwards` },
      "fade-left": { opacity: 0, transform: "translateX(30px)", animation: `fadeInLeft 0.6s ease-out ${delay}ms forwards` },
      "fade-right": { opacity: 0, transform: "translateX(-30px)", animation: `fadeInRight 0.6s ease-out ${delay}ms forwards` },
      "scale-up": { opacity: 0, transform: "scale(0.8)", animation: `scaleUp 0.6s ease-out ${delay}ms forwards` },
      "scale-down": { opacity: 0, transform: "scale(1.2)", animation: `scaleDown 0.6s ease-out ${delay}ms forwards` },
      "slide-up": { opacity: 0, transform: "translateY(100%)", animation: `slideUp 0.6s ease-out ${delay}ms forwards` },
      "slide-down": { opacity: 0, transform: "translateY(-100%)", animation: `slideDown 0.6s ease-out ${delay}ms forwards` }
    };
    return animations[style] || animations["fade-up"];
  };

  return (
    <section id="ussd" className="py-20 px-4" style={{ backgroundColor }}>
      <style>{`
        @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInDown { to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInLeft { to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeInRight { to { opacity: 1; transform: translateX(0); } }
        @keyframes scaleUp { to { opacity: 1; transform: scale(1); } }
        @keyframes scaleDown { to { opacity: 1; transform: scale(1); } }
        @keyframes slideUp { to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div className="max-w-6xl mx-auto text-center text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{ussd.title || "Access via USSD"}</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          {ussd.description || "No internet? No problem. Access our platform directly from your mobile phone"}
        </p>
        <div className="inline-block bg-white rounded-2xl p-8 mb-8">
          <a
            href={`tel:${ussd.dialCode || "*789*788#"}`}
            className="text-5xl md:text-6xl font-bold mb-4 block cursor-pointer hover:scale-105 transition-transform"
            style={{ color: backgroundColor }}
          >
            {ussd.dialCode || "*789*788#"}
          </a>
          <p className="text-gray-600">Tap to dial this code from any mobile phone</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {ussd.instructions?.map((instruction, index) => (
            <div
              key={index}
              className="bg-white bg-opacity-20 rounded-lg p-4"
              style={getAnimationStyle(index)}
            >
              <div className="text-2xl mb-2">{index + 1}</div>
              <p className="text-sm">{instruction}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const PAYGOSection = ({ settings, theme }) => {
  const paygo = settings.paygo || {};
  const items = paygo.items || [];
  const backgroundColor = paygo.backgroundColor || "#f0fdf4";
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const getAnimationStyle = (index) => {
    const animationEnabled = isMobile ? paygo.mobileAnimationEnabled : paygo.animationEnabled;
    if (!animationEnabled) return {};
    const animationStyle = isMobile ? paygo.mobileAnimationStyle : paygo.animationStyle;
    const animationDelay = isMobile ? paygo.mobileAnimationDelay : paygo.animationDelay;
    const style = animationStyle || "fade-up";
    const delay = index * (animationDelay || 100);
    const animations = {
      "fade-up": { opacity: 0, transform: "translateY(30px)", animation: `fadeInUp 0.6s ease-out ${delay}ms forwards` },
      "fade-down": { opacity: 0, transform: "translateY(-30px)", animation: `fadeInDown 0.6s ease-out ${delay}ms forwards` },
      "fade-left": { opacity: 0, transform: "translateX(30px)", animation: `fadeInLeft 0.6s ease-out ${delay}ms forwards` },
      "fade-right": { opacity: 0, transform: "translateX(-30px)", animation: `fadeInRight 0.6s ease-out ${delay}ms forwards` },
      "scale-up": { opacity: 0, transform: "scale(0.8)", animation: `scaleUp 0.6s ease-out ${delay}ms forwards` },
      "scale-down": { opacity: 0, transform: "scale(1.2)", animation: `scaleDown 0.6s ease-out ${delay}ms forwards` },
      "slide-up": { opacity: 0, transform: "translateY(100%)", animation: `slideUp 0.6s ease-out ${delay}ms forwards` },
      "slide-down": { opacity: 0, transform: "translateY(-100%)", animation: `slideDown 0.6s ease-out ${delay}ms forwards` }
    };
    return animations[style] || animations["fade-up"];
  };

  return (
    <section className="py-20 px-4" style={{ backgroundColor }}>
      <style>{`
        @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInDown { to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInLeft { to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeInRight { to { opacity: 1; transform: translateX(0); } }
        @keyframes scaleUp { to { opacity: 1; transform: scale(1); } }
        @keyframes scaleDown { to { opacity: 1; transform: scale(1); } }
        @keyframes slideUp { to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: theme.textColor || "#064e3b" }}>
          {paygo.title || "PAYGO Solutions"}
        </h2>
        <p className="text-center mb-12 max-w-2xl mx-auto" style={{ color: theme.mutedTextColor || "#475569" }}>
          {paygo.description || "Pay-as-you-go solar solutions for affordable clean energy access"}
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl text-center transition hover:scale-105"
              style={{
                backgroundColor: theme.surfaceBackground || "#ffffff",
                border: `1px solid ${theme.borderColor || "#a7f3d0"}`,
                ...getAnimationStyle(index)
              }}
            >
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-lg font-bold mb-2" style={{ color: theme.textColor || "#064e3b" }}>
                {item.title}
              </h3>
              <p className="text-sm" style={{ color: theme.mutedTextColor || "#475569" }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ResourceLibrarySection = ({ settings, theme }) => {
  const resourceLibrary = settings.resourceLibrary || {};
  const resources = resourceLibrary.resources || [];
  const backgroundColor = resourceLibrary.backgroundColor || "#f0fdf4";

  return (
    <section className="py-20 px-4" style={{ backgroundColor }}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: theme.textColor || "#064e3b" }}>
          {resourceLibrary.title || "Resource Library"}
        </h2>
        <p className="text-center mb-12 max-w-2xl mx-auto" style={{ color: theme.mutedTextColor || "#475569" }}>
          {resourceLibrary.description || "Access policies, best practices, and sector guides"}
        </p>
        {resources.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl transition hover:scale-105"
                style={{ backgroundColor: theme.surfaceMuted || "#f0fdf4", border: `1px solid ${theme.borderColor || "#a7f3d0"}` }}
              >
                <h3 className="text-lg font-bold mb-2" style={{ color: theme.textColor || "#064e3b" }}>
                  {resource.title}
                </h3>
                <p className="text-sm mb-4" style={{ color: theme.mutedTextColor || "#475569" }}>
                  {resource.description}
                </p>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 rounded-lg font-bold text-white text-sm"
                  style={{ backgroundColor: theme.primaryColor || "#059669" }}
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center" style={{ color: theme.mutedTextColor || "#475569" }}>
            Resources coming soon...
          </p>
        )}
      </div>
    </section>
  );
};

const ImpactSection = ({ settings, theme }) => {
  const impact = settings.impact || {};
  const stories = impact.stories || [];
  const backgroundColor = impact.backgroundColor || "#ffffff";
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const getAnimationStyle = (index) => {
    const animationEnabled = isMobile ? impact.mobileAnimationEnabled : impact.animationEnabled;
    if (!animationEnabled) return {};
    const animationStyle = isMobile ? impact.mobileAnimationStyle : impact.animationStyle;
    const animationDelay = isMobile ? impact.mobileAnimationDelay : impact.animationDelay;
    const style = animationStyle || "fade-up";
    const delay = index * (animationDelay || 100);
    const animations = {
      "fade-up": { opacity: 0, transform: "translateY(30px)", animation: `fadeInUp 0.6s ease-out ${delay}ms forwards` },
      "fade-down": { opacity: 0, transform: "translateY(-30px)", animation: `fadeInDown 0.6s ease-out ${delay}ms forwards` },
      "fade-left": { opacity: 0, transform: "translateX(30px)", animation: `fadeInLeft 0.6s ease-out ${delay}ms forwards` },
      "fade-right": { opacity: 0, transform: "translateX(-30px)", animation: `fadeInRight 0.6s ease-out ${delay}ms forwards` },
      "scale-up": { opacity: 0, transform: "scale(0.8)", animation: `scaleUp 0.6s ease-out ${delay}ms forwards` },
      "scale-down": { opacity: 0, transform: "scale(1.2)", animation: `scaleDown 0.6s ease-out ${delay}ms forwards` },
      "slide-up": { opacity: 0, transform: "translateY(100%)", animation: `slideUp 0.6s ease-out ${delay}ms forwards` },
      "slide-down": { opacity: 0, transform: "translateY(-100%)", animation: `slideDown 0.6s ease-out ${delay}ms forwards` }
    };
    return animations[style] || animations["fade-up"];
  };

  return (
    <section className="py-20 px-4" style={{ backgroundColor }}>
      <style>{`
        @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInDown { to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInLeft { to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeInRight { to { opacity: 1; transform: translateX(0); } }
        @keyframes scaleUp { to { opacity: 1; transform: scale(1); } }
        @keyframes scaleDown { to { opacity: 1; transform: scale(1); } }
        @keyframes slideUp { to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: theme.textColor || "#064e3b" }}>
          {impact.title || "Our Impact"}
        </h2>
        <p className="text-center mb-12 max-w-2xl mx-auto" style={{ color: theme.mutedTextColor || "#475569" }}>
          {impact.description || "Transforming lives through renewable energy across Kenya"}
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {stories.map((story, index) => (
            <div
              key={index}
              className="rounded-2xl overflow-hidden transition hover:scale-105"
              style={{
                backgroundColor: theme.surfaceBackground || "#ffffff",
                border: `1px solid ${theme.borderColor || "#a7f3d0"}`,
                ...getAnimationStyle(index)
              }}
            >
              {story.imageUrl && (
                <img src={story.imageUrl} alt={story.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                <h3 className="text-lg font-bold mb-2" style={{ color: theme.textColor || "#064e3b" }}>
                  {story.title}
                </h3>
                <p className="text-sm" style={{ color: theme.mutedTextColor || "#475569" }}>
                  {story.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const PartnersSection = ({ settings, theme }) => {
  const partners = settings.partners || {};
  const logos = partners.logos || [];
  const backgroundColor = partners.backgroundColor || "#ffffff";

  return (
    <section className="py-20 px-4" style={{ backgroundColor }}>
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: theme.textColor || "#064e3b" }}>
          {partners.title || "Our Partners"}
        </h2>
        <p className="mb-12 max-w-2xl mx-auto" style={{ color: theme.mutedTextColor || "#475569" }}>
          {partners.description || "Working together to accelerate renewable energy adoption"}
        </p>
        {logos.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-8">
            {logos.map((logo, index) => (
              <img key={index} src={logo.url} alt={logo.alt || "Partner"} className="h-16 opacity-70 hover:opacity-100 transition" />
            ))}
          </div>
        ) : (
          <p style={{ color: theme.mutedTextColor || "#475569" }}>Partner logos coming soon...</p>
        )}
      </div>
    </section>
  );
};

const ContactSection = ({ settings, theme }) => {
  const contact = settings.contact || {};
  const backgroundColor = contact.backgroundColor || "#f0fdf4";

  return (
    <section id="contact" className="py-20 px-4" style={{ backgroundColor }}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: theme.textColor || "#064e3b" }}>
          {contact.title || "Get in Touch"}
        </h2>
        <p className="text-center mb-12 max-w-2xl mx-auto" style={{ color: theme.mutedTextColor || "#475569" }}>
          {contact.description || "Have questions? We're here to help"}
        </p>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl" style={{ backgroundColor: theme.surfaceBackground || "#ffffff", border: `1px solid ${theme.borderColor || "#a7f3d0"}` }}>
            <h3 className="text-xl font-bold mb-6" style={{ color: theme.textColor || "#064e3b" }}>
              Contact Information
            </h3>
            <div className="space-y-4">
              <div>
                <div className="font-bold mb-1" style={{ color: theme.primaryColor || "#059669" }}>Email</div>
                <a href={`mailto:${contact.email}`} className="hover:underline">{contact.email}</a>
              </div>
              <div>
                <div className="font-bold mb-1" style={{ color: theme.primaryColor || "#059669" }}>Phone</div>
                <a href={`tel:${contact.phone}`} className="hover:underline">{contact.phone}</a>
              </div>
              <div>
                <div className="font-bold mb-1" style={{ color: theme.primaryColor || "#059669" }}>Address</div>
                <p>{contact.address}</p>
              </div>
            </div>
          </div>
          {contact.formEnabled && (
            <div className="p-8 rounded-2xl" style={{ backgroundColor: theme.surfaceBackground || "#ffffff", border: `1px solid ${theme.borderColor || "#a7f3d0"}` }}>
              <h3 className="text-xl font-bold mb-6" style={{ color: theme.textColor || "#064e3b" }}>
                Send us a message
              </h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: theme.textColor || "#064e3b" }}>
                    Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border"
                    style={{ borderColor: theme.borderColor || "#a7f3d0", backgroundColor: theme.surfaceMuted || "#f0fdf4" }}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: theme.textColor || "#064e3b" }}>
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-lg border"
                    style={{ borderColor: theme.borderColor || "#a7f3d0", backgroundColor: theme.surfaceMuted || "#f0fdf4" }}
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: theme.textColor || "#064e3b" }}>
                    Message
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border"
                    style={{ borderColor: theme.borderColor || "#a7f3d0", backgroundColor: theme.surfaceMuted || "#f0fdf4" }}
                    placeholder="Your message"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 rounded-lg font-bold text-white transition hover:scale-105"
                  style={{ backgroundColor: theme.primaryColor || "#059669" }}
                >
                  Send Message
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const FooterSection = ({ settings, theme }) => {
  const footer = settings.footer || {};
  const branding = settings.branding || {};
  const backgroundColor = footer.backgroundColor || "#064e3b";

  return (
    <footer className="py-12 px-4" style={{ backgroundColor, borderTop: `1px solid ${theme.borderColor || "#a7f3d0"}` }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            {branding.logoUrl && (
              <img src={branding.logoUrl} alt={branding.logoAlt || "Solar Mkononi"} className="h-12 mb-4" />
            )}
            <h3 className="text-xl font-bold mb-2" style={{ color: theme.textColor || "#064e3b" }}>
              {footer.title || "Solar Mkononi"}
            </h3>
            <p className="text-sm" style={{ color: theme.mutedTextColor || "#475569" }}>
              {footer.body || "Empowering Kenya with accessible renewable energy solutions"}
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4" style={{ color: theme.textColor || "#064e3b" }}>Quick Links</h4>
            <ul className="space-y-2">
              {footer.links?.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="hover:underline text-sm" style={{ color: theme.mutedTextColor || "#475569" }}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4" style={{ color: theme.textColor || "#064e3b" }}>Connect</h4>
            <div className="flex gap-4">
              {footer.socialLinks?.map((social, index) => (
                <a key={index} href={social.url} target="_blank" rel="noopener noreferrer" className="text-2xl">
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="text-center pt-8" style={{ borderTop: `1px solid ${theme.borderColor || "#a7f3d0"}` }}>
          <p className="text-sm" style={{ color: theme.mutedTextColor || "#475569" }}>
            {footer.copyright || "© 2026 Solar Mkononi. All rights reserved."}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default SolarMkononiPage;
