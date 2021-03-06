import { Component } from '@angular/core'
import { isPlatform, ToastController } from '@ionic/angular'
import { ServerModel } from 'src/app/models/server-model'
import { copyToClipboard } from 'src/app/util/web.util'
import { ConfigService } from 'src/app/services/config.service'
import { LoaderService } from 'src/app/services/loader.service'
import { ApiService } from 'src/app/services/api/api.service'

@Component({
  selector: 'lan',
  templateUrl: './lan.page.html',
  styleUrls: ['./lan.page.scss'],
})
export class LANPage {
  torDocs = 'docs.privacy34kn4ez3y3nijweec6w4g54i3g54sdv7r5mr6soma3w4begyd.onion/user-manual/general/lan-setup'
  lanDocs = 'docs.start9labs.com/user-manual/general/lan-setup'

  lanAddress: string
  fullDocumentationLink: string
  lanDisabled: LanSetupIssue
  readonly lanDisabledExplanation: { [k in LanSetupIssue]: string } = {
    NotDesktop: `We have detected you are on a mobile device. To setup LAN on a mobile device, use the Start9 Setup App.`,
    NotTor: `We have detected you are not using a Tor connection. For security reasons, you must setup LAN over a Tor connection. Please navigate to your Embassy Tor Address and try again.`,
  }

  constructor (
    private readonly serverModel: ServerModel,
    private readonly toastCtrl: ToastController,
    private readonly config: ConfigService,
    private readonly loader: LoaderService,
    private readonly apiService: ApiService,
  ) { }

  ngOnInit () {
    if (isPlatform('ios') || isPlatform('android')) {
      this.lanDisabled = 'NotDesktop'
    } else if (!this.config.isTor()) {
      this.lanDisabled = 'NotTor'
    }

    if (this.config.isTor()) {
      this.fullDocumentationLink = `http://${this.torDocs}`
    } else {
      this.fullDocumentationLink = `https://${this.lanDocs}`
    }

    const server = this.serverModel.peek()
    this.lanAddress = `https://${server.serverId}.local`
  }

  async refreshLAN (): Promise<void> {
    this.loader.of({
      message: 'Refreshing Network',
      spinner: 'lines',
      cssClass: 'loader',
    }).displayDuringAsync( async () => {
      await this.apiService.refreshLAN()
    }).catch(e => {
      console.error(e)
    })
  }

  viewInstructions (): void {
    if (this.config.isConsulate) {
      this.copyInstructions()
    } else {
      window.open(this.fullDocumentationLink, '_blank')
    }
  }

  async copyLAN (): Promise <void> {
    const message = await copyToClipboard(this.lanAddress).then(success => success ? 'copied to clipboard!' :  'failed to copy')

    const toast = await this.toastCtrl.create({
      header: message,
      position: 'bottom',
      duration: 1000,
      cssClass: 'notification-toast',
    })
    await toast.present()
  }

  async copyInstructions (): Promise < void > {
    const message = await copyToClipboard(this.fullDocumentationLink).then(
      success => success ? 'copied link to clipboard!' :  'failed to copy',
    )

    const toast = await this.toastCtrl.create({
      header: message,
      position: 'bottom',
      duration: 1000,
      cssClass: 'notification-toast',
    })
    await toast.present()
  }

  installCert (): void {
    document.getElementById('install-cert').click()
  }
}

type LanSetupIssue = 'NotTor' | 'NotDesktop'
