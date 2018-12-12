import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Injector, OnDestroy, OnInit } from '@angular/core';
import { merge, Observable, Subject } from 'rxjs';
import { startWith, takeUntil, tap } from 'rxjs/operators';
import { CurrentOverlay } from './current-overlay';
import { Content, ContentType, ToppyConfig } from './models';
import { Position } from './position/position';
import { Bus, cssClass, newInjector, toCss } from './utils';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'toppy',
  templateUrl: './template.html',
  styleUrls: ['./styles.scss']
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToppyComponent implements OnInit, AfterViewInit, OnDestroy {
  content: Content = {
    type: ContentType.STRING,
    data: '',
    props: {}
  };
  config: ToppyConfig;
  position: Position;
  toppyRef;
  close;
  tid;
  el: HTMLElement | any;
  wrapperEl: HTMLElement | any;
  triggerPosChange: Subject<1> = new Subject();
  private die: Subject<1> = new Subject();

  constructor(private inj: Injector, private cd: ChangeDetectorRef, private elRef: ElementRef) {}

  ngOnInit() {
    this.el = this.elRef.nativeElement;
    this.wrapperEl = this.el.querySelector('.t-wrapper');
    let cls = [this.config.containerClass, this.position.getClassName()];
    if (this.config.dismissOnDocumentClick) {
      cls = cls.concat(['no-pointers']);
    }
    this.el.setAttribute('data-tid', this.tid);
    cssClass('add', cls, `[data-tid='${[this.tid]}']`);
    cssClass('add', [this.config.bodyClassNameOnOpen]);
  }

  ngAfterViewInit() {
    this.listenPos().subscribe();
  }

  createInj(): Injector {
    return newInjector(
      {
        provide: CurrentOverlay,
        useFactory: () => new CurrentOverlay(this.content.props.close),
        deps: []
      },
      this.inj
    );
  }

  updateTextContent(data: string) {
    if (this.content.type === ContentType.STRING) {
      this.content.data = data;
      this.cd.detectChanges();
    }
  }

  ngOnDestroy() {
    cssClass('remove', [this.config.bodyClassNameOnOpen]);
    this.die.next(1);
    Bus.send(this.tid, 'DETACHED');
  }

  private listenPos(): Observable<any> {
    return merge(this.triggerPosChange.pipe(startWith(1)), Bus.listen(this.tid, 'NEW_DYN_POS')).pipe(
      takeUntil(this.die),
      tap(e => {
        if (!e || !e.x) return this.setPos();
        const coords = { left: e.x, top: e.y };
        this.wrapperEl.style = toCss(coords);
      })
    );
  }

  private setPos(): void {
    const coords = this.position.getPositions(this.wrapperEl);
    Object.assign(coords, { visibility: 'visible', opacity: '1' });

    this.wrapperEl.style = toCss(coords);
    Bus.send(this.tid, 't_posupdate');
  }
}
