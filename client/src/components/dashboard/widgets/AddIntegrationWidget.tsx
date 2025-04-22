import React from "react";

interface AddIntegrationWidgetProps {
  onAddClick: () => void;
}

const AddIntegrationWidget: React.FC<AddIntegrationWidgetProps> = ({ onAddClick }) => {
  return (
    <div className="widget col-span-1 md:col-span-1 border-2 border-dashed border-neutral-200 rounded-lg relative flex items-center justify-center bg-white bg-opacity-50 hover:bg-opacity-75 transition-all duration-200 h-64">
      <div className="text-center p-6">
        <div className="mx-auto h-12 w-12 rounded-full bg-primary bg-opacity-10 flex items-center justify-center mb-3">
          <span className="material-icons text-primary">add</span>
        </div>
        <h3 className="text-sm font-medium text-neutral-900 mb-1">Add Integration</h3>
        <p className="text-xs text-neutral-500">Connect more services to enrich your dashboard</p>
        <button 
          className="mt-3 inline-flex items-center px-3 py-1.5 text-xs font-medium text-primary bg-white border border-primary-light rounded-md hover:bg-primary-light hover:bg-opacity-10"
          onClick={onAddClick}
        >
          Browse Integrations
        </button>
      </div>
    </div>
  );
};

export default AddIntegrationWidget;
