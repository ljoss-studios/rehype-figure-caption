// __tests__/plugin.test.ts
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import transformImagesPlugin from "../src/plugin.js";

describe("rehype-figure-caption plugin", () => {
  const createProcessor = (pluginOptions = {}, rehypeOptions = {}) => {
    return unified()
      .use(remarkParse)
      .use(remarkRehype, { allowDangerousHtml: true, ...rehypeOptions })
      .use(rehypeRaw)
      .use(transformImagesPlugin, pluginOptions)
      .use(rehypeStringify);
  };

  const processMarkdown = async (
    markdown: string,
    pluginOptions = {},
    rehypeOptions = {}
  ) => {
    const result = await createProcessor(pluginOptions, rehypeOptions).process(
      markdown
    );
    return result.toString().trim();
  };

  it("wraps an image with a figure element and custom class names", async () => {
    const markdown = "![Alt text](image.png)";
    const html = await processMarkdown(markdown, {
      figureClassName: "custom-figure",
      imageClassName: "custom-image",
      captionClassName: "custom-caption",
    });

    expect(html).toBe(
      `<figure class="custom-figure">` +
        `<img src="image.png" alt="Alt text" class="custom-image">` +
        `<figcaption class="custom-caption">Alt text</figcaption>` +
        `</figure>`
    );
  });

  it("supports raw HTML <img> elements and wraps them in a <figure>", async () => {
    const markdown = `<img src="image.png" alt="Alt text" class="test">`;
    const html = await processMarkdown(markdown);

    expect(html).toBe(
      `<figure>` +
        `<img src="image.png" alt="Alt text" class="test">` +
        `<figcaption>Alt text</figcaption>` +
        `</figure>`
    );
  });

  it("wraps an image with a figure element without class names", async () => {
    const markdown = "![Alt text](image.png)";
    const html = await processMarkdown(markdown);

    expect(html).toBe(
      `<figure>` +
        `<img src="image.png" alt="Alt text">` +
        `<figcaption>Alt text</figcaption>` +
        `</figure>`
    );
  });

  it("does not wrap images without alt text when allowEmptyCaption is false", async () => {
    const markdown = "![](image.png)";
    const html = await processMarkdown(markdown, { allowEmptyCaption: false });

    expect(html).toBe(`<p><img src="image.png" alt=""></p>`);
  });

  it("wraps images without alt text when allowEmptyCaption is true", async () => {
    const markdown = "![](image.png)";
    const html = await processMarkdown(markdown, { allowEmptyCaption: true });

    expect(html).toBe(`<figure><img src="image.png" alt=""></figure>`);
  });

  it("handles Markdown without images", async () => {
    const markdown = "# Heading\n\nSome text.";
    const html = await processMarkdown(markdown);

    expect(html).toBe(`<h1>Heading</h1>\n<p>Some text.</p>`);
  });

  // Additional Test Cases

  it("does not wrap images inside links", async () => {
    const markdown = `[![Alt text](image.png)](http://example.com)`;
    const html = await processMarkdown(markdown);

    expect(html).toBe(
      `<p><a href="http://example.com">` +
        `<img src="image.png" alt="Alt text">` +
        `</a></p>`
    );
  });

  it("processes multiple images in the content", async () => {
    const markdown = `
![Image One](image1.png)

Some text.

![Image Two](image2.png)
`;
    const html = await processMarkdown(markdown);

    expect(html).toBe(
      `<figure>` +
        `<img src="image1.png" alt="Image One">` +
        `<figcaption>Image One</figcaption>` +
        `</figure>` +
        `\n<p>Some text.</p>` +
        `\n<figure>` +
        `<img src="image2.png" alt="Image Two">` +
        `<figcaption>Image Two</figcaption>` +
        `</figure>`
    );
  });

  it("preserves existing classes on images and figures", async () => {
    const markdown = `<img src="image.png" alt="Alt text" class="existing-class">`;
    const html = await processMarkdown(markdown, {
      imageClassName: "new-image-class",
    });

    expect(html).toBe(
      `<figure>` +
        `<img src="image.png" alt="Alt text" class="existing-class new-image-class">` +
        `<figcaption>Alt text</figcaption>` +
        `</figure>`
    );
  });

  it("handles images with titles", async () => {
    const markdown = `![Alt text](image.png "Title text")`;
    const html = await processMarkdown(markdown);

    expect(html).toBe(
      `<figure>` +
        `<img src="image.png" alt="Alt text" title="Title text">` +
        `<figcaption>Alt text</figcaption>` +
        `</figure>`
    );
  });

  it("does not wrap non-image elements", async () => {
    const markdown = `<div>Not an image</div>`;
    const html = await processMarkdown(markdown);

    expect(html).toBe(`<div>Not an image</div>`);
  });

  it("handles images with nested elements (edge case)", async () => {
    const markdown = `<p><img src="image.png" alt="Alt text"><span>Caption</span></p>`;
    const html = await processMarkdown(markdown);

    expect(html).toBe(
      `<figure>` +
        `<img src="image.png" alt="Alt text">` +
        `<figcaption>Alt text</figcaption>` +
        `</figure>` +
        `<p><span>Caption</span></p>`
    );
  });
});
