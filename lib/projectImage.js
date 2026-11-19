/**
 * Resolves project cover image with user-configured priority:
 *
 * 1. Custom uploaded banner / database media image (top priority when added)
 * 2. Live website landing page screenshot preview (when site has liveUrl and no custom banner)
 * 3. Default fallback placeholder
 */
export function getProjectCoverImage(project) {
  const isDefaultPlaceholder =
    project?.image &&
    typeof project.image === 'string' &&
    project.image.includes('photo-1517694712202');

  // Priority 1: Custom banner image (uploaded via local storage to MongoDB, or custom URL)
  if (
    project?.image &&
    typeof project.image === 'string' &&
    project.image.trim() &&
    !isDefaultPlaceholder
  ) {
    return project.image.trim();
  }

  // Priority 2: Live website landing page preview if site has a liveUrl
  if (project?.liveUrl && typeof project.liveUrl === 'string' && project.liveUrl.trim()) {
    const raw = project.liveUrl.trim();
    let cleanUrl = raw.startsWith('http://') || raw.startsWith('https://') ? raw : `https://${raw}`;
    try {
      const parsed = new URL(cleanUrl);
      cleanUrl = parsed.origin;
    } catch {
      // keep cleanUrl
    }
    return `https://s0.wp.com/mshots/v1/${encodeURIComponent(cleanUrl)}?w=1200`;
  }

  // Priority 3: Fallback custom image or default unsplash placeholder
  if (project?.image && typeof project.image === 'string' && project.image.trim()) {
    return project.image.trim();
  }

  return 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000&q=80';
}
