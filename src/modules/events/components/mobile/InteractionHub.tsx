import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThumbsUp, MessageSquare, BarChart2, Send } from 'lucide-react';
import { Card } from '@/components/ui/card';

export const InteractionHub = () => {
  const [view, setView] = useState<'qa' | 'poll'>('qa');

  // Mock Data
  const questions = [
    {
      id: 1,
      author: 'Sarah M.',
      text: 'Will the slides be available after the session?',
      upvotes: 12,
    },
    { id: 2, author: 'David K.', text: 'How can we volunteer for the next event?', upvotes: 8 },
  ];

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
          Q&A
        </Button>
        <Button
          variant="ghost"
          onClick={() => setView('poll')}
          className={`flex-1 rounded-lg text-xs font-bold uppercase tracking-wider ${view === 'poll' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground'}`}
        >
          <BarChart2 className="w-3 h-3 mr-2" />
          Live Polls
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
                />
                <Button size="icon" className="shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {questions.map((q) => (
                <Card key={q.id} className="p-4 flex gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-primary/5 hover:text-primary"
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </Button>
                    <span className="text-xs font-bold text-muted-foreground">{q.upvotes}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{q.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">Asked by {q.author}</p>
                  </div>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <BarChart2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No active polls at the moment.</p>
            <p className="text-xs opacity-60">Wait for the presenter to launch a poll.</p>
          </div>
        )}
      </div>
    </div>
  );
};
