import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PracticeQuiz, { QUIZ_QUESTION_OPTIONS } from '@/components/study/PracticeQuiz';
import { QuizQuestion } from '@/types/lecture';

const mockQuestions: QuizQuestion[] = [
  {
    id: 'q-1',
    question: 'What is the primary objective of scaled dot-product attention?',
    options: [
      'Scale gradients down by 1/sqrt(d_k) to prevent softmax vanishing',
      'Increase parameter count infinitely',
      'Eliminate memory caches completely',
      'Convert text to binary signals',
    ],
    correctAnswerIndex: 0,
    explanation: 'Dividing by the square root of key dimension prevents variance explosion.',
    topic: 'Attention Mechanics',
  },
  {
    id: 'q-2',
    question: 'What is the computational complexity of self-attention over sequence length N?',
    options: ['O(1)', 'O(N)', 'O(N^2)', 'O(log N)'],
    correctAnswerIndex: 2,
    explanation: 'Every token computes a dot product with every other token, resulting in N x N.',
    topic: 'Complexity',
  },
];

describe('PracticeQuiz Component', () => {
  it('renders initial question and options', () => {
    render(<PracticeQuiz quiz={mockQuestions} />);
    expect(
      screen.getByText('What is the primary objective of scaled dot-product attention?')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Scale gradients down by 1/sqrt(d_k) to prevent softmax vanishing')
    ).toBeInTheDocument();
  });

  it('renders question count options for 5, 10, 15, and 20', () => {
    render(<PracticeQuiz quiz={mockQuestions} />);
    expect(screen.getByRole('radio', { name: /^5 questions$/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /^10 questions$/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /^15 questions$/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /^20 questions$/i })).toBeInTheDocument();
  });

  it('adjusts question count dynamically when 5, 10, 15, or 20 option is selected', () => {
    render(<PracticeQuiz quiz={mockQuestions} initialCount="all" />);
    expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();

    // Select 5 questions
    const opt5 = screen.getByRole('radio', { name: /^5 questions$/i });
    fireEvent.click(opt5);
    expect(screen.getByText('Question 1 of 5')).toBeInTheDocument();

    // Select 10 questions
    const opt10 = screen.getByRole('radio', { name: /^10 questions$/i });
    fireEvent.click(opt10);
    expect(screen.getByText('Question 1 of 10')).toBeInTheDocument();

    // Select 15 questions
    const opt15 = screen.getByRole('radio', { name: /^15 questions$/i });
    fireEvent.click(opt15);
    expect(screen.getByText('Question 1 of 15')).toBeInTheDocument();

    // Select 20 questions
    const opt20 = screen.getByRole('radio', { name: /^20 questions$/i });
    fireEvent.click(opt20);
    expect(screen.getByText('Question 1 of 20')).toBeInTheDocument();
  });

  it('reveals explanation when an option is clicked', () => {
    render(<PracticeQuiz quiz={mockQuestions} />);
    const correctOption = screen.getByText(
      'Scale gradients down by 1/sqrt(d_k) to prevent softmax vanishing'
    );
    fireEvent.click(correctOption);
    expect(screen.getByText(/Dividing by the square root of key dimension/i)).toBeInTheDocument();
  });

  it('allows advancing to next question', () => {
    render(<PracticeQuiz quiz={mockQuestions} initialCount="all" />);
    const option = screen.getByText(
      'Scale gradients down by 1/sqrt(d_k) to prevent softmax vanishing'
    );
    fireEvent.click(option);

    const nextBtn = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(nextBtn);

    expect(
      screen.getByText(
        'What is the computational complexity of self-attention over sequence length N?'
      )
    ).toBeInTheDocument();
  });
});
