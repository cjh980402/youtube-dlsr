import { request } from 'undici';
import { YoutubeChannel } from '../classes/YoutubeChannel';
import { YoutubeConfig } from '../util/config';
import { Util } from '../util/Util';

export async function getChannelInfo(id: string): Promise<YoutubeChannel> {
    const { body } = await request(Util.getApiURL('browse'), {
        method: 'POST',
        body: JSON.stringify({
            context: YoutubeConfig.INNERTUBE_CONTEXT,
            browseId: id
        })
    });

    return new YoutubeChannel(await body.json());
}
