<script>
  import { fetchAllBaostagramUrls } from "$lib/api";
  import { onMount } from "svelte";

  /** @type {string[]} */
  let imgs = [];
  /** @type {string[]} */
  let blobUrls = [];

  const resizePrefix = `https://baos.haus/cdn-cgi/image/width=${window.innerWidth - 50},height=auto,quality=100,fit=contain`;
  const r2Preix = "https://r2.baos.haus";
  onMount(async () => {
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

<style type="postcss">
  h1 {
    @apply text-5xl font-bold text-black bg-white py-1 px-4 rounded-md;
  }
  img {
    min-height: 400px;
  }
</style>
