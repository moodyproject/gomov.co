import { motion as Motion } from 'framer-motion';
import { useEffect, useRef, useState, useCallback } from 'react';
import { LiquidGlassTab, LiquidGlassNavigation } from './LiquidGlassUI';

const CodeExample = () => {
  const [activeTab, setActiveTab] = useState('typescript');
  const [tabsMagnifier, setTabsMagnifier] = useState({ left: 0, width: 0, top: 0, height: 0, visible: false });
  const [isCompact, setIsCompact] = useState(false);
  const containerRef = useRef(null);
  const tabRefs = useRef({});

  const updateMagnifierFromElement = useCallback((el) => {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const navEl = containerRef.current;
    if (!navEl) return;
    const containerRoot = navEl.querySelector('.liquid-glass') || navEl;
    const containerRect = containerRoot.getBoundingClientRect();
    const left = rect.left - containerRect.left + rect.width / 2;
    const width = Math.max(rect.width + 12, 26);
    const top = rect.top - containerRect.top + rect.height / 2;
    const height = Math.max(rect.height, 30);
    setTabsMagnifier({ left, width, top, height, visible: true });
  }, []);

  const updateMagnifierToActive = useCallback(() => {
    const el = tabRefs.current[activeTab];
    if (el) updateMagnifierFromElement(el);
  }, [activeTab, updateMagnifierFromElement]);

  useEffect(() => {
    const raf = requestAnimationFrame(updateMagnifierToActive);
    const onResize = () => updateMagnifierToActive();
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [updateMagnifierToActive]);

  useEffect(() => {
    const handleResize = () => {
      setIsCompact(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const codeExamples = {
    typescript: {
      language: 'typescript',
      code: `import { MovClient } from '@mov/sdk';

const mov = new MovClient({ 
  base: "https://edge.mov" 
});

// Start a session
const { session_id, token } = await mov.startSession({ 
  nodes: [1, 2, 3, 4] 
});

// Connect to gateway
await mov.connectGatewayBLE();

// Stream motion data
mov.onFrame(frame => {
  renderer.apply(frame);
});

mov.onFeedback(feedback => {
  coach.update(feedback);
});

await mov.stream();`,
      description: 'TypeScript SDK - Simple motion capture setup'
    },
    python: {
      language: 'python',
      code: `from mov import MovClient, export_session

# Initialize client
mov = MovClient(base_url="https://edge.mov")

# Start session
session = mov.start_session(nodes=[1, 2, 3, 4])

# Process motion data
for frame in mov.stream():
    process_motion(frame)
    
    if frame.feedback:
        apply_corrections(frame.feedback)

# Export session data
url = export_session(session.id)
df = load_features(session.id)  # Parquet format`,
      description: 'Python SDK - Data analysis and export'
    },
    unity: {
      language: 'csharp',
      code: `using MOV.SDK;

public class MotionController : MonoBehaviour 
{
    private MovClient movClient;
    
    void Start() 
    {
        movClient = new MovClient();
        movClient.OnFrame += HandleMotionFrame;
        movClient.OnFeedback += HandleFeedback;
        
        movClient.Connect();
    }
    
    void HandleMotionFrame(MotionFrame frame) 
    {
        // Apply to character rig
        ApplyToRig(frame);
        
        // Trigger haptics
        if (frame.rhythmOffset > threshold)
            TriggerHapticFeedback();
    }
    
    void HandleFeedback(FeedbackData feedback) 
    {
        // Show coaching UI
        ShowCorrection(feedback.correction);
    }
}`,
      description: 'Unity Bridge - VR/AR integration'
    }
  };

  const orientation = isCompact ? 'vertical' : 'horizontal';
  const activePanelId = `code-pane-${activeTab}`;

  return (
    <Motion.div
      className="code-example"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="code-content">
        <div className="code-description">
          {codeExamples[activeTab].description}
        </div>
        <pre
          id={activePanelId}
          className="code-block"
          role="tabpanel"
          aria-labelledby={`code-tab-${activeTab}`}
        >
          <code>{codeExamples[activeTab].code}</code>
        </pre>
      </div>

      <LiquidGlassNavigation
        ref={containerRef}
        className={`mini-toolbar ${isCompact ? 'mini-toolbar--stacked' : ''}`}
        magnifierStyle={tabsMagnifier}
        onMagnifierUpdate={setTabsMagnifier}
        onMouseLeave={updateMagnifierToActive}
        role="toolbar"
        aria-label="Code language toolbar"
      >
        <div
          className="code-tabs"
          aria-label="Languages"
          role="tablist"
          aria-orientation={orientation}
        >
          {Object.entries(codeExamples).map(([key, example]) => {
            const tabId = `code-tab-${key}`;
            const panelId = `code-pane-${key}`;
            return (
              <LiquidGlassTab
                key={key}
                id={tabId}
                ref={(el) => { tabRefs.current[key] = el; }}
                active={activeTab === key}
                onClick={() => setActiveTab(key)}
                magnifier
                onMagnifierUpdate={setTabsMagnifier}
                aria-controls={panelId}
              >
                {example.language}
              </LiquidGlassTab>
            );
          })}
        </div>
      </LiquidGlassNavigation>
    </Motion.div>
  );
};

export default CodeExample;
