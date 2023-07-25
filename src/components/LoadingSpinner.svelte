<div class="loading-spinner"><div class="spinner" /></div>

<style>
  .loading-spinner {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 60px;
  }
  .spinner {
    border: 4px solid rgba(54, 255, 131, 0.3);
    border-top-color: red;
    border-radius: 50%;
    width: 2em;
    height: 2em;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
