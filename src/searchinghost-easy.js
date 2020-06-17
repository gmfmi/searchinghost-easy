const DEFAULT_SEARCHINGHOST_VERSION = '1.3.3';
const SEARCHINGHOST_URL_TEMPLATE = `https://cdn.jsdelivr.net/npm/searchinghost@{{version}}/dist/searchinghost.min.js`;

export default class SearchinGhostEasy {

    constructor(args) {
        this.isOpen = false;

        this.parseArgs(args);
        this.createIframeElement();
        this.initSearchEngine();
        this.addListeners();
    }
    
    parseArgs(args) {
        this.contentKey = args.contentApiKey;
        this.apiUrl = args.apiUrl || window.location.origin;
        this.searchinghostOptions = args.searchinghostOptions || {};
        this.searchinghostVersion = args.searchinghostVersion || DEFAULT_SEARCHINGHOST_VERSION;
        this.zIndex = args.zIndex || 2147483647; // max int-32 value, used by most browsers
        this.debug = args.debug || false;
    }

    createIframeElement() {
        this.iframeElement = document.createElement('iframe');
        this.iframeElement.setAttribute('id', 'searchinghost-easy');
        this.iframeElement.setAttribute('width', '100%');
        this.iframeElement.setAttribute('height', '100%');
        // we use 'visibility' instead of 'display' to get a better CSS transition support
        this.iframeElement.style = `visibility:hidden;border:none;position:fixed;z-index:${this.zIndex};top:0;left:0;`;
        document.body.appendChild(this.iframeElement);
        
        this.iframeWindow = this.iframeElement.contentWindow;
        
        this.iframeDocument = this.iframeWindow.document;
        this.iframeDocument.open();
        this.iframeDocument.write(this.getHtmlTemplate());
        this.iframeDocument.close();

        // Open any iframe's link from its parent space
        const base = document.createElement("base");
        base.setAttribute('target', '_parent');
        this.iframeDocument.head.appendChild(base);
        
        // Get variables from the theme itself
        this.themeOptions = this.iframeWindow.searchinghostOptions;
        this.themeCloseDelay = this.iframeWindow.closeDelay;

        // Get theme elements
        this.themeCloseButton = this.iframeDocument.getElementById('sge-close');
        this.themeContainer = this.iframeDocument.getElementById("sge-container");
        this.themeInput = this.iframeDocument.getElementById('sge-input');
    }

    initSearchEngine() {
        const searchinghostOptions = {
            key: this.contentKey,
            url: this.apiUrl,
            inputId: 'sge-input',
            outputId: 'sge-results',
            outputChildsType: 'li'
        }

        if (this.themeOptions) {
            this.mergeConfigs(searchinghostOptions, this.themeOptions);
        }
        
        this.mergeConfigs(searchinghostOptions, this.searchinghostOptions);

        if (this.debug) {
            searchinghostOptions.debug = true;
            searchinghostOptions.cacheMaxAge = 0;
            console.info("[debug] SearchinGhost configuration:", searchinghostOptions);
        }
        
        // add SearchinGhost library
        const searchLibrary = document.createElement("script");
        const searchinGhostUrl = SEARCHINGHOST_URL_TEMPLATE.replace('{{version}}', this.searchinghostVersion)
        searchLibrary.setAttribute('src', searchinGhostUrl);
        this.iframeDocument.body.appendChild(searchLibrary);

        // init the search engine
        const initScript = document.createElement("script");
        const serializedOptions = this.serializeConfiguration(searchinghostOptions);
        initScript.textContent = `new SearchinGhost(${serializedOptions});`;
        searchLibrary.onload = () => this.iframeDocument.body.appendChild(initScript);
    }

    addListeners() {
        const openAnchors = document.querySelectorAll('a[href*="#searchinghost-easy"]');
        openAnchors.forEach((link) => {
            link.addEventListener('click', (ev) => {
                ev.preventDefault();
                this.clickedAnchor = link;
                this.openOverlay();
            });
        });

        this.iframeDocument.addEventListener('keyup', (ev) => {
            if (ev.key === "Escape" || ev.keyCode === 27) {
                this.closeOverlay();
            }
        });

        if (this.themeCloseButton) {
            this.themeCloseButton.addEventListener('click', (ev) => {
                ev.preventDefault();
                this.closeOverlay();
            });
        }
    }

    openOverlay() {
        this.iframeElement.style.visibility = "visible";
        document.documentElement.style.overflow = 'hidden';
        this.themeContainer.classList.add("is-active");
        this.themeInput.focus();
        this.isOpen = true;
    }

    closeOverlay() {
        if (this.isOpen) {
            this.clickedAnchor.focus({preventScroll:true});
            this.themeContainer.classList.remove("is-active");
            setTimeout(() => {
                this.iframeElement.style.visibility = "hidden";
                document.documentElement.style.overflow = 'auto';
                this.clickedAnchor = undefined;
                this.isOpen = false;
            }, this.themeCloseDelay || 0);
        }
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
        for (let [key, value] of Object.entries(b)) {
            a[key] = value;
        }
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
                    if (Array.isArray(value)) {
                        c += `${key}:${JSON.stringify(value)},`;
                    } else {
                        c += `${key}:${this.serializeConfiguration(value)},`;
                    }
                    break;
                case "undefined":
                default:
                    // do nothing
                    break;
            }
        }
        c = c.slice(0, -1); // remove the last ","
        c += "}"
        if (this.debug) console.info("[debug] serialized configuration:", c);
        return c;
    }
}
