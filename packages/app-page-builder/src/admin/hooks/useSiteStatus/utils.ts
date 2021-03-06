const MINUTE = 60 * 1000;
// Plain in-memory store for fetch response
const CACHE = {};

function getCacheTimer(time) {
    let cacheTimer = 0;
    const now = new Date().getTime();
    if (cacheTimer < now + time) {
        cacheTimer = now + time;
    }
    return cacheTimer;
}

export async function fetchWithCache(params: { url: string; time?: number; ignoreCache: boolean }) {
    const { url, time = 5 * MINUTE, ignoreCache } = params;

    const now = new Date().getTime();

    if (!CACHE[url] || CACHE[url].cacheTimer < now || ignoreCache) {
        try {
            const response = await fetch(url, {
                method: "GET",
                mode: "no-cors"
            });
            // Update cache with response
            if (response) {
                CACHE[url] = { ...response, active: true };
                CACHE[url].cacheTimer = getCacheTimer(time);
            }
        } catch (e) {
            CACHE[url] = { active: false };
        }
    }

    return CACHE[url];
}

export const pingSite = async (params: { url: string; cb: any; ignoreCache: boolean }) => {
    const { url, cb, ignoreCache } = params;
    try {
        const response = await fetchWithCache({ url, ignoreCache });

        cb(response && response.active);
    } catch (e) {
        console.error(e);
        cb(false);
    }
};
