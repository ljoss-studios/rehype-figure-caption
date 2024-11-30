# @ljoss/rehype-figure-caption

Transform your images into semantic and accessible `<figure>` elements with optional `<figcaption>` using this **Rehype** plugin. It handles images in both Markdown and raw HTML, enhancing your content's structure and presentation.

---

## Installation

Install the plugin and its required dependencies:

### Using npm:

```bash
npm install @ljoss/rehype-figure-caption unified remark-parse remark-rehype rehype-raw rehype-stringify unist-util-visit-parents
```

### Using Yarn:

```bash
yarn add @ljoss/rehype-figure-caption unified remark-parse remark-rehype rehype-raw rehype-stringify unist-util-visit-parents
```

**Note**: This plugin operates at the **Rehype** (HTML) level and depends on the following packages:

- `unified`: Core of the Unified framework.
- `remark-parse`: Parses Markdown to MDAST (Markdown Abstract Syntax Tree).
- `remark-rehype`: Converts MDAST to HAST (HTML Abstract Syntax Tree).
- `rehype-raw`: Parses raw HTML within Markdown (needed if you have raw HTML).
- `rehype-stringify`: Serializes HAST to HTML.
- `unist-util-visit-parents`: Utility for traversing the syntax tree with access to parent nodes.

---

## Usage

Integrate the plugin into your Unified processing pipeline.

### Example: Converting Markdown to HTML

```javascript
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw'; // Needed if processing raw HTML
import rehypeStringify from 'rehype-stringify';
import rehypeFigureCaption from '@ljoss/rehype-figure-caption';

const processor = unified()
  .use(remarkParse) // Parses Markdown to MDAST
  .use(remarkRehype, { allowDangerousHtml: true }) // Converts MDAST to HAST, allows raw HTML
  .use(rehypeRaw) // Parses raw HTML in Markdown to HAST
  .use(rehypeFigureCaption, {
    figureClassName: 'custom-figure',
    imageClassName: 'custom-image',
    captionClassName: 'custom-caption',
    allowEmptyCaption: true, // Wraps images without alt text
  })
  .use(rehypeStringify); // Converts HAST to HTML

const markdown = `
![Alt Text](path-to-image.jpg)

<img src="path-to-image.jpg" alt="Alt Text" class="test">

![](path-to-image.jpg)

Some text before ![Image in text](image-in-text.jpg) some text after.

<p>Some text and <img src="inline-image.jpg" alt="Inline Image"> more text.</p>
`;

processor.process(markdown).then((file) => {
  console.log(String(file));
});
```

#### Expected Output

```html
<figure class="custom-figure">
  <img src="path-to-image.jpg" alt="Alt Text" class="custom-image">
  <figcaption class="custom-caption">Alt Text</figcaption>
</figure>

<figure>
  <img src="path-to-image.jpg" alt="Alt Text" class="test">
  <figcaption>Alt Text</figcaption>
</figure>

<figure>
  <img src="path-to-image.jpg" alt="">
</figure>

<p>Some text before </p>
<figure>
  <img src="image-in-text.jpg" alt="Image in text">
  <figcaption>Image in text</figcaption>
</figure>
<p> some text after.</p>

<p>Some text and </p>
<figure>
  <img src="inline-image.jpg" alt="Inline Image">
  <figcaption>Inline Image</figcaption>
</figure>
<p> more text.</p>
```

### Simplified Usage Without Raw HTML

If your Markdown content does not contain raw HTML, you can omit `rehype-raw` and the `allowDangerousHtml` option:

```javascript
const processor = unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeFigureCaption)
  .use(rehypeStringify);
```

---

## Options

Customize the plugin's behavior using the following options:

| Option              | Type      | Description                                                                   | Default     |
| ------------------- | --------- | ----------------------------------------------------------------------------- | ----------- |
| `figureClassName`   | `string`  | CSS class to add to `<figure>` elements                                       | `undefined` |
| `imageClassName`    | `string`  | CSS class to add to `<img>` elements                                          | `undefined` |
| `captionClassName`  | `string`  | CSS class to add to `<figcaption>` elements                                   | `undefined` |
| `allowEmptyCaption` | `boolean` | If `true`, wraps images without alt text in `<figure>` without `<figcaption>` | `false`     |

---

## Processing Flow

The plugin processes your content through the following steps:

1. **Traverse the Syntax Tree**: The plugin visits each node in the HTML syntax tree (HAST), specifically looking for `<img>` elements.

2. **Skip Images Inside Links**: If an image is inside an `<a>` tag, it is skipped to avoid breaking the link structure.

3. **Check Alt Text**: The plugin checks the `alt` attribute of the image.

   - If `alt` text exists, or `allowEmptyCaption` is `true`, it proceeds.
   - Otherwise, the image is left unaltered.

4. **Add Class Names**: If provided in the options, class names are added to the `<img>`, `<figure>`, and `<figcaption>` elements.

5. **Create `<figure>` and `<figcaption>` Elements**:

   - A `<figure>` element is created to wrap the image.
   - If `alt` text exists, a `<figcaption>` element is created with the `alt` text as its content.

6. **Replace or Restructure Nodes**:

   - **If the parent is a `<p>` element**:
     - **With only the `<img>`**: The `<p>` is replaced with the `<figure>`.
     - **With additional content**: The `<p>` is split into separate nodes before and after the `<img>`.
       - Content before the image remains in a `<p>`.
       - The `<figure>` is inserted after.
       - Content after the image is placed in a new `<p>`.

   - **If the parent is not a `<p>` element**:
     - The `<img>` is replaced with the `<figure>`.

7. **Result**: The syntax tree is updated, and when stringified, produces HTML with images wrapped in `<figure>` elements and captions added where appropriate.

---

## Contributing

We welcome contributions!

### Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/Ljoss-Studios/rehype-figure-caption.git
   ```

2. **Navigate to the project directory**

   ```bash
   cd rehype-figure-caption
   ```

3. **Install dependencies**

   Using npm:

   ```bash
   npm install
   ```

   Using Yarn:

   ```bash
   yarn install
   ```

4. **Run tests**

   Using npm:

   ```bash
   npm test
   ```

   Using Yarn:

   ```bash
   yarn test
   ```

5. **Start development server (if applicable)**

   If the project has a development server or watch mode:

   ```bash
   npm run dev
   ```

   Or with Yarn:

   ```bash
   yarn dev
   ```

### Submitting Changes

- **Fork the repository** and create a new branch.
- **Write tests** to cover your changes.
- **Ensure all tests pass** before submitting.
- **Submit a pull request** detailing your changes.

---

## License

This project is licensed under the [MIT License](./LICENSE).

---

**Thank you for your interest and contributions!**

---

**Important Notes**

- **Dependency on Rehype**: This plugin operates at the **Rehype** level, manipulating the HTML syntax tree (HAST). It requires `remark-rehype` to convert Markdown to HTML and `rehype-raw` to parse any raw HTML within your Markdown content.

- **Processing Pipeline**: Ensure your processing pipeline includes the necessary steps:

  1. **Parse Markdown to MDAST**: Using `remark-parse`.
  2. **Convert MDAST to HAST**: Using `remark-rehype`.
     - Set `allowDangerousHtml: true` if processing raw HTML.
  3. **Parse Raw HTML to HAST Nodes**: Using `rehype-raw` (if needed).
  4. **Apply `rehype-figure-caption` Plugin**: To transform images.
  5. **Stringify HAST to HTML**: Using `rehype-stringify`.

- **Raw HTML Support**: Include `rehype-raw` in your pipeline to process raw HTML `<img>` elements embedded in your Markdown.

---

### Frequently Asked Questions

#### **Q1: Can I use this plugin with Remark directly?**

**A**: No, this plugin is designed to work with **Rehype**, not Remark. It manipulates the HTML AST (HAST), which is available after converting Markdown to HTML using `remark-rehype`.

#### **Q2: What if I only have Markdown images and no raw HTML?**

**A**: Even if your content only contains Markdown images, you can still use this plugin. Just ensure your pipeline includes `remark-rehype` to convert the Markdown to HTML before applying the plugin.

#### **Q3: Do I need to set `allowDangerousHtml: true` if I don't have raw HTML in my Markdown?**

**A**: No, if your Markdown does not contain raw HTML, you can omit the `allowDangerousHtml: true` option and the `rehype-raw` plugin.

---

### Acknowledgments

We thank all contributors and users who have provided feedback and suggestions to improve this plugin.

---

For any questions or suggestions, feel free to open an issue on the [GitHub repository](https://github.com/Ljoss-Studios/rehype-figure-caption) or contact us directly.
