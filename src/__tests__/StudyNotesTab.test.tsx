import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import StudyNotesTab from '@/components/study/StudyNotesTab';

const sampleMarkdown = `# Machine Learning Lecture
## 1. Executive Summary
This is a test summary for students studying deep learning.
> **Exam Alert:** Softmax gradients can vanish without scaling.
| Algorithm | Complexity | Memory |
| :--- | :--- | :--- |
| Attention | O(N^2) | High |
| RNN | O(N) | Low |
## 2. Derivations
$$E = mc^2$$
- First takeaway
- Second takeaway
1. Step one
2. Step two
`;

describe('StudyNotesTab Component', () => {
  it('renders study notes headings properly', () => {
    render(<StudyNotesTab notes={sampleMarkdown} />);
    expect(screen.getByRole('heading', { level: 1, name: /Machine Learning Lecture/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /1\. Executive Summary/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /2\. Derivations/i })).toBeInTheDocument();
  });

  it('renders table of contents quick navigation links', () => {
    render(<StudyNotesTab notes={sampleMarkdown} />);
    expect(screen.getByText('Quick Navigation')).toBeInTheDocument();
  });

  it('renders exam alert callout box', () => {
    render(<StudyNotesTab notes={sampleMarkdown} />);
    expect(screen.getByText(/Softmax gradients can vanish/i)).toBeInTheDocument();
  });

  it('renders formatted markdown tables', () => {
    render(<StudyNotesTab notes={sampleMarkdown} />);
    expect(screen.getByText('Algorithm')).toBeInTheDocument();
    expect(screen.getByText('Attention')).toBeInTheDocument();
    expect(screen.getByText('RNN')).toBeInTheDocument();
  });

  it('calculates reading time and word count', () => {
    render(<StudyNotesTab notes={sampleMarkdown} />);
    expect(screen.getByText(/min read/i)).toBeInTheDocument();
    expect(screen.getByText(/words/i)).toBeInTheDocument();
  });

  it('supports copying notes to clipboard', () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
    });

    render(<StudyNotesTab notes={sampleMarkdown} />);
    const copyButton = screen.getByTitle('Copy all notes as Markdown');
    fireEvent.click(copyButton);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(sampleMarkdown);
  });
});
