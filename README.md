# Kaspian-KRC20

## Development

Ensure you have Bun. If not, please install the latest version of Bun to proceed with the development process.

Install the required Bun modules using the command ``bun install`` and get WASM binaries from [here](https://kaspa.aspectron.org/nightly/downloads/) or by building it yourself from rusty-kaspa. Once obtained, place the WASM binaries into the ``./wasm`` folder.

### Testing

To begin testing, execute ``bun run dev`` to run the development server. Then, utilize the contents of the dist folder as an unpacked extension in your browser for testing purposes.

### Building

To build it as an unpacked extension, execute ``bun run build``. It will be built into dist folder.
