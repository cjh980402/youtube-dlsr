import { Util } from '../util/Util';

export interface YoutubeSearchBaseInfo {
    type: 'video' | 'playlist' | 'channel';
    id: string;
    url: string;
    title: string;
    thumbnails: {
        url: string;
        width: string;
        height: string;
    }[];
}

export interface YoutubeSearchVideoInfo extends YoutubeSearchBaseInfo {
    type: 'video';
    publishedTimeAgo?: string;
    description?: string;
    duration: number;
    formattedDuration: string;
    viewCount: number;
    formattedViewCount: string;
    channel: {
        id: string;
        url: string;
        title: string;
        thumbnails: {
            url: string;
            width: number;
            height: number;
        }[];
    };
}

export interface YoutubeSearchListInfo extends YoutubeSearchBaseInfo {
    type: 'playlist';
    videoCount: number;
    channel: {
        id: string;
        url: string;
        title: string;
    };
}

export interface YoutubeSearchChannelInfo extends YoutubeSearchBaseInfo {
    type: 'channel';
    verified: boolean;
    subscriberCount: number;
}

export class YoutubeSearchResults {
    private json: any;
    private limit: number;

    constructor(json: any, limit: number) {
        this.json = json;
        this.limit = limit;
    }

    get estimatedResults() {
        return Number(this.json.estimatedResults);
    }

    get results(): (YoutubeSearchVideoInfo | YoutubeSearchListInfo | YoutubeSearchChannelInfo)[] {
        const arr: (YoutubeSearchVideoInfo | YoutubeSearchListInfo | YoutubeSearchChannelInfo)[] = [];

        const datas =
            this.json.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0]
                .itemSectionRenderer.contents;

        for (const data of datas) {
            const video = data.videoRenderer;
            const list = data.playlistRenderer;
            const channel = data.channelRenderer;

            if (video) {
                const rawViewCount: string =
                    video.viewCountText?.simpleText ?? video.viewCountText?.runs[0]?.text ?? '0';
                const formattedDuration: string = video.lengthText?.simpleText ?? '0:00';
                const formattedViewCount: string =
                    video.shortViewCountText?.simpleText ?? video.shortViewCountText?.runs[0]?.text ?? '0 views';

                arr.push({
                    type: 'video',
                    id: video.videoId,
                    url: `${Util.getYTVideoURL()}${video.videoId}`,
                    title: video.title.runs[0].text,
                    thumbnails: video.thumbnail.thumbnails,
                    publishedTimeAgo: video.publishedTimeText?.simpleText,
                    description: video.detailedMetadataSnippets?.[0].snippetText.runs.map((e: any) => e.text).join(''),
                    duration:
                        formattedDuration
                            .split(':')
                            .map((d: string) => Number(d))
                            .reduce((acc: number, time: number) => 60 * acc + time) * 1000,
                    formattedDuration: formattedDuration,
                    viewCount: Number(rawViewCount.replace(/\D/g, '')),
                    formattedViewCount: formattedViewCount,
                    channel: {
                        id: video.ownerText.runs[0].navigationEndpoint.browseEndpoint.browseId,
                        url: `${Util.getYTChannelURL()}/${
                            video.ownerText.runs[0].navigationEndpoint.browseEndpoint.browseId
                        }`,
                        title: video.ownerText.runs[0].text,
                        thumbnails:
                            video.channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer.thumbnail
                                .thumbnails
                    }
                });
            } else if (list) {
                arr.push({
                    type: 'playlist',
                    id: list.playlistId,
                    url: `${Util.getYTPlaylistURL()}?list=${list.playlistId}`,
                    title: list.title.simpleText,
                    thumbnails: list.thumbnails,
                    videoCount: Number(list.videoCount.replace(/\D/g, '')),
                    channel: {
                        id: list.shortBylineText.runs[0].navigationEndpoint.browseEndpoint.browseId,
                        url: `${Util.getYTChannelURL()}/${
                            list.shortBylineText.runs[0].navigationEndpoint.browseEndpoint.browseId
                        }`,
                        title: list.shortBylineText.runs[0].text
                    }
                });
            } else if (channel) {
                const rawSubscriberCount: string = channel.subscriberCountText?.simpleText ?? '0';

                arr.push({
                    type: 'channel',
                    id: channel.channelId,
                    url: `${Util.getYTChannelURL()}/${channel.channelId}`,
                    title: channel.title.simpleText,
                    thumbnails: channel.thumbnail.thumbnails,
                    verified: Boolean(channel.ownerBadges?.[0]?.metadataBadgeRenderer?.style?.includes('VERIFIED')),
                    subscriberCount: Number(rawSubscriberCount)
                });
            }

            if (arr.length === this.limit) {
                break;
            }
        }

        return arr;
    }
}
