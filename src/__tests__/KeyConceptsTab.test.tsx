import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import KeyConceptsTab from '@/components/study/KeyConceptsTab';
import { DEMO_LECTURES } from '@/data/demoLectures';

describe('KeyConceptsTab Component', () => {
  const lecture = DEMO_LECTURES[0];

  it('renders all key concepts and formula titles correctly', () => {
    render(<KeyConceptsTab keyConcepts={lecture.keyConcepts} formulas={lecture.formulas} />);
    expect(screen.getByText(/Key Concepts \(/i)).toBeInTheDocument();
    expect(screen.getByText(/Governing Mathematical Formulas/i)).toBeInTheDocument();
  });

  it('filters concepts dynamically when the user types in search', () => {
    render(<KeyConceptsTab keyConcepts={lecture.keyConcepts} formulas={lecture.formulas} />);
    const searchInput = screen.getByRole('searchbox', { name: /filter concepts and formulas/i });
    fireEvent.change(searchInput, { target: { value: 'Scaled Dot-Product' } });

    expect(screen.getAllByText(/Scaled Dot-Product/i).length).toBeGreaterThan(0);
  });

  it('filters concepts by priority pill buttons', () => {
    render(<KeyConceptsTab keyConcepts={lecture.keyConcepts} formulas={lecture.formulas} />);
    const highPriorityBtn = screen.getByRole('button', { name: /^high$/i });
    fireEvent.click(highPriorityBtn);
    expect(highPriorityBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('displays empty state gracefully when no concepts match query', () => {
    render(<KeyConceptsTab keyConcepts={lecture.keyConcepts} formulas={lecture.formulas} />);
    const searchInput = screen.getByRole('searchbox', { name: /filter concepts and formulas/i });
    fireEvent.change(searchInput, { target: { value: 'nonexistenttermxyz123' } });

    expect(screen.getByText(/No concepts match the selected filter/i)).toBeInTheDocument();
  });
});
