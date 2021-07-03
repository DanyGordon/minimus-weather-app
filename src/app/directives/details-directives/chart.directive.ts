import { isPlatformBrowser } from '@angular/common';
import { Directive, ElementRef, Inject, Input, OnChanges, OnDestroy, PLATFORM_ID } from '@angular/core';

import * as d3 from 'd3';

interface forecastTemp {
  temp: number,
  time: Date | string
}

@Directive({
  selector: '[chart]'
})
export class ChartDirective implements OnChanges, OnDestroy {

  @Input() private params: { height: number, forecastParams: object, city: string, mode: string };

  @Input() private visibility: boolean;

  private svg: any;
  private svgInner: any;
  private yAxis: any;
  private xAxis: any;
  private yScale: any;
  private xScale: any;
  private dotXScale: any;
  private dotYScale: any;
  private lineGroup: any;
  private areaPath: any;

  private selector: string;
  private color: string = '#2B244D';

  private chartData: any;
  private chartTitle: string;

  private mode: string;

  private readonly margin = 50;

  private width: number;

  private metrics = {
    temperature: 'C°',
    pressure: 'hPa'
  }

  private tooltipTitle = {
    temperature: 'Temp',
    pressure: 'Pressure'
  };

  private chartHandlersMap: Map<string, Function> = new Map();

  constructor(private el: ElementRef, @Inject(PLATFORM_ID) private readonly platformId) {
    this.chartHandlersMap
      .set('temperature max', (params) => {
        return this.computeMaxTemp(params);
      })
      .set('temperature min', (params) => {
        return this.computeMinTemp(params);
      })
      .set('temperature yScale', (params) => {
        return this.yScale(params.temp);
      })
      .set('temperature dotYScale', params => this.dotYScale(params.temp))
      .set('pressure max', (params) => {
        return +d3.max(params, f => f['pressure']) + 1;
      })
      .set('pressure min', (params) => {
        return +d3.min(params, f => f['pressure']) - 1;
      })
      .set('pressure yScale', (params) => {
        return this.yScale(params.pressure);
      })
      .set('pressure dotYScale', params => this.dotYScale(params.pressure));
 
  }

  ngOnChanges(changes): void {
    if(changes.hasOwnProperty('params') && this.params) {
      if(isPlatformBrowser(this.platformId)) {
        this.mode = this.params.mode;
        this.chartData = this.params.forecastParams;
        this.chartTitle = this.params.city;
        this.selector = '#' + this.el.nativeElement.id;

        this.initializeLineChart(this.color, this.params.height);
        this.drawChart(this.params.height);

        // window.addEventListener('resize', () => this.drawChart(this.params.height));
      }
    }

    if(changes.hasOwnProperty('visibility') && this.visibility) {
      if(isPlatformBrowser(this.platformId)) {
        this.drawLine();
      }
    }
  }

  private initializeLineChart(color: string, height: number): void {

    this.svg = d3
      .select(this.selector)
      .attr('height', height);
    
    this.svgInner = this.svg
      .append('g')
      .style('transform', `translate(${this.margin}px, ${this.margin}px)`);

    this.dotYScale = d3.scaleLinear()
      .range([0, height - 2 * this.margin])
      .domain([this.chartHandlersMap.get(this.mode + ' max')(this.chartData), this.chartHandlersMap.get(this.mode + ' min')(this.chartData)]);

    this.yScale = d3.scaleLinear()
      .domain([this.chartHandlersMap.get(this.mode + ' max')(this.chartData), this.chartHandlersMap.get(this.mode + ' min')(this.chartData)])
      .range([0, height - 2 * this.margin]);

    this.xScale = d3.scaleTime()
      .domain(d3.extent(this.chartData, (item: { time: Date }) => new Date(item.time)));

    this.yAxis = this.svgInner
      .append('g')
      .attr('id', 'y-axis')
      .style('transform', `translate(${this.margin}px, 0)`);

    this.xAxis = this.svgInner
      .append('g')
      .attr('id', 'x-axis')
      .style('transform', `translate(0, ${height - 2 * this.margin}px)`);

    this.lineGroup = this.svgInner
      .data(this.chartData)
      .append('g')
      .append('path')
      .attr('id', 'line')
      .attr('filter', 'url(#shadow)')
      .style('fill', 'none')
      .style('stroke', color)
      .style('stroke-width', '2px');

    this.areaPath = this.svgInner
      .append('g')
      .append('path')
      .attr('id', 'area-path')
      .attr('fill', color)
      .attr('filter', 'url(#shadow)')
  }

  private drawChart(height: number): void {
    this.width = this.el.nativeElement.getBoundingClientRect().width;
    this.svg.attr('width', this.width);
    this.svg.attr('viewBox', '0, 0, 1200, 600');

    this.xScale.range([this.margin, this.width - 2 * this.margin]);
    
    this.dotXScale = d3.scaleTime()
      .domain(d3.extent(this.chartData, (f: { time: Date }) => new Date(f.time)))
      .range([this.margin, this.width - 2 * this.margin]);

    const xAxis = d3
      .axisBottom(this.xScale)
      .scale(this.xScale)
      .ticks(10)
      .tickFormat(d3.timeFormat('%a %d %I %p\n'));
    
    this.xAxis.call(xAxis);

    const yAxis = d3
      .axisLeft(this.yScale);

    this.yAxis.call(yAxis);

    this.tickTextFilteredByDateFilterToColumn(this.selector + ' #x-axis');

    this.svg.selectAll(this.selector + ' .tick text').attr('font-size', '16px');

    if(!document.querySelector(this.selector + ' g.grid-horizontal')) {
      this.createGridToChart(height, xAxis, yAxis);
    }

    if(!document.querySelector(this.selector + ' text.title') && !document.querySelector(this.selector + 'text.label')) {
      this.appendTitle(height);
    }
  }

  private drawLine(): void {
    const line = d3.line()
      .x(d => d[0])
      .y(d => d[1])
      .curve(d3.curveCardinal);
    
    const areaPath = d3.area()
      .x(d => d[0])
      .y0(d => d[1])
      .y1(() => this.yScale(this.chartHandlersMap.get(this.mode + ' min')(this.chartData)))
      .curve(d3.curveCardinal);

    const transitionLine = d3
      .transition()
      .ease(d3.easeSin)
      .duration(2500);
    
    const points: [number, number][] = this.chartData.map(
      d => [this.xScale(new Date(d.time)), this.chartHandlersMap.get(this.mode + ' yScale')(d)]
    );

    this.lineGroup.attr('d', line(points));
    
    const lineLenth = this.lineGroup.node().getTotalLength();
    
    const tooltip = d3.select(`app-line-chart ${this.selector + this.mode} + div.chart__tooltip`)
      .style("position", "absolute")
      .style("z-index", "10")
      .style("visibility", "hidden");

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
      .data(this.chartData)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("r", 4.5)
      .attr("cx", f => this.xScale(new Date(f.time)))
      .attr("cy", f => this.chartHandlersMap.get(this.mode + ' dotYScale')(f))
    
    this.svg.select('g').selectAll(".dot")
      .on("mouseover", (e, f) => tooltip.style("visibility", "visible")
        .html(`<span>${d3.timeFormat('%a %d (%I %p)')(new Date(f.time))}</span><span>${this.tooltipTitle[this.mode]}: ${f[this.tooltipTitle[this.mode].toLowerCase()]} ${this.metrics[this.mode]}</span>`))
      .on("mousemove", (event) => this.handleMouseMove(event, tooltip))
      .on("mouseout", () => this.handleMouseLeave(tooltip));

    this.svg.select('g').selectAll(".dot")
      .style('opacity', 0)
      .transition(transitionLine)
      .style('opacity', 1)

  }

  private handleMouseMove = (e, tooltip): void => {
    tooltip.style("top", (e.offsetY-50)+"px").style("left",(e.offsetX - 40)+"px")
  };

  private handleMouseLeave = (tooltip): void => {
    tooltip.style("visibility", "hidden")
  };

  private computeMaxTemp(array: Array<forecastTemp>): number {
    return d3.max(array, f => f.temp) + 1 > 25 ? d3.max(array, f => f.temp) + 1 : 25;
  }

  private computeMinTemp(array: Array<forecastTemp>): number {
    return d3.min(array, f => f.temp) - 1 < 0 ? d3.min(array, f => f.temp) - 1 : 0
  }

  private tickTextFilteredByDateFilterToColumn(selector: string): void {
    const ticksText = this.svg.select(selector).text()
      .split('\n')
      .map(text => [text.slice(0, 6), text.slice(7)]);
   
    const textArray = Array.from(d3.select(selector).selectAll('text'));

    const yAttrSpace = this.svg.select(selector).selectAll('text').nodes().map(node => node['y'].baseVal[0].value);
    const dyAttrSpace = this.svg.select(selector).selectAll('text').nodes().map(node => +node['dy'].baseVal[0].valueAsString.slice(0, 4));

    const lineNumber = 0;
    const lineHeight = 1.1;

    textArray.map((node, indx) => {
      node['innerHTML'] = `<tspan x="0" y="${yAttrSpace[indx]}" dy="${lineNumber + lineHeight + dyAttrSpace[indx]}em">${ticksText[indx][0]}</tspan>
      <tspan x="0" y="${yAttrSpace[indx]}" dy="${(lineNumber + 1) + lineHeight + dyAttrSpace[indx]}em">${ticksText[indx][1]}</tspan>`
    })
    
  }

  private createGridToChart(height: number, xAxis: d3.Axis<d3.AxisDomain>, yAxis: d3.Axis<d3.AxisDomain>): void {
    const makeXLines = () => xAxis
      .scale(this.xScale);

    const makeYLines = () => yAxis
      .scale(this.yScale);
    
    this.svg.select('g').append('g')
      .attr('class', 'grid-vertical')
      .attr('transform', `translate(0, ${height - 2 * this.margin})`)
      .call(makeXLines()
        .tickSize(-height + 2 * this.margin)
      )

    this.svg.select('g').append('g')
      .attr('class', 'grid-horizontal')
      .attr('transform', `translate(${this.margin}, 0)`)
      .call(makeYLines()
        .tickSize(-this.width + 3 * this.margin)
      )

    this.svg.select('g.grid-horizontal').selectAll('.tick text').remove()
    this.svg.select('g.grid-vertical').selectAll('.tick text').remove()
  }

  private appendTitle(height: number): void {
    if(this.mode) {
      this.svg.append('text')
        .attr('class', 'title')
        .attr('x', this.width / 2 + this.margin)
        .attr('y', 0)
        .attr('text-anchor', 'middle')
        .text(`${this.mode} forecast - ${this.chartTitle}`);

      this.svg.append('text')
        .attr('class', 'label')
        .attr('x', -(height / 2) + this.margin)
        .attr('y', this.margin)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .text(`${this.mode} (${this.metrics[this.mode]})`);
    }
  }

  ngOnDestroy(): void {
    if(this.svg && this.svg.hasOwnProperty('_groups')) {
      d3.select(this.svg._groups[0]).remove();
    }
  }

}
