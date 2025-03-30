import React from 'react';
import { render, screen } from '@testing-library/react';
import { Spinner, SpinnerSize } from '@/components/ui/spinner';

describe('Spinner Component', () => {
  it('renders the spinner with default props', () => {
    render(<Spinner />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('w-8 h-8 border-2');
    expect(spinner).toHaveClass('border-primary');
  });
  
  it('applies xs size class when size is XS', () => {
    render(<Spinner size={SpinnerSize.XS} />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-4 h-4 border-2');
  });
  
  it('applies sm size class when size is SM', () => {
    render(<Spinner size={SpinnerSize.SM} />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-6 h-6 border-2');
  });
  
  it('applies lg size class when size is LG', () => {
    render(<Spinner size={SpinnerSize.LG} />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-12 h-12 border-3');
  });
  
  it('applies xl size class when size is XL', () => {
    render(<Spinner size={SpinnerSize.XL} />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-16 h-16 border-4');
  });
  
  it('applies custom color class when provided', () => {
    render(<Spinner color="border-red-500" />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('border-red-500');
  });
  
  it('applies additional className when provided', () => {
    render(<Spinner className="test-class" />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('test-class');
  });
});