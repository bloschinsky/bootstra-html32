// Copy buttons for the install snippets. Without clipboard access, selects the text instead.
document.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-copy]');
  if (!button) return;
  const code = document.getElementById(button.dataset.copy);
  const status = document.getElementById('copy-status');
  const label = button.firstChild;
  try {
    await navigator.clipboard.writeText(code.textContent);
    label.textContent = 'Copied';
    status.textContent = 'Copied to clipboard';
  } catch {
    getSelection().selectAllChildren(code);
    label.textContent = 'Selected';
    status.textContent = 'Text selected, press Ctrl+C or Cmd+C to copy';
  }
  setTimeout(() => { label.textContent = 'Copy'; status.textContent = ''; }, 2000);
});
