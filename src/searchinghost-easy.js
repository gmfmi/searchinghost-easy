const DEFAULT_SEARCHINGHOST_VERSION = '1.3.3';
const SEARCHINGHOST_URL_TEMPLATE = `https://cdn.jsdelivr.net/npm/searchinghost@{{version}}/dist/searchinghost.min.js`

export default class SearchinGhostEasy {

    constructor(args) {
        this.parseArgs(args);
        this.createIframeElement();
        this.initSearchEngine();
        this.addListeners();
    }
    
    parseArgs(args) {
        this.contentKey = args.contentApiKey;
        this.apiUrl = args.apiUrl || window.location.origin;
        this.searchEngineOptions = args.searchEngineOptions || {};
        this.version = args.version || DEFAULT_SEARCHINGHOST_VERSION;
    }

    createIframeElement() {
        this.iframeElement = document.createElement('iframe');
        this.iframeElement.setAttribute('id', 'searchinghost-easy');
        this.iframeElement.setAttribute('width', '100%');
        this.iframeElement.setAttribute('height', '100%');
        this.iframeElement.style = `visibility:hidden;border:none;position:fixed;z-index:10000;top:0;left:0;`;
        document.body.appendChild(this.iframeElement);

        this.iframeWindow = this.iframeElement.contentWindow;

        this.iframeDocument = this.iframeWindow.document;
        this.iframeDocument.open();
        this.iframeDocument.write(this.getHtmlTemplate());
        this.iframeDocument.close();
    }

    initSearchEngine() {
        let searchinghostOptions = {
            key: this.contentKey,
            url: this.apiUrl,
            inputId: 'sge-input',
            outputId: 'sge-results',
            outputChildsType: 'li'
        }

        const themeOptions = this.iframeWindow.searchinghostOptions;
        if (themeOptions) {
            // console.log("themeOptions:", themeOptions);
            searchinghostOptions = this.mergeConfigs(searchinghostOptions, themeOptions);
        }
        
        searchinghostOptions = this.mergeConfigs(searchinghostOptions, this.searchEngineOptions);
        const serializedOptions = this.serializeConfiguration(searchinghostOptions);
        // console.log("serializedOptions:", serializedOptions);

        // add SearchinGhost library
        const searchLibrary = document.createElement("script");
        const searchinGhostUrl = SEARCHINGHOST_URL_TEMPLATE.replace('{{version}}', this.version)
        searchLibrary.setAttribute('src', searchinGhostUrl);
        this.iframeDocument.body.appendChild(searchLibrary);

        // init the search engine
        const initScript = document.createElement("script");
        initScript.textContent = `new SearchinGhost(${serializedOptions});`;
        const _this = this;
        searchLibrary.onload = function() {
            _this.iframeDocument.body.appendChild(initScript);
        }
    }

    addListeners() {
        const openAnchors = document.querySelectorAll('a[href*="#searchinghost-easy"]');
        openAnchors.forEach((link) => {
            link.addEventListener('click', (ev) => {
                ev.preventDefault();
                this.openOverlay();
            });
        });

        const _this = this;
        function closeOnEscape(ev) {
            if (ev.key === "Escape" || ev.keyCode === 27) {
                _this.closeOverlay();
            }
        }
        document.addEventListener('keyup', closeOnEscape);
        this.iframeDocument.addEventListener('keyup', closeOnEscape);

        const closeButton = this.iframeDocument.getElementById('sge-close');
        if (closeButton) {
            closeButton.addEventListener('click', (ev) => {
                ev.preventDefault();
                this.closeOverlay();
            });
        }
    }

    openOverlay() {
        this.iframeElement.style.visibility = "visible";
        document.documentElement.style.overflow = 'hidden';
        this.iframeDocument.getElementById('sge-input').focus();
    }

    closeOverlay() {
        this.iframeElement.style.visibility = "hidden";
        document.documentElement.style.overflow = 'auto';
    }

    getHtmlTemplate() {
        return "{{HTML_TEMPLATE}}";
    }

    /**
     * Properties found in B will override orignal A values
     * @param {Document} a the original document
     * @param {Document} b the document to merge
     */
    mergeConfigs(a, b) {
        const result = Object.assign({}, a);
        for (let [key, value] of Object.entries(b)) {
            result[key] = value;
        }
        return result;
    }

    /**
     * Home-made configuration object serializer.
     * 
     * The `JSON.stringify()` do not work as it does not support
     * function, objects or undefined.
     * 
     * @param {Document} config configuration object to serialize
     * @return {string} the configuration as string
     */
    serializeConfiguration(config) {
        let c = "{"
        for (let [key, value] of Object.entries(config)) {
            switch (typeof value) {
                case "string":
                    c += `${key}:"${value}",`;
                    break;
                case "function":
                case "boolean":
                case "number":
                    c += `${key}:${value},`;
                    break;
                case "object":
                    c += `${key}:${this.serializeConfiguration(value)},`;
                    break;
                case "undefined":
                default:
                    // do nothing
                    break;
            }
        }
        c = c.slice(0, -1); // remove the last ","
        c += "}"
        return c;
    }
}
