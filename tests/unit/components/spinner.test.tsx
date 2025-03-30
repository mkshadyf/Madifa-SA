import React from 'react';
import { render, screen } from '@testing-library/react';
import { Spinner } from '@/components/ui/spinner';

describe('Spinner Component', () => {
  it('renders with default size (md)', () => {
    render(<Spinner />);
    
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('h-6 w-6');
  });
  
  it('renders with small size', () => {
    render(<Spinner size="sm" />);
    
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveClass('h-4 w-4');
  });
  
  it('renders with medium size', () => {
    render(<Spinner size="md" />);
    
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveClass('h-6 w-6');
  });
  
  it('renders with large size', () => {
    render(<Spinner size="lg" />);
    
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveClass('h-8 w-8');
  });
  
  it('renders with extra large size', () => {
    render(<Spinner size="xl" />);
    
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveClass('h-12 w-12');
  });
  
  it('applies custom className', () => {
    render(<Spinner className="custom-class" />);
    
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveClass('custom-class');
  });
});