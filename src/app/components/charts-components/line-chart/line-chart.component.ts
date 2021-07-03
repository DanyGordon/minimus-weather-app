import { Component, Input, OnInit, OnChanges, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  @Input() public visibility: boolean;

  @Input() private forecastParams: { temp?: number, pressure?: number, time: Date | string }[];

  @Input() private city: string;

  @Input() private content: string;

  @ViewChild('chart') private chart: ElementRef;

  public chartTemp: any;

  private readonly height = 600;

  public darkModeActive: Boolean;

  private destroy$: Subject<void> = new Subject<void>();

  constructor(private ui: UiService) { }

  ngOnInit(): void {
    this.ui.darkModeState.pipe(takeUntil(this.destroy$)).subscribe(status => this.darkModeActive = status);
  }

  ngOnChanges(changes): void {
    if(changes.hasOwnProperty('forecastParams') && this.forecastParams && changes.hasOwnProperty('content') && this.content) {
      this.chartTemp = { height: this.height, forecastParams: this.forecastParams, city: this.city, mode: this.content }
    }
  }

  ngAfterViewInit(): void {
    const id = this.chart.nativeElement.id;
    this.chart.nativeElement.id = id + this.content;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
}
