import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from './LandingPage.jsx';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe('public landing page', () => {
  it('shows required public content, navigation and an empty state without stored posts', () => {
    render(<MemoryRouter><LandingPage /></MemoryRouter>);
    expect(screen.getByRole('heading', { level: 1, name: 'Your thoughts. Your space. Beautifully simple.' })).toBeTruthy();
    expect(screen.getAllByRole('link', { name: 'Login' })[0].getAttribute('href')).toBe('/login');
    expect(screen.getByRole('link', { name: 'Get Started' }).getAttribute('href')).toBe('/register');
    expect(screen.getByText('No posts yet — check back soon!')).toBeTruthy();
    expect(screen.getByText(/not secure or private/i)).toBeTruthy();
    expect(screen.getByRole('navigation', { name: 'Footer navigation' })).toBeTruthy();
  });

  it('lists only the three newest records in descending order with storage-backed links', () => {
    window.localStorage.setItem('writespace_posts', JSON.stringify([
      { id: 'old', title: 'Old story', content: 'Older text', createdAt: '2026-01-01T00:00:00.000Z', authorName: 'Writer' },
      { id: 'newest', title: 'Newest story', content: 'Newest text', createdAt: '2026-03-03T00:00:00.000Z', authorName: 'Writer' },
      { id: 'middle', title: 'Middle story', content: 'Middle text', createdAt: '2026-02-01T00:00:00.000Z', authorName: 'Writer' },
      { id: 'second', title: 'Second newest', content: 'Second text', createdAt: '2026-03-01T00:00:00.000Z', authorName: 'Writer' },
    ]));
    render(<MemoryRouter><LandingPage /></MemoryRouter>);
    const links = screen.getAllByRole('link').filter((link) => link.getAttribute('href')?.startsWith('/blog/'));
    expect(links.length).toBe(3);
    expect(links[0].getAttribute('href')).toBe('/blog/newest');
    expect(links[0].textContent).toContain('Newest story');
    expect(links[1].textContent).toContain('Second newest');
    expect(links[2].textContent).toContain('Middle story');
    expect(screen.queryByText('Old story')).toBeNull();
  });
});
