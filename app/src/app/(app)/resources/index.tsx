import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  TextInput,
} from 'react-native';

import { client } from '@/api/common/client';
import { FocusAwareStatusBar, SafeAreaView, Text, View } from '@/components/ui';

// ─── Types ───────────────────────────────────────────────────────────────────
type Step = { text: string; status: 'loading' | 'done' };
type AnalysisMode = 'match' | 'review';

interface MatchResult {
  matchScore: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  suggestions: string[];
  missingKeywords: string[];
  improvedBullets: string[];
}

interface ReviewResult {
  overallScore: number;
  summary: string;
  formatScore: number;
  contentScore: number;
  atsScore: number;
  strengths: string[];
  issues: string[];
  suggestions: string[];
  improvedBullets: string[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function ScoreCircle({ score, label, size = 80 }: { score: number; label?: string; size?: number }) {
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <View className="items-center">
      <View
        style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 4, borderColor: color }}
        className="items-center justify-center"
      >
        <Text style={{ color, fontSize: size * 0.3, fontWeight: '800' }}>{score}</Text>
      </View>
      {label && <Text className="mt-1 text-xs text-neutral-500">{label}</Text>}
    </View>
  );
}

function ThinkingSteps({ steps }: { steps: Step[] }) {
  return (
    <View className="mt-4 rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
      <View className="mb-2 flex-row items-center gap-2">
        <Ionicons name="sparkles" size={16} color="#7c3aed" />
        <Text className="text-sm font-semibold text-neutral-700">HiringBull Copilot is thinking...</Text>
      </View>
      {steps.map((step, i) => (
        <View key={i} className="ml-1 mt-2 flex-row items-center gap-2">
          {step.status === 'done' ? (
            <Ionicons name="checkmark-circle" size={16} color="#10b981" />
          ) : (
            <ActivityIndicator size={14} color="#7c3aed" />
          )}
          <Text className={`text-sm ${step.status === 'done' ? 'text-neutral-600' : 'text-neutral-800 font-medium'}`}>
            {step.text}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function CopilotScreen() {
  const [resumeText, setResumeText] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  const [jdText, setJdText] = useState('');
  const [mode, setMode] = useState<AnalysisMode>('match');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [result, setResult] = useState<MatchResult | ReviewResult | null>(null);
  const [error, setError] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const pickResume = useCallback(async () => {
    try {
      const docResult = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain', 'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (docResult.canceled) return;

      const file = docResult.assets[0];
      setResumeFileName(file.name);

      // For now, read as text if possible. For PDF we'll send to backend.
      // In production, we'd upload the file and parse server-side.
      // For MVP, user can paste text OR we extract from the file URI.
      if (file.mimeType === 'text/plain') {
        const response = await fetch(file.uri);
        const text = await response.text();
        setResumeText(text);
      } else {
        // For PDF/DOC, we'll set a placeholder and upload the file
        setResumeText(`[Uploaded: ${file.name}]`);
        // TODO: Add actual PDF parsing via server endpoint
      }
    } catch (e) {
      console.error('Document pick error:', e);
    }
  }, []);

  const analyze = useCallback(async () => {
    if (!resumeText.trim()) {
      setError('Please upload or paste your resume first');
      return;
    }
    if (mode === 'match' && !jdText.trim()) {
      setError('Please paste the job description for match analysis');
      return;
    }

    setError('');
    setResult(null);
    setSteps([]);
    setIsAnalyzing(true);
    fadeAnim.setValue(0);

    try {
      const response = await fetch(`${client.defaults.baseURL}/ai/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: client.defaults.headers.Authorization as string || '',
        },
        body: JSON.stringify({
          resume: resumeText,
          jobDescription: jdText || undefined,
          mode,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;

          try {
            const event = JSON.parse(data);
            if (event.type === 'step') {
              setSteps((prev) => {
                const existing = prev.findIndex((s) => s.text === event.step);
                if (existing >= 0) {
                  const updated = [...prev];
                  updated[existing] = { text: event.step, status: event.status };
                  return updated;
                }
                return [...prev, { text: event.step, status: event.status }];
              });
            } else if (event.type === 'result') {
              setResult(event.data);
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              }).start();
            } else if (event.type === 'error') {
              setError(event.message);
            }
          } catch {}
        }
      }
    } catch (e: any) {
      setError(e.message || 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [resumeText, jdText, mode, fadeAnim]);

  const reset = () => {
    setResult(null);
    setSteps([]);
    setError('');
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <FocusAwareStatusBar />
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-5 pb-10">
          {/* Header */}
          <View className="pb-1 pt-4">
            <View className="flex-row items-center gap-2">
              <Ionicons name="sparkles" size={28} color="#7c3aed" />
              <Text className="text-[32px] font-extrabold leading-[38px] text-neutral-900">
                Copilot
              </Text>
            </View>
            <Text className="mt-2 text-[15px] leading-[22px] text-neutral-500">
              AI-powered resume analysis to help you{'\n'}land your dream job.
            </Text>
          </View>

          {/* Mode Toggle */}
          <View className="mt-6 flex-row gap-3">
            <Pressable
              onPress={() => { setMode('match'); reset(); }}
              className={`flex-1 rounded-xl border px-4 py-3 ${mode === 'match' ? 'border-violet-500 bg-violet-50' : 'border-neutral-200 bg-white'}`}
            >
              <View className="flex-row items-center gap-2">
                <Ionicons name="git-compare-outline" size={18} color={mode === 'match' ? '#7c3aed' : '#737373'} />
                <Text className={`text-sm font-semibold ${mode === 'match' ? 'text-violet-700' : 'text-neutral-600'}`}>
                  Match with JD
                </Text>
              </View>
              <Text className="mt-1 text-xs text-neutral-500">Compare resume vs job</Text>
            </Pressable>
            <Pressable
              onPress={() => { setMode('review'); reset(); }}
              className={`flex-1 rounded-xl border px-4 py-3 ${mode === 'review' ? 'border-violet-500 bg-violet-50' : 'border-neutral-200 bg-white'}`}
            >
              <View className="flex-row items-center gap-2">
                <Ionicons name="document-text-outline" size={18} color={mode === 'review' ? '#7c3aed' : '#737373'} />
                <Text className={`text-sm font-semibold ${mode === 'review' ? 'text-violet-700' : 'text-neutral-600'}`}>
                  Resume Review
                </Text>
              </View>
              <Text className="mt-1 text-xs text-neutral-500">General quality check</Text>
            </Pressable>
          </View>

          {/* Resume Upload */}
          <View className="mt-6">
            <Text className="mb-2 text-sm font-semibold text-neutral-700">Your Resume</Text>
            <Pressable
              onPress={pickResume}
              className="flex-row items-center gap-3 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-4"
            >
              <View className="h-10 w-10 items-center justify-center rounded-full bg-violet-100">
                <Ionicons name="cloud-upload-outline" size={20} color="#7c3aed" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-neutral-700">
                  {resumeFileName || 'Upload Resume'}
                </Text>
                <Text className="text-xs text-neutral-400">PDF, DOC, or TXT</Text>
              </View>
              {resumeFileName && <Ionicons name="checkmark-circle" size={20} color="#10b981" />}
            </Pressable>

            <Text className="my-3 text-center text-xs text-neutral-400">— or paste below —</Text>
            <TextInput
              placeholder="Paste your resume text here..."
              placeholderTextColor="#9ca3af"
              value={resumeText.startsWith('[Uploaded:') ? '' : resumeText}
              onChangeText={(t) => { setResumeText(t); setResumeFileName(''); }}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              className="min-h-[120px] rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-800"
            />
          </View>

          {/* Job Description (only in match mode) */}
          {mode === 'match' && (
            <View className="mt-5">
              <Text className="mb-2 text-sm font-semibold text-neutral-700">Job Description</Text>
              <TextInput
                placeholder="Paste the job description here..."
                placeholderTextColor="#9ca3af"
                value={jdText}
                onChangeText={setJdText}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                className="min-h-[120px] rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-800"
              />
            </View>
          )}

          {/* Error */}
          {error ? (
            <View className="mt-4 flex-row items-center gap-2 rounded-xl bg-red-50 px-4 py-3">
              <Ionicons name="alert-circle" size={18} color="#ef4444" />
              <Text className="flex-1 text-sm text-red-600">{error}</Text>
            </View>
          ) : null}

          {/* Analyze Button */}
          <Pressable
            onPress={analyze}
            disabled={isAnalyzing}
            className={`mt-6 flex-row items-center justify-center gap-2 rounded-xl py-4 ${isAnalyzing ? 'bg-violet-300' : 'bg-violet-600 active:bg-violet-700'}`}
          >
            {isAnalyzing ? (
              <ActivityIndicator size={18} color="#fff" />
            ) : (
              <Ionicons name="sparkles" size={18} color="#fff" />
            )}
            <Text className="text-base font-bold text-white">
              {isAnalyzing ? 'Analyzing...' : mode === 'match' ? 'Analyze Match' : 'Review Resume'}
            </Text>
          </Pressable>

          {/* Thinking Steps */}
          {steps.length > 0 && <ThinkingSteps steps={steps} />}

          {/* Results */}
          {result && (
            <Animated.View style={{ opacity: fadeAnim }} className="mt-6">
              {/* Score */}
              <View className="items-center rounded-2xl border border-neutral-100 bg-gradient-to-b from-violet-50 to-white p-6">
                <ScoreCircle
                  score={'matchScore' in result ? (result as MatchResult).matchScore : (result as ReviewResult).overallScore}
                  label={mode === 'match' ? 'Match Score' : 'Overall Score'}
                  size={100}
                />
                {mode === 'review' && 'formatScore' in result && (
                  <View className="mt-4 flex-row gap-6">
                    <ScoreCircle score={(result as ReviewResult).formatScore} label="Format" size={56} />
                    <ScoreCircle score={(result as ReviewResult).contentScore} label="Content" size={56} />
                    <ScoreCircle score={(result as ReviewResult).atsScore} label="ATS" size={56} />
                  </View>
                )}
              </View>

              {/* Summary */}
              <View className="mt-4 rounded-2xl border border-neutral-100 bg-white p-4">
                <Text className="mb-2 text-sm font-bold text-neutral-800">Summary</Text>
                <Text className="text-sm leading-5 text-neutral-600">{result.summary}</Text>
              </View>

              {/* Strengths */}
              {result.strengths && result.strengths.length > 0 && (
                <View className="mt-4 rounded-2xl border border-green-100 bg-green-50 p-4">
                  <View className="mb-2 flex-row items-center gap-2">
                    <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                    <Text className="text-sm font-bold text-green-800">Strengths</Text>
                  </View>
                  {result.strengths.map((s: string, i: number) => (
                    <Text key={i} className="mt-1 text-sm text-green-700">• {s}</Text>
                  ))}
                </View>
              )}

              {/* Gaps / Issues */}
              {('gaps' in result ? result.gaps : (result as ReviewResult).issues)?.length > 0 && (
                <View className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4">
                  <View className="mb-2 flex-row items-center gap-2">
                    <Ionicons name="alert-circle" size={16} color="#ef4444" />
                    <Text className="text-sm font-bold text-red-800">
                      {mode === 'match' ? 'Gaps' : 'Issues'}
                    </Text>
                  </View>
                  {('gaps' in result ? result.gaps : (result as ReviewResult).issues)?.map((g: string, i: number) => (
                    <Text key={i} className="mt-1 text-sm text-red-700">• {g}</Text>
                  ))}
                </View>
              )}

              {/* Suggestions */}
              {result.suggestions && result.suggestions.length > 0 && (
                <View className="mt-4 rounded-2xl border border-violet-100 bg-violet-50 p-4">
                  <View className="mb-2 flex-row items-center gap-2">
                    <Ionicons name="bulb-outline" size={16} color="#7c3aed" />
                    <Text className="text-sm font-bold text-violet-800">Suggestions</Text>
                  </View>
                  {result.suggestions.map((s: string, i: number) => (
                    <Text key={i} className="mt-2 text-sm leading-5 text-violet-700">{i + 1}. {s}</Text>
                  ))}
                </View>
              )}

              {/* Missing Keywords (match mode) */}
              {'missingKeywords' in result && (result as MatchResult).missingKeywords?.length > 0 && (
                <View className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-4">
                  <View className="mb-2 flex-row items-center gap-2">
                    <Ionicons name="key-outline" size={16} color="#d97706" />
                    <Text className="text-sm font-bold text-amber-800">Missing Keywords</Text>
                  </View>
                  <View className="flex-row flex-wrap gap-2">
                    {(result as MatchResult).missingKeywords.map((k: string, i: number) => (
                      <View key={i} className="rounded-full bg-amber-200 px-3 py-1">
                        <Text className="text-xs font-medium text-amber-800">{k}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Improved Bullets */}
              {result.improvedBullets && result.improvedBullets.length > 0 && (
                <View className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <View className="mb-2 flex-row items-center gap-2">
                    <Ionicons name="create-outline" size={16} color="#3b82f6" />
                    <Text className="text-sm font-bold text-blue-800">Improved Bullets (Copy These)</Text>
                  </View>
                  {result.improvedBullets.map((b: string, i: number) => (
                    <View key={i} className="mt-2 rounded-lg bg-white p-3">
                      <Text className="text-sm leading-5 text-neutral-700">• {b}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Reset */}
              <Pressable
                onPress={() => { reset(); setResumeText(''); setJdText(''); setResumeFileName(''); }}
                className="mt-6 flex-row items-center justify-center gap-2 rounded-xl border border-neutral-200 py-3"
              >
                <Ionicons name="refresh-outline" size={18} color="#737373" />
                <Text className="text-sm font-semibold text-neutral-600">Start New Analysis</Text>
              </Pressable>
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
