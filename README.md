[![](https://flat.badgen.net/github/release/gmfmi/searchinghost-easy)](https://github.com/gmfmi/searchinghost-easy/releases)
[![](https://data.jsdelivr.com/v1/package/gh/gmfmi/searchinghost-easy/badge)](https://www.jsdelivr.com/package/gh/gmfmi/searchinghost-easy)
[![](https://flat.badgen.net/github/license/gmfmi/searchinghost-easy)](https://github.com/gmfmi/searchinghost-easy/blob/master/LICENSE)


# SearchinGhostEasy

A Zero code & easy to setup search bar for Ghost CMS (blog).


## Description

SearchinGhostEasy is a wrapper around the original [SearchinGhost library](https://github.com/gmfmi/searchinGhost)
to make it accessible to any "non-developper" Ghost user.

Because we are not all born with design skills, we created various [search bar templates](#templates)
so you do not have worry about it. They all use a responsive design so they fit perfectly on
any screen size, from mobile phones to 4K TVs.

Finally, we put everything together in an HTML iframe to get a super smooth user experience!


## Installation

1. First, create a "custom integration". On the left side, go to the "integration" section, click on "Add custom integration" and give it the name "SearchinGhostEasy".
Now, copy the "Content API Key", we will need it for the next step.
If you need more help, visit the official [Ghost custom integration](https://ghost.org/integrations/custom-integrations/) page.

![Installation step1](screenshots/installation/step1.png)

2. Then, from the "Code Injection" section, copy/paste the following code chunk into the "Site Footer" area (the one from the screenshot is probably outdated). DO NOT FORGET to replace the `<CONTENT_API_KEY>` placeholder with your own API key. Click on "save".  
*note: various search box templates are available, see the [templates section](#templates) below.*

```html
<script src="https://cdn.jsdelivr.net/gh/gmfmi/searchinghost-easy@0.1.2/dist/searchinghost-easy-basic.js"></script>
<script>
    new SearchinGhostEasy({
        contentApiKey: '<CONTENT_API_KEY>'
    });
</script>
```

![Installation step2](screenshots/installation/step2.png)

3. Finally, add a link in the menu that open the search box. To do so, go to the "Design" section and add a new item. It can be in the "navigation" or "secondary navigation". You can name it with any label (but "Search" feels natural) but the link **must** ends with `#searchinghost-easy`. Click on "save".

![Installation step3](screenshots/installation/step3.png)


This is it, everything is setup! On you blog, a "search" button should shows up in the menu. Click it to see the magic happens! 😃


## Templates

SearchinGhostEasy comes in various graphical flavors. The template provided by default is called "Basic" but you
can easily switch to any other one.

To do so, refer to each template description and copy/paste the associated code chunk into your blog
`Code Injection > Site Footer` section. Basically, only the last part of the script name changes
(e.g. "searchinghost-easy-basic.js", "searchinghost-easy-backpack.js", ...).

---

### ✏️ Basic template

#### Screenshot

![Basic template screenshot](screenshots/basic.png)

#### Demo

Live demo: https://gmfmi.github.io/searchinghost-easy/basic/


#### Installation

```html
<script src="https://cdn.jsdelivr.net/gh/gmfmi/searchinghost-easy@0.1.2/dist/searchinghost-easy-basic.js"></script>
<script>
    new SearchinGhostEasy({
        contentApiKey: '<CONTENT_API_KEY>'
    });
</script>
```

---

### ✏️ Backpack template

#### Screenshot

![Backpack template screenshot](screenshots/backpack.png)

#### Demo

Live demo: https://gmfmi.github.io/searchinghost-easy/backpack/


#### Installation

```html
<script src="https://cdn.jsdelivr.net/gh/gmfmi/searchinghost-easy@0.1.2/dist/searchinghost-easy-backpack.js"></script>
<script>
    new SearchinGhostEasy({
        contentApiKey: '<CONTENT_API_KEY>'
    });
</script>
```


## Configuration

The default configuration parameters are carefully chosen so most of users only need to set the `contentApiKey`.
For more advanced scenarios, here are the available options:

```js
new SearchinGhostEasy({
    contentApiKey: '<CONTENT_API_KEY>', // mandatory
    apiUrl: 'http://example.com',
    searchinghostOptions: {},
    searchinghostVersion: '1.3.3',
    debug: false
});
```

- **contentApiKey** (string, mandatory)
> The content API key. This value is mandatory and can be found in the custom integration details.
>
> example: `'06a02026a9f2dcf69f7e065d7c'`

- **apiUrl** (string)
> Set an API url different from the blog domain name. Can be useful for testing purpose.
> This options corresponds to `url` in the SearchinGhost library.
>
> example: `'http://example.com'`

- **searchinghostOptions** (object)
> Override SearchinGhost default configuration. This configuration will be merged with the
> ones provided by SearchinGhostEasy itself and the selected search template.
>
> To see all the available options, refer to the [SearchinGhost documentation](https://github.com/gmfmi/searchinGhost#options).
>
> example:
> ```js
> {
>     searchOn: 'submit',
>     limit: 5,
>     cacheMaxAge: 3600,
> }
> ```

- **searchinghostVersion** (string)
> Set the SearchinGhost version to use. Can be useful if a newer version has just been released.
>
> example: `'1.3.0'`

- **debug** (boolean)
> Set it to `true` to enable the debug mode. This will output the final SearchinGhost configuration used
> and also enable debug for SearchinGhost.
>
> default: `false`


## Q&A

### Can I use a search icon instead of a word?

Yes, you can but you will need to customize your theme. Follow this [Ghost guide](https://ghost.org/docs/api/v3/handlebars-themes/helpers/navigation/) to modify the menu as needed.

Then, the only requirement to make SearchinGhostEasy works is to use `#searchinghost-easy` as value in the href of your link.

For example, your `partials/navigation.hbs` file could be:

```html
<ul class="nav" role="menu">
    {{#foreach navigation}}
    <li class="{{link_class for=(url) class=(concat "nav-" slug)}}" role="menuitem"><a href="{{url absolute="true"}}">{{label}}</a></li>
    {{/foreach}}
    <li class="search-icon" role="menuitem"><a href="#searchinghost-easy">{{> "icons/search"}}</a></li>
</ul>
```

with `partials/icons/search.hbs` containing:

```html
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512"><path d="M508.875,493.792L353.089,338.005c32.358-35.927,52.245-83.296,52.245-135.339C405.333,90.917,314.417,0,202.667,0 S0,90.917,0,202.667s90.917,202.667,202.667,202.667c52.043,0,99.411-19.887,135.339-52.245l155.786,155.786 c2.083,2.083,4.813,3.125,7.542,3.125c2.729,0,5.458-1.042,7.542-3.125C513.042,504.708,513.042,497.958,508.875,493.792z M202.667,384c-99.979,0-181.333-81.344-181.333-181.333S102.688,21.333,202.667,21.333S384,102.677,384,202.667 S302.646,384,202.667,384z"/></svg>
```