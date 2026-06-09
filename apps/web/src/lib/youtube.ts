export type YoutubeThumbnailQuality =
  | "maxresdefault"
  | "hqdefault"
  | "mqdefault";

type YoutubeOEmbedResponse = {
  author_name: string;
  author_url: string;
  title: string;
};

/** Build YouTube thumbnail URL from video ID (not full watch URL). */
export function getYoutubeThumbnailUrl(
  videoId: string,
  quality: YoutubeThumbnailQuality = "maxresdefault",
): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

export function getYoutubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/** Fetch uploader/channel name via YouTube oEmbed (no API key). Server-only. */
export async function fetchYoutubeChannelName(
  videoId: string,
): Promise<string | null> {
  const watchUrl = getYoutubeWatchUrl(videoId);
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`;

  try {
    const response = await fetch(oembedUrl, {
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!response.ok) return null;

    const data = (await response.json()) as YoutubeOEmbedResponse;
    return data.author_name || null;
  } catch {
    return null;
  }
}

export async function enrichFaqItemsWithChannelNames<
  T extends { youtubeUrl: string; youtubeChannelName?: string },
>(items: T[]): Promise<(T & { youtubeChannelName: string })[]> {
  return Promise.all(
    items.map(async (item) => {
      if (item.youtubeChannelName) {
        return { ...item, youtubeChannelName: item.youtubeChannelName };
      }

      const channelName = await fetchYoutubeChannelName(item.youtubeUrl);
      return {
        ...item,
        youtubeChannelName: channelName ?? "YouTube",
      };
    }),
  );
}
