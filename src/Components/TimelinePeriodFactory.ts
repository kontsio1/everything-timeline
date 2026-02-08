import {noOfVisiblePeriods, timelineHeight} from "../Constants/GlobalConfigConstants";
import * as d3 from "d3";
import {ScaleTime} from "d3";
import { TimelinePeriod } from "../Entities/TimelinePeriod";
import {GetPeriodTooltipHtml} from "./PeriodTooltip";

export class TimelinePeriodFactory {
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>

    constructor(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) {
        this.svg = svg;
    }
    public updatePeriods = (periods: TimelinePeriod[], newX: d3.ScaleTime<number, number>)=> {
        this.updateMarkers("period-marker", periods, newX);
        this.updatePeriodLabels("period-label", periods, newX);
    }
    private updatePeriodLabels = (selector: string, topPriorityPeriods: TimelinePeriod[], newX: ScaleTime<number, number, never>) => {
        this.svg.selectAll<SVGTextElement, TimelinePeriod>(`.${selector}`)
            .data(topPriorityPeriods)
            .join(
                enter => enter.append("text")
                    .attr("class", selector)
                    .style("cursor", "default")
                    .attr("x", d => (newX(d.startDate) + newX(d.endDate)) / 2)
                    .attr("y", d => d.labelY)
                    .attr("id", d => d.label)
                    .attr("text-anchor", "middle")
                    .attr("font-size", 12)
                    .attr("fill", "black")
                    .on("mouseover", this.handlePeriodMouseOver)
                    .on("mousemove", this.handlePeriodMouseMove)
                    .on("mouseout", this.handlePeriodMouseOut)
                    .text(d => d.label),
                update => update
                    .attr("x", d => (newX(d.startDate) + newX(d.endDate)) / 2)
                    .attr("y", d => d.labelY)
                    .attr("id", d => d.label)
                    .text(d => d.label)
                    .on("mouseover", this.handlePeriodMouseOver)
                    .on("mousemove", this.handlePeriodMouseMove)
                    .on("mouseout", this.handlePeriodMouseOut),
                exit => exit.remove()
            );
    }
    private updateMarkers = (selector: string, periods: TimelinePeriod[], newX: d3.ScaleTime<number, number>) => {
        this.svg.selectAll<SVGRectElement, TimelinePeriod>(`.${selector}`)
            .data(periods)
            .join(
                enter => enter.append("rect")
                    .attr("class", selector)
                    .attr("x", d => newX(d.startDate))
                    .attr("height", d => d.height)
                    .attr("y", d => timelineHeight / 2)
                    .attr("width", d => newX(d.endDate) - newX(d.startDate))
                    .attr("fill", d => d.colour)
                    .attr("opacity", d => d.opacity)
                    .attr("id", d => d.label)
                    .on("click", this.handleClick)
                    .on("mouseover", this.handlePeriodMouseOver)
                    .on("mousemove", this.handlePeriodMouseMove)
                    .on("mouseout", this.handlePeriodMouseOut),
                update => update
                    .attr("x", d => newX(d.startDate))
                    .attr("height", d => d.height)
                    .attr("width", d => newX(d.endDate) - newX(d.startDate))
                    .attr("fill", d => d.colour)
                    .attr("opacity", d => d.opacity)
                    .attr("id", d => d.label)
                    .on("click", this.handleClick)
                    .on("mouseover", this.handlePeriodMouseOver)
                    .on("mousemove", this.handlePeriodMouseMove)
                    .on("mouseout", this.handlePeriodMouseOut),
                exit => exit.remove()
            );
    }
    private handleClick = (event: any, d: TimelinePeriod) => {
        console.log("Clicked on period:", d);
        const labelNode = this.svg.select(`.period-label[id="${d.label}"]`).node() as SVGGraphicsElement;
        console.log(labelNode.getBBox());
    }
    private handlePeriodMouseOver(this: any, event: MouseEvent, d: TimelinePeriod) {
        if (this.tagName !== "text") {
            if (d.opacity != 0.8) {
                d3.select(this).attr("opacity", 0.8);
            } else {
                d3.select(this).attr("opacity", 0.9);
            }
        }
        const tooltip = document.getElementById("tooltip-period");
        if (tooltip) {
            tooltip.style.display = "block";
            tooltip.style.left = (event.pageX + 15) + "px";
            tooltip.style.top = (event.pageY + 15) + "px";
            tooltip.innerHTML = GetPeriodTooltipHtml(d);
        }
    }
    private handlePeriodMouseMove(this: any, event: MouseEvent, d: TimelinePeriod) {
        const tooltip = document.getElementById("tooltip-period");
        if (tooltip) {
            tooltip.style.left = (event.pageX + 15) + "px";
            tooltip.style.top = (event.pageY + 15) + "px";
        }
    }
    private handlePeriodMouseOut(this: any, event: MouseEvent, d: TimelinePeriod) {
        if (this.tagName !== "text") {
            d3.select(this)
                .attr("opacity", d.opacity);
        }
        const tooltip = document.getElementById("tooltip-period");
        if (tooltip) {
            tooltip.style.display = "none";
        }
    }
}
