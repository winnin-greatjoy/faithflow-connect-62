import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Music, Star } from 'lucide-react';

interface AddSongDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmentId: string;
  onSongAdded: () => void;
}

interface SongData {
  title: string;
  composer: string;
  arranger: string;
  keySignature: string;
  tempo: string;
  difficulty: number;
  durationMinutes: number;
  notes: string;
}

export const AddSongDialog: React.FC<AddSongDialogProps> = ({
  open,
  onOpenChange,
  departmentId,
  onSongAdded,
}) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [song, setSong] = useState<SongData>({
    title: '',
    composer: '',
    arranger: '',
    keySignature: 'C',
    tempo: 'Moderato',
    difficulty: 3,
    durationMinutes: 4,
    notes: '',
  });

  const handleSave = async () => {
    if (!song.title.trim() || !song.composer.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Title and Composer are required',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('choir_repertoire').insert({
        department_id: departmentId,
        title: song.title.trim(),
        composer: song.composer.trim(),
        arranger: song.arranger.trim() || null,
        key_signature: song.keySignature,
        tempo: song.tempo,
        difficulty: song.difficulty,
        duration_minutes: song.durationMinutes,
        notes: song.notes.trim() || null,
        date_added: new Date().toISOString(),
        performance_count: 0,
      });

      if (error) throw error;

      toast({
        title: 'Song Added',
        description: `${song.title} added to repertoire`,
      });

      resetForm();
      onSongAdded();
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to add song',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setSong({
      title: '',
      composer: '',
      arranger: '',
      keySignature: 'C',
      tempo: 'Moderato',
      difficulty: 3,
      durationMinutes: 4,
      notes: '',
    });
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Add Song to Repertoire
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="title">Song Title *</Label>
              <Input
                id="title"
                value={song.title}
                onChange={(e) => setSong({ ...song, title: e.target.value })}
                placeholder="e.g., Amazing Grace"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="composer">Composer *</Label>
              <Input
                id="composer"
                value={song.composer}
                onChange={(e) => setSong({ ...song, composer: e.target.value })}
                placeholder="e.g., John Newton"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="arranger">Arranger</Label>
              <Input
                id="arranger"
                value={song.arranger}
                onChange={(e) => setSong({ ...song, arranger: e.target.value })}
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="key">Key Signature</Label>
              <Select
                value={song.keySignature}
                onValueChange={(v) => setSong({ ...song, keySignature: v })}
              >
                <SelectTrigger id="key">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="C">C Major</SelectItem>
                  <SelectItem value="C#">C# Major</SelectItem>
                  <SelectItem value="Db">Db Major</SelectItem>
                  <SelectItem value="D">D Major</SelectItem>
                  <SelectItem value="Eb">Eb Major</SelectItem>
                  <SelectItem value="E">E Major</SelectItem>
                  <SelectItem value="F">F Major</SelectItem>
                  <SelectItem value="F#">F# Major</SelectItem>
                  <SelectItem value="Gb">Gb Major</SelectItem>
                  <SelectItem value="G">G Major</SelectItem>
                  <SelectItem value="Ab">Ab Major</SelectItem>
                  <SelectItem value="A">A Major</SelectItem>
                  <SelectItem value="Bb">Bb Major</SelectItem>
                  <SelectItem value="B">B Major</SelectItem>
                  <SelectItem value="Am">A Minor</SelectItem>
                  <SelectItem value="Em">E Minor</SelectItem>
                  <SelectItem value="Dm">D Minor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tempo">Tempo</Label>
              <Select value={song.tempo} onValueChange={(v) => setSong({ ...song, tempo: v })}>
                <SelectTrigger id="tempo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Largo">Largo (Slow)</SelectItem>
                  <SelectItem value="Adagio">Adagio (Slow & Stately)</SelectItem>
                  <SelectItem value="Andante">Andante (Walking Pace)</SelectItem>
                  <SelectItem value="Moderato">Moderato (Moderate)</SelectItem>
                  <SelectItem value="Allegro">Allegro (Fast)</SelectItem>
                  <SelectItem value="Vivace">Vivace (Lively)</SelectItem>
                  <SelectItem value="Presto">Presto (Very Fast)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSong({ ...song, difficulty: level })}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        level <= song.difficulty
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-sm text-gray-600 ml-2">
                  {song.difficulty === 1 && 'Beginner'}
                  {song.difficulty === 2 && 'Easy'}
                  {song.difficulty === 3 && 'Intermediate'}
                  {song.difficulty === 4 && 'Advanced'}
                  {song.difficulty === 5 && 'Expert'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="30"
                value={song.durationMinutes}
                onChange={(e) =>
                  setSong({ ...song, durationMinutes: parseInt(e.target.value) || 4 })
                }
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={song.notes}
                onChange={(e) => setSong({ ...song, notes: e.target.value })}
                placeholder="Additional notes, performance instructions, or special requirements..."
                rows={4}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Adding...' : 'Add Song'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
