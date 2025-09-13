import createCache from '@emotion/cache';
import stylisRTLPlugin from 'stylis-plugin-rtl';

export const rtlCache = createCache({
    key: 'mui-rtl',
    stylisPlugins: [stylisRTLPlugin],
});
