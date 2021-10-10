import axios from 'axios';
import { SearchError } from '../classes/SearchError';
import { YoutubeSearchResults } from '../classes/YoutubeSearchResults';
import { ErrorCodes, Regexes } from '../util/constants';

export async function getSearchInfo(url: string, limit: number) {
    const request = await axios.get<string>(url).catch(() => {});
    if (!request) {
        throw new SearchError(ErrorCodes.SEARCH_FAILED);
    }

    try {
        const json = JSON.parse((Regexes.YOUTUBE_INITIAL_DATA.exec(request.data) as RegExpExecArray)[1]);

        return new YoutubeSearchResults(json, limit);
    } catch (error) {
        throw new SearchError((error as Error).message);
    }
}
