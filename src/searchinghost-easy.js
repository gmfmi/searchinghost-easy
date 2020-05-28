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
        this.iframeElement.setAttribute('width', "100%");
        this.iframeElement.setAttribute('height', "100%");
        this.iframeElement.style = `visibility:hidden;border:none;position:fixed;z-index:10000;top:0;left:0;`;
        document.body.appendChild(this.iframeElement);

        this.iframeDom = this.iframeElement.contentWindow.document;
        this.iframeDom.open();
        this.iframeDom.write(this.getHtmlTemplate());
        this.iframeDom.close();
    }

    initSearchEngine() {
        const ghostOptions = {
            key: this.contentKey,
            url: this.apiUrl,
            inputId: 'sg-easy-input',
            outputId: 'sg-easy-results',
            outputChildsType: 'li'
        }

        const options = this.mergeConfigs(ghostOptions, this.searchEngineOptions);
        // TODO: issue when serializing function, which are not JSON...
        // console.log("OPTIONS:", options);
        // console.log("OPTIONS JSON:", JSON.stringify(options));

        // add SearchinGhost library
        const searchLibrary = document.createElement("script");
        const searchinGhostUrl = SEARCHINGHOST_URL_TEMPLATE.replace('{{version}}', this.version)
        searchLibrary.setAttribute('src', searchinGhostUrl);
        this.iframeDom.body.appendChild(searchLibrary);

        // init the search engine
        const initScript = document.createElement("script");
        initScript.textContent = `new SearchinGhost(${JSON.stringify(options)});`;
        const _this = this;
        searchLibrary.onload = function() {
            _this.iframeDom.body.appendChild(initScript);
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
        this.iframeDom.addEventListener('keyup', closeOnEscape);

        const closeButton = this.iframeDom.getElementById('sg-easy-close');
        closeButton.addEventListener('click', (ev) => {
            ev.preventDefault();
            this.closeOverlay();
        });
    }

    openOverlay() {
        this.iframeElement.style.visibility = "visible";
        document.documentElement.style.overflow = 'hidden';
        this.iframeDom.getElementById('sg-easy-input').focus();
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
}
