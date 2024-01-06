<script>
  import { fetchAllBaostagramUrls } from "$lib/api";
  import { onMount } from "svelte";

  /** @type {import('./$types').PageData} */
  export let data;

  /** @type {string[]} */
  let imgs = [];
  /** @type {string[]} */
  let blobUrls = [];

  onMount(async () => {
    /** @type {number | string}*/
    let width = window.innerWidth;
    /** @type {number | string}*/
    let height = "auto"
    if (width > 768) {
      height = window.innerHeight - 200;
      width = "auto";
    }
    console.log(height, width)
    const resizePrefix = `https://baos.haus/cdn-cgi/image/width=${width},height=${height},quality=100,fit=contain`;
    const r2Preix = "https://r2.baos.haus";
    const imgObjects = await fetchAllBaostagramUrls();
    console.log(imgObjects);
    // @ts-ignore
    const keys = imgObjects.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()).map((o) => o.key);
    // @ts-ignore
    imgs = keys.map((key) => `${resizePrefix}/${r2Preix}/${key}`);

    // blobUrls = await Promise.all(
    //   imgUrls.map(async (url) => {
    //     const response = await fetch(url);
    //     const blob = await response.blob();
    //     return URL.createObjectURL(blob);
    //   })
    // );
  });
</script>

<div class="flex flex-col items-center gap-4">
  <h1>BAOSTAGRAM</h1>
  {#each imgs as url}
    <img loading="lazy" class="max-w-3xl my-8 w-11/12" src={url} alt="chicken" />
  {/each}
</div>

<style>
  h1 {
    @apply text-5xl font-bold text-purple-300 bg-green-300 py-1 px-4 rounded-md;
  }
  img {
    min-height: 400px;
    max-width: 60vh;
    padding: 40px;
    background: radial-gradient(#2a00ff, #d2d3ff63);
  }
</style>
