<script>
    import Nav from "$lib/components/Nav.svelte";
</script>

<Nav />

<main>
    <slot />
</main>

<footer>
    <p>Parkolóház &copy; {new Date().getFullYear()}</p>
</footer>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f5f5f5;
    }

    main {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
        min-height: calc(100vh - 150px);
    }

    footer {
        text-align: center;
        padding: 1rem;
        background-color: #2c3e50;
        color: white;
    }
</style>
