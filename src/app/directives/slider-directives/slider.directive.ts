import { isPlatformBrowser } from '@angular/common';
import { Directive, ElementRef, Inject, Input, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { HammerGestureConfig } from '@angular/platform-browser';

import { UiService } from 'src/app/services/ui.service';

@Directive({
  selector: '[slider]'
})
export class SliderDirective implements OnInit, OnDestroy {

  @Input() private animationTime: number;

  private gestureManager: any;
  private currentValue: number = 0;

  private cardsSlider = {
    slideCount: 0,
    containerLength: 0,
    slideWidth: 0,
    slideToShow: 0,
  };

  private mapOfGesturesHandlers: Map<string, Function>;

  constructor(private el: ElementRef, private gestureHandlers: HammerGestureConfig, @Inject(PLATFORM_ID) private readonly platformId, private ui: UiService) {
    this.mapOfGesturesHandlers = new Map();
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.setHandlersForGesture();
      if(isPlatformBrowser(this.platformId)) {
        (() => import('hammerjs')
          .then(() => {
            this.gestureManager = this.gestureHandlers.buildHammer(this.el.nativeElement);
            this.gestureManager.on('pan', e => this.panHander(e));
          })
        )();
        this.initializeSlider();
      }
    }, this.animationTime)
  }

  private initializeSlider(): void {
    this.cardsSlider.slideCount = this.el.nativeElement.children.length;
    this.cardsSlider.containerLength = this.el.nativeElement.parentElement.getBoundingClientRect().width;
    this.cardsSlider.slideWidth = this.el.nativeElement.children[0].clientWidth + parseInt(getComputedStyle(this.el.nativeElement.children[0]).marginLeft) + parseInt(getComputedStyle(this.el.nativeElement.children[0]).marginRight);
    this.cardsSlider.slideToShow = Math.floor(this.cardsSlider.containerLength / this.cardsSlider.slideWidth);
  }

  private panHander(event): void {
    try {
      this.mapOfGesturesHandlers.get(event.additionalEvent + '-moving')(event);
    } catch(e) {}
    
    try {
      if (event.isFinal) {
        if (event.distance > this.cardsSlider.slideWidth / 2) {
          this.mapOfGesturesHandlers.get(event.additionalEvent + '-final')();
        } else {
          this.ui.$slidingValue.next(this.currentValue);
        } 
      }
    } catch(e) {}
  }

  private setHandlersForGesture(): void {
    this.mapOfGesturesHandlers
      .set('panright-moving', (event) => {
        const maxLength = this.cardsSlider.slideWidth / 4;
        const condition = this.ui.$slidingValue.getValue() < maxLength;
        this.commonHandlerMoving(event, condition);
      })
      .set('panleft-moving', (event) => {
        const maxLength = this.cardsSlider.slideWidth * (this.cardsSlider.slideCount - this.cardsSlider.slideToShow) + this.cardsSlider.slideWidth / 4;
        const condition = Math.abs(this.ui.$slidingValue.getValue()) < maxLength;
        this.commonHandlerMoving(event, condition);
      })
      .set('panright-final', () => {
        const condition = this.currentValue < 0 || this.ui.$slidingValue.getValue() < -this.cardsSlider.slideWidth;
        const value = this.cardsSlider.slideWidth;
        const valueToInitial = 0;
        const incrementingValue = () => this.currentValue += this.cardsSlider.slideWidth;
        this.commonHandlerSwipe(condition, value, valueToInitial, incrementingValue);
      })
      .set('panleft-final', () => {
        const condition = Math.abs(this.currentValue) < this.cardsSlider.slideWidth * (this.cardsSlider.slideCount - this.cardsSlider.slideToShow);
        const value = -this.cardsSlider.slideWidth;
        const valueToInitial = -(this.cardsSlider.slideWidth * (this.cardsSlider.slideCount - this.cardsSlider.slideToShow));
        const decrementingValue = () => this.currentValue -= this.cardsSlider.slideWidth;
        this.commonHandlerSwipe(condition, value, valueToInitial, decrementingValue);
      });
  }

  private commonHandlerMoving(event, condition: boolean): void {
    if (event.distance <= this.cardsSlider.slideWidth * (this.cardsSlider.slideCount - this.cardsSlider.slideToShow) + this.cardsSlider.slideWidth / 4 
      && Math.abs(this.ui.$slidingValue.getValue()) !== this.cardsSlider.slideWidth / 4
      && condition) {
        let value = this.ui.$slidingValue.getValue();
        this.ui.$slidingValue.next(value += event.changedPointers[0].movementX);
    }
  }

  private commonHandlerSwipe(condition: boolean, value: number, valueToInitial: number, changeCurrentValueOfSlidind: Function): void {
    if (condition) {
      this.ui.$slidingValue.next(this.currentValue + value);
      changeCurrentValueOfSlidind();
    } else {
      this.ui.$slidingValue.next(valueToInitial);
      this.currentValue = valueToInitial;
    }
  }

  public slidingLeft(): void {
    if (Math.abs(this.ui.$slidingValue.getValue()) < this.cardsSlider.slideWidth * (this.cardsSlider.slideCount - this.cardsSlider.slideToShow)) {
      let value = this.ui.$slidingValue.getValue();
      this.ui.$slidingValue.next(value -= this.cardsSlider.slideWidth);
      this.currentValue = this.ui.$slidingValue.getValue();
    } else {
      this.ui.$slidingValue.next(0);
      this.currentValue = this.ui.$slidingValue.getValue();
    }
  }

  public slidingRight(): void {
    if (this.ui.$slidingValue.getValue() < 0) {
      let value = this.ui.$slidingValue.getValue();
      this.ui.$slidingValue.next(value += this.cardsSlider.slideWidth);
      this.currentValue = this.ui.$slidingValue.getValue();
    } else {
      this.ui.$slidingValue.next(-(this.cardsSlider.slideWidth * (this.cardsSlider.slideCount - this.cardsSlider.slideToShow)));
      this.currentValue = this.ui.$slidingValue.getValue();
    }
  }

  ngOnDestroy(): void {
    if (this.gestureManager) {
      this.gestureManager.destroy();
    }
    this.ui.$slidingValue.next(0);
  }

}