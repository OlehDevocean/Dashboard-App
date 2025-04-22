import React from "react";
import { Widget as WidgetType } from "@/lib/types";
import Widget from "./Widget";
import JiraWidget from "./widgets/JiraWidget";
import GoogleAnalyticsWidget from "./widgets/GoogleAnalyticsWidget";
import AtlassianWidget from "./widgets/AtlassianWidget";
import PingdomWidget from "./widgets/PingdomWidget";
import AddIntegrationWidget from "./widgets/AddIntegrationWidget";
import MetricsWidget from "./widgets/MetricsWidget";
import RaciMatrixWidget from "./widgets/RaciMatrixWidget";
import { useWidgetData } from "@/hooks/useWidgetData";

interface WidgetGridProps {
  widgets: WidgetType[];
  onAddWidget: () => void;
}

const WidgetGrid: React.FC<WidgetGridProps> = ({ widgets, onAddWidget }) => {
  // We'll set this up correctly when needed
  // const { refreshData } = useWidgetData("metrics");

  const renderWidget = (widget: WidgetType) => {
    switch (widget.type) {
      case 'jira':
        return <JiraWidget widget={widget} />;
      case 'google_analytics':
        return <GoogleAnalyticsWidget widget={widget} />;
      case 'atlassian':
        return <AtlassianWidget widget={widget} />;
      case 'pingdom':
        return <PingdomWidget widget={widget} />;
      case 'metrics':
        return <MetricsWidget widget={widget} />;
      case 'add_integration':
        return <AddIntegrationWidget onAddClick={onAddWidget} />;
      case 'raci_matrix_jira':
      case 'raci_matrix_google_analytics':
      case 'raci_matrix_atlassian':
      case 'raci_matrix_pingdom':
        return <RaciMatrixWidget widget={widget} />;
      default:
        return (
          <Widget widget={widget}>
            <div className="h-full flex items-center justify-center">
              <p className="text-neutral-500">Unknown widget type</p>
            </div>
          </Widget>
        );
    }
  };

  // Helper function to determine column span based on widget type
  const getColSpan = (widget: WidgetType) => {
    // RACI Matrix widgets should take up more space
    if (widget.type === 'metrics') {
      return 'col-span-1 lg:col-span-2';
    } else if (widget.type.startsWith('raci_matrix_')) {
      return 'col-span-1 md:col-span-2';
    } else {
      return 'col-span-1';
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {widgets.map((widget) => (
        <div key={widget.id} className={getColSpan(widget)}>
          {renderWidget(widget)}
        </div>
      ))}
    </div>
  );
};

export default WidgetGrid;
