'use client';

import { useEffect, useState } from 'react';
import { signout } from './login/actions';
import { createClient } from '@/utils/supabase/client';
import { getReviews, createReview, updateReview, deleteReview } from '@/lib/actions/companion.actions';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Pencil, Trash2, Save, X } from 'lucide-react';
import Link from 'next/link';


export default function ReviewPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [suggestion, setSuggestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      try {
        const reviewsData = await getReviews();
        setReviews(reviewsData || []);
      } catch (error) {
        console.error('Error loading reviews:', error);
      }
    }

    fetchData();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestion.trim() || !user) return;

    setIsSubmitting(true);
    try {
      await createReview(suggestion, user.id);
      setSuggestion('');
      const updatedReviews = await getReviews();
      setReviews(updatedReviews || []);
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (review: any) => {
    setEditingId(review.id);
    setEditText(review.suggestion);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleUpdate = async (id: number) => {
    if (!editText.trim() || !user) return;

    try {
      await updateReview(id, editText, user.id);
      const updatedReviews = await getReviews();
      setReviews(updatedReviews || []);
      setEditingId(null);
    } catch (error) {
      console.error('Error updating review:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!user) return;
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      await deleteReview(id, user.id);
      const updatedReviews = await getReviews();
      setReviews(updatedReviews || []);
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Link href="/companions" className='p-4 bg-blue-500 text-white font-bold rounded-full hover:bg-blue-600 transition-colors'>Home</Link>
      <h1 className="text-3xl font-bold mb-6 mt-8">Feedback & Suggestions</h1>
      
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Share Your Thoughts</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            placeholder="What suggestions do you have for us?"
            className="min-h-[120px]"
            required
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </form>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Recent Feedback</h2>
        
        {reviews.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No feedback yet. Be the first to share!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 relative">
                {editingId === review.id ? (
                  <div className="space-y-4">
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        onClick={cancelEditing}
                        size="sm"
                      >
                        <X className="w-4 h-4 mr-2" /> Cancel
                      </Button>
                      <Button 
                        onClick={() => handleUpdate(review.id)}
                        size="sm"
                      >
                        <Save className="w-4 h-4 mr-2" /> Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src={review.profiles?.avatar_url} />
                        <AvatarFallback>
                          {review.profiles?.full_name?.charAt(0) || review.profiles?.username?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">
                            {review.profiles?.full_name || review.profiles?.username || 'Anonymous'}
                          </h3>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {format(new Date(review.created_at), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <p className="mt-2 text-gray-700 dark:text-gray-300">{review.suggestion}</p>
                      </div>
                    </div>
                    {user?.id === review.user_id && (
                      <div className="absolute top-4 right-4 flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => startEditing(review)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                          onClick={() => handleDelete(review.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}