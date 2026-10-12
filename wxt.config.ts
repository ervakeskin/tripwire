import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  publicDir: 'src/public',
  manifest: {
    name: 'Tripwire — ToS Trap Spotter',
    description: 'Kullanım koşullarındaki riskli maddeleri kanıtlı alıntılarla yakalar. Hukuki tavsiye değildir.',
    permissions: ['activeTab', 'storage', 'sidePanel', 'scripting', 'declarativeContent'],
    host_permissions: ['https://api.anthropic.com/*', 'https://generativelanguage.googleapis.com/*', 'https://api.groq.com/*', 'http://localhost:11434/*'],
    optional_host_permissions: ['http://*/*', 'https://*/*'],
    side_panel: { default_path: 'sidepanel.html' },
    action: { default_title: 'Tripwire' },
  },
  hooks: {
    // The on-demand content script's `matches` makes WXT add all-sites host permissions. We inject via activeTab +
    // scripting.executeScript instead, so drop them: the only host permissions left are the LLM endpoints.
    'build:manifestGenerated': (_wxt, manifest) => {
      manifest.host_permissions = (manifest.host_permissions ?? []).filter((p: string) => !/^https?:\/\/\*\//.test(p));
    },
  },
});
