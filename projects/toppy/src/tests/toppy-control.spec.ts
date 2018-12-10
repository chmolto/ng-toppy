import { Component, DebugElement, NgModule, ApplicationRef, Injector, ComponentFactoryResolver } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ToppyControl } from '../lib/toppy-control';
import { ToppyComponent } from '../lib/toppy.component';
import { CommonModule } from '@angular/common';
import { ContentType } from 'toppy/lib/models';
import { Bus } from 'toppy/lib/utils';
import { DefaultConfig } from 'toppy/lib/config';

@Component({
  selector: 'lib-test-component',
  template: '<div>DYNAMIC COMP</div>'
})
export class TestComponent {
  name = 'lib-test-component';
}

@NgModule({
  imports: [ CommonModule],
  declarations: [TestComponent, ToppyComponent],
  entryComponents: [TestComponent, ToppyComponent],
  exports: [TestComponent, ToppyComponent]
})
export class TestModule {}

describe('== ToppyControl ==', () => {
  let toppyControl: ToppyControl = null;
  let debugEl: DebugElement = null;
  let fixture: ComponentFixture<TestComponent> = null;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TestModule, CommonModule],
      providers: [{provide: ToppyControl, useClass: ToppyControl, deps: [ApplicationRef, ComponentFactoryResolver, Injector]}]
    }).compileComponents();

    toppyControl = TestBed.get(ToppyControl);
    fixture = TestBed.createComponent(TestComponent);
    debugEl = fixture.debugElement;
  }));

  afterEach(function() {
    fixture.destroy();
    document.body.removeChild(fixture.debugElement.nativeElement);
  });

  it('should initialize', () => {
    expect(toppyControl).toBeTruthy();
  });
  describe('when calling "open" method', () => {
    beforeEach(() => {
      toppyControl.tid = 'abc';
      toppyControl.config = DefaultConfig;
      toppyControl.content = {data: 'hello', props: {id: 'abc'}, type: ContentType.STRING};
    });
    afterEach(() => {
      // toppyControl.close();
    });
    it('should set isOpen to true', () => {
      toppyControl.open();
      expect(toppyControl['_isOpen']).toBeTruthy();
    });
    it('should emit event', (done) => {
      Bus.listen('abc', 'OPENED_OVERLAY_INS').subscribe((data) => {
        expect(data).toEqual(null);
        done();
      });
      toppyControl.open();
    });
  });
  describe('when calling "close" method', () => {
    // it("shoudl");
  });
  describe('when calling "toggle" method', () => {
    // it("shoudl");
  });
});
