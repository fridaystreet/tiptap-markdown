import { Strong } from "mdast";
import type { Bold } from "@tiptap/extension-bold";
import remarkRehype from "remark-rehype";
import remarkStringify from "remark-stringify";
import rehypeRemark from "rehype-remark";
import { defaultHandlers as remarkRehypeDefaultHandlers } from "mdast-util-to-hast";
import { defaultHandlers as remarkStringifyDefaultHandlers } from "mdast-util-to-markdown";
import { defaultHandlers as rehypeRemarkDefaultHandlers } from "hast-util-to-mdast";
import { MarkMixin } from "../load-mixins/types";
import { remarkMarker } from "../../remark-plugins/remark-marker-plugin";
import { withStateOptions } from "../../util/state";


export const bold: MarkMixin<typeof Bold> = (Bold) => (
    Bold.extend({
        addAttributes() {
            return {
                ...this.parent?.(),
                'data-markdown-marker': {
                    default: '*'
                },
            }
        },
        parseMarkdown({ fromMarkdown, toHTML }) {
            fromMarkdown.use(remarkMarker);
            toHTML.use(remarkRehype, {
                handlers: {
                    strong: (state, node: Strong) => {
                        const element = remarkRehypeDefaultHandlers.strong(state, node);
                        element.properties.dataMarkdownMarker = node.data!.marker;
                        return element;
                    }
                }
            });
        },
        renderMarkdown({ toMarkdown }) {
            toMarkdown
                .use(rehypeRemark, {
                    handlers: {
                        strong(state, element) {
                            const node = rehypeRemarkDefaultHandlers.strong(state, element);
                            (node.data ??= {}).marker = element.properties.dataMarkdownMarker as any;
                            return node;
                        }
                    }
                })
                .use(remarkStringify, {
                    handlers: {
                        strong(node: Strong, parent, state, info) {
                            return withStateOptions(state, { strong: node.data!.marker }, (state) =>
                                remarkStringifyDefaultHandlers.strong(node, parent, state, info)
                            );
                        }
                    }
                });
        }
    })
);
