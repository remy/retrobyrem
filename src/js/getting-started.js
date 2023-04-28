(() => {
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const $ = (s) => document.querySelector(s);

  const options = $("#getting-started");

  options.addEventListener("change", (event) => {
    document.body.dataset.filter = event.target.value;
  });
})();
