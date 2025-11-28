import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Music, Star, Clock, Edit, Trash2, Calendar } from 'lucide-react';

export interface Song {
  id: string;
  title: string;
  composer: string;
  arranger?: string | null;
  key_signature: string;
  tempo: string;
  difficulty: number;
  duration_minutes: number;
  notes?: string | null;
  last_performed?: string | null;
  performance_count: number;
}

interface SongCardProps {
  song: Song;
  onEdit: (song: Song) => void;
  onDelete: (songId: string) => void;
  onMarkPerformed: (songId: string) => void;
}

export const SongCard: React.FC<SongCardProps> = ({ song, onEdit, onDelete, onMarkPerformed }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Music className="h-4 w-4 text-blue-600" />
              <h4 className="font-semibold text-gray-900">{song.title}</h4>
            </div>
            <p className="text-sm text-gray-600">
              {song.composer}
              {song.arranger && <span className="text-gray-500"> (arr. {song.arranger})</span>}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className="text-xs">
            Key: {song.key_signature}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {song.tempo}
          </Badge>
          <Badge variant="outline" className="text-xs flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {song.duration_minutes}min
          </Badge>
        </div>

        <div className="flex items-center gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((level) => (
            <Star
              key={level}
              className={`h-4 w-4 ${
                level <= song.difficulty ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
            />
          ))}
          <span className="text-xs text-gray-500 ml-2">
            {song.difficulty === 1 && 'Beginner'}
            {song.difficulty === 2 && 'Easy'}
            {song.difficulty === 3 && 'Intermediate'}
            {song.difficulty === 4 && 'Advanced'}
            {song.difficulty === 5 && 'Expert'}
          </span>
        </div>

        {song.last_performed && (
          <div className="text-xs text-gray-500 mb-3 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Last performed: {new Date(song.last_performed).toLocaleDateString()}
            <Badge variant="secondary" className="ml-2 text-xs">
              {song.performance_count}x
            </Badge>
          </div>
        )}

        {song.notes && <p className="text-xs text-gray-600 mb-3 line-clamp-2">{song.notes}</p>}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onMarkPerformed(song.id)}
          >
            Mark Performed
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(song)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(song.id)}>
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
