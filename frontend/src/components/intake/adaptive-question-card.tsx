import React, { useState, useEffect } from "react";
import {
  Mic,
  MicOff,
  SendHorizontal,
  Sparkles,
  Volume2,
  AlertTriangle,
  HelpCircle,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { cn } from "@/lib/utils";

interface AdaptiveQuestionCardProps {
  department: {
    id: string;
    name: string;
    icon?: string;
  };
  question: {
    id: string;
    slotKey: string;
    text: string;
    options?: Array<{ label: string; value: string }>;
    inputType: string;
    questionIndex: number;
    totalQuestions: number;
  };
  language: string;
  redFlags?: string[];
  onSubmitAnswer: (answerText: string, inputMode: "voice" | "text" | "touch") => void;
  loading?: boolean;
}

export function AdaptiveQuestionCard({
  department,
  question,
  language,
  redFlags = [],
  onSubmitAnswer,
  loading = false,
}: AdaptiveQuestionCardProps) {
  const [typedText, setTypedText] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);

  // Map language to speech recognition locale
  const langLocale =
    language === "ta" ? "ta-IN" : language === "hi" ? "hi-IN" : "en-US";

  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    audioLevel,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    language: langLocale,
    continuous: false,
    interimResults: true,
  });

  // When speech recognition produces transcript, update the text input
  useEffect(() => {
    if (transcript) {
      setTypedText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  // Reset inputs on question change
  useEffect(() => {
    setTypedText("");
    setSelectedOptions([]);
    resetTranscript();
  }, [question.id, resetTranscript]);

  const handleToggleOption = (opt: { label: string; value: string }) => {
    if (question.inputType === "multi-choice") {
      setSelectedOptions((prev) =>
        prev.includes(opt.label) ? prev.filter((o) => o !== opt.label) : [...prev, opt.label]
      );
    } else {
      // Single choice -> Submit immediately for ultra-fast, smooth touch intake
      onSubmitAnswer(opt.label, "touch");
    }
  };

  const handleTextSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalAnswer = typedText.trim() || selectedOptions.join(", ");
    if (!finalAnswer || loading) return;

    if (isListening) {
      stopListening();
    }

    const mode = isListening ? "voice" : selectedOptions.length > 0 ? "touch" : "text";
    onSubmitAnswer(finalAnswer, mode);
  };

  const handleSpeakQuestion = () => {
    if ("speechSynthesis" in window) {
      if (isSpeakingQuestion) {
        window.speechSynthesis.cancel();
        setIsSpeakingQuestion(false);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(question.text);
      utterance.lang = langLocale;
      utterance.onend = () => setIsSpeakingQuestion(false);
      utterance.onerror = () => setIsSpeakingQuestion(false);
      setIsSpeakingQuestion(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const progressPercent = Math.min(
    100,
    Math.round((question.questionIndex / (question.totalQuestions || 8)) * 100)
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Top Department Badge & Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">
              AI
            </span>
            <span className="text-foreground">{department.name} Intake</span>
          </div>
          <span className="text-muted-foreground">
            Question {question.questionIndex} of ~{question.totalQuestions || 8} ({progressPercent}%)
          </span>
        </div>
        <Progress value={progressPercent} className="h-2 rounded-full" />
      </div>

      {/* Red Flags Banner (if any detected previously) */}
      {redFlags && redFlags.length > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-600 dark:text-amber-400 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle className="size-4 shrink-0 text-amber-500" />
            <span>Clinical Attention Alert Detected</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            {redFlags[redFlags.length - 1]}
          </p>
        </div>
      )}

      {/* Main Adaptive Question Card */}
      <div className="surface-card relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
        {/* Question Header & TTS */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                Adaptive Clinical Query
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
                {question.text}
              </h2>
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleSpeakQuestion}
              className={cn(
                "size-10 rounded-2xl shrink-0 transition-colors",
                isSpeakingQuestion ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              )}
              title="Read Question Aloud"
            >
              <Volume2 className={cn("size-4", isSpeakingQuestion && "animate-pulse")} />
            </Button>
          </div>
        </div>

        {/* Quick Touch Options (Chips) */}
        {question.options && question.options.length > 0 && (
          <div className="space-y-2 pt-2">
            <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <span>👆 Tap to Select / தொட்டு தேர்வு செய்யவும்:</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {question.options.map((opt) => {
                const isSelected = selectedOptions.includes(opt.label);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleToggleOption(opt)}
                    disabled={loading}
                    className={cn(
                      "flex items-center justify-between rounded-2xl border p-4 text-left text-sm font-semibold transition-all duration-150 active:scale-[0.98]",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground shadow-xs"
                        : "border-border bg-accent/40 text-foreground hover:border-primary/50 hover:bg-accent/80"
                    )}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <CheckCircle2 className="size-4 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Multimodal Input: Voice or Text Area */}
        <div className="space-y-3 border-t border-border/80 pt-5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold flex items-center gap-1.5">
              <span>🎙️ Voice or ⌨️ Type Details:</span>
            </span>
            {isSupported && (
              <span className="text-[11px]">
                {isListening ? (
                  <span className="text-primary font-bold animate-pulse">● Listening in {langLocale}…</span>
                ) : (
                  "Voice dictation ready"
                )}
              </span>
            )}
          </div>

          {/* Live Audio Visualizer Bar when listening */}
          {isListening && (
            <div className="flex items-center gap-2 rounded-2xl border border-primary/40 bg-primary/10 p-3">
              <div className="flex items-center gap-1 flex-1">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-primary rounded-full transition-all duration-75"
                    style={{
                      height: `${Math.max(4, Math.min(28, (audioLevel / 100) * 32 * ((i % 3) + 1)))}px`,
                    }}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-primary shrink-0">
                {interimTranscript || "Speak now…"}
              </span>
            </div>
          )}

          <form onSubmit={handleTextSubmit} className="space-y-3">
            <div className="relative">
              <Textarea
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                placeholder={`Describe in your own words in ${language === 'ta' ? 'தமிழ்' : language === 'hi' ? 'हिंदी' : 'English'}…`}
                className="min-h-24 resize-none rounded-2xl p-4 pr-14 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleTextSubmit();
                  }
                }}
              />

              {/* In-text Mic Button */}
              {isSupported && (
                <button
                  type="button"
                  onClick={() => {
                    if (isListening) {
                      stopListening();
                    } else {
                      startListening();
                    }
                  }}
                  className={cn(
                    "absolute right-3.5 bottom-3.5 flex size-9 items-center justify-center rounded-xl transition-all",
                    isListening
                      ? "bg-red-500 text-white animate-pulse shadow-md"
                      : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                  )}
                  title={isListening ? "Stop Voice Input" : "Start Voice Input"}
                >
                  {isListening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
                </button>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setTypedText("");
                    setSelectedOptions([]);
                    resetTranscript();
                  }}
                  className="text-xs text-muted-foreground gap-1"
                >
                  <RotateCcw className="size-3.5" /> Clear
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onSubmitAnswer("Not sure / skipped", "touch")}
                  className="text-xs text-muted-foreground gap-1"
                >
                  <HelpCircle className="size-3.5" /> Skip / Not Sure
                </Button>
              </div>

              <Button
                type="submit"
                disabled={loading || (!typedText.trim() && selectedOptions.length === 0)}
                className="w-full sm:w-auto gap-2 font-bold px-6 rounded-xl"
              >
                {loading ? (
                  <>
                    <Sparkles className="size-4 animate-spin" /> Analyzing…
                  </>
                ) : (
                  <>
                    Next Question <SendHorizontal className="size-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
