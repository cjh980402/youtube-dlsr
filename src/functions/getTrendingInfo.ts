import axios from 'axios';
import { YoutubeTrending } from '../classes/YoutubeTrending';
import { Regexes } from '../util/constants';
import { Util } from '../util/Util';

export async function getTrendingInfo(): Promise<YoutubeTrending> {
    const { data } = await axios.get<string>(`${Util.getYTTrendingURL()}?hl=en`);

    const json = JSON.parse((Regexes.YOUTUBE_INITIAL_DATA.exec(data) as RegExpExecArray)[1]);

    return new YoutubeTrending(
        json.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].shelfRenderer.content.expandedShelfContentsRenderer.items
    );
}