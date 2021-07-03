import { isPlatformServer } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UiService } from '../../../services/ui.service';

import * as d3 from 'd3';

@Component({
  selector: 'app-weather-table',
  templateUrl: './weather-table.component.html',
  styleUrls: ['./weather-table.component.scss']
})
export class WeatherTableComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  @Input() private visibility: boolean;

  @Input() public city: string;

  @Input() public forecastPrecipitation: { time: Date | string, precipitation: number }[];

  @Input() public forecastWind: { time: Date | string, wind: { speed: number, deg: number } }[];

  @Input() private forecastHumidity: { time: Date | string, humidity: number }[];

  @Input() public forecastConditionAndTemp: { time: Date | string, minTemp: number, maxTemp: number, condition: string }[];

  @ViewChild('containerPresentation') private container: ElementRef;

  public humidity = { name: 'humidity', active: true };
  public precipitation = { name: 'precipitation', active: false };
  public wind = { name: 'wind', active: false }

  private tabs = [this.humidity, this.precipitation, this.wind];

  private hoursList = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];

  public hours = [];

  private daysList = [
    { selected: true, translateValue: 0 }, 
    { selected: false, translateValue: 0 },  
    { selected: false, translateValue: 0 },  
    { selected: false, translateValue: 0 },  
    { selected: false, translateValue: 0 }
  ];

  public dateOfForecast: Array<Date | string>;

  public $translateValue: number;

  private svgSelector = '#humidityChart';
  private lineColor = '#2b244d'
  private areaColor = '#5f84fb';

  private svg: any;
  private svgInner: any;
  private xScale: any;
  private yScale: any;
  private lineGroup: any;
  private areaPath: any;

  private width: number;

  public darkModeActive: boolean;

  private destroy$: Subject<void> = new Subject<void>();

  constructor(private ui: UiService, @Inject(PLATFORM_ID) private readonly platformId) { 
    this.dateOfForecast = [];
  }
  
  ngOnChanges(changes): void {
    if(changes.hasOwnProperty('forecastHumidity') && this.forecastHumidity.length && this.humidity.active) {
      for(let i = 0; i < 8; i++) {
        this.getHourFromDate(this.forecastHumidity[i].time);
      }

      for (let interval of this.forecastHumidity) {
        if (this.dateOfForecast && !this.dateOfForecast.length) {
          this.dateOfForecast.push(interval.time);
        } else {
          const isInArray = this.dateOfForecast.some(item => new Date(interval.time).getDay() === new Date(item).getDay());
          if(!isInArray) {
            this.dateOfForecast.push(interval.time);
          }
        }
      }
      this.initializeChart(this.svgSelector);
    }
    if (changes.hasOwnProperty('visibility') && this.visibility) {
      this.drawChart();
    }
  }

  ngOnInit(): void {
    this.ui.darkModeState.pipe(takeUntil(this.destroy$)).subscribe(state => this.darkModeActive = state);
  }
  
  ngAfterViewInit(): void {
    if(!isPlatformServer(this.platformId)) {
      this.width = this.container.nativeElement.getBoundingClientRect().width * (this.forecastHumidity.length / this.hours.length);
      if(this.container.nativeElement.getBoundingClientRect().width > 0) {
        const width = this.container.nativeElement.getBoundingClientRect().width;
        this.daysList.map((item, indx) => item.translateValue = -(indx) * width);
      }
    }
    // window.addEventListener('resize', () => this.drawChart());
  }
  
  private getHourFromDate(time: Date | string): void {
    const hour = this.hoursList.find(h => parseInt(h) === new Date(time).getHours())
    this.hours.push(hour);
  }
  
  public changeActive(e: Event): void {
    const target = e.target['classList'][1];
    this.tabs.map(tab => tab.name === target ? tab.active = true : tab.active = false);
  }
  
  public computeBarHeight(value: number): number {
    const computeMaxValue = (): number => {
      let maxValue = 0;
      this.forecastPrecipitation.filter(f => f.precipitation > maxValue ? maxValue = f.precipitation : maxValue = maxValue);
      return maxValue;
    }

    const maxValue = computeMaxValue() * 10 >= 100 ? computeMaxValue() : 75;
    return Math.round(value * 10 / maxValue * 100);
  }
  
  public computeWidthDayTitle(day: Date | string): number {
    const count = this.forecastHumidity.filter(item => new Date(item.time).getDay() === new Date(day).getDay()).length;
    return (count * 100) / 8;
  }
  
  public selectCardHandler(e: Event, index: number): void {
    this.daysList.map((item, indx) => {
      if(indx === index) {
        item.selected = true;
        this.$translateValue = item.translateValue;
      } else {
        item.selected = false;
      }
    })
  }

  private initializeChart(selector: string): void {
    this.svg = d3.select(selector);

    this.svgInner = this.svg
      .append('g')

    this.yScale = d3.scaleLinear()
      .domain([d3.max(this.forecastHumidity, f => f.humidity), 0])
      .range([0, 100]);
    
    this.xScale = d3.scaleTime()
      .domain(d3.extent(this.forecastHumidity, f => new Date(f.time)));

    this.lineGroup = this.svgInner
      .data(this.forecastHumidity)
      .append('g')
      .append('path')
      .attr('id', 'lineHumidityChart')
      .style('fill', 'none')
      .style('stroke', this.lineColor)
      .style('stroke-width', '2px');

    this.areaPath = this.svgInner
      .append('g')
      .append('path')
      .attr('id', 'area-path-humidity')
      .attr('fill', this.areaColor);

  }

  private drawChart(): void {
    this.svg
      .attr('width', this.width)
      .attr('viewBox', `0, 0, ${this.width + 50}, 90`);

    this.xScale.range([10, this.width + 40]);

    const line = d3.line()
      .x(d => d[0])
      .y(d => d[1])
      .curve(d3.curveCardinal);

    const areaPath = d3.area()
      .x(d => d[0])
      .y0(d => d[1])
      .y1(() => this.yScale(0))
      .curve(d3.curveCardinal);

    const transitionLine = d3
      .transition()
      .ease(d3.easeSin)
      .duration(2500);
    
    const points: [number, number][] = this.forecastHumidity.map(
      d => [this.xScale(new Date(d.time)), this.yScale(d.humidity)]
    );

    this.lineGroup.attr('d', line(points));

    const tooltip = d3.select(".days-params__list div.chart__tooltip")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("visibility", "hidden");

    const lineLenth = this.lineGroup.node().getTotalLength();

    this.lineGroup
      .attr("stroke-dashoffset", lineLenth)
      .attr("stroke-dasharray", lineLenth)
      .transition(transitionLine)
      .attr("stroke-dashoffset", 0);

    this.areaPath
      .attr('d', areaPath(points))
      .style('opacity', 0)
      .transition(transitionLine)
      .style('opacity', 0.1);
    
    this.svg.select('g').selectAll(".dot")
      .data(this.forecastHumidity)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("r", 4.5)
      .attr("cx", f => this.xScale(new Date(f.time)))
      .attr("cy", f => this.yScale(f.humidity));
      
    this.svg.select('g').selectAll('.dot-title')
      .data(this.forecastHumidity)
      .enter()
      .append('text')
      .attr("class", "dot-title")
      .attr('font-size', '.75rem')
      .attr('fill', '#2b244db7')
      .attr('x', f => this.xScale(new Date(f.time)) - 5)
      .attr("y", f => this.yScale(f.humidity) + 20)
      .text(f => `${f.humidity}%`)

    this.svg.select('g').selectAll(".dot")
      .on("mouseover", (event, f) => tooltip.style("visibility", "visible")
        .html(`<span>${d3.timeFormat('%a %d (%I %p)')(new Date(f.time))}</span><span>Humidity: ${f.humidity}%</span>`))
      .on("mousemove", (event) => this.handleMouseMove(event, tooltip))
      .on("mouseout", () => this.handleMouseLeave(tooltip));

    this.svg.select('g').selectAll(".dot")
      .style('opacity', 0)
      .transition(transitionLine)
      .style('opacity', 1)
    
    this.svg.select('g').selectAll('.dot-title')
      .style('opacity', 0)
      .transition(transitionLine)
      .style('opacity', 1)
      
  }

  private handleMouseMove(event: Event, targetEl: d3.Selection<d3.BaseType, unknown, HTMLElement, any>): void {
    targetEl.style("top", (event.target['cy'].baseVal.value + 110)+"px").style("left",(event.target['cx'].baseVal.value - 20)+"px");
  }

  private handleMouseLeave(targetEl: d3.Selection<d3.BaseType, unknown, HTMLElement, any>): void {
    targetEl.style("visibility", "hidden");
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if(this.svg && this.svg.hasOwnProperty('_groups')) {
      d3.select(this.svg._groups[0]).remove();
    }
  }

}
