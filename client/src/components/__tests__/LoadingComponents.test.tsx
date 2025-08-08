import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { 
  SkeletonLine, 
  SkeletonButton, 
  SkeletonCard,
  LoadingScreen,
  LoadingSpinner,
  ProgressBar
} from '../LoadingComponents';

describe('LoadingComponents', () => {
  describe('SkeletonLine', () => {
    it('renders with default variant', () => {
      render(<SkeletonLine data-testid="skeleton-line" />);
      const skeleton = screen.getByTestId('skeleton-line');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass('skeleton-line');
    });

    it('renders with custom variant', () => {
      render(<SkeletonLine variant="short" data-testid="skeleton-line" />);
      const skeleton = screen.getByTestId('skeleton-line');
      expect(skeleton).toHaveClass('skeleton-line-short');
    });

    it('renders with medium variant', () => {
      render(<SkeletonLine variant="medium" data-testid="skeleton-line" />);
      const skeleton = screen.getByTestId('skeleton-line');
      expect(skeleton).toHaveClass('skeleton-line-medium');
    });
  });

  describe('SkeletonButton', () => {
    it('renders skeleton button', () => {
      render(<SkeletonButton data-testid="skeleton-button" />);
      const skeleton = screen.getByTestId('skeleton-button');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass('skeleton-button');
    });
  });

  describe('SkeletonCard', () => {
    it('renders skeleton card', () => {
      render(<SkeletonCard data-testid="skeleton-card" />);
      const skeleton = screen.getByTestId('skeleton-card');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass('skeleton-card');
    });
  });

  describe('LoadingScreen', () => {
    it('renders loading message', () => {
      render(<LoadingScreen />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders spinner component', () => {
      render(<LoadingScreen data-testid="loading-screen" />);
      const loadingScreen = screen.getByTestId('loading-screen');
      expect(loadingScreen).toBeInTheDocument();
    });
  });

  describe('LoadingSpinner', () => {
    it('renders with default size', () => {
      render(<LoadingSpinner data-testid="loading-spinner" />);
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('loading-spinner');
    });

    it('renders with large size', () => {
      render(<LoadingSpinner size="lg" data-testid="loading-spinner" />);
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('loading-spinner-lg');
    });

    it('renders with small size', () => {
      render(<LoadingSpinner size="sm" data-testid="loading-spinner" />);
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('loading-spinner-sm');
    });
  });

  describe('ProgressBar', () => {
    it('renders progress bar with default value', () => {
      render(<ProgressBar data-testid="progress-bar" />);
      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveClass('progress-bar');
    });

    it('renders indeterminate progress bar', () => {
      render(<ProgressBar indeterminate data-testid="progress-bar" />);
      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveClass('progress-bar-indeterminate');
    });

    it('calculates percentage correctly', () => {
      render(<ProgressBar value={25} max={100} data-testid="progress-bar" />);
      const progressBar = screen.getByTestId('progress-bar');
      const progressFill = progressBar.querySelector('.progress-bar-fill');
      expect(progressFill).toHaveStyle('width: 25%');
    });

    it('caps percentage at 100%', () => {
      render(<ProgressBar value={150} max={100} data-testid="progress-bar" />);
      const progressBar = screen.getByTestId('progress-bar');
      const progressFill = progressBar.querySelector('.progress-bar-fill');
      expect(progressFill).toHaveStyle('width: 100%');
    });
  });
});