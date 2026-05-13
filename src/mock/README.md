# Mock API (development only)

To enable the local mock API, add this line to `.env.local`:

`VITE_USE_MOCKS=true`

Then restart the Vite dev server.

The mock API layer affects only requests made through `axiosInstance`.

Authentication login flow is not bypassed by this mock layer. If you need login bypass, apply a separate development-only auth bypass patch.
