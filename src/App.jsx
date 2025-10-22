import { motion as Motion } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import Typewriter from './components/Typewriter';
import { 
  LiquidGlassContainer, 
  LiquidGlassButton, 
  LiquidGlassCard, 
  LiquidGlassNavigation,
  LiquidGlassStats,
  LiquidGlassStatItem
} from './components/LiquidGlassUI';
import CodeExample from './components/CodeExample';
import './App.css';
import heroWatchImage from './assets/hero-watch.png';

const FEATURE_CARDS = [
  {
    title: 'Edge-First Architecture',
    description: 'Distributed wearables with ESP32 + IMU nodes, custom BLE mesh, and Cloudflare edge compute.',
  },
  {
    title: 'Teaching Engine',
    description: 'Live motion is compared to exemplars so crews get human-readable timing cues instantly.',
  },
  {
    title: 'Developer SDKs',
    description: 'TypeScript/Python SDKs with Unity/Unreal bridges. Simple APIs expose motion data anywhere.',
  },
  {
    title: 'Privacy-Aware',
    description: 'Short-lived tokens, signed exports, configurable retention, and hashed IP storage baked in.',
  },
];

const SYSTEM_SPECS = [
  {
    id: 'hardware',
    heading: 'Hardware Layer',
    side: 'left',
    items: [
      { label: 'Nodes', value: 'ESP32 + 6-DoF IMU + AFE' },
      { label: 'Wireless', value: 'Custom BLE mesh + GATT' },
      { label: 'Gateway', value: 'Any node can promote' },
      { label: 'Sync', value: '≤1.5ms p95 desync' },
    ],
  },
  {
    id: 'cloud',
    heading: 'Cloud & ML',
    side: 'right',
    items: [
      { label: 'Edge', value: 'Cloudflare Workers + KV' },
      { label: 'Models', value: 'BiGRU + Transformer' },
      { label: 'Teaching', value: 'Exemplar alignment + corrections' },
      { label: 'APIs', value: 'REST + WebSocket + SDKs' },
    ],
  },
];

const PERFORMANCE_SPECS = [
  {
    id: 'latency',
    heading: 'Latency Targets',
    side: 'left',
    items: [
      { label: 'Motion → UI', value: '≤100-150ms p95' },
      { label: 'Node → Gateway', value: '0-25ms' },
      { label: 'Gateway → App', value: '0-20ms' },
      { label: 'Edge Compute', value: '1-10ms' },
    ],
  },
  {
    id: 'quality',
    heading: 'Quality Metrics',
    side: 'right',
    items: [
      { label: 'Sync Accuracy', value: '≤1.5ms p95 desync' },
      { label: 'ML Stability', value: 'ICC ≥0.85' },
      { label: 'Correction Error', value: '≤8° angular' },
      { label: 'Availability', value: '≥99.9% monthly' },
    ],
  },
];

const NAV_SECTIONS = [
  { name: 'Platform', href: '#platform' },
  { name: 'Technology', href: '#technology' },
  { name: 'Performance', href: '#performance' },
  { name: 'SDK', href: '#sdk' },
  { name: 'Contact', href: '#contact' },
];

function App() {
  const [activeSection, setActiveSection] = useState(0);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navItemRefs = useRef([]);
  const [magnifierStyle, setMagnifierStyle] = useState({ left: 50, width: 70 });
  const navContainerRef = useRef(null);
  const [navMagnifiedIndex, setNavMagnifiedIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Specs magnifier states (per column)
  const leftSpecItemRefs = useRef([]);
  const rightSpecItemRefs = useRef([]);
  const [leftSpecMag, setLeftSpecMag] = useState({ top: 0, height: 0, visible: false });
  const [rightSpecMag, setRightSpecMag] = useState({ top: 0, height: 0, visible: false });
  const [leftSpecActiveIdx, setLeftSpecActiveIdx] = useState(null);
  const [rightSpecActiveIdx, setRightSpecActiveIdx] = useState(null);

  // Performance Targets magnifier states (per column)
  const perfLeftItemRefs = useRef([]);
  const perfRightItemRefs = useRef([]);
  const [perfLeftMag, setPerfLeftMag] = useState({ top: 0, height: 0, visible: false });
  const [perfRightMag, setPerfRightMag] = useState({ top: 0, height: 0, visible: false });
  const [perfLeftActiveIdx, setPerfLeftActiveIdx] = useState(null);
  const [perfRightActiveIdx, setPerfRightActiveIdx] = useState(null);

  const typewriterLines = isMobile
    ? ['Wearables and edge software that teach and adapt in real time.']
    : ['Distributed wearables + edge/cloud software that understands and teaches movement.'];

  const heroStatsVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: isMobile ? 0 : 0.2,
        delayChildren: isMobile ? 0.2 : 1.2,
      },
    },
  };

  const featureCardVariants = {
    hidden: { opacity: 0, y: isMobile ? 16 : 40, scale: isMobile ? 1 : 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: isMobile ? 0.45 : 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const heroContentTransition = { duration: isMobile ? 0.6 : 1, delay: isMobile ? 0.15 : 0.2 };
  const heroVisualTransition = { duration: isMobile ? 0.6 : 1.1, delay: isMobile ? 0.2 : 0.4 };

  useEffect(() => {
    const updateViewportFlags = () => {
      setIsMobile(globalThis.window?.innerWidth <= 768);
    };

    updateViewportFlags();
    globalThis.window?.addEventListener('resize', updateViewportFlags);
    globalThis.window?.addEventListener('orientationchange', updateViewportFlags);
    return () => {
      globalThis.window?.removeEventListener('resize', updateViewportFlags);
      globalThis.window?.removeEventListener('orientationchange', updateViewportFlags);
    };
  }, []);

  useEffect(() => {
    const updateDprClass = () => {
      const lowDpr = (globalThis.window?.devicePixelRatio || 1) < 1.5;
      const root = globalThis.document?.documentElement;
      if (!root) return;
      root.classList.toggle('lg-low-dpr', lowDpr);
    };

    updateDprClass();
    globalThis.window?.addEventListener('resize', updateDprClass);
    globalThis.window?.addEventListener('orientationchange', updateDprClass);
    return () => {
      globalThis.window?.removeEventListener('resize', updateDprClass);
      globalThis.window?.removeEventListener('orientationchange', updateDprClass);
    };
  }, []);

  const updateMagnifierFromElement = useCallback((el) => {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const container = el.closest('.liquid-glass');
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const left = rect.left - containerRect.left + rect.width / 2;
    const width = Math.max(rect.width + 4, 22);
    const top = rect.top - containerRect.top + rect.height / 2;
    const height = Math.max(rect.height, 22);
    setMagnifierStyle({ left, width, top, height, visible: true });
  }, [setMagnifierStyle]);

  // Helpers to update specs magnifier based on an item element
  const updateSpecMagnifierFromEl = (el, setState) => {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const parent = el.closest('.liquid-glass');
    if (!parent) return;
    const parentRect = parent.getBoundingClientRect();

    const isMagnified = el.classList.contains('magnified');

    const verticalPadding = isMagnified ? 12 : 8;
    const horizontalPadding = isMagnified ? 28 : 20;

    const baseHeight = rect.height + verticalPadding;
    const top = rect.top - parentRect.top + rect.height / 2; // center point stays consistent
    const height = Math.min(
      parentRect.height - 12,
      Math.max(baseHeight, 30)
    );

    let width = Math.min(
      parentRect.width - 24,
      rect.width + horizontalPadding
    );

    const halfWidth = width / 2;
    let left = rect.left - parentRect.left + rect.width / 2;

    const minBoundary = 12 + halfWidth;
    const maxBoundary = parentRect.width - 12 - halfWidth;
    if (left < minBoundary) left = minBoundary;
    if (left > maxBoundary) left = maxBoundary;

    setState((prev) => ({
      ...prev,
      top,
      height,
      left,
      width,
      visible: true
    }));
  };

  const hideSpecMagnifier = (setState) => {
    setState((prev) => ({ ...prev, visible: false }));
  };

  const updateMagnifierToIndex = useCallback((idx) => {
    const el = navItemRefs.current[idx];
    if (el) updateMagnifierFromElement(el);
  }, [updateMagnifierFromElement]);

  // Update magnifier position when active section changes with spring animation
  useEffect(() => {
    const timer = setTimeout(() => {
      updateMagnifierToIndex(activeSection);
    }, 16); // Optimized for 60fps

    return () => clearTimeout(timer);
  }, [activeSection, updateMagnifierToIndex]);

  // Re-align on resize to keep magnifier sized/positioned correctly
  useEffect(() => {
    const onResize = () => updateMagnifierToIndex(activeSection);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [activeSection, updateMagnifierToIndex]);

  // Smart auto-hide navigation on scroll with throttling
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          // Always keep nav visible (floating glass toolbar)
          setIsNavVisible(true);
          
          setLastScrollY(currentScrollY);
          
          // Detect active section
          const scrollPos = currentScrollY + 200;
          NAV_SECTIONS.forEach((section, idx) => {
            const element = document.querySelector(section.href);
            if (element) {
              const top = element.offsetTop;
              const height = element.offsetHeight;
              
              if (scrollPos >= top && scrollPos < top + height) {
                setActiveSection(idx);
              }
            }
          });
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div className="app">
      <a href="#main-content" className="skip-link">Skip to content</a>
      {/* Navigation */}
      <Motion.div
        className={`nav ${isNavVisible ? 'nav-visible' : 'nav-hidden'}`}
        initial={{ y: -340, opacity: 0 }}
        animate={{
          y: isNavVisible ? 0 : -340,
          opacity: isNavVisible ? 1 : 0
        }}
        transition={{ 
          duration: 0.4, 
          ease: [0.25, 0.46, 0.45, 0.94] // Custom easing for smoothness
        }}
      >
        <LiquidGlassNavigation
          magnifierStyle={magnifierStyle}
          onMagnifierUpdate={setMagnifierStyle}
        >
          <div className="nav-pane-content">
            <nav 
              className="nav-links-container"
              ref={navContainerRef}
              role="navigation"
              aria-label="Main navigation"
              onMouseLeave={() => {
                updateMagnifierToIndex(activeSection);
                setMagnifierStyle(prev => ({ ...prev, visible: true }));
                setNavMagnifiedIndex(null);
              }}
            >
              <ul className="nav-links">
                {NAV_SECTIONS.map((section, idx) => (
                  <li key={section.name} role="none">
                    <a
                      ref={(el) => { navItemRefs.current[idx] = el; }}
                      href={section.href}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveSection(idx);
                        document.querySelector(section.href)?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start'
                        });
                      }}
                      onMouseEnter={() => { setNavMagnifiedIndex(idx); updateMagnifierToIndex(idx); }}
                      onFocus={() => { setNavMagnifiedIndex(idx); updateMagnifierToIndex(idx); }}
                      onBlur={() => {
                        // If focus leaves the nav entirely, revert to the active index
                        setTimeout(() => {
                          const container = navContainerRef.current;
                          const active = document.activeElement;
                          if (container && active && !container.contains(active)) {
                            updateMagnifierToIndex(activeSection);
                            setNavMagnifiedIndex(null);
                          }
                        }, 0);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setActiveSection(idx);
                          document.querySelector(section.href)?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                          });
                        }
                      }}
                      className={`${idx === activeSection ? 'active' : ''} ${idx === navMagnifiedIndex ? 'magnified' : ''}`}
                      role="menuitem"
                      aria-current={idx === activeSection ? 'page' : undefined}
                      tabIndex={0}
                    >
                      {section.name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <Motion.div 
              className="logo logo-inside"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              MOV
            </Motion.div>
          </div>
        </LiquidGlassNavigation>
      </Motion.div>

      <main id="main-content" role="main">
      {/* Hero Section */}
      <section className="hero">
        <Motion.div
          className="hero-content"
          initial={{ opacity: 0, y: isMobile ? 18 : 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={heroContentTransition}
        >
          <h1 className="hero-title">
            <span className="hero-title-line">Movement</span>
            <span className="hero-title-line gradient-text">Intelligence</span>
          </h1>
          <p className="hero-subtitle">
            <Typewriter
              lines={typewriterLines}
              typingSpeedMs={isMobile ? 24 : 28}
              pauseBetweenLinesMs={isMobile ? 400 : 600}
              ariaLabel={typewriterLines[0]}
            />
          </p>
          <Motion.div 
            className="hero-stats"
            initial="hidden"
            animate="visible"
            variants={heroStatsVariants}
          >
            <LiquidGlassStats>
              <LiquidGlassStatItem
                value="<100ms"
                label="Latency"
                look={{ radius: 20, flex: 0.05 }}
              />
              <LiquidGlassStatItem
                value="4+"
                label="Nodes"
                look={{ radius: 20, flex: 0.05 }}
              />
              <LiquidGlassStatItem
                value="SDK"
                label="Ready"
                look={{ radius: 20, flex: 0.05 }}
              />
            </LiquidGlassStats>
          </Motion.div>
        </Motion.div>
        
        {/* Hero Visual */}
        <Motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={heroVisualTransition}
        >
          <div className="hero-visual-frame liquid-glass glass-shadow-primary">
            <img
              src={heroWatchImage}
              alt="MOV wearable visualization"
              className="hero-visual-image"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
            />
          </div>
        </Motion.div>
      </section>

      {/* Platform Overview Section */}
      <section id="platform" className="features">
        <Motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2>Movement Intelligence Platform</h2>
          <p className="section-subtitle">
            Turn raw motion into synchronized, teachable data with sub-100ms latency
          </p>
        </Motion.div>

        <Motion.div 
          className="features-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: isMobile ? 0 : 0.15,
                delayChildren: isMobile ? 0.15 : 0.1
              }
            }
          }}
        >
          {FEATURE_CARDS.map((card) => (
            <LiquidGlassCard
              padding="0"
              look={{ radius: 28, flex: 0.05 }}
              key={card.title}
            >
              <Motion.div
                className="feature-card"
                variants={featureCardVariants}
                whileHover={
                  isMobile
                    ? undefined
                    : { 
                        y: -8, 
                        transition: { duration: 0.2 } 
                      }
                }
              >
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </Motion.div>
            </LiquidGlassCard>
          ))}
        </Motion.div>
      </section>

      {/* Technology Section */}
      <section id="technology" className="specs">
        <Motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2>System Architecture</h2>
          <p className="section-subtitle">
            Edge-first, modular, and interoperable via open APIs
          </p>
        </Motion.div>

        {isMobile ? (
          <div className="specs-accordion">
            {SYSTEM_SPECS.map((group, index) => (
              <LiquidGlassContainer
                key={group.id}
                className="specs-accordion-shell"
                padding="0"
                look={{
                  radius: 24,
                  flex: 0.05,
                  sheen: true,
                  hotspot: true,
                  rimLight: true,
                  ambientLight: true,
                }}
                variant="secondary"
              >
                <details
                  className="specs-accordion-item"
                  open={index === 0}
                >
                  <summary>
                    <span>{group.heading}</span>
                  </summary>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item.label} className="specs-accordion-row">
                        <span className="specs-accordion-label">{item.label}</span>
                        <span className="specs-accordion-value">{item.value}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              </LiquidGlassContainer>
            ))}
          </div>
        ) : (
          <div className="specs-grid">
            {SYSTEM_SPECS.map((group) => {
              const isLeftGroup = group.side === 'left';
              const itemRefs = isLeftGroup ? leftSpecItemRefs : rightSpecItemRefs;
              const activeIdx = isLeftGroup ? leftSpecActiveIdx : rightSpecActiveIdx;
              const setActiveIdx = isLeftGroup ? setLeftSpecActiveIdx : setRightSpecActiveIdx;
              const magnifierState = isLeftGroup ? leftSpecMag : rightSpecMag;
              const setMagnifierState = isLeftGroup ? setLeftSpecMag : setRightSpecMag;
              const initialX = isLeftGroup ? -30 : 30;

              return (
                <Motion.div
                  key={group.id}
                  initial={{ opacity: 0, x: initialX }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <LiquidGlassContainer
                    padding="clamp(2rem, 5vw, 3.5rem)"
                    look={{ 
                      radius: 28, 
                      flex: 0.05, 
                      sheen: true, 
                      hotspot: true, 
                      rimLight: true, 
                      refraction: true, 
                      ambientLight: true, 
                      shimmer: true 
                    }}
                    magnifier
                    magnifierStyle={magnifierState}
                    onMagnifierUpdate={setMagnifierState}
                  >
                    <h3>{group.heading}</h3>
                    {group.items.map((item, idx) => (
                      <div
                        key={item.label}
                        className={`spec-item ${activeIdx === idx ? 'magnified' : ''}`}
                        ref={(el) => { itemRefs.current[idx] = el; }}
                        onMouseEnter={(e) => {
                          updateSpecMagnifierFromEl(e.currentTarget, setMagnifierState);
                          setActiveIdx(idx);
                        }}
                        onMouseLeave={() => {
                          hideSpecMagnifier(setMagnifierState);
                          setActiveIdx(null);
                        }}
                      >
                        <div className="spec-label">{item.label}</div>
                        <div className="spec-value">{item.value}</div>
                      </div>
                    ))}
                  </LiquidGlassContainer>
                </Motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Performance Metrics Section */}
      <section id="performance" className="specs">
        <Motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2>Performance Targets</h2>
          <p className="section-subtitle">
            Engineered for ultra-low latency and high precision
          </p>
        </Motion.div>

        {isMobile ? (
          <div className="specs-accordion">
            {PERFORMANCE_SPECS.map((group, index) => (
              <LiquidGlassContainer
                key={group.id}
                className="specs-accordion-shell"
                padding="0"
                look={{
                  radius: 24,
                  flex: 0.05,
                  sheen: true,
                  hotspot: true,
                  rimLight: true,
                  ambientLight: true,
                }}
                variant="secondary"
              >
                <details
                  className="specs-accordion-item"
                  open={index === 0}
                >
                  <summary>
                    <span>{group.heading}</span>
                  </summary>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item.label} className="specs-accordion-row">
                        <span className="specs-accordion-label">{item.label}</span>
                        <span className="specs-accordion-value">{item.value}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              </LiquidGlassContainer>
            ))}
          </div>
        ) : (
          <div className="specs-grid">
            {PERFORMANCE_SPECS.map((group) => {
              const isLeftGroup = group.side === 'left';
              const itemRefs = isLeftGroup ? perfLeftItemRefs : perfRightItemRefs;
              const activeIdx = isLeftGroup ? perfLeftActiveIdx : perfRightActiveIdx;
              const setActiveIdx = isLeftGroup ? setPerfLeftActiveIdx : setPerfRightActiveIdx;
              const magnifierState = isLeftGroup ? perfLeftMag : perfRightMag;
              const setMagnifierState = isLeftGroup ? setPerfLeftMag : setPerfRightMag;
              const initialX = isLeftGroup ? -30 : 30;

              return (
                <Motion.div
                  key={group.id}
                  initial={{ opacity: 0, x: initialX }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <LiquidGlassContainer
                    padding="clamp(2rem, 5vw, 3.5rem)"
                    look={{ 
                      radius: 28, 
                      flex: 0.05, 
                      sheen: true, 
                      hotspot: true, 
                      rimLight: true, 
                      refraction: true, 
                      ambientLight: true, 
                      shimmer: true 
                    }}
                    magnifier
                    magnifierStyle={magnifierState}
                    onMagnifierUpdate={setMagnifierState}
                  >
                    <h3>{group.heading}</h3>
                    {group.items.map((item, idx) => (
                      <div
                        key={item.label}
                        className={`spec-item ${activeIdx === idx ? 'magnified' : ''}`}
                        ref={(el) => { itemRefs.current[idx] = el; }}
                        onMouseEnter={(e) => {
                          updateSpecMagnifierFromEl(e.currentTarget, setMagnifierState);
                          setActiveIdx(idx);
                        }}
                        onMouseLeave={() => {
                          hideSpecMagnifier(setMagnifierState);
                          setActiveIdx(null);
                        }}
                      >
                        <div className="spec-label">{item.label}</div>
                        <div className="spec-value">{item.value}</div>
                      </div>
                    ))}
                  </LiquidGlassContainer>
                </Motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* SDK Showcase Section */}
      <section id="sdk" className="features">
        <Motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2>Developer Experience</h2>
          <p className="section-subtitle">
            Simple APIs that expose motion data to any application
          </p>
          <div className="coming-soon-container">
            <span className="coming-soon-badge">Coming Soon</span>
          </div>
        </Motion.div>

        <LiquidGlassContainer
          padding="2rem"
          look={{ radius: 28, flex: 0.05, sheen: true, hotspot: true, rimLight: true, refraction: true, ambientLight: true, shimmer: true }}
        >
          <CodeExample />
        </LiquidGlassContainer>
      </section>

      {/* CTA Section */}
      <section id="contact" className="cta-section">
        <LiquidGlassContainer
          variant="secondary"
          padding="0"
          look={{ radius: 32, flex: 0.05 }}
        >
          <Motion.div
            className="cta-content"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2>Ready to Build the Future of Motion?</h2>
            <p>Join us in creating the movement intelligence platform that will power the next generation of applications</p>
            <div className="cta-buttons">
              <LiquidGlassButton
                variant="primary"
                size="large"
                className="cta-button"
                magnifier={true}
                onMagnifierUpdate={() => {}}
                onClick={() => {
                  window.location.href = 'mailto:moudsaistuff@gmail.com';
                }}
              >
                Partner with MOV
              </LiquidGlassButton>
            </div>
          </Motion.div>
        </LiquidGlassContainer>
      </section>

      </main>

      {/* Footer */}
      <footer className="footer">
        <p>© 2024 MOV. Movement Intelligence Platform.</p>
      </footer>
    </div>
  );
}

export default App;
