<script>
  import { page } from "$app/stores";
  import baovico from "$lib/assets/baovico.png";
  import { chat, isLoaded } from "$stores/chat";
  import { user } from "$stores/user";
  import { Liquid } from "sveders";
  import { onDestroy, onMount } from "svelte";
  import "../app.css";

  export let data;
  let height = 0;
  const resize = () => (height = typeof window !== "undefined" ? window.innerHeight : 0);

  onMount(async () => {
    user.remember({ userData: data.user, chats: data.chats });
    resize();
    window.addEventListener("resize", resize);
    if (data.user.authed) {
      await user.updateChickenTokens();
    }
    chat.init(data.chats);
    isLoaded.set(true);
    document.getElementById("baos")?.remove();
  });

  onDestroy(() => {
    if (typeof window !== "undefined") window.removeEventListener("resize", resize);
  });
</script>

<svelte:head>
  <link rel="icon" type="image/svg" href={$page.url.origin + '/baovico.png'} />
  <meta property="og:image" content={$page.url.origin + "/SUMMARY_CARD.png"} />
</svelte:head>
<div style={`height:${height || 500}px`} class="app_container flex flex-col text-primary p-3 m-auto">
  <slot />
  <div class="fixed left-0 top-0 w-full h-full z-[-1]">
    <Liquid />
  </div>
</div>
