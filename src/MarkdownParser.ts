import { Content, Editor } from "@tiptap/core";
import { unified } from "unified";
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkBreaks from 'remark-breaks';
import rehypeStringify from 'rehype-stringify';
import rehypeRaw from 'rehype-raw';
import rehypeMinifyWhitespace from 'rehype-minify-whitespace';
import { remarkGfm } from "./remark-plugins/remark-gfm";
import { defaultHandlers as remarkRehypeDefaultHandlers } from "mdast-util-to-hast";

type ParserOptions = {
    html: boolean,
    linkify: boolean,
    breaks: boolean,
}

export class MarkdownParser {
    editor: Editor;
    options: ParserOptions;

    constructor(editor: Editor, options: ParserOptions) {
        this.editor = editor;
        this.options = options;
    }

    parse(content: Content): Content {
        if(typeof content === 'string') {
            const remark = unified();

            this.editor.extensionManager.extensions.forEach(extension => {
                extension.config.fromMarkdown?.({
                    remark,
                    remarkRehype,
                    remarkRehypeDefaultHandlers,
                });
            });

            remark.use(remarkParse)
                .use(remarkGfm, { autolink: this.options.linkify })
                .use(this.options.breaks ? [remarkBreaks] : [])
                .use(remarkRehype, { allowDangerousHtml: true })
                .use(this.options.html ? [rehypeRaw] : [])
                .use(rehypeMinifyWhitespace)
                .use(rehypeStringify);

            const parsed = String(remark.processSync(content));
            return parsed;
        }

        return content;
    }
}
