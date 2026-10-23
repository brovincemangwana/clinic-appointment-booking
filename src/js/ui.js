export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function showLoading(target, message = 'Loading…') {
  target.className = 'status';
  target.textContent = message;
}

export function showError(target, message) {
  target.className = 'status error';
  target.textContent = message;
}

export function clearStatus(target) {
  target.className = 'status';
  target.textContent = '';
}