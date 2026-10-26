# Mobile installation offer

`AppInstallBanner` offers installation to Android, iPhone and iPad browser users
after eight seconds. It is an inline, dismissible card below the header. Desktop
windows, including narrow windows, do not receive this offer.

`useAppInstall` retains a real `beforeinstallprompt` event when available. Only a
click on **Instalar** calls the browser prompt, once per event. Without that event,
or if it fails, the card provides the platform's home-screen installation steps.
It does not promise offline playback or cross-device progress.

**Agora nom**, or dismissing the native dialog, postpones the offer for seven days.
An observed standalone launch, accepted prompt or `appinstalled` event hides it
and applies a thirty-day courtesy cooldown. Only the expiry timestamp is stored
under `logaliza:install-offer-until`; player data is not changed. If storage is
blocked, dismissal still lasts for the current component session.

Standalone display modes and iOS `navigator.standalone` suppress the card.
Ordinary browser tabs cannot reliably detect every installation elsewhere,
particularly on iOS. The cooldown is deliberately temporary, not a permanent
claim about installed status.

The existing manifest and HTTPS deployment meet the basic installation metadata
requirements. Keep the existing cleanup of old service workers: adding an offline
cache is not needed for this offer and would be a separate feature.

Sources: [Chrome install criteria](https://web.dev/articles/install-criteria),
[MDN installation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable),
[MDN native prompt](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Trigger_install_prompt).

Automated coverage is in `useAppInstall.test.tsx` and `AppInstallBanner.test.tsx`.
Browser checks use temporary device/event fixtures; actual OS installation dialogs
remain controlled by each browser and require user interaction.
