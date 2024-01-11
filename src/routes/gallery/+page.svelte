<script>
  import BaoHead from "$components/BaoHead.svelte";

  /** @type {any[]} */
  const imgs = [];
  for (let i = 0; i <= 25; i++) {
    const o = { src: `/chickems/${i}-image.png`, name: `Chicken ${i}`, date: "November 2023" };
    imgs.push(o);
  }

  /** @param {*} node */
  export function lazyLoad(node) {
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          // @ts-ignore
          img.src = img.dataset.src;
          observer.unobserve(img);
        }
      });
    });

    observer.observe(node);

    return {
      destroy() {
        observer.unobserve(node);
      }
    };
  }
</script>

<BaoHead />
<div class="page-container">
  <h1>My chickens</h1>
  <p class="desc">enjoy my various chicken masterpieces</p>
  <section class="grid--masonry">
    {#each imgs as img}
    <div class="grid-item">
      <img use:lazyLoad data-src={img.src} alt="chicken" />
      <h3>{img.name}</h3>
      <h4>{img.date}</h4>
    </div>
  {/each}
  </section>
</div>

<style type="postcss">
  .page-container {
    margin-top: 70px;
  }
  h1 {
    color: black;
    font-weight: bold;
    max-width: 500px;
    margin-top: .75rem;
    margin-left: 6px;
    font-size: 3rem;
  }
  .desc {
    color: black;
    font-weight:bold;
    font-size:2rem;
    line-height: 2.2rem;
    margin-bottom: 2rem;
  }
  h3 {
    font-size: 2rem;
  }
  .grid--masonry {
    display: grid;
    width: 100%;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    justify-content: center;
    grid-gap: 4.5rem;
    padding: 0.5rem;
  }
  .grid-item {
    color: black;
    font-weight: bold;;
  }
</style>
