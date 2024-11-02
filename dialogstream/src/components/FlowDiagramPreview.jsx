// Continuing src/components/FlowEditor/FlowEditModal.jsx

<div className="space-y-2 mb-6">
    {steps.map((step, index) => (
        <div
            key={index}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={() => setDraggedStep(null)}
            className={`flex items-center gap-2 bg-gray-50 p-2 rounded ${
                draggedStep === index ? 'opacity-50' : ''
            }`}
        >
            <GripVertical className="cursor-move text-gray-400" size={20} />
            <span className="flex-1">{step}</span>
            <Button
                variant="danger"
                onClick={() => setSteps(steps.filter((_, i) => i !== index))}
            >
                <Trash2 size={16} />
            </Button>
        </div>
    ))}
</div>

<div className="flex justify-end gap-2">
    <Button variant="secondary" onClick={onClose}>
        Cancel
    </Button>
    <Button onClick={handleSave}>
        Save Changes
    </Button>
</div>
</div>
</div>
);
};

export default FlowEditModal;

// src/components/FlowEditor/FlowDiagramPreview.jsx
import React from 'react';
import { STEP_TYPES } from '../../utils/validation';

const getStepIcon = (step) => {
    const type = Object.entries(STEP_TYPES).find(([_, config]) =>
        step.startsWith(config.prefix)
    )?.[0];

    switch (type) {
        case 'RTSP': return '📹';
        case 'FILE': return '📁';
        case 'SCHEDULE': return '⏰';
        case 'EMAIL': return '📧';
        case 'SUBSCRIBE': return '📥';
        case 'PUBLISH': return '📤';
        case 'PROCESS': return '⚙️';
        default: return '❓';
    }
};

const FlowDiagramPreview = ({ flow }) => {
    return (
        <div className="overflow-x-auto">
            <div className="flex flex-col items-center min-w-[200px]">
                {flow.steps.map((step, index) => (
                    <React.Fragment key={index}>
                        <div className="flex items-center justify-center w-48 h-12 border rounded-lg bg-gray-50">
                            <span className="mr-2">{getStepIcon(step)}</span>
                            <span className="text-sm truncate max-w-[160px]">
                {step.split('://')[1]}
              </span>
                        </div>
                        {index < flow.steps.length - 1 && (
                            <div className="h-8 w-0.5 bg-gray-300" />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default FlowDiagramPreview;
