import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ExamQuestionsTab from '@/components/study/ExamQuestionsTab';
import { DEMO_LECTURES } from '@/data/demoLectures';

describe('ExamQuestionsTab Component', () => {
  const lecture = DEMO_LECTURES[0];

  it('renders short answer and long answer questions properly', () => {
    render(
      <ExamQuestionsTab
        shortAnswer={lecture.examQuestions.shortAnswer}
        longAnswer={lecture.examQuestions.longAnswer}
      />
    );

    expect(screen.getByText(/Short Answer Problems/i)).toBeInTheDocument();
    expect(screen.getByText(/Long Answer & Derivations/i)).toBeInTheDocument();
  });

  it('toggles model answer and evaluation rubric visibility on button click', () => {
    render(
      <ExamQuestionsTab
        shortAnswer={lecture.examQuestions.shortAnswer}
        longAnswer={lecture.examQuestions.longAnswer}
      />
    );

    // Find first question collapsible button
    const questionButtons = screen.getAllByRole('button', { expanded: false });
    expect(questionButtons.length).toBeGreaterThan(0);

    // Click to expand first question
    fireEvent.click(questionButtons[0]);
    expect(screen.getByText(/Model Answer:/i)).toBeInTheDocument();
    expect(screen.getByText(/Required Criteria:/i)).toBeInTheDocument();
  });

  it('displays empty state if no exam questions are provided', () => {
    render(<ExamQuestionsTab shortAnswer={[]} longAnswer={[]} />);
    expect(screen.getByText(/No Exam Questions Available/i)).toBeInTheDocument();
  });
});
