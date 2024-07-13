export function extractHostAndEndpoint(url) {

    // Decode URL-encoded characters
    url = decodeURIComponent(url);

    // Add "http://" if the URL doesn't start with it
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('{{')) {
        if (url.startsWith('/')) {
            url = 'http:/' + url;
        } else {
            url = 'http://' + url;
        }
    }

    // Check if the URL contains any placeholder like {{value}}
    const placeholderRegex = /\{\{([^}]+)\}\}/;
    const match = url.match(placeholderRegex);   
    
    // If the URL does not contain any placeholder
    const queryIndex = url.indexOf('?');

    if (queryIndex !== -1) {
            url = url.substring(0, queryIndex);
    }

    const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;


    if (urlRegex.test(url)) {
        try {

           // const { host, pathname } = new URL(url);

            const segments = url.split('/');
            const host = segments.slice(0, 3).join('/');
            const endpoint = segments.slice(3).join('/');


            //const pathSegments = pathname.split('/').filter(segment => segment.trim() !== '');
            //var endpoint = pathSegments.slice(0).join('/');
            
            return { host: decodeURIComponent(host), endpoint:decodeURIComponent(endpoint) };
        } catch (error) {
            console.log('Invalid URL from catch:', url);
            return null;
        }
    } else {
        console.log('Invalid URL from else:', url);
        return null;
    }
    
}
