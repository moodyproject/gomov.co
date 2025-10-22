import { useEffect, useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => { media.removeEventListener?.('change', update); };
  }, []);
  return reduced;
}

export default function Typewriter({
  lines,
  typingSpeedMs = 40,
  pauseBetweenLinesMs = 600,
  className = '',
  ariaLabel,
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [displayed, setDisplayed] = useState(['']);
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const typeTimerRef = useRef(null);
  const lineTimerRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Cleanup function to clear all timers and animation frames
  const cleanup = useCallback(() => {
    if (typeTimerRef.current) {
      clearTimeout(typeTimerRef.current);
      typeTimerRef.current = null;
    }
    if (lineTimerRef.current) {
      clearTimeout(lineTimerRef.current);
      lineTimerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Reset state when lines change or when reduced motion toggles
  useEffect(() => {
    if (!Array.isArray(lines) || lines.length === 0) return;
    
    cleanup(); // Clear any running animations
    
    if (prefersReducedMotion) {
      setDisplayed([...lines]);
      setLineIndex(lines.length - 1);
      setCharIndex((lines[lines.length - 1] ?? '').length);
      setIsTyping(false);
      return;
    }
    
    setDisplayed(['']);
    setLineIndex(0);
    setCharIndex(0);
    setIsTyping(true);
  }, [lines, prefersReducedMotion, cleanup]);

  // Type next character with improved state management
  useEffect(() => {
    if (!Array.isArray(lines) || lines.length === 0) return;
    if (prefersReducedMotion) return;
    if (!isTyping) return;

    const fullLine = lines[lineIndex] ?? '';
    if (charIndex >= fullLine.length) {
      setIsTyping(false);
      return;
    }

    const animateChar = () => {
      setDisplayed((prev) => {
        const updated = [...prev];
        const shouldStartNewLine = updated.length - 1 !== lineIndex;
        const nextChar = fullLine.charAt(charIndex);
        
        if (shouldStartNewLine) {
          updated.push(nextChar);
        } else {
          updated[lineIndex] = (updated[lineIndex] ?? '') + nextChar;
        }
        
        return updated;
      });
      
      setCharIndex(prev => prev + 1);
    };

    typeTimerRef.current = setTimeout(animateChar, typingSpeedMs);

    return cleanup;
  }, [lines, lineIndex, charIndex, typingSpeedMs, prefersReducedMotion, isTyping, cleanup]);

  // Advance to next line after a pause
  useEffect(() => {
    if (!Array.isArray(lines) || lines.length === 0) return;
    if (prefersReducedMotion) return;
    if (isTyping) return;

    const isLastLine = lineIndex >= lines.length - 1;
    const fullLine = lines[lineIndex] ?? '';
    const finishedCurrentLine = charIndex >= fullLine.length;
    
    if (isLastLine || !finishedCurrentLine) return;

    lineTimerRef.current = setTimeout(() => {
      setLineIndex(prev => prev + 1);
      setCharIndex(0);
      setIsTyping(true);
    }, pauseBetweenLinesMs);

    return cleanup;
  }, [lines, lineIndex, charIndex, pauseBetweenLinesMs, prefersReducedMotion, isTyping, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Determine if we should show the caret (like insert mode - always visible while active)
  const shouldShowCaret = !prefersReducedMotion && 
    displayed.length > 0 && 
    lineIndex < lines.length;

  return (
    <span className={`typewriter ${prefersReducedMotion ? 'typewriter--static' : ''} ${className}`.trim()} aria-label={ariaLabel}>
      {displayed.map((text, i) => (
        <span key={`line-${i}-${text.length}`} className="typewriter-line">
          {text}
          {i === displayed.length - 1 && shouldShowCaret ? (
            <span className="typewriter-caret" aria-hidden="true"></span>
          ) : null}
          {i < displayed.length - 1 ? <br /> : null}
        </span>
      ))}
    </span>
  );
}

Typewriter.propTypes = {
  lines: PropTypes.arrayOf(PropTypes.string).isRequired,
  typingSpeedMs: PropTypes.number,
  pauseBetweenLinesMs: PropTypes.number,
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
};


