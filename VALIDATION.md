# Validation v0.15
- 127 pure checks pass, including five date boundary checks (Singapore UTC crossover, year crossover, leap February, inclusive custom boundaries).
- Ten existing DOM/IndexedDB regression suites pass.
- Two additional DOM simulations pass: fixed ADMIN password-only login, Admin cards preserved, Packer cards removed, Packer menu preserved, all five presets, custom apply, and invalid range guard.
- All dist JavaScript syntax and service-worker referenced assets checked.
- No production accounts or records modified. Firebase Rules and cloud commands unchanged. No new emulator integration run for this UI-only release; v0.14 had 33 passing integration tests.
- DOM simulation does not replace a real Android device/browser visual test.
