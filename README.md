# Kaspian-KRC20

Kaspian-KRC20 is a React app that integrates the KaspianProvider and KasplexBuilder to enable KRC-20 token functionality through the Kaspian wallet. Supports transacting and mintage of tokens with multi addresses support.

## Development

Ensure you have Bun. If not, please install the latest version of Bun to proceed with the development process.

Install the required Bun modules using the command ``bun install`` and get WASM binaries from [here](https://kaspa.aspectron.org/nightly/downloads/) or by building it yourself from rusty-kaspa. Once obtained, place the WASM binaries into the ``./wasm`` folder.

### Testing

To begin testing, execute ``bun run dev`` to run the development server. Then, route to development server via any browser for testing purposes.

### Building

To build it, execute ``bun run build``. It will be built into dist folder.
