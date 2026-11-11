import defaults from './content.json';

export function resolveContent(data = {}) {
  const saved = data.content || {};
  return {
    about: { ...defaults.about, ...saved.about },
    officers: Array.isArray(saved.officers) ? saved.officers : defaults.officers,
    performances: Array.isArray(saved.performances) ? saved.performances : defaults.performances,
    photos: Array.isArray(saved.photos) ? saved.photos : [],
  };
}
export function validateContent(content) {
  if (!content.about.description?.trim()) throw new Error('The About description is required.');
  const safeLink = value => !value || /^https:\/\//i.test(value);
  for (const key of ['instagram', 'discord']) if (!safeLink(content.about[key])) throw new Error('Social links must use HTTPS.');
  if (content.about.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content.about.email)) throw new Error('Enter a valid contact email.');
  for (const item of content.officers) if (!item.name?.trim() || !item.position?.trim()) throw new Error('Every officer needs a name and position.');
  for (const item of content.performances) {
    if (!item.title?.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(item.date || '') || !Number.isFinite(new Date(item.date+'T12:00:00Z').valueOf()) || new Date(item.date+'T12:00:00Z').toISOString().slice(0,10)!==item.date) throw new Error('Every performance needs a title and valid date.');
    if (!safeLink(item.videoLink)) throw new Error('Video links must use HTTPS.');
  }
  return content;
}
