importScripts("highlight.min.js");
importScripts("common-tags.min.js");

self.onmessage = function (event) {
    if (event.data.run === 'highlight') {
        highlight(event.data.transfer.language, event.data.transfer.source, event.data.transfer.options);
    }
}

/**
 * Create lines from given source code
 * @param source The source code
 * @returns {string} The amount of lines from source
 */
function createLines(source) {
    let formattedLines = "";

    for (let i = 1; i <= source.split(/\r\n|\r|\n/).length; i++) {
        formattedLines += (i === 1 ? "" : "\n") + i;
    }

    return formattedLines;
}

/**
 * Replace hljs classes with proper inline styling with user given colors
 * @param CSS The given user styles
 * @param formatted The hljs code to reformat
 * @returns {string} The formatted source code
 */
function inlineCss(CSS, formatted) {
    for (const [cssClass, cssStyle] of CSS) {
        const regex = new RegExp(`class="${cssClass}"`, 'gm');
        let inline = `style="`;

        cssStyle.forEach(style => {
            inline += `${style.name}:${style.style};`;
        });

        formatted = formatted.replace(regex, `${inline}"`);
    }

    // Remove un-styled or empty span tags
    formatted = formatted.replace(/ class="hljs-\w+"/gm, "");
    formatted = formatted.replace(/<span><\/span>/gm, "");

    // Return cleaned and inlined css
    return formatted;
}

/**
 * Options
 * BOX_OUTLINE
 * COLOR_BACKGROUND
 * COLOR_BOX_OUTLINE
 * COLOR_FONT
 * COLOR_LEFT_BORDER
 * CSS
 * FONT_SIZE
 * LEFT_BORDER
 * LINE_NUMBERS
 * hljs
 */

/**
 * Highlights code
 * @param language Chosen language
 * @param source Source code
 * @param options User defined options
 */

function highlight(language, source, options) {
    let border = `border-width:.1em .1em .1em .${options.LEFT_BORDER ? '8' : '1'}em; border-color: ${options.COLOR_BOX_OUTLINE} ${options.COLOR_BOX_OUTLINE} ${options.COLOR_BOX_OUTLINE} ${options.COLOR_LEFT_BORDER}`;
    let boilerplate = commonTags.stripIndents`
        <div style="font-size: ${options.FONT_SIZE}px; color: ${options.COLOR_FONT}; background: ${options.COLOR_BACKGROUND}; overflow:auto; width:auto; border:${options.BOX_OUTLINE ? `solid` : 'none'}; ${border}; padding:.2em .1em;">
            <table>
                <tr>
                ${options.LINE_NUMBERS ? commonTags.stripIndents`
                    <td style="text-align:right; padding-right:.5em;">
                        <pre style="margin: 0; line-height: 125%">
                            CREATE_LINES
                        </pre>
                    </td>                        
                ` : ''}
                    <td>
                        <pre style="margin: 0; line-height: 125%;">
                            INLINE_CSS
                        </pre>
                    </td>
                </tr>
            </table>
        </div>
    `;

    self.postMessage({run: 'highlight', out: boilerplate
            .replace(/CREATE_LINES/, createLines(source))
            .replace(/INLINE_CSS/, inlineCss(options.CSS, hljs.highlight(language, source + " ").value))});
}
