import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  publicDir: 'src/public',
  manifest: {
    name: 'Tripwire — ToS Trap Spotter',
    description: 'Kullanım koşullarındaki riskli maddeleri kanıtlı alıntılarla yakalar. Hukuki tavsiye değildir.',
    permissions: ['activeTab', 'storage', 'sidePanel', 'scripting'],
    host_permissions: ['https://api.anthropic.com/*', 'https://generativelanguage.googleapis.com/*', 'https://api.groq.com/*', 'http://localhost:11434/*'],
    side_panel: { default_path: 'sidepanel.html' },
    action: { default_title: 'Tripwire' },
  },
});
