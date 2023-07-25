<script>
  let props = $$restProps;
  /** @type {"primary" | "secondary"} */
  export let variant = "primary";
</script>

<button class:primary={variant === "primary"} class:secondary={variant === "secondary"} {...props} on:click
  ><slot /></button
>

<style>
  button {
    @apply rounded-full font-bold;
    padding: 8px;
    flex: 1;
  }
  .primary {
    /* background-color: red; */
    color: white;
  }
  .secondary {
    @apply rounded-full;
    background-color: rgb(225 153 255);
  }
</style>
