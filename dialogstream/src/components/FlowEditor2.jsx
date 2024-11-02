import React, {useState, useRef} from 'react';
import {Plus, Undo2, Redo2, Search, Upload, Download, Edit2, Save, Trash2, GripVertical} from 'lucide-react';

const FlowEditor = () => {
    const [flows, setFlows] = useState([]);
    const [newFlowName, setNewFlowName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [editingFlow, setEditingFlow] = useState(null);
    const [editingStep, setEditingStep] = useState({flowId: null, stepIndex: null, value: ''});
    const [draggedStep, setDraggedStep] = useState({flowId: null, stepIndex: null});
    const fileInputRef = useRef(null);

    // Add new flow
    const addFlow = () => {
        if (newFlowName.trim()) {
            setFlows(currentFlows => [...currentFlows, {
                id: Date.now(),
                name: newFlowName,
                steps: []
            }]);
            setNewFlowName('');
        }
    };

    // Start editing flow name
    const startEditingFlow = (flow) => {
        setEditingFlow({
            id: flow.id,
            name: flow.name
        });
    };

    // Save flow name
    const saveFlowName = () => {
        if (editingFlow && editingFlow.name.trim()) {
            setFlows(currentFlows =>
                currentFlows.map(flow =>
                    flow.id === editingFlow.id
                        ? {...flow, name: editingFlow.name}
                        : flow
                )
            );
            setEditingFlow(null);
        }
    };

    // Start editing step
    const startEditingStep = (flowId, stepIndex, value) => {
        setEditingStep({flowId, stepIndex, value});
    };

    // Save step
    const saveStep = () => {
        if (editingStep.value.trim()) {
            setFlows(currentFlows =>
                currentFlows.map(flow =>
                    flow.id === editingStep.flowId
                        ? {
                            ...flow,
                            steps: flow.steps.map((step, index) =>
                                index === editingStep.stepIndex ? editingStep.value : step
                            )
                        }
                        : flow
                )
            );
            setEditingStep({flowId: null, stepIndex: null, value: ''});
        }
    };

    // Handle step drag start
    const handleStepDragStart = (flowId, stepIndex) => {
        setDraggedStep({flowId, stepIndex});
    };

    // Handle step drag over
    const handleStepDragOver = (e, targetFlowId, targetStepIndex) => {
        e.preventDefault();

        if (!draggedStep.flowId) return;
        if (draggedStep.flowId === targetFlowId && draggedStep.stepIndex === targetStepIndex) return;

        setFlows(currentFlows => {
            const sourceFlow = currentFlows.find(f => f.id === draggedStep.flowId);
            const sourceStep = sourceFlow.steps[draggedStep.stepIndex];

            // Remove step from source
            const flowsWithoutStep = currentFlows.map(flow =>
                flow.id === draggedStep.flowId
                    ? {
                        ...flow,
                        steps: flow.steps.filter((_, index) => index !== draggedStep.stepIndex)
                    }
                    : flow
            );

            // Add step to target
            return flowsWithoutStep.map(flow =>
                flow.id === targetFlowId
                    ? {
                        ...flow,
                        steps: [
                            ...flow.steps.slice(0, targetStepIndex),
                            sourceStep,
                            ...flow.steps.slice(targetStepIndex)
                        ]
                    }
                    : flow
            );
        });

        setDraggedStep({flowId: targetFlowId, stepIndex: targetStepIndex});
    };

    // Add new step to flow
    const addStepToFlow = (flowId) => {
        setFlows(currentFlows =>
            currentFlows.map(flow =>
                flow.id === flowId
                    ? {...flow, steps: [...flow.steps, 'New Step']}
                    : flow
            )
        );
    };

    // Delete step
    const deleteStep = (flowId, stepIndex) => {
        setFlows(currentFlows =>
            currentFlows.map(flow =>
                flow.id === flowId
                    ? {
                        ...flow,
                        steps: flow.steps.filter((_, index) => index !== stepIndex)
                    }
                    : flow
            )
        );
    };

    // Delete flow
    const deleteFlow = (flowId) => {
        setFlows(currentFlows => currentFlows.filter(flow => flow.id !== flowId));
    };


    const importFlows = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = JSON.parse(e.target.result);
                    // Check if the content has the expected structure
                    if (content.flows && Array.isArray(content.flows)) {
                        // Add IDs to the imported flows for React keys
                        const flowsWithIds = content.flows.map(flow => ({
                            ...flow,
                            id: Date.now() + Math.random() // Generate unique IDs
                        }));
                        setFlows(flowsWithIds);
                    } else {
                        alert('Invalid file format. Expected { flows: [...] } structure.');
                    }
                } catch (error) {
                    console.error('Error importing flows:', error);
                    alert('Error importing flows. Please check the file format.');
                }
            };
            reader.onerror = (error) => {
                console.error('Error reading file:', error);
                alert('Error reading file. Please try again.');
            };
            reader.readAsText(file);
        }
    };

    const exportFlows = () => {
        try {
            // Transform the flows array to match the expected format
            const exportData = {
                flows: flows.map(({ id, ...flow }) => flow) // Remove the id property
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            const exportFileDefaultName = 'flows.json';

            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
        } catch (error) {
            console.error('Error exporting flows:', error);
            alert('Error exporting flows. Please try again.');
        }
    };

    // Filter flows based on search term
    const filteredFlows = flows.filter(flow =>
        flow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flow.steps.some(step => step.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-8 max-w-6xl mx-auto relative mb-6">

            {/* Header Section */}
            <div className="mb-8">
                <div className="flex justify-between items-center gap-2">
                    <img
                        src="/dialogstream-animation.svg"
                        alt="DialogStream Logo"
                        className="h-16"
                    />
                    <h1 className="text-3xl font-bold text-gray-400 "><a href="http://editor.dialogstream.com">editor.dialogstream.com</a></h1>

                    {/* Import/Export Buttons */}
                    <div className="flex gap-2">

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                            title="Import Flows"
                        >
                            <Upload size={20}/>
                            <span>Import</span>
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            onChange={importFlows}
                            className="hidden"
                        />
                        <button
                            onClick={exportFlows}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                            title="Export Flows"
                        >
                            <Download size={20}/>
                            <span>Export</span>
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20}/>
                    <input
                        type="text"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Search flows and steps..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Add New Flow */}
                <div className="flex gap-2">
                    <input
                        type="text"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter new flow name"
                        value={newFlowName}
                        onChange={(e) => setNewFlowName(e.target.value)}
                    />
                    <button
                        onClick={addFlow}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                        <Plus size={20}/>
                        <span>Add Flow</span>
                    </button>
                </div>
            </div>

            {/* Flow List */}
            <div className="space-y-4">
                {filteredFlows.map(flow => (
                    <div key={flow.id} className="p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
                        <div className="flex justify-between items-center mb-4">
                            {editingFlow?.id === flow.id ? (
                                <div className="flex gap-2 flex-1">
                                    <input
                                        type="text"
                                        value={editingFlow.name}
                                        onChange={(e) => setEditingFlow({...editingFlow, name: e.target.value})}
                                        className="flex-1 px-2 py-1 border rounded"
                                        autoFocus
                                    />
                                    <button
                                        onClick={saveFlowName}
                                        className="p-1 text-green-500 hover:text-green-600"
                                    >
                                        <Save size={20}/>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-semibold text-gray-900">{flow.name}</h3>
                                    <button
                                        onClick={() => startEditingFlow(flow)}
                                        className="p-1 text-blue-500 hover:text-blue-600"
                                    >
                                        <Edit2 size={16}/>
                                    </button>
                                </div>
                            )}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => addStepToFlow(flow.id)}
                                    className="p-2 text-blue-500 hover:text-blue-600"
                                >
                                    <Plus size={20}/>
                                </button>
                                <button
                                    onClick={() => deleteFlow(flow.id)}
                                    className="p-2 text-red-500 hover:text-red-600"
                                >
                                    <Trash2 size={20}/>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {flow.steps.map((step, stepIndex) => (
                                <div
                                    key={stepIndex}
                                    draggable
                                    onDragStart={() => handleStepDragStart(flow.id, stepIndex)}
                                    onDragOver={(e) => handleStepDragOver(e, flow.id, stepIndex)}
                                    className={`flex items-center gap-2 p-2 bg-gray-50 rounded border ${
                                        draggedStep.flowId === flow.id && draggedStep.stepIndex === stepIndex
                                            ? 'opacity-50'
                                            : ''
                                    }`}
                                >
                                    <GripVertical className="cursor-move text-gray-400" size={16}/>
                                    {editingStep.flowId === flow.id && editingStep.stepIndex === stepIndex ? (
                                        <div className="flex gap-2 flex-1">
                                            <input
                                                type="text"
                                                value={editingStep.value}
                                                onChange={(e) => setEditingStep({
                                                    ...editingStep,
                                                    value: e.target.value
                                                })}
                                                className="flex-1 px-2 py-1 border rounded"
                                                autoFocus
                                            />
                                            <button
                                                onClick={saveStep}
                                                className="p-1 text-green-500 hover:text-green-600"
                                            >
                                                <Save size={16}/>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-center flex-1">
                                            <span>{step}</span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => startEditingStep(flow.id, stepIndex, step)}
                                                    className="p-1 text-blue-500 hover:text-blue-600"
                                                >
                                                    <Edit2 size={16}/>
                                                </button>
                                                <button
                                                    onClick={() => deleteStep(flow.id, stepIndex)}
                                                    className="p-1 text-red-500 hover:text-red-600"
                                                >
                                                    <Trash2 size={16}/>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {flow.steps.length === 0 && (
                                <div className="text-gray-500 text-center py-4">
                                    No steps yet. Click the + button to add a step.
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FlowEditor;
