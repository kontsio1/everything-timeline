// Add custom markers as SVG groups
import * as d3 from "d3";
import {TimelineEvent} from "../Entities/TimelineEvent";
import {timelineHeight} from "../Constants/GlobalConfigConstants";
import {computeRelativePeriodForEvent, sanitizeId} from "../Helpers/GenericHelperFunctions";

export class EventFactory {
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>

    constructor(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) {
        this.svg = svg;
    }
    public updateEvents = (selector: string, events: TimelineEvent[], x: d3.ScaleTime<number, number>) => {
        this.svg.selectAll<SVGGElement, TimelineEvent>(`.${selector}`)
            .data(events)
            .join(
                enter => this.addEventMarkersEnter(enter, selector, x),
                update => this.updateEventMarkers(update, selector, x),
                exit => exit.remove()
            )
    }
    private addEventMarkersEnter = (
        enter: d3.Selection<d3.EnterElement, TimelineEvent, SVGSVGElement, unknown>,
        selector: string,
        x: d3.ScaleTime<number, number>
    ) => {
        const padding = 4;
        const maxTextWidth = 150;
        const lineHeight = 14;
        const self = this;
        
        return enter
            .append("g")
            .attr("class", selector)
            .style("cursor", "default")
            .attr("transform", d => `translate(0, ${timelineHeight / 2})`)
            .each(function (d) {
                const group = d3.select(this);
                group.append("circle")
                    .attr("cx", x(d.date))
                    .attr("cy", 0)
                    .attr("r", d.radius)
                    .attr("fill", d.colour)
                    .attr("opacity", d.opacity)
                    .attr('stroke', 'black')
                    .on("mouseover",  function(event, d) { self.handlePeriodMouseOver.call(this, event, d as TimelineEvent); })
                    .on("mousemove",  function(event, d) { self.handlePeriodMouseMove.call(this, event, d as TimelineEvent); })
                    .on("mouseout", function(event, d) { self.handlePeriodMouseOut.call(this, event, d as TimelineEvent); })
                    .raise()
                group.append("line")
                    .attr("x1", x(d.date))
                    .attr("y1", -d.stemHeight)
                    .attr("x2", x(d.date))
                    .attr("y2", -d.radius)
                    .attr("opacity", d.opacity)
                    .attr("stroke-width", 0.4)
                    .attr('stroke', 'black')
                    .lower();
                const textElement = group.append("text")
                    .attr("x", x(d.date))
                    .attr("y", -d.stemHeight - 5)
                    .attr("text-anchor", "middle")
                    .attr("font-size", 12)
                    .text(d.label)
                    .on("mouseover", function(event, d) { self.handlePeriodMouseOver.call(this, event, d as TimelineEvent); })
                    .on("mousemove", function(event, d) { self.handlePeriodMouseMove.call(this, event, d as TimelineEvent); })
                    .on("mouseout", function(event, d) { self.handlePeriodMouseOut.call(this, event, d as TimelineEvent); })
                    .on("click", function(event, d) {self.handleClick.call(this, event, d as TimelineEvent); })

                EventFactory.wrapText(textElement, maxTextWidth, lineHeight);

                const textNode = textElement.node() as SVGTextElement;
                const textBBox = textNode.getBBox();
                
                d.boxWidth = textBBox.width + (padding * 2)
                d.boxHeight = textBBox.height + (padding * 2);
                d.boxX = x(d.date);

                group.append("rect")
                    .attr("id", sanitizeId(d.label))
                    .attr("width", textBBox.width + (padding * 2))
                    .attr("height", textBBox.height + (padding * 2))
                    .attr("x", x(d.date) - (textBBox.width / 2) - padding)
                    .attr("y", textBBox.y - padding)
                    .attr("fill", d.colour)
                    .attr("opacity", d.opacity)
                    .attr("stroke", "black")
                    .attr("rx", 8)
                    .attr("ry", 8)
                    .on("mouseover", function(event, d) { self.handlePeriodMouseOver.call(this, event, d as TimelineEvent); })
                    .on("mousemove", function(event, d) { self.handlePeriodMouseMove.call(this, event, d as TimelineEvent); })
                    .on("mouseout", function(event, d) { self.handlePeriodMouseOut.call(this, event, d as TimelineEvent); })
                    .on("click", function(event, d) {self.handleClick.call(this, event, d as TimelineEvent); })
                    .lower();
            });
    }
    private updateEventMarkers = (
        update: d3.Selection<SVGGElement, TimelineEvent, SVGSVGElement, unknown>,
        selector: string,
        x: d3.ScaleTime<number, number>
    ) => {
        return update
            .attr("transform", d => `translate(0, ${timelineHeight / 2})`)
            .each(function(d) {
                const group = d3.select(this);

                // Update circle position
                group.select("circle")
                    .attr("cx", x(d.date));

                // Update line position
                group.select("line")
                    .attr("x1", x(d.date))
                    .attr("x2", x(d.date))
                    .attr("y1", -d.stemHeight)
                    .lower();

                // Update text position
                group.select("text")
                    .attr("x", x(d.date));

                const textElement = group.select("text")
                    .attr("x", x(d.date))
                    .attr("y", -d.stemHeight - 5)
                    .attr("text-anchor", "middle")
                    .attr("font-size", 12)
                    .text(d.label);
                
                const padding = 4;
                const maxTextWidth = 150;
                const lineHeight = 14;
                EventFactory.wrapText(textElement, maxTextWidth, lineHeight);

                const textNode = textElement.node() as SVGTextElement;
                const textBBox = textNode.getBBox();

                d.boxWidth = textBBox.width + (padding * 2)
                d.boxHeight = textBBox.height + (padding * 2);
                d.boxX = x(d.date);

                group.select("rect")
                    .attr("id", sanitizeId(d.label))
                    .attr("width", textBBox.width + (padding * 2))
                    .attr("height", textBBox.height + (padding * 2))
                    .attr("x", x(d.date) - (textBBox.width / 2) - padding)
                    .attr("y", textBBox.y - padding)
                    .attr("fill", d.colour)
                    .attr("opacity", d.opacity)
                    .attr("stroke", "black")
                    .attr("rx", 8)
                    .attr("ry", 8)
                    .lower();
            });
    }

    private handlePeriodMouseOver(this: SVGElement, event: MouseEvent, d: TimelineEvent) {
        d3.select(this.parentNode as Element)
            .selectAll("circle, line, rect")
            .attr("opacity", 0.5)
        const tooltip = document.getElementById("tooltip-event");
        if (tooltip) {
            tooltip.style.display = "block";
            tooltip.style.left = (event.pageX + 15) + "px";
            tooltip.style.top = (event.pageY + 15) + "px";
            // tooltip.innerHTML = GetTooltipEventHtml(d);
        }
    }
    private handlePeriodMouseMove(this: SVGElement, event: MouseEvent, d: TimelineEvent) {
        const tooltip = document.getElementById("tooltip-event");
        if (tooltip) {
            tooltip.style.left = (event.pageX + 15) + "px";
            tooltip.style.top = (event.pageY + 15) + "px";
        }
    }
    private handlePeriodMouseOut(this: SVGElement, event: MouseEvent, d: TimelineEvent) {
        d3.select(this.parentNode as Element)
            .selectAll("circle, line, rect")
            .attr("opacity", d.opacity);
        const tooltip = document.getElementById("tooltip-event");
        if (tooltip) {
            tooltip.style.display = "none";
        }
    }
    
    private handleClick = (event: MouseEvent, d: TimelineEvent) => {
        console.log("Clicked on event:", d);
        computeRelativePeriodForEvent(d)
        console.log(`Width: [${(d.boxX-d.boxWidth/2).toFixed()}, ${(d.boxX+d.boxWidth/2).toFixed()}]`);
        console.log(`Height: [${d.stemHeight.toFixed()}, ${(d.stemHeight + d.boxHeight).toFixed()}]`);
        // console.log(d.stemHeight);
    }
    private static wrapText = function (
        textEl: d3.Selection<any, unknown, null, undefined>,
        maxWidth: number,
        lineHeight: number = 14
    ) {
        const text = textEl.text();
        const words = text.split(/\s+/);

        textEl.text("");

        let line: string[] = [];
        const x = textEl.attr("x");
        const y = parseFloat(textEl.attr("y"));

        const lines: string[] = [];

        for (let i = 0; i < words.length; i++) {
            line.push(words[i]);
            textEl.text(line.join(" "));

            const textLength = (textEl.node() as SVGTextElement).getComputedTextLength();

            if (textLength > maxWidth && line.length > 1) {
                line.pop();
                lines.push(line.join(" "));
                line = [words[i]];
            }
        }

        if (line.length > 0) {
            lines.push(line.join(" "));
        }

        const adjustedY = y - ((lines.length - 1) * lineHeight);
        textEl.text("");

        lines.forEach((lineText, index) => {
            textEl.append("tspan")
                .attr("x", x)
                .attr("y", adjustedY + (index * lineHeight) - 3) // Adjust y for radius=6/3 and new line
                .text(lineText);
        });
    };
}