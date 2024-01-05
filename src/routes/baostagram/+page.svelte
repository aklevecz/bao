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
    const imgObjects = await fetchAllBaostagramUrls();
    console.log(imgObjects)
    // @ts-ignore
    imgs = imgObjects.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()).map((o) => o.url);
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
      <img class="max-w-3xl w-11/12" src={url} alt="chicken" />
    {/each}
</div>

<style>
    h1 {
        @apply text-5xl font-bold text-black;
    }
</style>
