import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FlashcardsViewer from '@/components/study/FlashcardsViewer';
import { Flashcard } from '@/types/lecture';

const mockCards: Flashcard[] = [
  {
    id: 'fc-1',
    front: 'What is Backpropagation?',
    back: 'An efficient algorithm to compute gradients of the loss function.',
    category: 'Optimization',
    difficulty: 'easy',
    mastered: false,
  },
  {
    id: 'fc-2',
    front: 'Why use Layer Normalization?',
    back: 'To stabilize hidden state dynamics and gradient flow across batches.',
    category: 'Architecture',
    difficulty: 'medium',
    mastered: true,
  },
];

describe('FlashcardsViewer Component', () => {
  it('renders initial flashcard front question', () => {
    render(<FlashcardsViewer flashcards={mockCards} />);
    expect(screen.getByText('What is Backpropagation?')).toBeInTheDocument();
  });

  it('flips the card to show back answer when clicked', () => {
    render(<FlashcardsViewer flashcards={mockCards} />);
    const card = screen.getByRole('button', { name: /Flashcard 1 of 2/i });
    fireEvent.click(card);
    expect(screen.getByText(/An efficient algorithm to compute gradients/i)).toBeInTheDocument();
  });

  it('navigates to next card', () => {
    render(<FlashcardsViewer flashcards={mockCards} />);
    const nextBtn = screen.getByTitle('Next (Right Arrow)');
    fireEvent.click(nextBtn);
    expect(screen.getByText('Why use Layer Normalization?')).toBeInTheDocument();
  });

  it('displays card counter correctly', () => {
    render(<FlashcardsViewer flashcards={mockCards} />);
    expect(screen.getByText(/Card 1\/2/i)).toBeInTheDocument();
  });
});
