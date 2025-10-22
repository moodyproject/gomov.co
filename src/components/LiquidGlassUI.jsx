import React, { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import PropTypes from 'prop-types';

// Unified Liquid Glass UI System
// Centralized system for consistent liquid glass styling across all components

// Liquid Glass Container Component
export const LiquidGlassContainer = forwardRef(function LiquidGlassContainer(
  {
    children,
    className = '',
    style,
    padding = 'clamp(2rem, 5vw, 2.5rem)',
    look,
    variant = 'primary',
    mouseContainer,
    globalMousePos,
    mouseOffset,
    magnifier = false,
    magnifierStyle = {},
    onMagnifierUpdate,
    ...rest
  },
  ref,
) {
  const {
    flex = 0.08,
    radius = 20,
    intensity = 1,
    sheen = true,
    hotspot = true,
    rimLight = true,
    refraction = false,
    ambientLight = false,
    shimmer = false,
  } = look || {};

  const uid = useId().replaceAll(/[^a-zA-Z0-9_-]/g, '');
  const keyframeName = `liquidGlass-${uid}-slide`;
  const uniqueClass = `liquid-glass-${uid}`;

  const localRef = useRef(null);
  useImperativeHandle(ref, () => localRef.current);

  // Mobile detection at component level
  const [isMobile, setIsMobile] = useState(false);

  // Internal magnifier state with sensible defaults; used unless external is provided
  const [internalMagnifier, setInternalMagnifier] = useState({
    left: '50%',
    top: '50%',
    width: 'calc(100% - 24px)',
    height: '30px',
    visible: false,
  });

  const effectiveMagnifier = magnifierStyle && Object.keys(magnifierStyle).length > 0
    ? magnifierStyle
    : internalMagnifier;

  // Mobile detection effect
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(globalThis.window?.innerWidth <= 768);
    };
    
    checkMobile();
    globalThis.window?.addEventListener('resize', checkMobile);
    return () => globalThis.window?.removeEventListener('resize', checkMobile);
  }, []);

  // Helper to normalize numeric values to px strings and pass-through CSS strings
  const toUnit = (value) => {
    if (typeof value === 'number') return `${value}px`;
    if (value === undefined || value === null) return '0px';
    return String(value);
  };

  // Pointer-driven specular highlight with performance optimizations
  useEffect(() => {
    const targetEl = mouseContainer?.current ?? localRef.current;
    if (!targetEl) return;

    const prefersReducedMotion =
      globalThis.window?.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    let rafId;
    let desiredX = 50;
    let desiredY = 50;
    let currentX = desiredX;
    let currentY = desiredY;
    let lastUpdate = 0;

  // Base highlight opacity - reduced on mobile for performance
  const baseOpacity = Math.max(0.55, Math.min(1, 0.75 * intensity * (isMobile ? 0.8 : 1)));
  const hoverOpacity = Math.max(0.6, Math.min(1, 1 * intensity * (isMobile ? 0.9 : 1)));
    targetEl.style.setProperty('--lg-opacity', String(baseOpacity));

    const update = (timestamp) => {
      // Throttle to 60fps max
      if (timestamp - lastUpdate < 16) {
        rafId = requestAnimationFrame(update);
        return;
      }
      lastUpdate = timestamp;

      const deltaX = (desiredX - currentX) * flex;
      const deltaY = (desiredY - currentY) * flex;
      
      // Only update if change is significant enough
      if (Math.abs(deltaX) > 0.1 || Math.abs(deltaY) > 0.1) {
        currentX += deltaX;
        currentY += deltaY;
        targetEl.style.setProperty('--lg-x', `${currentX}%`);
        targetEl.style.setProperty('--lg-y', `${currentY}%`);
      }
      
      rafId = requestAnimationFrame(update);
    };

    rafId = requestAnimationFrame(update);

    const handleMove = (x, y) => {
      const rect = targetEl.getBoundingClientRect();
      desiredX = ((x - rect.left) / rect.width) * 100;
      desiredY = ((y - rect.top) / rect.height) * 100;
    };

    const onPointerMove = (e) => handleMove(e.clientX, e.clientY);

    const onPointerEnter = () => {
      targetEl.style.setProperty('--lg-opacity', String(hoverOpacity));
    };

    const onPointerLeave = () => {
      desiredX = 50;
      desiredY = 50;
      targetEl.style.setProperty('--lg-opacity', String(baseOpacity));
    };

    let externalRaf;
    const trackGlobal = () => {
      if (globalMousePos) {
        const offsetX = mouseOffset?.x ?? 0;
        const offsetY = mouseOffset?.y ?? 0;
        handleMove(globalMousePos.x + offsetX, globalMousePos.y + offsetY);
      }
      externalRaf = requestAnimationFrame(trackGlobal);
    };

    if (globalMousePos) externalRaf = requestAnimationFrame(trackGlobal);
    // Disable local pointer tracking to prevent cursor-following halo

    targetEl.addEventListener('pointerenter', onPointerEnter);
    targetEl.addEventListener('pointerleave', onPointerLeave);

    return () => {
      cancelAnimationFrame(rafId);
      cancelAnimationFrame(externalRaf);
      targetEl.removeEventListener('pointermove', onPointerMove);
      targetEl.removeEventListener('pointerenter', onPointerEnter);
      targetEl.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [mouseContainer, globalMousePos, mouseOffset, flex, intensity, isMobile]);

  // Unified magnifier interactions (fallback when no external handler)
  useEffect(() => {
    if (!magnifier) return;
    const el = localRef.current;
    if (!el) return;

    // Skip if externally controlled
    const isExternallyControlled = typeof onMagnifierUpdate === 'function' || (magnifierStyle && Object.keys(magnifierStyle).length > 0);
    let hoveredTarget = null;

    const computeFromRect = (rect, containerRect) => {
      const left = rect.left - containerRect.left + rect.width / 2;
      const top = rect.top - containerRect.top + rect.height / 2;
      const width = Math.max(rect.width + 12, 26);
      const height = Math.max(rect.height, 30);
      return { left, top, width, height };
    };

    const updateForTarget = (target) => {
      const containerRect = el.getBoundingClientRect();
      const rect = target.getBoundingClientRect();
      const { left, top, width, height } = computeFromRect(rect, containerRect);
      setInternalMagnifier({ left, top, width, height, visible: true });
    };

    const hideMagnifier = () => {
      setInternalMagnifier((prev) => ({ ...prev, visible: false }));
    };

    const onCustomUpdate = (e) => {
      const detail = e.detail || {};
      setInternalMagnifier((prev) => ({
        left: detail.left ?? prev.left,
        top: detail.top ?? prev.top,
        width: detail.width ?? prev.width,
        height: detail.height ?? prev.height,
        visible: typeof detail.visible === 'boolean' ? detail.visible : prev.visible,
      }));
    };

    const handleTargetEnter = (e) => {
      if (isExternallyControlled) return;
      const target = e.target.closest('a, button, .spec-item, [data-lg-target]');
      if (target && el.contains(target)) {
        hoveredTarget = target;
        updateForTarget(target);
      }
    };

    const handleTargetLeave = (e) => {
      if (isExternallyControlled) return;
      if (!e.currentTarget.contains(e.relatedTarget)) {
        hoveredTarget = null;
        hideMagnifier();
      }
    };

    const onPointerMove = (e) => {
      if (isExternallyControlled) return;
      if (hoveredTarget) return; // element hover takes precedence
      const containerRect = el.getBoundingClientRect();
      const left = e.clientX - containerRect.left;
      const top = e.clientY - containerRect.top;
      setInternalMagnifier({ left, top, width: 120, height: 34, visible: true });
    };

    const resolveTouchTarget = (touchEvent) => {
      if (!touchEvent.touches || touchEvent.touches.length === 0) return null;
      const primaryTouch = touchEvent.touches[0];
      const elementAtPoint = document.elementFromPoint(primaryTouch.clientX, primaryTouch.clientY);
      return elementAtPoint?.closest('a, button, .spec-item, [data-lg-target]');
    };

    const onTouchStart = (e) => {
      if (isExternallyControlled) return;
      const target = e.target.closest('a, button, .spec-item, [data-lg-target]') || resolveTouchTarget(e);
      if (target && el.contains(target)) {
        hoveredTarget = target;
        updateForTarget(target);
      }
    };

    const onTouchMove = (e) => {
      if (isExternallyControlled) return;
      const target = resolveTouchTarget(e);
      if (target && el.contains(target)) {
        hoveredTarget = target;
        updateForTarget(target);
      }
    };

    const onTouchEnd = () => {
      if (isExternallyControlled) return;
      hoveredTarget = null;
      hideMagnifier();
    };

    el.addEventListener('lg:magnifierUpdate', onCustomUpdate);
    el.addEventListener('mouseover', handleTargetEnter);
    el.addEventListener('mouseout', handleTargetLeave);
    el.addEventListener('focusin', handleTargetEnter);
    el.addEventListener('focusout', handleTargetLeave);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('touchcancel', onTouchEnd);

    return () => {
      el.removeEventListener('lg:magnifierUpdate', onCustomUpdate);
      el.removeEventListener('mouseover', handleTargetEnter);
      el.removeEventListener('mouseout', handleTargetLeave);
      el.removeEventListener('focusin', handleTargetEnter);
      el.removeEventListener('focusout', handleTargetLeave);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [magnifier, magnifierStyle, onMagnifierUpdate]);

  // Inject keyframes once per instance
  useEffect(() => {
    if (!document.getElementById(`${keyframeName}-style`)) {
      const styleTag = document.createElement('style');
      styleTag.id = `${keyframeName}-style`;
      styleTag.innerHTML = `@keyframes ${keyframeName} { 0% { background-position: 0 0; } 100% { background-position: 100% 0; } }`;
      document.head.appendChild(styleTag);
    }
  }, [keyframeName]);

  // Dynamic highlight radius based on element size
  useEffect(() => {
    const el = localRef.current;
    if (!el) return;
    const recomputeRadius = () => {
      const rect = el.getBoundingClientRect();
      const dynamicRadiusPx = Math.ceil(Math.max(rect.width, rect.height) * 0.9);
      el.style.setProperty('--lg-r', `${dynamicRadiusPx}px`);
    };
    recomputeRadius();
    window.addEventListener('resize', recomputeRadius);
    return () => window.removeEventListener('resize', recomputeRadius);
  }, []);

  const containerStyle = {
    padding,
    borderRadius: radius,
    position: 'relative',
    overflow: 'hidden',
    '--lg-x': '50%',
    '--lg-y': '50%',
    ...style,
  };

  // Precompute unit-safe magnifier values for styles
  const magLeft = toUnit(effectiveMagnifier.left);
  const magTop = toUnit(effectiveMagnifier.top);
  const magWidth = toUnit(effectiveMagnifier.width);
  const magHeight = toUnit(effectiveMagnifier.height);

  return (
    <div
      ref={localRef}
      {...rest}
      className={`${className} liquid-glass liquid-glass-${variant} glass-shadow-primary ${uniqueClass} ${refraction ? 'glass-refraction' : ''} ${ambientLight ? 'glass-ambient-light' : ''} ${shimmer ? 'glass-shimmer' : ''}`}
      style={containerStyle}
    >
      {/* Specular highlight following pointer (primary soft halo) */}
      <span
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(var(--lg-r, 600px) circle at var(--lg-x) var(--lg-y), rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 22%, rgba(255,255,255,0.03) 46%, transparent 72%)`,
          mixBlendMode: 'soft-light',
          borderRadius: radius,
          zIndex: 3,
          opacity: 'var(--lg-opacity, 0.75)',
          transition: 'opacity 200ms ease',
          willChange: 'opacity, transform',
        }}
      />

      {/* Hotspot highlight (small, brighter core) */}
      {hotspot && (
        <span
          style={{
            pointerEvents: 'none',
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(160px circle at var(--lg-x) var(--lg-y), rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.06) 35%, transparent 60%)`,
            mixBlendMode: 'screen',
            borderRadius: radius,
            zIndex: 3,
            opacity: 'calc(var(--lg-opacity, 0.75) * 0.9)',
            transition: 'opacity 200ms ease',
            willChange: 'opacity, transform',
          }}
        />
      )}

      {/* Rim light (reduced intensity) */}
      {rimLight && (
        <div
          style={{
            position: 'absolute',
            inset: '0.5px',
            borderRadius: radius,
            background: `linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%, rgba(255,255,255,0.03) 100%)`,
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />
      )}

      {/* Sheen layer (slow diagonal sweep) */}
      {sheen && (
        <span
          style={{
            pointerEvents: 'none',
            position: 'absolute',
            inset: 0,
            borderRadius: radius,
            background: `linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.10) 45%, rgba(255,255,255,0.04) 55%, transparent 70%)`,
            mixBlendMode: 'soft-light',
            zIndex: 2,
            opacity: 0.5,
            backgroundSize: '200% 100%',
            animation: `${keyframeName} 12s linear infinite`,
          }}
        />
      )}

      {/* Magnifying Glass Selector - Enhanced with better text magnification */}
      {magnifier && (
        <>
          {/* Scaled content underneath for true magnification effect */}
          <div
            style={{
              position: 'absolute',
              left: `calc(${magLeft} - 25px)`,
              top: `calc(${magTop} - 25px)`,
              width: `calc(${magWidth} + 50px)`,
              height: `calc(${magHeight} + 50px)`,
              transform: 'scale(1.4)',
              transformOrigin: 'center center',
              pointerEvents: 'none',
              zIndex: 0,
              opacity: effectiveMagnifier.visible ? 0.9 : 0,
              transition: 'opacity 0.3s ease',
              // Ensure the scaled content is properly positioned
              overflow: 'hidden',
            }}
          />

          {/* The glass magnifier overlay */}
          <Motion.div
            className="liquid-glass-magnifier"
            animate={{
              left: effectiveMagnifier.left ?? '50%',
              width: effectiveMagnifier.width ?? 'calc(100% - 24px)',
              top: effectiveMagnifier.top ?? '50%',
              height: effectiveMagnifier.height ?? '30px',
              opacity: effectiveMagnifier.visible ? 1 : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
              mass: 0.8
            }}
            style={{
              position: 'absolute',
              background: `
                linear-gradient(135deg,
                  rgba(255, 255, 255, 0.18) 0%,
                  rgba(255, 255, 255, 0.12) 50%,
                  rgba(255, 255, 255, 0.15) 100%
                ),
                var(--glass-gradient-primary)
              `,
              backdropFilter: `blur(${isMobile ? '6px' : '8px'}) saturate(170%) brightness(1.22)`,
              WebkitBackdropFilter: `blur(${isMobile ? '6px' : '8px'}) saturate(170%) brightness(1.22)`,
              borderRadius: '16px',
              transform: 'translate(-50%, -50%)',
              boxShadow: `
                0 8px 32px rgba(255, 255, 255, 0.15),
                inset 0 1px 0 rgba(255, 255, 255, 0.28),
                0 0 20px rgba(255, 255, 255, 0.12),
                inset 0 -1px 0 rgba(0, 0, 0, 0.12)
              `,
              border: '1px solid transparent',
              backgroundClip: 'padding-box',
              zIndex: 6,
              willChange: 'left, width, top, height, opacity',
              pointerEvents: 'none',
            }}
          >
            {/* Enhanced glass interior with better light effects */}
            <div
              style={{
                position: 'absolute',
                inset: '3px',
                borderRadius: '13px',
                background: `
                  radial-gradient(circle at 20% 20%,
                    rgba(255, 255, 255, 0.15) 0%,
                    rgba(255, 255, 255, 0.08) 50%,
                    transparent 80%
                  ),
                  radial-gradient(circle at 80% 80%,
                    rgba(255, 255, 255, 0.12) 0%,
                    rgba(255, 255, 255, 0.06) 50%,
                    transparent 80%
                  ),
                  radial-gradient(circle at 50% 50%,
                    rgba(255, 255, 255, 0.05) 0%,
                    transparent 60%
                  )
                `,
                filter: 'contrast(1.15) brightness(1.08)',
              }}
            />

            {/* Magnifier border effect */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                padding: '1px',
                background: 'var(--glass-border-gradient)',
                borderRadius: 'inherit',
                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                maskComposite: 'xor',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                pointerEvents: 'none',
                opacity: 0.95,
              }}
            />

            {/* Enhanced magnifier highlight */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '6%',
                right: '6%',
                height: '2px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.45) 50%, transparent 100%)',
                opacity: 0.7,
                pointerEvents: 'none',
                boxShadow: '0 0 4px rgba(255, 255, 255, 0.3)',
              }}
            />
          </Motion.div>
        </>
      )}

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 4,
          filter: 'contrast(1.05) brightness(1.02)',
        }}
      >
        {children}
      </div>
    </div>
  );
});

LiquidGlassContainer.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
  padding: PropTypes.string,
  look: PropTypes.object,
  variant: PropTypes.string,
  mouseContainer: PropTypes.object,
  globalMousePos: PropTypes.object,
  mouseOffset: PropTypes.object,
  magnifier: PropTypes.bool,
  magnifierStyle: PropTypes.object,
  onMagnifierUpdate: PropTypes.func,
};

// Liquid Glass Button Component
export const LiquidGlassButton = forwardRef(function LiquidGlassButton(
  {
    children,
    className = '',
    variant = 'primary',
    size = 'medium',
    magnifier = false,
    onMagnifierUpdate,
    onClick,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    as = 'button',
    ...rest
  },
  ref,
) {
  const buttonRef = useRef(null);
  useImperativeHandle(ref, () => buttonRef.current);

  const Component = as;
  const isButtonElement = Component === 'button';

  const sizeClasses = {
    small: 'btn--small',
    medium: 'btn--medium',
    large: 'btn--large',
  };

  const variantClasses = {
    primary: 'btn--glass btn--primary',
    secondary: 'btn--glass btn--secondary',
    tertiary: 'btn--glass btn--tertiary',
  };

  const handleMouseEnter = (e) => {
    if (magnifier && onMagnifierUpdate) {
      const rect = e.currentTarget.getBoundingClientRect();
      const container = e.currentTarget.closest('.liquid-glass');
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const left = rect.left - containerRect.left + rect.width / 2;
        const width = Math.max(rect.width + 12, 26);
        const top = rect.top - containerRect.top + rect.height / 2;
        const height = Math.max(rect.height, 30);
        onMagnifierUpdate({ left, width, top, height, visible: true });
      }
    }
    onMouseEnter?.(e);
  };

  const handleMouseLeave = () => {
    if (magnifier && onMagnifierUpdate) {
      onMagnifierUpdate(prev => ({ ...prev, visible: false }));
    }
    onMouseLeave?.();
  };

  const handleFocus = (e) => {
    if (magnifier && onMagnifierUpdate) {
      const rect = e.currentTarget.getBoundingClientRect();
      const container = e.currentTarget.closest('.liquid-glass');
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const left = rect.left - containerRect.left + rect.width / 2;
        const width = Math.max(rect.width + 12, 26);
        const top = rect.top - containerRect.top + rect.height / 2;
        const height = Math.max(rect.height, 30);
        onMagnifierUpdate({ left, width, top, height, visible: true });
      }
    }
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    if (magnifier && onMagnifierUpdate) {
      onMagnifierUpdate(prev => ({ ...prev, visible: false }));
    }
    onBlur?.(e);
  };

  return (
    <Component
      ref={buttonRef}
      className={`btn ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...(isButtonElement ? { type: 'button' } : {})}
      {...rest}
    >
      {children}
    </Component>
  );
});

LiquidGlassButton.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  variant: PropTypes.string,
  size: PropTypes.string,
  magnifier: PropTypes.bool,
  onMagnifierUpdate: PropTypes.func,
  onClick: PropTypes.func,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  as: PropTypes.oneOfType([PropTypes.string, PropTypes.elementType]),
};

// Liquid Glass Card Component
export const LiquidGlassCard = forwardRef(function LiquidGlassCard(
  {
    children,
    className = '',
    padding = '2rem',
    look,
    variant = 'primary',
    magnifier = false,
    magnifierStyle = {},
    onMagnifierUpdate,
    ...rest
  },
  ref,
) {
  return (
    <LiquidGlassContainer
      ref={ref}
      className={`liquid-glass-card ${className}`}
      padding={padding}
      look={look}
      variant={variant}
      magnifier={magnifier}
      magnifierStyle={magnifierStyle}
      onMagnifierUpdate={onMagnifierUpdate}
      {...rest}
    >
      {children}
    </LiquidGlassContainer>
  );
});

LiquidGlassCard.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  padding: PropTypes.string,
  look: PropTypes.object,
  variant: PropTypes.string,
  magnifier: PropTypes.bool,
  magnifierStyle: PropTypes.object,
  onMagnifierUpdate: PropTypes.func,
};

// Liquid Glass Tab Component
export const LiquidGlassTab = forwardRef(function LiquidGlassTab(
  {
    children,
    className = '',
    active = false,
    onClick,
    magnifier = false,
    onMagnifierUpdate,
    ...rest
  },
  ref,
) {
  const tabRef = useRef(null);
  useImperativeHandle(ref, () => tabRef.current);

  const handleMouseEnter = (e) => {
    if (magnifier && onMagnifierUpdate) {
      const rect = e.currentTarget.getBoundingClientRect();
      const container = e.currentTarget.closest('.liquid-glass');
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const left = rect.left - containerRect.left + rect.width / 2;
        const width = Math.max(rect.width + 12, 26);
        const top = rect.top - containerRect.top + rect.height / 2;
        const height = Math.max(rect.height, 30);
        onMagnifierUpdate({ left, width, top, height, visible: true });
      }
    }
  };

  const handleMouseLeave = () => {
    // Keep magnifier visible on leave to persist highlight on active tab
    if (magnifier && onMagnifierUpdate) {
      onMagnifierUpdate(prev => ({ ...prev, visible: true }));
    }
  };

  return (
    <button
      ref={tabRef}
      className={`liquid-glass-tab ${active ? 'active' : ''} ${className}`}
      type="button"
      role="tab"
      aria-selected={active}
      tabIndex={active ? 0 : -1}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      {children}
    </button>
  );
});

LiquidGlassTab.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  active: PropTypes.bool,
  onClick: PropTypes.func,
  magnifier: PropTypes.bool,
  onMagnifierUpdate: PropTypes.func,
};

// Liquid Glass Navigation Component
export const LiquidGlassNavigation = forwardRef(function LiquidGlassNavigation(
  {
    children,
    className = '',
    magnifierStyle = {},
    onMagnifierUpdate,
    ...rest
  },
  ref,
) {
  return (
    <nav
      ref={ref}
      className={`liquid-glass-nav ${className}`}
      {...rest}
    >
      <LiquidGlassContainer
        className="nav-container"
        padding="7.2px 9.6px"
        look={{ radius: 24, flex: 0.05 }}
        magnifier={true}
        magnifierStyle={magnifierStyle}
        onMagnifierUpdate={onMagnifierUpdate}
      >
        {children}
      </LiquidGlassContainer>
    </nav>
  );
});

LiquidGlassNavigation.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  magnifierStyle: PropTypes.object,
  onMagnifierUpdate: PropTypes.func,
};

// Liquid Glass Stats Component
export const LiquidGlassStats = forwardRef(function LiquidGlassStats(
  {
    children,
    className = '',
    ...rest
  },
  ref,
) {
  return (
    <div
      ref={ref}
      className={`liquid-glass-stats ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
});

LiquidGlassStats.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

// Liquid Glass Stat Item Component
export const LiquidGlassStatItem = forwardRef(function LiquidGlassStatItem(
  {
    value,
    label,
    className = '',
    look,
    ...rest
  },
  ref,
) {
  return (
    <LiquidGlassContainer
      ref={ref}
      className={`liquid-glass-stat-item ${className}`}
      padding="0"
      look={{ radius: 20, flex: 0.05, ...look }}
      {...rest}
    >
      <Motion.div
        className="stat"
        whileHover={{ 
          scale: 1.05, 
          y: -2,
          transition: { duration: 0.2 } 
        }}
      >
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </Motion.div>
    </LiquidGlassContainer>
  );
});

LiquidGlassStatItem.propTypes = {
  value: PropTypes.string,
  label: PropTypes.string,
  className: PropTypes.string,
  look: PropTypes.object,
};

// Export all components
export default {
  LiquidGlassContainer,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassTab,
  LiquidGlassNavigation,
  LiquidGlassStats,
  LiquidGlassStatItem,
};
