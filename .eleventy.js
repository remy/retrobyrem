const { DateTime } = require('luxon');
const CleanCSS = require('clean-css');
const UglifyJS = require('uglify-js');
const htmlmin = require('html-minifier');
const markdownIt = require('markdown-it');

const markdown = markdownIt({
  html: true,
  breaks: true,
  linkify: true,
}).use(require('markdown-it-named-headings'));

module.exports = function (eleventyConfig) {
  eleventyConfig.addLayoutAlias('post', 'src/layouts/post.njk');

  // Date formatting (human readable)
  eleventyConfig.addFilter('readableDate', (dateObj) => {
    return DateTime.fromJSDate(dateObj).toFormat('LLLL dd, yyyy');
  });

  // Date formatting (machine readable)
  eleventyConfig.addFilter('machineDate', (dateObj) => {
    return DateTime.fromJSDate(dateObj).toFormat('yyyy-MM-dd');
  });

  eleventyConfig.addFilter('markdown', (s) => {
    if (typeof s !== 'string') return;
    return markdown.render(s);
  });
  eleventyConfig.addFilter('upper', (s) => s.toUpperCase());

  eleventyConfig.addFilter('getTitle', function (s) {
    const tags = this.ctx.tags;

    if (!tags[s]) {
      return 'glass lens';
    }

    return tags[s].short || tags[s].title;
  });

  eleventyConfig.addFilter('lower', (s) => s.toLowerCase());
  eleventyConfig.addFilter('dump', (s) => JSON.stringify(s, 0, 2));

  // Minify CSS
  eleventyConfig.addFilter('cssmin', function (code) {
    return new CleanCSS({}).minify(code).styles;
  });

  // Minify JS
  eleventyConfig.addFilter('jsmin', function (code) {
    let minified = UglifyJS.minify(code);
    if (minified.error) {
      console.log('UglifyJS error: ', minified.error);
      return code;
    }
    return minified.code;
  });

  eleventyConfig.addFilter('dmg_price', function (data) {
    const pricing = this.ctx.pricing;
    let price = pricing.unmodified;

    const tags = Object.keys(pricing);
    tags.forEach((tag) => {
      if (data[tag] && tag !== 'unmodified') {
        price += pricing[tag];
      }
    });

    const product = this.ctx.products[data.serial];

    if (product) {
      if (product.discount !== undefined) price -= product.discount;
    }

    return (price || 0).toFixed(2);
  });

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'GBP',

    // These options are needed to round to whole numbers if that's what you want.
    // minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
  });

  eleventyConfig.addFilter('to_price', function (data) {
    const maximumFractionDigits = parseInt(data, 10) == data ? 0 : 2;
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',

      // These options are needed to round to whole numbers if that's what you want.
      // minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
      maximumFractionDigits,
    }).format(data);
  });

  eleventyConfig.addFilter('price', function (data) {
    const pricing = this.ctx.pricing;
    let price = pricing.base;
    if (data.tags) data.tags.forEach((tag) => (price += pricing[tag]));

    if (data.discount) price -= data.discount;

    return (price || 0).toFixed(2);
  });

  eleventyConfig.addFilter('toFixed', function (data) {
    return parseInt(data, 10).toFixed(2);
  });

  // Minify HTML output
  // eleventyConfig.addTransform("htmlmin", function (content, outputPath) {
  //   if (outputPath.indexOf(".html") > -1) {
  //     let minified = htmlmin.minify(content, {
  //       useShortDoctype: true,
  //       removeComments: true,
  //       collapseWhitespace: true,
  //     });
  //     return minified;
  //   }
  //   return content;
  // });

  // eleventyConfig.addCollection("products", function (collection) {
  //   const res = collection.getFilteredByGlob(
  //     __dirname + "/src/_data/products/*.json"
  //   );
  //   console.log(__dirname + "/src/_data/products/*.json", res);
  //   return res;
  // });

  // only content in the latest `posts/` directory
  // eleventyConfig.addCollection('tags', function (collection) {
  //   const tags = new Set();
  //   const products = collection.items[0].data.products;
  //   for (const p of Object.values(products)) {
  //     if (p.tags) {
  //       p.tags.forEach((tag) => tags.add(tag));
  //     }
  //   }
  //   const res = Array.from(tags);
  //   return res;
  // });

  // Don't process folders with static assets e.g. images
  eleventyConfig.addPassthroughCopy('src/images/');
  eleventyConfig.addPassthroughCopy('src/js/');
  eleventyConfig.addPassthroughCopy('static/');

  let opts = {
    permalink: true,
    permalinkClass: 'direct-link',
    permalinkSymbol: '#',
  };

  return {
    templateFormats: ['md', 'njk', 'html'],
    markdownTemplateEngine: 'liquid',
    htmlTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    passthroughFileCopy: true,
    dir: {
      input: 'src',
      output: 'dist',
      includes: '_includes',
      data: '_data',
    },
  };
};
