import Vue from 'vue';
import electron from 'electron';
import { Component } from 'vue-property-decorator';
import { BoolInput } from 'components/shared/inputs/inputs';
import { CacheUploaderService } from 'services/cache-uploader';
import { Inject } from 'services/core/injector';
import { CustomizationService } from 'services/customization';
import { StreamlabelsService } from 'services/streamlabels';
import { OnboardingService } from 'services/onboarding';
import { WindowsService } from 'services/windows';
import { UserService } from 'services/user';
import { StreamingService } from 'services/streaming';
import { $t } from 'services/i18n';
import { AppService } from 'services/app';
import fs from 'fs';
import path from 'path';

@Component({
  components: { BoolInput },
})
export default class ExtraSettings extends Vue {
  @Inject() cacheUploaderService: CacheUploaderService;
  @Inject() customizationService: CustomizationService;
  @Inject() streamlabelsService: StreamlabelsService;
  @Inject() onboardingService: OnboardingService;
  @Inject() windowsService: WindowsService;
  @Inject() userService: UserService;
  @Inject() streamingService: StreamingService;
  @Inject() appService: AppService;

  cacheUploading = false;

  get streamInfoUpdate() {
    return this.customizationService.state.updateStreamInfoOnLive;
  }

  set streamInfoUpdate(value: boolean) {
    this.customizationService.setUpdateStreamInfoOnLive(value);
  }

  get navigateToLive() {
    return this.customizationService.state.navigateToLiveOnStreamStart;
  }

  set navigateToLive(value: boolean) {
    this.customizationService.setNavigateToLive(value);
  }

  showCacheDir() {
    electron.remote.shell.openItem(this.appService.appDataDirectory);
  }

  deleteCacheDir() {
    if (
      confirm(
        $t('WARNING! You will lose all scenes, sources, and settings. This cannot be undone!'),
      )
    ) {
      electron.remote.app.relaunch({ args: ['--clearCacheDir'] });
      electron.remote.app.quit();
    }
  }

  uploadCacheDir() {
    this.cacheUploading = true;
    this.cacheUploaderService.uploadCache().then(file => {
      electron.remote.clipboard.writeText(file);
      alert(
        $t(
          'Your cache directory has been successfully uploaded.  ' +
            'The file name %{file} has been copied to your clipboard.',
          { file },
        ),
      );
      this.cacheUploading = false;
    });
  }

  restartStreamlabelsSession() {
    this.streamlabelsService.restartSession().then(result => {
      if (result) alert($t('Streamlabels session has been succesfully restarted!'));
    });
  }

  runAutoOptimizer() {
    this.onboardingService.start({ isOptimize: true });
    this.windowsService.closeChildWindow();
  }

  get isLoggedIn() {
    return this.userService.isLoggedIn();
  }

  get isTwitch() {
    return this.isLoggedIn && this.userService.platform.type === 'twitch';
  }

  get isFacebook() {
    return this.isLoggedIn && this.userService.platform.type === 'facebook';
  }

  get isRecordingOrStreaming() {
    return this.streamingService.isStreaming || this.streamingService.isRecording;
  }

  // Avoid file IO by keeping track of file state in memory while
  // this component is mounted.
  disableHA: boolean = null;

  get disableHardwareAcceleration() {
    if (this.disableHA == null) {
      this.disableHA = fs.existsSync(this.disableHAFilePath);
    }

    return this.disableHA;
  }

  set disableHardwareAcceleration(val: boolean) {
    try {
      if (val) {
        // Touch the file
        fs.closeSync(fs.openSync(this.disableHAFilePath, 'w'));
        this.disableHA = true;
      } else {
        fs.unlinkSync(this.disableHAFilePath);
        this.disableHA = false;
      }
    } catch (e) {
      console.error('Error setting hardware acceleration', e);
    }
  }

  get disableHAFilePath() {
    return path.join(this.appService.appDataDirectory, 'HADisable');
  }
}
