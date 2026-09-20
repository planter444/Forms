import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AnimatedPatternBackground from "../components/AnimatedPatternBackground.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import BrandLogo from "../components/BrandLogo.jsx";
import { getTermsConditionsSettings } from "../lib/api.js";

const TermsConditionsPage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    
    const loadSettings = async () => {
      try {
        const data = await getTermsConditionsSettings();
        setSettings(data.settings);
      } catch (error) {
        console.error("Failed to load terms and conditions settings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    if (settings?.seo?.title) {
      document.title = settings.seo.title;
    }
    if (settings?.seo?.description) {
      document.querySelector('meta[name="description"]')?.setAttribute('content', settings.seo.description);
    }
  }, [settings]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#f8fafc" }}>
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#f8fafc" }}>
        <div className="text-center">
          <p className="text-sm text-gray-600">Unable to load terms and conditions.</p>
          <Link to="/" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  const header = settings.header || {};
  const content = settings.content || {};
  const footer = settings.footer || {};
  const theme = settings.theme || {};

  const getAnimationClass = (enabled, style, delay) => {
    if (!enabled) return "";
    const delayStyle = delay ? `animation-delay: ${delay}ms;` : "";
    switch (style) {
      case "fade-down":
        return `animate-fade-down ${delayStyle}`;
      case "fade-up":
        return `animate-fade-up ${delayStyle}`;
      case "fade-left":
        return `animate-fade-left ${delayStyle}`;
      case "fade-right":
        return `animate-fade-right ${delayStyle}`;
      case "bounce":
        return `animate-bounce ${delayStyle}`;
      case "pulse":
        return `animate-pulse ${delayStyle}`;
      default:
        return "";
    }
  };

  const getPatternClass = (pattern) => {
    switch (pattern) {
      case "dots":
        return "bg-dots";
      case "grid":
        return "bg-grid";
      case "waves":
        return "bg-waves";
      case "zigzag":
        return "bg-zigzag";
      default:
        return "";
    }
  };

  const getPaddingClass = (padding) => {
    switch (padding) {
      case "compact":
        return "p-4 sm:p-6";
      case "comfortable":
        return "p-6 sm:p-8";
      case "spacious":
        return "p-8 sm:p-12";
      default:
        return "p-6 sm:p-8";
    }
  };

  const getFontSizeClass = (fontSize) => {
    switch (fontSize) {
      case "sm":
        return "text-sm";
      case "base":
        return "text-base";
      case "lg":
        return "text-lg";
      case "xl":
        return "text-xl";
      default:
        return "text-base";
    }
  };

  const getLineHeightClass = (lineHeight) => {
    switch (lineHeight) {
      case "tight":
        return "leading-tight";
      case "normal":
        return "leading-normal";
      case "relaxed":
        return "leading-relaxed";
      case "loose":
        return "leading-loose";
      default:
        return "leading-relaxed";
    }
  };

  const formatContent = (text) => {
    if (!text) return "";
    
    return text.split('\n').map((line, index) => {
      if (line.trim() === '') {
        return <br key={index} />;
      }
      
      // Handle bold text **text**
      let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Handle italic text *text*
      formattedLine = formattedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      // Handle headings # Heading
      if (formattedLine.startsWith('# ')) {
        return <h2 key={index} className="text-xl font-bold mt-6 mb-3" style={{ color: content.textColor }}>{formattedLine.substring(2)}</h2>;
      }
      
      // Handle numbered lists
      if (/^\d+\./.test(formattedLine)) {
        return <p key={index} className="ml-4" style={{ color: content.textColor }} dangerouslySetInnerHTML={{ __html: formattedLine }} />;
      }
      
      return <p key={index} className="mb-4" style={{ color: content.textColor }} dangerouslySetInnerHTML={{ __html: formattedLine }} />;
    });
  };

  return (
    <div className="relative flex min-h-screen flex-col" style={{ backgroundColor: theme.backgroundColor || "#ffffff" }}>
      <AnimatedPatternBackground />
      
      {/* Header */}
      {header.enabled !== false && (
        <header 
          className={`relative z-10 ${getPatternClass(header.backgroundPattern)}`}
          style={{ 
            backgroundColor: header.backgroundColor || "#ffffff",
            color: header.textColor || "#0f172a"
          }}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className={getAnimationClass(header.animationEnabled, header.animationStyle, header.animationDelay)}>
              <div className="flex items-center justify-between mb-6">
                {header.logoUrl ? (
                  <img 
                    src={header.logoUrl} 
                    alt="Logo" 
                    className="h-12 w-auto"
                  />
                ) : (
                  <Link to="/" className="flex items-center">
                    <BrandLogo size="md" />
                  </Link>
                )}
              </div>
              
              <div className="text-center">
                <h1 
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight"
                  style={{ color: header.textColor || "#0f172a" }}
                >
                  {header.title || "Terms and Conditions"}
                </h1>
                {header.subtitle && (
                  <p 
                    className="mt-4 text-lg sm:text-xl"
                    style={{ color: header.subtitleColor || "#475569" }}
                  >
                    {header.subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Content */}
      {content.enabled !== false && (
        <main 
          className={`relative z-10 flex-1 ${getPatternClass(content.backgroundPattern)}`}
          style={{ backgroundColor: content.backgroundColor || "#f8fafc" }}
        >
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div 
              className={`rounded-2xl border shadow-sm ${getPaddingClass(content.padding)} ${getAnimationClass(content.animationEnabled, content.animationStyle, content.animationDelay)}`}
              style={{ 
                borderColor: theme.borderColor || "#e2e8f0",
                backgroundColor: "#ffffff"
              }}
            >
              <div className={`${getFontSizeClass(content.fontSize)} ${getLineHeightClass(content.lineHeight)}`}>
                {formatContent(content.terms)}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Footer */}
      {footer.enabled !== false && (
        <footer 
          className={`relative z-10 ${getPatternClass(footer.backgroundPattern)}`}
          style={{ 
            backgroundColor: footer.backgroundColor || "#0f172a",
            color: footer.textColor || "#ffffff"
          }}
        >
          <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 ${getAnimationClass(footer.animationEnabled, footer.animationStyle, footer.animationDelay)}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                {footer.title && (
                  <h3 className="text-lg font-semibold mb-3" style={{ color: footer.textColor }}>
                    {footer.title}
                  </h3>
                )}
                {footer.body && (
                  <p className="text-sm mb-4" style={{ color: footer.textColor }}>
                    {footer.body}
                  </p>
                )}
                <div className="space-y-2 text-sm">
                  {footer.email && (
                    <a 
                      href={`mailto:${footer.email}`}
                      className="block hover:underline"
                      style={{ color: footer.linkColor || "#93c5fd" }}
                    >
                      {footer.email}
                    </a>
                  )}
                  {footer.phone && (
                    <a 
                      href={`tel:${footer.phone}`}
                      className="block hover:underline"
                      style={{ color: footer.linkColor || "#93c5fd" }}
                    >
                      {footer.phone}
                    </a>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3" style={{ color: footer.textColor }}>
                  Quick Links
                </h3>
                <ul className="space-y-2">
                  {footer.links && footer.links.map((link, index) => (
                    <li key={index}>
                      <Link 
                        to={link.href}
                        className="text-sm hover:underline"
                        style={{ color: footer.linkColor || "#93c5fd" }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {footer.copyright && (
              <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm" style={{ color: footer.textColor }}>
                {footer.copyright}
              </div>
            )}
          </div>
        </footer>
      )}

      <style jsx>{`
        @keyframes fade-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-left {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fade-right {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fade-down {
          animation: fade-down 0.6s ease-out forwards;
        }
        
        .animate-fade-up {
          animation: fade-up 0.6s ease-out forwards;
        }
        
        .animate-fade-left {
          animation: fade-left 0.6s ease-out forwards;
        }
        
        .animate-fade-right {
          animation: fade-right 0.6s ease-out forwards;
        }
        
        .bg-dots {
          background-image: radial-gradient(circle, currentColor 1px, transparent 1px);
          background-size: 20px 20px;
          opacity: 0.1;
        }
        
        .bg-grid {
          background-image: linear-gradient(currentColor 1px, transparent 1px),
            linear-gradient(90deg, currentColor 1px, transparent 1px);
          background-size: 20px 20px;
          opacity: 0.1;
        }
        
        .bg-waves {
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
        }
        
        .bg-zigzag {
          background-image: linear-gradient(135deg, currentColor 25%, transparent 25%), 
            linear-gradient(225deg, currentColor 25%, transparent 25%), 
            linear-gradient(45deg, currentColor 25%, transparent 25%), 
            linear-gradient(315deg, currentColor 25%, transparent 25%);
          background-size: 20px 20px;
          opacity: 0.1;
        }
      `}</style>
    </div>
  );
};

export default TermsConditionsPage;
