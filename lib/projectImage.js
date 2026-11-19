/**
 * Resolves project cover image with priority:
 * 1. Custom banner image (if provided)
 * 2. Live website screenshot/preview (if site has a liveUrl)
 * 3. Default fallback placeholder
 */
export function getProjectCoverImage(project) {
  if (project?.image && typeof project.image === 'string' && project.image.trim()) {
    return project.image.trim();
  }

  if (project?.liveUrl && typeof project.liveUrl === 'string' && project.liveUrl.trim()) {
    const raw = project.liveUrl.trim();
    const cleanUrl = raw.startsWith('http://') || raw.startsWith('https://') ? raw : `https://${raw}`;
    return `https://api.microlink.io?url=${encodeURIComponent(cleanUrl)}&screenshot=true&embed=screenshot.url`;
  }

  return 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000&q=80';
}
