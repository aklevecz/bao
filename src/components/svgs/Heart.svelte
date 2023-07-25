<script>
  export let filled = false;
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="32" height="32">
  <!-- Large central circle (main pad) -->

  <!-- Top-left small circle (toe pad) -->
  <circle cx="23" cy="25" r="8" fill={filled ? "#ff0000" : "#000"} stroke-width="4px" />

  <!-- Top-right small circle (toe pad) -->
  <circle cx="41" cy="25" r="8" fill={filled ? "#ff0000" : "#000"} stroke-width="4px" />

  <!-- Bottom-left small circle (toe pad) -->
  <circle cx="16" cy="40" r="8" fill={filled ? "#ff0000" : "#000"} stroke-width="4px" />

  <!-- Bottom-right small circle (toe pad) -->
  <circle cx="48" cy="40" r="8" fill={filled ? "#ff0000" : "#000"} stroke-width="4px" />
  <circle cx="32" cy="40" r="16" fill={filled ? "#ff0000" : "#000"} stroke-width="4px" />
</svg>
