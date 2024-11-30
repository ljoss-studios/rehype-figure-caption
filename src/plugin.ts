// src/plugin.ts

import { Plugin } from "unified";
import { visitParents } from "unist-util-visit-parents";
import { Element, Root, Parent, RootContent } from "hast";

/**
 * Interface representing the options that can be passed to the plugin.
 */
interface PluginOptions {
  /**
   * Class name to add to the `<figure>` elements.
   */
  figureClassName?: string;

  /**
   * Class name to add to the `<img>` elements.
   */
  imageClassName?: string;

  /**
   * Class name to add to the `<figcaption>` elements.
   */
  captionClassName?: string;

  /**
   * If set to `true`, images without alt text will be wrapped in `<figure>` elements.
   * Defaults to `false`.
   */
  allowEmptyCaption?: boolean;
}

/**
 * A unified plugin to transform `<img>` elements into `<figure>` elements with optional `<figcaption>`.
 *
 * This plugin processes the HTML syntax tree (HAST) and looks for `<img>` elements.
 * If an `<img>` element has an alt text (or `allowEmptyCaption` is true), it wraps the image in a `<figure>` element
 * and adds a `<figcaption>` element containing the alt text (if it exists).
 * It also supports adding custom class names to the `<figure>`, `<img>`, and `<figcaption>` elements.
 *
 * @param options - Configuration options for the plugin.
 * @returns A transformer function that processes the HAST.
 */
const transformImagesPlugin: Plugin<[PluginOptions?], Root> = (
  options = {}
) => {
  // Destructure options with default values
  const {
    figureClassName,
    imageClassName,
    captionClassName,
    allowEmptyCaption = false,
  } = options;

  /**
   * Transformer function that modifies the syntax tree.
   *
   * @param tree - The root of the HAST.
   */
  return (tree) => {
    // Visit all 'element' nodes and access their ancestors
    visitParents(tree, "element", (node, ancestors) => {
      // Only process <img> elements
      if (node.tagName !== "img") return;

      // Check if the image is inside a link (<a>)
      for (let i = ancestors.length - 1; i >= 0; i--) {
        const ancestor = ancestors[i];
        if (ancestor.type === "element" && ancestor.tagName === "a") {
          // Skip processing this image if it's inside a link
          return;
        }
      }

      // Get the parent node and the index of the current node within the parent
      const parent = ancestors[ancestors.length - 1];
      const index = (parent as Parent).children.indexOf(node);

      if (index === -1) return;

      const imgNode = node as Element;
      const altText = (imgNode.properties?.alt as string) || "";

      if (!altText && !allowEmptyCaption) {
        // Do not process images without alt text if allowEmptyCaption is false
        return;
      }

      // Add image class name to the <img> element without duplicates
      if (imageClassName) {
        const classNames = imgNode.properties.className;
        let classList: Array<string | number>;

        if (Array.isArray(classNames)) {
          classList = classNames.filter(
            (item): item is string | number =>
              typeof item === "string" || typeof item === "number"
          );
        } else if (
          typeof classNames === "string" ||
          typeof classNames === "number"
        ) {
          classList = [classNames];
        } else {
          classList = [];
        }

        if (!classList.includes(imageClassName)) {
          classList.push(imageClassName);
        }

        imgNode.properties.className =
          classList.length > 0 ? classList : undefined;
      }

      // Create a <figcaption> element if altText exists
      const figcaptionNode: Element | null = altText
        ? {
            type: "element",
            tagName: "figcaption",
            properties: captionClassName ? { className: captionClassName } : {},
            children: [{ type: "text", value: altText }],
          }
        : null;

      // Create a <figure> element and include the <img> (and <figcaption> if it exists)
      const figureNode: Element = {
        type: "element",
        tagName: "figure",
        properties: figureClassName ? { className: figureClassName } : {},
        children: [imgNode],
      };

      // Append <figcaption> to <figure> if it exists
      if (figcaptionNode) {
        figureNode.children.push(figcaptionNode);
      }

      // Handle cases where the parent is a <p> element
      if (parent.type === "element" && parent.tagName === "p") {
        const parentElement = parent as Element;
        const grandparent = ancestors[ancestors.length - 2];
        if (!(grandparent && "children" in grandparent)) return;

        const parentIndex = (grandparent as Parent).children.indexOf(parent);
        if (parentIndex === -1) return;

        // Split the parent's children into content before and after the <img>
        const before = parentElement.children.slice(0, index);
        const after = parentElement.children.slice(index + 1);

        const newNodes: RootContent[] = [];

        // If there's content before the image, create a new <p> element for it
        if (before.length > 0) {
          newNodes.push({
            type: "element",
            tagName: "p",
            properties: {},
            children: before,
          } as Element);
        }

        // Add the <figure> node to the new nodes
        newNodes.push(figureNode);

        // If there's content after the image, create a new <p> element for it
        if (after.length > 0) {
          newNodes.push({
            type: "element",
            tagName: "p",
            properties: {},
            children: after,
          } as Element);
        }

        // Replace the original <p> element in the grandparent's children with the new nodes
        (grandparent as Parent).children.splice(parentIndex, 1, ...newNodes);
      } else {
        // Replace the <img> node with the <figure> node in its parent
        (parent as Parent).children.splice(index, 1, figureNode);
      }
    });
  };
};

export default transformImagesPlugin;
