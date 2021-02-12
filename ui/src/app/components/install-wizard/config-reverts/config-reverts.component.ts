import { Component, Input, OnInit } from '@angular/core'
import { BehaviorSubject, from, of, Subject } from 'rxjs'
import { concatMap, map, takeUntil } from 'rxjs/operators'
import { ConfigReverts } from 'src/app/models/app-types'
import { markAsLoadingDuring$ } from 'src/app/services/loader.service'
import { pauseFor } from 'src/app/util/misc.util'
import { Loadable } from '../loadable'

@Component({
  selector: 'config-reverts',
  templateUrl: './config-reverts.component.html',
  styleUrls: ['../install-wizard.component.scss'],
})
export class ConfigRevertsComponent implements OnInit, Loadable {
  @Input() params: {
    title: string
    fetchReverts: () => Promise<ConfigReverts>
  }

  @Input() transitions: {
    cancel: () => void
    next: (result: ConfigRevertsComponent['result']) => void
    final: () => void
    error: (e: Error) => void
  }

  $loading$ = new BehaviorSubject(false)
  $cancel$ = new Subject<void>()

  configReverts: ConfigReverts
  result: boolean = false

  load () {
    markAsLoadingDuring$(
      this.$loading$,
      from(Promise.all([
        this.params.fetchReverts(),
        pauseFor(2000),
      ])).pipe(
        takeUntil(this.$cancel$),
        map(([revs]) => this.configReverts = revs),
        concatMap(() => {
          if (!Object.keys(this.configReverts).length) {
            console.log('completed')
            this.transitions.next(false)
            return pauseFor(250)
          } else {
            return of()
          }
        }),
      ),
    ).subscribe({
      error: (e: Error) => this.transitions.error(new Error(`Fetching dependent service information failed: ${e.message || e}`)),
    })
  }

  constructor () { }
  ngOnInit () { }
}
