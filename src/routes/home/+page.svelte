<script>
  import BaoHead from "$components/BaoHead.svelte";
  import { onMount } from "svelte";


  const text = "hello and welcome to my little world :)";
  let displayedText = "";
  let i = 0;

  onMount(() => {
    const interval = setInterval(() => {
      displayedText += text.charAt(i);
      i++;
      if (i > text.length) {
        clearInterval(interval);
      }
    }, 100); // Adjust speed here
  });
</script>

<BaoHead />
<div class="container">
  <div class="welcome-text">{displayedText}</div>
  <nav>
    <a href="/gallery" aria-label="go to gallery page" class="nav-link">
     <img  src="/chicken-icon.png" alt="chicken" />
     <div>Chicken Gallery</div>
    </a>
    <a href="/" aria-label="go to chat" class="nav-link">
      <img  src="icons/chat-icon.png" alt="chicken" />
      <div>Chat</div>
    </a>
    <a href="/baostagram" aria-label="go to selfies" class="nav-link">
      <img src="icons/bao-painted-icon.png" alt="chicken" />
      <div>Baostagram</div>
  </nav>
</div>

<style type="postcss">
  .container {
    @apply mt-[100px] text-black font-bold text-2xl h-full;
    height: 100%;
  }
  .welcome-text {
    @apply text-3xl capitalize p-4;
  }
  nav {
    @apply flex justify-center flex-wrap gap-10 p-2;
  }
  .nav-link {
    flex: 0 0 30%;
    @apply text-sm text-center;
  }
  .nav-link img {
    @apply block m-auto p-1 bg-white rounded-full;
  }
</style>
