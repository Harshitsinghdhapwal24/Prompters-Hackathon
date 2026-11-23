import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import LectureUploadZone from '@/components/upload/LectureUploadZone';

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

beforeEach(() => {
  global.fetch = jest.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            videoId: 'aircAruvnKk',
            url: 'https://www.youtube.com/watch?v=aircAruvnKk',
            title: 'Neural Networks',
            author: '3Blue1Brown',
            thumbnailUrl: 'https://i.ytimg.com/vi/aircAruvnKk/hqdefault.jpg',
            hasTranscript: true,
            transcriptCount: 15,
          },
        }),
    })
  ) as jest.Mock;
});

describe('LectureUploadZone Component', () => {
  it('renders tab options for YouTube, File Upload, and Direct Text', () => {
    render(<LectureUploadZone />);
    expect(screen.getByRole('tab', { name: /youtube video/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /audio \/ video file/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /paste transcript/i })).toBeInTheDocument();
  });

  it('switches to File Upload tab on click', () => {
    render(<LectureUploadZone />);
    const uploadTab = screen.getByRole('tab', { name: /audio \/ video file/i });
    fireEvent.click(uploadTab);
    expect(uploadTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/Drag and drop lecture file here/i)).toBeInTheDocument();
  });

  it('switches to Direct Text tab on click', () => {
    render(<LectureUploadZone />);
    const textTab = screen.getByRole('tab', { name: /paste transcript/i });
    fireEvent.click(textTab);
    expect(textTab).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.getByPlaceholderText(/Paste classroom transcript/i)
    ).toBeInTheDocument();
  });

  it('populates YouTube URL input when sample button is clicked', async () => {
    render(<LectureUploadZone />);
    const sampleBtn = screen.getByRole('button', { name: /3Blue1Brown Neural Networks/i });
    await act(async () => {
      fireEvent.click(sampleBtn);
    });
    const urlInput = screen.getByPlaceholderText(/youtube.com\/watch\?v=/i) as HTMLInputElement;
    expect(urlInput.value).toContain('aircAruvnKk');
  });
});
