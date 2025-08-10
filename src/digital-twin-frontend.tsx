import React, { useEffect, useMemo, useRef, useState } from "react";

// Extend window object for generated media URLs
declare global {
  interface Window {
    generatedVideoUrl?: string;
    generatedAudioUrl?: string;
  }
}

// Default export a single React component for canvas preview
export default function DigitalTwinsDemoUI() {
  // ----- Visual + Content System -----
  const steps = ["Choose Twins", "Describe Prompt", "Results"] as const;
  type Step = typeof steps[number];
  const [step, setStep] = useState<Step>("Choose Twins");

  // Twin catalog (nicknames only in UI; include internal mapping as comments)
  type Twin = {
    id: string;
    nickname: string; // UI label
    persona: string; // 1-liner
    // internal real name (not shown)
    real?: string;
    // lightweight illustration component
    Illustration: React.FC<{ selected?: boolean }>;
  };

  const TwinAvatar: React.FC<{ image?: string; colorA: string; colorB: string; icon?: string; selected?: boolean }>
    = ({ image, colorA, colorB, icon, selected }) => {
    return (
      <div
        className={`relative h-28 w-28 rounded-2xl p-[2px] transition-transform ${
          selected ? "scale-[1.02]" : ""
        }`}
        aria-hidden
      >
        <div
          className="h-full w-full rounded-2xl overflow-hidden"
          style={{
            background: image ? undefined : `radial-gradient(120% 120% at 20% 20%, ${colorA}, ${colorB})`,
            filter: selected ? "saturate(1.1)" : undefined,
          }}
        >
          {image ? (
            <img 
              src={image} 
              alt="" 
              className="h-full w-full object-cover"
              style={{ filter: selected ? "brightness(1.1)" : undefined }}
            />
          ) : (
            <div className="h-full w-full grid place-items-center text-4xl">
              <span role="img" aria-label="avatar" className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]">
                {icon}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const twins: Twin[] = useMemo(
    () => [
      {
        id: "sarah_guo",
        nickname: "Sarah",
        persona: "Scalpel-precise teardown, founder-friendly",
        real: "Sarah Guo",
        Illustration: ({ selected }) => (
          <TwinAvatar 
            image="/Chars/Sarah.jpg"
            colorA="#7c4dff" 
            colorB="#12121a" 
            selected={selected} 
          />
        ),
      },
      {
        id: "chad_goldstein",
        nickname: "Chad",
        persona: "Scale fast, break things, iterate faster",
        real: "Chad",
        Illustration: ({ selected }) => (
          <TwinAvatar 
            image="/Chars/Chad.jpg"
            colorA="#ff6b35" 
            colorB="#1a0f0a" 
            selected={selected} 
          />
        ),
      },
    ],
    []
  );

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const toggleTwin = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Step 2 input
  const [idea, setIdea] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Handle textarea change with proper cursor position
  const handleIdeaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    setIdea(value);
    
    // Restore cursor position after React re-render
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.selectionStart = cursorPosition;
        inputRef.current.selectionEnd = cursorPosition;
      }
    });
  };

  // Step 3 outputs
  type TwinOutput = { text: string; isStreaming: boolean };
  const [outputs, setOutputs] = useState<Record<string, TwinOutput>>({});
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  // History drawer
  const [historyOpen, setHistoryOpen] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);

  // Load sessions
  useEffect(() => {
    try {
      const raw = localStorage.getItem("dt_sessions");
      if (raw) setSessions(JSON.parse(raw));
    } catch {}
  }, []);

  const saveSession = (session: any) => {
    try {
      const next = [session, ...sessions].slice(0, 50);
      setSessions(next);
      localStorage.setItem("dt_sessions", JSON.stringify(next));
    } catch {}
  };

  // Progress percentage
  const progress = useMemo(() => {
    const idx = steps.indexOf(step);
    return ((idx + 1) / steps.length) * 100;
  }, [step]);

  // Handle Next
  const canProceedStep1 = selectedIds.length > 0;
  const canProceedStep2 = idea.trim().length > 0;

  const startStreaming = async () => {
    console.log('startStreaming called');
    const selectedTwins = twins.filter((t) => selectedIds.includes(t.id));
    console.log('Selected twins:', selectedTwins);
    console.log('Idea:', idea);
    
    const base = Object.fromEntries(
      selectedTwins.map((t) => [t.id, { text: "", isStreaming: true }])
    );
    setOutputs(base);

    // Start video loading
    setVideoReady(false);
    setVideoLoading(true);

    try {
      const requestBody = {
        idea: idea,
        id: selectedIds
      };
      
      console.log('Sending request to backend:', requestBody);
      
      // Send a single request with all selected twins
      const response = await fetch('http://localhost:8000/generate-pitch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      // Use the output_text from the response
      const outputText = data.output_text || "Nice energy, crisp demo, real problem. The a-eye assist is useful, not magical. But the moat is a puddle, I can step over it in Louboutins. Your market math reads like science fiction, and pricing is vibes. I am intrigued, bring retention and revenue, not adjectives.";
      
      // Process the result for each twin (using same text for now)
      selectedTwins.forEach((twin) => {
        console.log(`Processing result for ${twin.id}:`, outputText);
        
        // Simulate streaming effect for the received text - character by character
        const chars = outputText.split("");
        let idx = 0;
        const int = setInterval(() => {
          idx++;
          setOutputs((prev) => ({
            ...prev,
            [twin.id]: {
              text: chars.slice(0, idx).join(""),
              isStreaming: idx < chars.length,
            },
          }));
          if (idx >= chars.length) clearInterval(int);
        }, 15);
      });
      
      // Store video and audio URLs from response
      if (data.output_video) {
        // Will use this URL later for the video element
        window.generatedVideoUrl = `http://localhost:8000${data.output_video}`;
      }
      if (data.output_audio) {
        window.generatedAudioUrl = `http://localhost:8000${data.output_audio}`;
      }

    } catch (error) {
      console.error('Error in startStreaming - Full error:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
      }
      
      // Fallback for all twins on error
      selectedTwins.forEach((twin) => {
        const fallback = `${twin.nickname}: Here's my quick read. Your premise is specific, but I'd sharpen the wedge: pick one user, one urgent pain, one repeatable moment of delight. Show traction over thesis.`;
        
        const chars = fallback.split("");
        let idx = 0;
        const int = setInterval(() => {
          idx++;
          setOutputs((prev) => ({
            ...prev,
            [twin.id]: {
              text: chars.slice(0, idx).join(""),
              isStreaming: idx < chars.length,
            },
          }));
          if (idx >= chars.length) clearInterval(int);
        }, 15);
      });
    }

    // Show video after responses are done
    setTimeout(() => {
      setVideoLoading(false);
      setVideoReady(true);
    }, 10000);
  };

  // Read aloud (Web Speech API or generated audio)
  const speak = (nickname: string, text: string) => {
    try {
      // If we have generated audio, play that instead
      if (window.generatedAudioUrl) {
        const audio = new Audio(window.generatedAudioUrl);
        audio.play();
      } else {
        // Fallback to Web Speech API
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text.replace(/^.*?:\s*/, ""));
        utter.pitch = 1.05;
        utter.rate = 1.0;
        utter.volume = 1.0;
        window.speechSynthesis.speak(utter);
      }
    } catch {}
  };

  // Step transitions
  const goNext = () => {
    if (step === "Choose Twins" && canProceedStep1) {
      setStep("Describe Prompt");
      setTimeout(() => inputRef.current?.focus(), 50);
    } else if (step === "Describe Prompt" && canProceedStep2) {
      setStep("Results");
      startStreaming();
      // Save session stub
      const payload = {
        createdAt: new Date().toISOString(),
        selectedNicknames: twins
          .filter((t) => selectedIds.includes(t.id))
          .map((t) => t.nickname),
        promptText: idea,
      };
      saveSession(payload);
    }
  };

  const goBack = () => {
    if (step === "Describe Prompt") setStep("Choose Twins");
    if (step === "Results") setStep("Describe Prompt");
  };


  // UI helpers
  const StepHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
    <div className="mb-6">
      <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-[-0.01em]">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-sm text-zinc-400 max-w-prose">{subtitle}</p>
      )}
    </div>
  );

  const Container: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="min-h-screen w-full bg-[radial-gradient(120%_120%_at_80%_-10%,#1b1b24_0%,#0b0b10_50%,#060609_100%)] text-zinc-200">
      {/* Progress bar */}
      <div className="sticky top-0 z-20 w-full backdrop-blur supports-[backdrop-filter]:bg-black/30 bg-black/40">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>{steps.join(" · ")}</span>
            <button
              onClick={() => setHistoryOpen(true)}
              className="rounded-full border border-white/10 px-2.5 py-1 hover:bg-white/5 transition"
            >
              History
            </button>
          </div>
          <div className="mt-2 h-1 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 via-violet-400 to-sky-400 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main */}
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="mx-auto w-full rounded-2xl bg-white/5 p-6 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.35)] border border-white/10">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="mx-auto max-w-4xl px-4 pb-10 -mt-4 text-xs text-zinc-500">
        <button
          onClick={() => setHistoryOpen(true)}
          className="underline decoration-dotted underline-offset-4 hover:text-zinc-300"
        >
          Previous Interactions
        </button>
      </footer>

      {/* History Drawer */}
      {historyOpen && (
        <div className="fixed inset-0 z-30">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setHistoryOpen(false)}
            aria-hidden
          />
          <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-[#0f0f14] border-l border-white/10 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-sm font-medium text-white">Previous Interactions</h2>
              <button
                onClick={() => setHistoryOpen(false)}
                className="rounded-md border border-white/10 px-2 py-1 text-xs hover:bg-white/5"
                aria-label="Close history"
              >
                Close
              </button>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto h-[calc(100%-56px)]">
              {sessions.length === 0 && (
                <p className="text-zinc-400 text-sm">No history yet.</p>
              )}
              {sessions.map((s, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>{new Date(s.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(s.selectedNicknames || []).map((n: string, idx: number) => (
                      <span
                        key={idx}
                        className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-zinc-200"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-zinc-200 line-clamp-2">{s.promptText}</p>
                  <div className="mt-2 flex gap-2 text-xs">
                    <button
                      className="rounded-md border border-white/10 px-2 py-1 hover:bg-white/5"
                      onClick={() => {
                        // Load minimal session (step 3 view)
                        setSelectedIds(
                          twins
                            .filter((t) => (s.selectedNicknames || []).includes(t.nickname))
                            .map((t) => t.id)
                        );
                        setIdea(s.promptText || "");
                        setStep("Results");
                        startStreaming();
                        setHistoryOpen(false);
                      }}
                    >
                      View
                    </button>
                    <button
                      className="rounded-md border border-white/10 px-2 py-1 hover:bg-white/5"
                      onClick={() => navigator.clipboard.writeText(s.promptText || "")}
                    >
                      Copy text
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}
    </div>
  );

  // ----- Render step content -----
  return (
    <Container>
      {step === "Choose Twins" && (
        <div>
          <StepHeader
            title="Whose brains do you want to borrow?"
            subtitle="Pick one or more. Multi-select is encouraged."
          />
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6" role="list">
            {twins.map((t) => {
              const selected = selectedIds.includes(t.id);
              return (
                <li key={t.id}>
                  <button
                    onClick={() => toggleTwin(t.id)}
                    className={`group relative w-full rounded-2xl border p-4 text-left transition duration-200 focus:outline-none focus:ring-2 focus:ring-violet-400/60 ${
                      selected
                        ? "border-violet-400/50 bg-white/[0.08] shadow-[0_8px_30px_rgba(88,28,135,0.35)]"
                        : "border-white/10 bg-white/5 hover:bg-white/7"
                    }`}
                    aria-pressed={selected}
                  >
                    <div className="flex items-center gap-4">
                      <t.Illustration selected={selected} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-lg font-semibold text-white">
                            {t.nickname}
                          </h3>
                          {selected && (
                            <span
                              className="inline-flex items-center justify-center rounded-full bg-violet-500/20 text-violet-300 border border-violet-400/40 px-2 py-0.5 text-[10px]"
                              aria-label="Selected"
                            >
                              ✓ Selected
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-zinc-400">{t.persona}</p>
                      </div>
                    </div>
                    {selected && (
                      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-violet-400/40" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-xs text-zinc-400">Multi-select supported</div>
            <div className="flex gap-2">
              <button
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:bg-white/5 disabled:opacity-40"
                disabled={!canProceedStep1}
                onClick={goNext}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {step === "Describe Prompt" && (
        <div>
          <StepHeader
            title="What should they react to?"
            subtitle="One sentence is perfect. Be specific."
          />

          <div className="rounded-2xl bg-white/5 p-4 md:p-6 border border-white/10">
            <label htmlFor="idea-input" className="sr-only">
              Describe the idea
            </label>
            <textarea
              id="idea-input"
              ref={inputRef}
              value={idea}
              onChange={handleIdeaChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && canProceedStep2) {
                  e.preventDefault();
                  goNext();
                }
              }}
              placeholder="e.g., An AI that turns messy product feedback into prioritized JIRA tickets"
              className="w-full bg-transparent outline-none placeholder:text-zinc-500 text-zinc-100 text-lg md:text-xl tracking-[-0.01em] resize-none min-h-[60px] focus:ring-2 focus:ring-violet-400/30 rounded-lg p-2"
              rows={2}
              autoFocus
              spellCheck="true"
              autoComplete="off"
              autoCorrect="on"
            />
            <div className="mt-2 text-xs text-zinc-500">Press Enter to send (Shift+Enter for new line).</div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:bg-white/5"
              onClick={goBack}
            >
              Back
            </button>
            <button
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:bg-white/5 disabled:opacity-40"
              disabled={!canProceedStep2}
              onClick={goNext}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === "Results" && (
        <div>
          <StepHeader
            title="Results"
            subtitle="Streaming insights now—then audio, then video."
          />

          <div className="space-y-4">
            {twins
              .filter((t) => selectedIds.includes(t.id))
              .map((t) => (
                <section
                  key={t.id}
                  className="relative rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <header className="mb-3 flex items-center gap-3">
                    <t.Illustration />
                    <div>
                      <h3 className="text-white font-semibold">{t.nickname}</h3>
                      <p className="text-xs text-zinc-400">Responding to: “{idea}”</p>
                    </div>
                    {/* Speaker Icon */}
                    {!outputs[t.id]?.isStreaming && outputs[t.id]?.text && (
                      <button
                        className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 hover:bg-white/5"
                        title={`Play this in ${t.nickname}'s voice.`}
                        onClick={() => speak(t.nickname, outputs[t.id]?.text || "")}
                        aria-label={`Play ${t.nickname}`}
                      >
                        {/* Simple speaker icon */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className="h-5 w-5"
                        >
                          <path d="M3 10h4l5-4v12l-5-4H3z" />
                          <path d="M16 8c1.333 1.333 1.333 6.667 0 8" strokeLinecap="round" />
                          <path d="M18.5 6.5c2.2 2.2 2.2 8.8 0 11" strokeLinecap="round" />
                        </svg>
                      </button>
                    )}
                  </header>

                  <div className="prose prose-invert max-w-none">
                    <p className="text-zinc-200 leading-relaxed">
                      {outputs[t.id]?.text || (
                        <span className="text-zinc-400">Generating…</span>
                      )}
                      {outputs[t.id]?.isStreaming && (
                        <span className="ml-1 inline-block h-[1em] w-[1.2ch] animate-pulse bg-zinc-400/40 align-middle" />
                      )}
                    </p>
                  </div>
                </section>
              ))}
          </div>

          {/* Video lane */}
          <div className="mt-6">
            <div className="rounded-2xl border border-white/10 overflow-hidden">
              {videoLoading && (
                <div className="relative grid min-h-[220px] place-items-center bg-gradient-to-br from-zinc-900 to-zinc-800">
                  {/* Cute Pixar-style animal getting ready (represented as emoji + props) */}
                  <div className="flex items-center gap-4">
                    <div className="text-5xl" aria-hidden>🦊</div>
                    <div>
                      <div className="text-white font-medium">One sec—your twins are in makeup.</div>
                      <div className="text-sm text-zinc-400">Polishing the lighting and the one-liners…</div>
                    </div>
                  </div>
                  {/* Subtle loading shimmer */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden">
                    <div className="animate-[load_2s_linear_infinite] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                  </div>
                </div>
              )}

              {!videoLoading && !videoReady && (
                <div className="grid min-h-[220px] place-items-center bg-zinc-900">
                  <div className="text-zinc-400 text-sm">Preparing video…</div>
                </div>
              )}

              {videoReady && (
                <video
                  className="block w-full h-auto bg-black"
                  controls
                  autoPlay
                  src={window.generatedVideoUrl || "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"}
                />
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:bg-white/5"
              onClick={goBack}
            >
              Back
            </button>
            <button
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:bg-white/5"
              onClick={() => {
                // restart streaming for demo
                startStreaming();
              }}
            >
              Regenerate
            </button>
          </div>
        </div>
      )}
    </Container>
  );
} 

/* Tailwind utility for shimmer */
const style = document.createElement('style');
style.innerHTML = `@keyframes load{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}`;
document.head.appendChild(style);
