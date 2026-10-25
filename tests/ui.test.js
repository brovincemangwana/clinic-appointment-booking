// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { el, showLoading, showError, showSuccess, clearStatus } from '../src/js/ui.js';

describe('el', () => {
  it('creates an element with a class and text', () => {
    const node = el('p', 'muted', 'Hello');
    expect(node.tagName).toBe('P');
    expect(node.className).toBe('muted');
    expect(node.textContent).toBe('Hello');
  });

  it('creates a plain element without a class or text', () => {
    const node = el('div');
    expect(node.className).toBe('');
    expect(node.textContent).toBe('');
  });
});

describe('status messages', () => {
  const makeTarget = () => document.createElement('p');

  it('shows a loading message', () => {
    const target = makeTarget();
    showLoading(target);
    expect(target.className).toBe('status');
    expect(target.textContent).toBe('Loading…');
  });

  it('shows a custom loading message', () => {
    const target = makeTarget();
    showLoading(target, 'Saving…');
    expect(target.textContent).toBe('Saving…');
  });

  it('shows an error', () => {
    const target = makeTarget();
    showError(target, 'Something failed');
    expect(target.className).toBe('status error');
    expect(target.textContent).toBe('Something failed');
  });

  it('shows a success message', () => {
    const target = makeTarget();
    showSuccess(target, 'Saved');
    expect(target.className).toBe('status success');
    expect(target.textContent).toBe('Saved');
  });

  it('clears the message and resets the class', () => {
    const target = makeTarget();
    showError(target, 'Oops');
    clearStatus(target);
    expect(target.className).toBe('status');
    expect(target.textContent).toBe('');
  });
});