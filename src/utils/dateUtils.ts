export const vaultFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short', 
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

export const formatDate = (date: Date) => vaultFormatter.format(new Date(date));