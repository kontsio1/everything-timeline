import {TimelinePeriod} from "../Entities/TimelinePeriod";
import {getYearLabel} from "../Helpers/GenericHelperFunctions";

export const PeriodTooltip: React.FC = () => {
    return (
        <div id="tooltip-period" style={{
            position: "absolute",
            pointerEvents: "none",
            background: "#fff",
            border: "1px solid #ccc",
            padding: "6px",
            borderRadius: "4px",
            display: "none",
            zIndex: 10
        }}></div>
    );
};

export const GetPeriodTooltipHtml = (d: TimelinePeriod) => {
    const startYear = getYearLabel(d.startDate.getUTCFullYear()+1)
    const endYear = getYearLabel(d.endDate.getUTCFullYear()+1)
    return `<strong>${d.label}</strong>
            <br/>${startYear} - ${endYear}
            `
}