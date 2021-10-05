import { Util } from '../util/Util';

export interface YoutubeTrendingVideo {
    id: string;
    thumbnails: {
        url: string;
        width: string;
        height: string;
    }[];
    url: string;
    title: string;
    publishedTimeAgo?: string;
    viewCount: number;
    formattedViewCount: number;
    description?: string;
    duration: number;
    formattedDuration: string;
    formattedReadableDuration: string;
    channel: {
        name: string;
        id: string;
        url: string;
        thumbnails: {
            url: string;
            width: number;
            height: number;
        }[];
    };
}

export class YoutubeTrending {
    private json: any;

    constructor(json: any) {
        this.json = json;
    }

    get results(): YoutubeTrendingVideo[] {
        const arr: YoutubeTrendingVideo[] = [];

        for (const data of this.json) {
            const video = data.videoRenderer;

            if (video) {
                arr.push({
                    url: `${Util.getYTVideoURL()}${video.videoId}`,
                    id: video.videoId,
                    thumbnails: video.thumbnail.thumbnails,
                    title: video.title.runs[0].text,
                    channel: {
                        name: video.ownerText.runs[0].text,
                        id: video.ownerText.runs[0].navigationEndpoint.browseEndpoint.browseId,
                        url: `${Util.getYTChannelURL()}/${
                            video.ownerText.runs[0].navigationEndpoint.browseEndpoint.browseId
                        }`,
                        thumbnails:
                            video.channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer.thumbnail
                                .thumbnails
                    },
                    viewCount: Number(video.viewCountText.simpleText.split(' ')[0].replace(/,/g, '')),
                    publishedTimeAgo: video.publishedTimeText?.simpleText,
                    formattedDuration: video.lengthText.simpleText,
                    formattedReadableDuration: video.lengthText.accessibility.accessibilityData.label,
                    formattedViewCount: video.shortViewCountText.simpleText,
                    description: video.detailedMetadataSnippets?.[0].snippetText.runs.map((e: any) => e.text).join(''),
                    duration:
                        video.lengthText.simpleText
                            .split(':')
                            .map((d: string) => Number(d))
                            .reduce((acc: number, time: number) => 60 * acc + time) * 1000
                });
            }
        }

        return arr;
    }
}
