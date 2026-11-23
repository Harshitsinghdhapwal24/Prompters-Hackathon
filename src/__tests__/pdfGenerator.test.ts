import { exportLectureToPdf } from '@/lib/pdfGenerator';
import { DEMO_LECTURES } from '@/data/demoLectures';

// Mock jsPDF
jest.mock('jspdf', () => {
  return {
    jsPDF: jest.fn().mockImplementation(() => ({
      internal: {
        pageSize: {
          getWidth: jest.fn().mockReturnValue(210),
          getHeight: jest.fn().mockReturnValue(297),
        },
        getNumberOfPages: jest.fn().mockReturnValue(1),
      },
      setFont: jest.fn(),
      setFontSize: jest.fn(),
      setTextColor: jest.fn(),
      setFillColor: jest.fn(),
      setDrawColor: jest.fn(),
      setLineWidth: jest.fn(),
      line: jest.fn(),
      roundedRect: jest.fn(),
      text: jest.fn(),
      splitTextToSize: jest.fn().mockReturnValue(['Sample text line']),
      addPage: jest.fn(),
      save: jest.fn(),
    })),
  };
});

describe('PDF Generation Utility', () => {
  it('should generate and download PDF study guide without errors', async () => {
    const lecture = DEMO_LECTURES[0];
    await expect(exportLectureToPdf(lecture)).resolves.not.toThrow();
  });
});
