# Startup regression verified — 2026-11-08

Original native Release simulator run 42434390153 reproduced termination at launch: DYLD Symbol missing _OBJC_CLASS_$_RCTStatusBarAppearance, referenced by ExpoModulesCore.framework and absent from React.framework. This occurs before JavaScript.

Final candidate commit 15cf2dbfced20f20468f1a7d40bdda25380aea1a pins expo-modules-core58.0.11 (Expo58.0.2 declared baseline) and companion expo-modules-jsi58.0.7 (Core declared baseline). Both iOS workflows set EXPO_USE_PRECOMPILED_MODULES=0 so Expo modules compile with the runner toolchain. No framework source patched.

Intermediate evidence: run42435633298 exposed an incompatible precompiled Swift interface; source-build run42436384409 exposed JSI58.0.22 API changes. These were not distributed.

Verification on final candidate: npm ci succeeded;114/114 tests passed; TypeScript passed. Run42436848726 completed SUCCESS: Release simulator build, installation, launch and process-survival check passed. startup.png displays the actual Random Stranger welcome/demo UI. Artifact13599559629 SHA25626c958a59b1e549125bd1646cc2c07d0419e22f9421bdd33c3be02c133ee9fbf. No RandomStranger crash report was produced in the artifact.

Replacement signed iOS workflow42438255269 is running on the SAME source commit, expected version0.1.0 build12001. Upload/presence/installability not yet verified. Device retest still pending; simulator success does not prove the owner's iPhone startup. Build11001 remains the previously installed crash report.

Official source-build option: https://docs.expo.dev/guides/prebuilt-expo-modules/
