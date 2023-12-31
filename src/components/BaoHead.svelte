<script>
    import baoHead from "$lib/assets/bao.png";
</script>
<img class="absolute bao-head w-20 h-20 m-auto -ml-10" alt="BAO" src={'/bao.png'} />

<style>
  .bao-head {
    animation: tripout 30000ms infinite alternate;
    left: calc(100vw / 2);
    opacity: 0.8;
    z-index: 9;
  }

  @keyframes tripout {
    0% {
      filter: saturate(5.5) hue-rotate(0deg);
    }
    100% {
      filter: saturate(5.5) hue-rotate(360deg);
    }
  }
</style>
