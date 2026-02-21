import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThumbsUp, MessageSquare, BarChart2, Send, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { streamingApi, type StreamQA, type StreamPoll } from '@/services/streaming/streamingApi';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  streamId?: string;
}

export const InteractionHub = ({ streamId: initialStreamId }: Props) => {
  const [view, setView] = useState<'qa' | 'poll'>('qa');
  const [streamId, setStreamId] = useState<string | undefined>(initialStreamId);
  const [questions, setQuestions] = useState<StreamQA[]>([]);
  const [polls, setPolls] = useState<StreamPoll[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null));
  }, []);

  // Find a live stream if none provided
  useEffect(() => {
    if (!streamId) {
      streamingApi.list({ status: 'live' }).then((res) => {
        if (res.data && res.data.length > 0) {
          setStreamId(res.data[0].id);
        }
      });
    }
  }, [streamId]);

  useEffect(() => {
    if (!streamId) return;

    loadData();

    const unsubscribeQA = streamingApi.subscribeToQA(streamId, (payload) => {
      if (payload.eventType === 'INSERT') {
        setQuestions((prev) => [payload.new, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setQuestions((prev) => prev.map((q) => (q.id === payload.new.id ? payload.new : q)));
      } else if (payload.eventType === 'DELETE') {
        setQuestions((prev) => prev.filter((q) => q.id === payload.old.id));
      }
    });

    const unsubscribePolls = streamingApi.subscribeToPolls(streamId, (payload) => {
      if (payload.eventType === 'INSERT') {
        setPolls((prev) => [payload.new, ...prev]);
      } else {
        setPolls((prev) => {
          const exists = prev.some((p) => p.id === payload.new.id);
          if (!exists && payload.eventType === 'UPDATE') return [payload.new, ...prev];
          return prev.map((p) => (p.id === payload.new.id ? payload.new : p));
        });
      }
    });

    return () => {
      unsubscribeQA();
      unsubscribePolls();
    };
  }, [streamId]);

  async function loadData() {
    if (!streamId) return;
    const [qaRes, pollRes] = await Promise.all([
      streamingApi.getQA(streamId),
      streamingApi.getPolls(streamId),
    ]);
    if (qaRes.data) setQuestions(qaRes.data);
    if (pollRes.data) setPolls(pollRes.data);
  }

  async function handleAskQuestion() {
    if (!streamId || !newQuestion.trim()) return;
    setLoading(true);
    const res = await streamingApi.askQuestion(streamId, newQuestion.trim());
    setLoading(false);
    if (res.error) {
      toast.error(res.error.message);
    } else {
      setNewQuestion('');
      toast.success('Question posted');
    }
  }

  async function handleUpvote(qaId: string) {
    if (!userId) {
      toast.error('Please sign in to upvote');
      return;
    }
    const res = await streamingApi.upvoteQuestion(qaId, userId);
    if (res.error) toast.error(res.error.message);
  }

  async function handleVote(pollId: string, index: number) {
    const res = await streamingApi.submitVote(pollId, index);
    if (res.error) {
      toast.error(res.error.message);
    } else {
      toast.success('Vote submitted');
    }
  }

  const activePoll = useMemo(() => polls.find((p) => p.status === 'active'), [polls]);

  const getPollStats = (poll: StreamPoll) => {
    const total = poll.votes?.length || 0;
    return poll.options.map((_, idx) => {
      const count = poll.votes?.filter((v) => v.option_index === idx).length || 0;
      return {
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      };
    });
  };

  const hasVoted = (poll: StreamPoll) => {
    return poll.votes?.some((v) => v.user_id === userId);
  };

  if (!streamId) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        <Radio className="w-12 h-12 mx-auto mb-4 opacity-20" />
        <p>No active stream found for interaction.</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 space-y-4">
      {/* Toggle */}
      <div className="flex p-1 bg-gray-100 rounded-xl">
        <Button
          variant="ghost"
          onClick={() => setView('qa')}
          className={`flex-1 rounded-lg text-xs font-bold uppercase tracking-wider ${view === 'qa' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground'}`}
        >
          <MessageSquare className="w-3 h-3 mr-2" />
          Q&A ({questions.length})
        </Button>
        <Button
          variant="ghost"
          onClick={() => setView('poll')}
          className={`flex-1 rounded-lg text-xs font-bold uppercase tracking-wider ${view === 'poll' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground'}`}
        >
          <BarChart2 className="w-3 h-3 mr-2" />
          Polls{' '}
          {activePoll && <span className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
        </Button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {view === 'qa' ? (
          <>
            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
              <h4 className="text-sm font-bold text-primary mb-2">Ask the Speaker</h4>
              <div className="flex gap-2">
                <Input
                  placeholder="Type your question..."
                  className="bg-white border-none shadow-sm"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
                />
                <Button
                  size="icon"
                  className="shrink-0"
                  onClick={handleAskQuestion}
                  disabled={loading}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {questions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No questions yet. Be the first to ask!
                </div>
              ) : (
                questions.map((q) => (
                  <Card
                    key={q.id}
                    className={`p-4 flex gap-3 ${q.is_answered ? 'bg-green-50/30 border-green-100' : ''}`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleUpvote(q.id)}
                        className={`h-8 w-8 rounded-full hover:bg-primary/5 ${q.upvotes?.includes(userId || '') ? 'text-primary bg-primary/5' : 'text-muted-foreground'}`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </Button>
                      <span className="text-xs font-bold">{q.upvotes?.length || 0}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-muted-foreground">
                          {q.user ? `${q.user.first_name} ${q.user.last_name}` : 'Anonymous'}
                        </span>
                        {q.is_answered && (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-700 hover:bg-green-100 text-[10px] py-0 h-4"
                          >
                            Answered
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-900 leading-relaxed">
                        {q.question}
                      </p>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {activePoll ? (
              <Card className="p-6 border-primary/20 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <h3 className="font-bold text-lg mb-4">{activePoll.question}</h3>

                <div className="space-y-3">
                  {activePoll.options.map((opt, idx) => {
                    const stats = getPollStats(activePoll)[idx];
                    const voted = hasVoted(activePoll);
                    const isMyChoice = activePoll.votes?.some(
                      (v) => v.user_id === userId && v.option_index === idx
                    );

                    return (
                      <div key={idx} className="relative">
                        <Button
                          variant={isMyChoice ? 'default' : 'outline'}
                          className={`w-full justify-start h-auto py-3 px-4 relative z-10 transition-all ${!voted ? 'hover:border-primary' : 'cursor-default h-12'}`}
                          onClick={() => !voted && handleVote(activePoll.id, idx)}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="truncate pr-8">{opt.text}</span>
                            {voted && <span className="font-bold">{stats.percentage}%</span>}
                          </div>
                          {isMyChoice && (
                            <CheckCircle2 className="w-4 h-4 ml-2 shrink-0 absolute right-4" />
                          )}
                        </Button>

                        {voted && (
                          <div
                            className="absolute inset-y-0 left-0 bg-primary/10 rounded-md transition-all duration-1000"
                            style={{ width: `${stats.percentage}%` }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {hasVoted(activePoll) ? (
                  <p className="text-xs text-center text-muted-foreground mt-4">
                    Thanks for voting! Waiting for results...
                  </p>
                ) : (
                  <p className="text-xs text-center text-muted-foreground mt-4">
                    Select an option to cast your vote
                  </p>
                )}
              </Card>
            ) : (
              <div className="text-center py-12 text-muted-foreground bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <BarChart2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">No active polls at the moment.</p>
                <p className="text-xs opacity-60">Wait for the presenter to launch a poll.</p>
              </div>
            )}

            {/* Show recent results if any */}
            {polls.filter((p) => p.status === 'ended').length > 0 && (
              <div className="pt-4">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                  Recent Results
                </h4>
                <div className="space-y-3">
                  {polls
                    .filter((p) => p.status === 'ended')
                    .slice(0, 2)
                    .map((poll) => (
                      <Card key={poll.id} className="p-4 bg-gray-50/50">
                        <p className="text-sm font-bold mb-2">{poll.question}</p>
                        <div className="text-xs text-muted-foreground">
                          {poll.votes?.length || 0} votes • Ended
                        </div>
                      </Card>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
